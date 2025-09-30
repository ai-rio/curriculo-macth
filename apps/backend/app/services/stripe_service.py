"""
Stripe payment service for Resume-Matcher.

Handles checkout session creation, payment verification, and webhook processing.
"""

from typing import Any

import stripe
from stripe import StripeError

from app.core.stripe_client import get_stripe_client, get_webhook_secret


class StripeService:
    """Service for Stripe payment operations."""

    def __init__(self):
        self.client = get_stripe_client()
        self.webhook_secret = get_webhook_secret()

    async def create_checkout_session(
        self,
        optimization_id: str,
        user_id: str,
        user_email: str,
        success_url: str,
        cancel_url: str,
        amount: int = 5000,  # R$ 50.00 in cents
    ) -> dict[str, Any]:
        """
        Create a Stripe Checkout session for résumé optimization payment.

        Args:
            optimization_id: ID of the optimization record
            user_id: Supabase user ID
            user_email: User's email address
            success_url: URL to redirect after successful payment
            cancel_url: URL to redirect if payment is cancelled
            amount: Amount in cents (default: 5000 = R$ 50.00)

        Returns:
            Dict containing session_id and checkout_url

        Raises:
            StripeError: If session creation fails
        """
        try:
            # Create checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                mode="payment",
                customer_email=user_email,
                line_items=[
                    {
                        "price_data": {
                            "currency": "brl",
                            "unit_amount": amount,
                            "product_data": {
                                "name": "Otimização de Currículo com IA",
                                "description": "Otimização profissional do seu currículo com Inteligência Artificial",
                                "images": [],  # TODO: Add product image URL
                            },
                        },
                        "quantity": 1,
                    }
                ],
                metadata={
                    "optimization_id": optimization_id,
                    "user_id": user_id,
                    "service": "resume_optimization",
                },
                success_url=success_url,
                cancel_url=cancel_url,
                # Enable automatic tax calculation (if configured in Stripe)
                automatic_tax={"enabled": False},
                # Set payment intent data for better tracking
                payment_intent_data={
                    "metadata": {
                        "optimization_id": optimization_id,
                        "user_id": user_id,
                    },
                },
            )

            return {
                "session_id": session.id,
                "checkout_url": session.url,
                "expires_at": session.expires_at,
            }

        except StripeError as e:
            raise e

    async def verify_payment(self, session_id: str) -> dict[str, Any]:
        """
        Verify a payment by retrieving the checkout session.

        Args:
            session_id: Stripe checkout session ID

        Returns:
            Dict containing payment status and metadata

        Raises:
            StripeError: If session retrieval fails
        """
        try:
            session = stripe.checkout.Session.retrieve(session_id)

            return {
                "payment_status": session.payment_status,
                "status": session.status,
                "amount_total": session.amount_total,
                "currency": session.currency,
                "customer_email": session.customer_details.email if session.customer_details else None,
                "payment_intent": session.payment_intent,
                "metadata": session.metadata,
            }

        except StripeError as e:
            raise e

    def verify_webhook_signature(self, payload: bytes, signature: str, tolerance: int = 300) -> stripe.Event | None:
        """
        Verify Stripe webhook signature to prevent replay attacks.

        Args:
            payload: Raw request body as bytes
            signature: Stripe-Signature header value
            tolerance: Timestamp tolerance in seconds (default: 300 = 5 minutes)

        Returns:
            Verified Stripe Event object or None if verification fails

        Raises:
            stripe.SignatureVerificationError: If signature verification fails
        """
        try:
            event = stripe.Webhook.construct_event(
                payload=payload, sig_header=signature, secret=self.webhook_secret, tolerance=tolerance
            )
            return event

        except stripe.SignatureVerificationError as e:
            # Signature verification failed
            raise e
        except ValueError as e:
            # Invalid payload
            raise e

    async def get_payment_intent(self, payment_intent_id: str) -> dict[str, Any]:
        """
        Retrieve a payment intent by ID.

        Args:
            payment_intent_id: Stripe payment intent ID

        Returns:
            Dict containing payment intent details

        Raises:
            StripeError: If retrieval fails
        """
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            return {
                "id": intent.id,
                "amount": intent.amount,
                "currency": intent.currency,
                "status": intent.status,
                "metadata": intent.metadata,
                "created": intent.created,
            }

        except StripeError as e:
            raise e

    async def refund_payment(
        self, payment_intent_id: str, amount: int | None = None, reason: str = "requested_by_customer"
    ) -> dict[str, Any]:
        """
        Issue a refund for a payment.

        Args:
            payment_intent_id: Stripe payment intent ID
            amount: Amount to refund in cents (None = full refund)
            reason: Reason for refund ('duplicate', 'fraudulent', 'requested_by_customer')

        Returns:
            Dict containing refund details

        Raises:
            StripeError: If refund fails
        """
        try:
            # Build refund parameters with proper typing
            refund_params: dict[str, str | int] = {
                "payment_intent": payment_intent_id,
                "reason": reason,
            }

            if amount is not None:
                refund_params["amount"] = amount

            refund = stripe.Refund.create(**refund_params)  # type: ignore

            return {
                "id": refund.id,
                "amount": refund.amount,
                "currency": refund.currency,
                "status": refund.status,
                "created": refund.created,
            }

        except StripeError as e:
            raise e


# Singleton instance
_stripe_service: StripeService | None = None


def get_stripe_service() -> StripeService:
    """Get or create the singleton StripeService instance."""
    global _stripe_service

    if _stripe_service is None:
        _stripe_service = StripeService()

    return _stripe_service
