"""
Payment API endpoints for Resume-Matcher.

Handles Stripe checkout session creation and payment verification.
"""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from app.services.payment_verification import PaymentVerificationService, get_payment_verification_service
from app.services.stripe_service import StripeService, get_stripe_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["payments"])


# Request/Response Models
class CreateCheckoutRequest(BaseModel):
    """Request model for creating checkout session."""

    optimization_id: str = Field(..., description="Optimization record ID")
    user_id: str = Field(..., description="Supabase user ID")
    user_email: EmailStr = Field(..., description="User email address")
    success_url: str = Field(..., description="Success redirect URL")
    cancel_url: str = Field(..., description="Cancel redirect URL")
    amount: int = Field(default=5000, description="Amount in cents (default: R$ 50.00)")


class CreateCheckoutResponse(BaseModel):
    """Response model for checkout session creation."""

    session_id: str
    checkout_url: str
    expires_at: int


class VerifyPaymentRequest(BaseModel):
    """Request model for payment verification."""

    session_id: str = Field(..., description="Stripe checkout session ID")
    optimization_id: str = Field(..., description="Optimization record ID")


class VerifyPaymentResponse(BaseModel):
    """Response model for payment verification."""

    success: bool
    optimization_id: str
    status: str
    amount_paid: int
    currency: str


@router.post(
    "/create-checkout",
    response_model=CreateCheckoutResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Stripe Checkout Session",
    description="Create a Stripe Checkout session for résumé optimization payment (R$ 50.00)",
)
async def create_checkout_session(
    request: CreateCheckoutRequest, stripe_service: StripeService = Depends(get_stripe_service)
) -> CreateCheckoutResponse:
    """
    Create a Stripe Checkout session for payment.

    This endpoint:
    1. Creates a Stripe Checkout session
    2. Links the session to the optimization record via metadata
    3. Returns the checkout URL for the frontend to redirect

    Args:
        request: Checkout session creation request
        stripe_service: Injected Stripe service

    Returns:
        CreateCheckoutResponse with session_id and checkout_url

    Raises:
        HTTPException: If session creation fails
    """
    try:
        logger.info(f"Creating checkout session for optimization {request.optimization_id}")

        session_data = await stripe_service.create_checkout_session(
            optimization_id=request.optimization_id,
            user_id=request.user_id,
            user_email=request.user_email,
            success_url=request.success_url,
            cancel_url=request.cancel_url,
            amount=request.amount,
        )

        logger.info(f"Checkout session created: {session_data['session_id']}")

        return CreateCheckoutResponse(**session_data)

    except Exception as e:
        logger.exception(f"Error creating checkout session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create checkout session: {str(e)}"
        )


@router.post(
    "/verify",
    response_model=VerifyPaymentResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify Payment",
    description="Verify a payment was completed successfully and update optimization status",
)
async def verify_payment(
    request: VerifyPaymentRequest,
    payment_verification: PaymentVerificationService = Depends(get_payment_verification_service),
) -> VerifyPaymentResponse:
    """
    Verify a payment and update optimization status.

    This endpoint:
    1. Verifies the payment was successful with Stripe
    2. Updates the optimization record
    3. Changes status to 'processing' to trigger AI

    Args:
        request: Payment verification request
        payment_verification: Injected payment verification service

    Returns:
        VerifyPaymentResponse with payment details

    Raises:
        HTTPException: If verification fails
    """
    try:
        logger.info(f"Verifying payment for optimization {request.optimization_id}")

        # Get payment intent ID from session
        stripe_service = get_stripe_service()
        session_details = await stripe_service.verify_payment(request.session_id)
        payment_intent_id = session_details.get("payment_intent")

        if not payment_intent_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment intent not found in session")

        # Verify and process payment
        result = await payment_verification.verify_and_process_payment(
            session_id=request.session_id, optimization_id=request.optimization_id, stripe_payment_id=payment_intent_id
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("error", "Payment verification failed")
            )

        logger.info(f"Payment verified for optimization {request.optimization_id}")

        return VerifyPaymentResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error verifying payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Payment verification failed: {str(e)}"
        )


@router.get(
    "/session/{session_id}",
    status_code=status.HTTP_200_OK,
    summary="Get Checkout Session Details",
    description="Retrieve details of a Stripe checkout session",
)
async def get_session_details(
    session_id: str, stripe_service: StripeService = Depends(get_stripe_service)
) -> dict[str, Any]:
    """
    Get Stripe checkout session details.

    Args:
        session_id: Stripe checkout session ID
        stripe_service: Injected Stripe service

    Returns:
        Dict with session details

    Raises:
        HTTPException: If session retrieval fails
    """
    try:
        logger.info(f"Retrieving session details for {session_id}")

        session_details = await stripe_service.verify_payment(session_id)

        return session_details

    except Exception as e:
        logger.exception(f"Error retrieving session details: {str(e)}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Session not found: {str(e)}")
