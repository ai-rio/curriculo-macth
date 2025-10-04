"""Integration tests for payment processing and AI optimization workflow."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import status
from httpx import AsyncClient

from app.services.ai_optimization import AIOptimizationService
from app.services.paid_resume_improvement_service import PaidResumeImprovementService
from app.services.payment_verification import PaymentVerificationService
from app.services.stripe_service import StripeService


@pytest.mark.asyncio
class TestPaymentIntegration:
    """Test payment processing integration."""

    async def test_create_checkout_session_success(
        self,
        async_client: AsyncClient,
        test_optimization_id: str,
        test_user_id: str,
        mock_stripe_service: MagicMock,
    ):
        """Test successful checkout session creation."""
        with patch("app.api.router.v1.payments.get_stripe_service", return_value=mock_stripe_service):
            response = await async_client.post(
                "/api/v1/payments/create-checkout",
                json={
                    "optimization_id": test_optimization_id,
                    "user_id": test_user_id,
                    "user_email": "test@example.com",
                    "success_url": "https://example.com/success",
                    "cancel_url": "https://example.com/cancel",
                    "amount": 5000,
                },
            )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "session_id" in data
        assert "checkout_url" in data
        assert "expires_at" in data
        assert data["session_id"] == "cs_test_1234567890"
        assert mock_stripe_service.create_checkout_session.called

    async def test_create_checkout_session_invalid_data(
        self,
        async_client: AsyncClient,
    ):
        """Test checkout session creation with invalid data."""
        response = await async_client.post(
            "/api/v1/payments/create-checkout",
            json={
                "optimization_id": "",  # Invalid empty ID
                "user_id": "test-user",
                "user_email": "invalid-email",  # Invalid email
                "success_url": "invalid-url",  # Invalid URL
                "cancel_url": "invalid-url",
            },
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_verify_payment_success(
        self,
        async_client: AsyncClient,
        test_optimization_id: str,
        mock_stripe_service: MagicMock,
        mock_supabase_client: MagicMock,
    ):
        """Test successful payment verification."""
        with (
            patch("app.api.router.v1.payments.get_stripe_service", return_value=mock_stripe_service),
            patch("app.services.payment_verification.get_payment_verification_service") as mock_payment_verification,
        ):
            mock_verification_service = AsyncMock()
            mock_verification_service.verify_and_process_payment.return_value = {
                "success": True,
                "optimization_id": test_optimization_id,
                "status": "processing",
                "amount_paid": 5000,
                "currency": "brl",
            }
            mock_payment_verification.return_value = mock_verification_service

            response = await async_client.post(
                "/api/v1/payments/verify",
                json={
                    "session_id": "cs_test_1234567890",
                    "optimization_id": test_optimization_id,
                },
            )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        assert data["optimization_id"] == test_optimization_id
        assert data["status"] == "processing"
        assert data["amount_paid"] == 5000
        assert data["currency"] == "brl"

    async def test_verify_payment_session_not_found(
        self,
        async_client: AsyncClient,
        test_optimization_id: str,
        mock_stripe_service: MagicMock,
    ):
        """Test payment verification with non-existent session."""
        mock_stripe_service.verify_payment.side_effect = Exception("Session not found")

        with patch("app.api.router.v1.payments.get_stripe_service", return_value=mock_stripe_service):
            response = await async_client.post(
                "/api/v1/payments/verify",
                json={
                    "session_id": "cs_nonexistent",
                    "optimization_id": test_optimization_id,
                },
            )

        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

    async def test_get_session_details(
        self,
        async_client: AsyncClient,
        mock_stripe_service: MagicMock,
    ):
        """Test retrieving session details."""
        mock_stripe_service.verify_payment.return_value = {
            "payment_status": "paid",
            "status": "complete",
            "amount_total": 5000,
            "currency": "brl",
            "payment_intent": "pi_test_1234567890",
        }

        with patch("app.api.router.v1.payments.get_stripe_service", return_value=mock_stripe_service):
            response = await async_client.get("/api/v1/payments/session/cs_test_1234567890")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["payment_status"] == "paid"
        assert data["amount_total"] == 5000


@pytest.mark.asyncio
class TestWebhookProcessing:
    """Test Stripe webhook processing."""

    async def test_checkout_session_completed_webhook(
        self,
        async_client: AsyncClient,
        mock_stripe_service: MagicMock,
        mock_supabase_client: MagicMock,
        test_optimization_id: str,
    ):
        """Test processing checkout.session.completed webhook."""
        # Mock webhook signature verification
        mock_stripe_service.verify_webhook_signature.return_value = MagicMock(
            type="checkout.session.completed",
            id="evt_test_1234567890",
            data={
                "object": {
                    "id": "cs_test_1234567890",
                    "payment_intent": "pi_test_1234567890",
                    "metadata": {
                        "optimization_id": test_optimization_id,
                        "user_id": "test-user-123",
                    },
                }
            },
        )

        # Mock payment verification service
        with (
            patch("app.api.router.v1.webhooks.get_stripe_service", return_value=mock_stripe_service),
            patch("app.core.supabase_client.get_supabase_admin_client", return_value=mock_supabase_client),
            patch("app.services.payment_verification.get_payment_verification_service") as mock_payment_verification,
        ):
            mock_verification_service = AsyncMock()
            mock_verification_service.handle_checkout_completed.return_value = {
                "success": True,
                "optimization_id": test_optimization_id,
            }
            mock_payment_verification.return_value = mock_verification_service

            response = await async_client.post(
                "/api/v1/webhooks/stripe",
                headers={"stripe-signature": "test_signature"},
                content=b'{"type": "checkout.session.completed"}',
            )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["received"] is True

    async def test_webhook_invalid_signature(
        self,
        async_client: AsyncClient,
        mock_stripe_service: MagicMock,
    ):
        """Test webhook with invalid signature."""
        mock_stripe_service.verify_webhook_signature.side_effect = Exception("Invalid signature")

        with patch("app.api.router.v1.webhooks.get_stripe_service", return_value=mock_stripe_service):
            response = await async_client.post(
                "/api/v1/webhooks/stripe",
                headers={"stripe-signature": "invalid_signature"},
                content=b'{"type": "checkout.session.completed"}',
            )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    async def test_webhook_idempotency(
        self,
        async_client: AsyncClient,
        mock_stripe_service: MagicMock,
        mock_supabase_client: MagicMock,
    ):
        """Test webhook idempotency - same event processed twice."""
        # Mock webhook signature verification
        mock_stripe_service.verify_webhook_signature.return_value = MagicMock(
            type="checkout.session.completed",
            id="evt_test_1234567890",  # Same event ID
        )

        # Mock existing event in database (already processed)
        mock_supabase_client.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"stripe_event_id": "evt_test_1234567890", "processed": True}]
        )

        with (
            patch("app.api.router.v1.webhooks.get_stripe_service", return_value=mock_stripe_service),
            patch("app.core.supabase_client.get_supabase_admin_client", return_value=mock_supabase_client),
        ):
            response = await async_client.post(
                "/api/v1/webhooks/stripe",
                headers={"stripe-signature": "test_signature"},
                content=b'{"type": "checkout.session.completed"}',
            )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["received"] is True
        assert "already processed" in data["message"]

    async def test_payment_intent_succeeded_webhook(
        self,
        async_client: AsyncClient,
        mock_stripe_service: MagicMock,
        mock_supabase_client: MagicMock,
        test_optimization_id: str,
    ):
        """Test processing payment_intent.succeeded webhook."""
        mock_stripe_service.verify_webhook_signature.return_value = MagicMock(
            type="payment_intent.succeeded",
            id="evt_test_payment_succeeded",
            data={
                "object": {
                    "id": "pi_test_1234567890",
                    "metadata": {
                        "optimization_id": test_optimization_id,
                    },
                }
            },
        )

        with (
            patch("app.api.router.v1.webhooks.get_stripe_service", return_value=mock_stripe_service),
            patch("app.core.supabase_client.get_supabase_admin_client", return_value=mock_supabase_client),
            patch("app.services.payment_verification.get_payment_verification_service") as mock_payment_verification,
        ):
            mock_verification_service = AsyncMock()
            mock_verification_service.handle_payment_intent_succeeded.return_value = {
                "success": True,
                "optimization_id": test_optimization_id,
            }
            mock_payment_verification.return_value = mock_verification_service

            response = await async_client.post(
                "/api/v1/webhooks/stripe",
                headers={"stripe-signature": "test_signature"},
                content=b'{"type": "payment_intent.succeeded"}',
            )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["received"] is True

    async def test_payment_intent_failed_webhook(
        self,
        async_client: AsyncClient,
        mock_stripe_service: MagicMock,
        mock_supabase_client: MagicMock,
        test_optimization_id: str,
    ):
        """Test processing payment_intent.payment_failed webhook."""
        mock_stripe_service.verify_webhook_signature.return_value = MagicMock(
            type="payment_intent.payment_failed",
            id="evt_test_payment_failed",
            data={
                "object": {
                    "id": "pi_test_failed",
                    "metadata": {
                        "optimization_id": test_optimization_id,
                    },
                    "last_payment_error": {"message": "Card declined"},
                }
            },
        )

        with (
            patch("app.api.router.v1.webhooks.get_stripe_service", return_value=mock_stripe_service),
            patch("app.core.supabase_client.get_supabase_admin_client", return_value=mock_supabase_client),
            patch("app.services.payment_verification.get_payment_verification_service") as mock_payment_verification,
        ):
            mock_verification_service = AsyncMock()
            mock_verification_service.handle_payment_failure.return_value = None
            mock_payment_verification.return_value = mock_verification_service

            response = await async_client.post(
                "/api/v1/webhooks/stripe",
                headers={"stripe-signature": "test_signature"},
                content=b'{"type": "payment_intent.payment_failed"}',
            )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["received"] is True

    async def test_webhook_unhandled_event_type(
        self,
        async_client: AsyncClient,
        mock_stripe_service: MagicMock,
        mock_supabase_client: MagicMock,
    ):
        """Test webhook with unhandled event type."""
        mock_stripe_service.verify_webhook_signature.return_value = MagicMock(
            type="account.updated",  # Unhandled event type
            id="evt_test_unhandled",
        )

        with (
            patch("app.api.router.v1.webhooks.get_stripe_service", return_value=mock_stripe_service),
            patch("app.core.supabase_client.get_supabase_admin_client", return_value=mock_supabase_client),
        ):
            response = await async_client.post(
                "/api/v1/webhooks/stripe",
                headers={"stripe-signature": "test_signature"},
                content=b'{"type": "account.updated"}',
            )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["received"] is True
        assert "not handled" in data["message"]


@pytest.mark.asyncio
class TestPaymentVerificationService:
    """Test payment verification service integration."""

    async def test_verify_and_process_payment_success(
        self,
        mock_stripe_service: MagicMock,
        mock_supabase_client: MagicMock,
        test_optimization_id: str,
    ):
        """Test successful payment verification and processing."""
        mock_stripe_service.verify_payment.return_value = {
            "payment_status": "paid",
            "amount_total": 5000,
            "currency": "brl",
        }

        mock_supabase_client.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"id": 1, "status": "processing"}]
        )

        service = PaymentVerificationService()
        result = await service.verify_and_process_payment(
            session_id="cs_test_1234567890",
            optimization_id=test_optimization_id,
            stripe_payment_id="pi_test_1234567890",
        )

        assert result["success"] is True
        assert result["optimization_id"] == test_optimization_id
        assert result["status"] == "processing"
        assert result["amount_paid"] == 5000
        assert result["currency"] == "brl"

    async def test_verify_and_process_payment_not_paid(
        self,
        mock_stripe_service: MagicMock,
        test_optimization_id: str,
    ):
        """Test payment verification when payment is not completed."""
        mock_stripe_service.verify_payment.return_value = {
            "payment_status": "unpaid",
            "amount_total": 5000,
            "currency": "brl",
        }

        service = PaymentVerificationService()
        result = await service.verify_and_process_payment(
            session_id="cs_test_1234567890",
            optimization_id=test_optimization_id,
            stripe_payment_id="pi_test_1234567890",
        )

        assert result["success"] is False
        assert "Payment not completed" in result["error"]

    async def test_handle_checkout_completed_success(
        self,
        mock_stripe_service: MagicMock,
        mock_supabase_client: MagicMock,
        test_optimization_id: str,
    ):
        """Test successful checkout completed handling."""
        event_data = {
            "object": {
                "id": "cs_test_1234567890",
                "payment_intent": "pi_test_1234567890",
                "metadata": {
                    "optimization_id": test_optimization_id,
                    "user_id": "test-user-123",
                },
            }
        }

        mock_stripe_service.verify_payment.return_value = {"payment_status": "paid"}

        mock_supabase_client.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"id": 1}]
        )

        service = PaymentVerificationService()
        result = await service.handle_checkout_completed(event_data)

        assert result["success"] is True
        assert result["optimization_id"] == test_optimization_id

    async def test_handle_checkout_completed_missing_metadata(
        self,
        mock_stripe_service: MagicMock,
    ):
        """Test checkout completed handling with missing metadata."""
        event_data = {
            "object": {
                "id": "cs_test_1234567890",
                "payment_intent": "pi_test_1234567890",
                "metadata": {},  # Missing optimization_id
            }
        }

        service = PaymentVerificationService()
        result = await service.handle_checkout_completed(event_data)

        assert result["success"] is False
        assert "Missing optimization_id" in result["error"]

    async def test_handle_payment_failure(
        self,
        mock_supabase_client: MagicMock,
        test_optimization_id: str,
    ):
        """Test payment failure handling."""
        service = PaymentVerificationService()
        await service.handle_payment_failure(
            optimization_id=test_optimization_id,
            error_message="Card declined",
        )

        # Verify the optimization status was updated
        mock_supabase_client.table.return_value.update.return_value.eq.return_value.execute.assert_called_once()
        call_args = mock_supabase_client.table.return_value.update.return_value.eq.return_value.execute.call_args
        update_data = call_args[0][0]

        assert update_data["status"] == "failed"
        assert "Card declined" in update_data["error_message"]
