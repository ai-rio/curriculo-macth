"""
Stripe Webhook API endpoints for Resume-Matcher.

Handles Stripe webhook events with idempotency and security.
Based on QuoteKit's robust webhook implementation.
"""

import hashlib
import logging
from datetime import UTC, datetime
from typing import Any

import stripe
from fastapi import APIRouter, Header, HTTPException, Request, status

from app.core.supabase_client import get_supabase_admin_client
from app.services.payment_verification import get_payment_verification_service
from app.services.stripe_service import get_stripe_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

# Webhook security constants
WEBHOOK_TIMEOUT_MS = 30000  # 30 seconds
SIGNATURE_TOLERANCE_MS = 300  # 5 minutes
MAX_BODY_SIZE = 1024 * 1024  # 1MB


@router.post(
    "/stripe",
    status_code=status.HTTP_200_OK,
    summary="Stripe Webhook Endpoint",
    description="Handle Stripe webhook events (checkout.session.completed, payment_intent.succeeded, etc.)",
)
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(..., alias="stripe-signature"),
) -> dict[str, Any]:
    """
    Handle Stripe webhook events.

    This endpoint:
    1. Verifies webhook signature for security
    2. Checks idempotency to prevent duplicate processing
    3. Processes the event based on type
    4. Updates optimization status accordingly

    Supported Events:
    - checkout.session.completed: Payment completed via Checkout
    - payment_intent.succeeded: Payment succeeded
    - payment_intent.payment_failed: Payment failed

    Args:
        request: FastAPI request object
        stripe_signature: Stripe signature header for verification

    Returns:
        Dict with received status

    Raises:
        HTTPException: If signature verification fails or processing errors occur
    """
    request_id = hashlib.sha256(str(datetime.now(UTC).timestamp()).encode()).hexdigest()[:16]
    start_time = datetime.now(UTC)

    logger.info(f"[WEBHOOK:{request_id}] ===== WEBHOOK REQUEST RECEIVED =====")

    try:
        # Get client IP for logging
        client_ip = request.client.host if request.client else "unknown"

        # STEP 1: Read raw body
        logger.info(f"[STEP 1:{request_id}] Reading request body...")
        body = await request.body()

        if len(body) > MAX_BODY_SIZE:
            logger.error(f"[WEBHOOK:{request_id}] Body size too large: {len(body)} bytes")
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Payload too large")

        logger.info(f"[STEP 1:{request_id}] Body read successfully ({len(body)} bytes)")

        # STEP 2: Verify webhook signature
        logger.info(f"[STEP 2:{request_id}] Verifying webhook signature...")
        stripe_service = get_stripe_service()

        try:
            event = stripe_service.verify_webhook_signature(
                payload=body, signature=stripe_signature, tolerance=SIGNATURE_TOLERANCE_MS
            )
        except stripe.SignatureVerificationError as e:
            logger.error(f"[WEBHOOK:{request_id}] Signature verification failed: {str(e)}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

        if event is None:
            logger.error(f"[WEBHOOK:{request_id}] Event verification returned None")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid event")

        logger.info(f"[STEP 2:{request_id}] Signature verified successfully")
        logger.info(f"[STEP 3:{request_id}] Event: {event.type} (ID: {event.id})")

        # STEP 3: Check idempotency
        logger.info(f"[STEP 4:{request_id}] Checking event idempotency...")
        supabase = get_supabase_admin_client()

        # Check if event already processed
        existing_event = supabase.table("stripe_webhook_events").select("*").eq("stripe_event_id", event.id).execute()

        if existing_event.data:
            event_data = existing_event.data[0]
            if event_data.get("processed"):
                logger.info(f"[WEBHOOK:{request_id}] Event already processed at {event_data.get('processed_at')}")
                return {"received": True, "message": "Event already processed"}

        logger.info(f"[STEP 4:{request_id}] Event is new, proceeding with processing")

        # STEP 4: Record processing start
        logger.info(f"[STEP 5:{request_id}] Recording webhook processing start...")
        supabase.table("stripe_webhook_events").upsert(
            {
                "stripe_event_id": event.id,
                "event_type": event.type,
                "processed": False,
                "processing_started_at": datetime.now(UTC).isoformat(),
                "data": event.data,
                "created_at": datetime.now(UTC).isoformat(),
                "request_id": request_id,
                "client_ip": client_ip,
            },
            on_conflict="stripe_event_id",
        ).execute()

        # STEP 5: Process event
        logger.info(f"[STEP 6:{request_id}] Processing webhook event...")
        processing_result = await process_webhook_event(event, request_id)

        # STEP 6: Update processing status
        logger.info(f"[STEP 7:{request_id}] Updating processing status...")
        processing_time = (datetime.now(UTC) - start_time).total_seconds() * 1000

        supabase.table("stripe_webhook_events").update(
            {
                "processed": processing_result.get("success", False),
                "processed_at": datetime.now(UTC).isoformat(),
                "processing_completed_at": datetime.now(UTC).isoformat(),
                "error_message": processing_result.get("error"),
                "processing_time_ms": processing_time,
            }
        ).eq("stripe_event_id", event.id).execute()

        if not processing_result.get("success"):
            logger.error(f"[WEBHOOK:{request_id}] Processing failed: {processing_result.get('error')}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Processing failed: {processing_result.get('error')}",
            )

        logger.info(f"[SUCCESS:{request_id}] Webhook processed successfully in {processing_time:.2f}ms")

        return {"received": True, "event_id": event.id, "request_id": request_id, "processing_time_ms": processing_time}

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[CRITICAL:{request_id}] Unexpected webhook error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Webhook processing failed: {str(e)}"
        )


async def process_webhook_event(event: stripe.Event, request_id: str) -> dict[str, Any]:
    """
    Process individual webhook event based on type.

    Args:
        event: Stripe Event object
        request_id: Request ID for logging

    Returns:
        Dict with success status and optional error message
    """
    try:
        payment_verification = get_payment_verification_service()

        # Route event to appropriate handler
        if event.type == "checkout.session.completed":
            logger.info(f"[EVENT:{request_id}] Processing checkout.session.completed")
            result = await payment_verification.handle_checkout_completed(event.data)
            return result

        elif event.type == "payment_intent.succeeded":
            logger.info(f"[EVENT:{request_id}] Processing payment_intent.succeeded")
            result = await payment_verification.handle_payment_intent_succeeded(event.data)
            return result

        elif event.type == "payment_intent.payment_failed":
            logger.info(f"[EVENT:{request_id}] Processing payment_intent.payment_failed")
            payment_intent = event.data.get("object", {})
            metadata = payment_intent.get("metadata", {})
            optimization_id = metadata.get("optimization_id")

            if optimization_id:
                error_message = (
                    f"Payment failed: {payment_intent.get('last_payment_error', {}).get('message', 'Unknown error')}"
                )
                await payment_verification.handle_payment_failure(optimization_id, error_message)

            return {"success": True, "message": "Payment failure handled"}

        else:
            logger.info(f"[EVENT:{request_id}] Unhandled event type: {event.type}")
            return {"success": True, "message": f"Event type {event.type} not handled"}

    except Exception as e:
        logger.exception(f"[EVENT:{request_id}] Event processing failed: {str(e)}")
        return {"success": False, "error": str(e)}
