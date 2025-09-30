"""
Payment verification service for Resume-Matcher.

Handles linking payments to optimization jobs and triggering AI processing.
"""

import logging
from datetime import UTC, datetime
from typing import Any

from app.core.supabase_client import get_supabase_admin_client
from app.services.stripe_service import get_stripe_service

logger = logging.getLogger(__name__)


class PaymentVerificationService:
    """Service for verifying payments and updating optimization status."""

    def __init__(self):
        self.stripe_service = get_stripe_service()
        self.supabase = get_supabase_admin_client()

    async def verify_and_process_payment(
        self, session_id: str, optimization_id: str, stripe_payment_id: str
    ) -> dict[str, Any]:
        """
        Verify payment and update optimization status.

        This method:
        1. Verifies the Stripe payment was successful
        2. Updates the optimization record with payment details
        3. Changes optimization status to 'processing' to trigger AI
        4. Returns success/failure status

        Args:
            session_id: Stripe checkout session ID
            optimization_id: Optimization record ID
            stripe_payment_id: Stripe payment intent ID

        Returns:
            Dict containing success status and details

        Raises:
            Exception: If verification or database update fails
        """
        try:
            # 1. Verify payment with Stripe
            payment_details = await self.stripe_service.verify_payment(session_id)

            if payment_details["payment_status"] != "paid":
                logger.error(
                    f"Payment not completed for session {session_id}: status={payment_details['payment_status']}"
                )
                return {"success": False, "error": "Payment not completed", "status": payment_details["payment_status"]}

            # 2. Update optimization record
            update_result = (
                self.supabase.table("optimizations")
                .update(
                    {
                        "stripe_payment_id": stripe_payment_id,
                        "status": "processing",
                        "paid_at": datetime.now(UTC).isoformat(),
                        "updated_at": datetime.now(UTC).isoformat(),
                    }
                )
                .eq("id", optimization_id)
                .execute()
            )

            if not update_result.data:
                logger.error(f"Failed to update optimization {optimization_id}")
                return {"success": False, "error": "Database update failed"}

            logger.info(f"Payment verified and optimization {optimization_id} updated to 'processing' status")

            return {
                "success": True,
                "optimization_id": optimization_id,
                "status": "processing",
                "amount_paid": payment_details["amount_total"],
                "currency": payment_details["currency"],
            }

        except Exception as e:
            logger.exception(f"Error verifying payment for optimization {optimization_id}: {str(e)}")
            raise e

    async def handle_checkout_completed(self, event_data: dict[str, Any]) -> dict[str, Any]:
        """
        Handle checkout.session.completed webhook event.

        Args:
            event_data: Stripe event data

        Returns:
            Dict containing processing result
        """
        try:
            session = event_data.get("object", {})
            session_id = session.get("id")
            metadata = session.get("metadata", {})
            optimization_id = metadata.get("optimization_id")
            payment_intent = session.get("payment_intent")

            if not optimization_id:
                logger.error(f"No optimization_id in session {session_id} metadata")
                return {"success": False, "error": "Missing optimization_id"}

            if not payment_intent:
                logger.error(f"No payment_intent in session {session_id}")
                return {"success": False, "error": "Missing payment_intent"}

            # Verify and process payment
            result = await self.verify_and_process_payment(session_id, optimization_id, payment_intent)

            return result

        except Exception as e:
            logger.exception(f"Error handling checkout completed: {str(e)}")
            return {"success": False, "error": str(e)}

    async def handle_payment_intent_succeeded(self, event_data: dict[str, Any]) -> dict[str, Any]:
        """
        Handle payment_intent.succeeded webhook event.

        Args:
            event_data: Stripe event data

        Returns:
            Dict containing processing result
        """
        try:
            payment_intent = event_data.get("object", {})
            payment_intent_id = payment_intent.get("id")
            metadata = payment_intent.get("metadata", {})
            optimization_id = metadata.get("optimization_id")

            if not optimization_id:
                logger.warning(f"No optimization_id in payment_intent {payment_intent_id} metadata")
                return {"success": False, "error": "Missing optimization_id"}

            # Update optimization with payment confirmation
            update_result = (
                self.supabase.table("optimizations")
                .update(
                    {
                        "stripe_payment_id": payment_intent_id,
                        "paid_at": datetime.now(UTC).isoformat(),
                        "updated_at": datetime.now(UTC).isoformat(),
                    }
                )
                .eq("id", optimization_id)
                .execute()
            )

            if not update_result.data:
                logger.error(f"Failed to update optimization {optimization_id}")
                return {"success": False, "error": "Database update failed"}

            logger.info(f"Payment intent succeeded for optimization {optimization_id}")

            return {"success": True, "optimization_id": optimization_id, "payment_intent_id": payment_intent_id}

        except Exception as e:
            logger.exception(f"Error handling payment intent succeeded: {str(e)}")
            return {"success": False, "error": str(e)}

    async def handle_payment_failure(self, optimization_id: str, error_message: str) -> None:
        """
        Handle payment failure by updating optimization status.

        Args:
            optimization_id: Optimization record ID
            error_message: Error message to store
        """
        try:
            self.supabase.table("optimizations").update(
                {"status": "failed", "error_message": error_message, "updated_at": datetime.now(UTC).isoformat()}
            ).eq("id", optimization_id).execute()

            logger.info(f"Payment failure recorded for optimization {optimization_id}")

        except Exception as e:
            logger.exception(f"Error handling payment failure: {str(e)}")


# Singleton instance
_payment_verification_service: PaymentVerificationService | None = None


def get_payment_verification_service() -> PaymentVerificationService:
    """Get or create the singleton PaymentVerificationService instance."""
    global _payment_verification_service

    if _payment_verification_service is None:
        _payment_verification_service = PaymentVerificationService()

    return _payment_verification_service
