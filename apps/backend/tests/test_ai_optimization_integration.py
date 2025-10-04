"""Integration tests for AI optimization workflow."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import status
from httpx import AsyncClient
from openai import AsyncOpenAI

from app.services.ai_optimization import AIOptimizationError, AIOptimizationService, OptimizationResult
from app.services.paid_resume_improvement_service import PaidResumeImprovementService, PaymentVerificationError


@pytest.mark.asyncio
class TestAIOptimizationService:
    """Test AI optimization service integration."""

    async def test_optimize_resume_success(
        self,
        mock_ai_optimization_service: MagicMock,
        sample_resume_text: str,
        sample_job_description: str,
        test_user_id: str,
    ):
        """Test successful resume optimization."""
        # Mock the OpenAI client response
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content=json.dumps(
                        {
                            "optimized_text": "Optimized resume content...",
                            "match_percentage": 85,
                            "suggestions": ["Suggestion 1", "Suggestion 2"],
                            "keywords": ["keyword1", "keyword2"],
                        }
                    )
                )
            )
        ]

        with patch("openai.AsyncOpenAI") as mock_openai:
            mock_client = AsyncMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_openai.return_value = mock_client

            service = AIOptimizationService(api_key="test-key")
            result = await service.optimize_resume(
                resume_text=sample_resume_text,
                job_description=sample_job_description,
                user_id=test_user_id,
            )

        assert isinstance(result, OptimizationResult)
        assert result.match_percentage == 85
        assert len(result.suggestions) == 2
        assert len(result.keywords) == 2
        assert result.optimized_text == "Optimized resume content..."

    async def test_optimize_resume_with_model_override(
        self,
        mock_ai_optimization_service: MagicMock,
        sample_resume_text: str,
        sample_job_description: str,
    ):
        """Test resume optimization with model override."""
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content=json.dumps(
                        {
                            "optimized_text": "Optimized content with GPT-4",
                            "match_percentage": 90,
                            "suggestions": ["GPT-4 suggestion"],
                            "keywords": ["gpt4", "keyword"],
                        }
                    )
                )
            )
        ]

        with patch("openai.AsyncOpenAI") as mock_openai:
            mock_client = AsyncMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_openai.return_value = mock_client

            service = AIOptimizationService(api_key="test-key")
            result = await service.optimize_resume(
                resume_text=sample_resume_text,
                job_description=sample_job_description,
                model="openai/gpt-4",
                temperature=0.5,
            )

        assert result.match_percentage == 90
        # Verify the correct model was used
        mock_client.chat.completions.create.assert_called_once()
        call_args = mock_client.chat.completions.create.call_args
        assert call_args[1]["model"] == "openai/gpt-4"
        assert call_args[1]["temperature"] == 0.5

    async def test_optimize_resume_invalid_response(
        self,
        sample_resume_text: str,
        sample_job_description: str,
    ):
        """Test resume optimization with invalid AI response."""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content="invalid json content"))]

        with patch("openai.AsyncOpenAI") as mock_openai:
            mock_client = AsyncMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_openai.return_value = mock_client

            service = AIOptimizationService(api_key="test-key")

            with pytest.raises(AIOptimizationError) as exc_info:
                await service.optimize_resume(
                    resume_text=sample_resume_text,
                    job_description=sample_job_description,
                )

        assert "Erro ao processar resposta da IA" in str(exc_info.value)

    async def test_optimize_resume_missing_fields(
        self,
        sample_resume_text: str,
        sample_job_description: str,
    ):
        """Test resume optimization with missing required fields in response."""
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content=json.dumps(
                        {
                            "optimized_text": "Content",
                            # Missing match_percentage, suggestions, keywords
                        }
                    )
                )
            )
        ]

        with patch("openai.AsyncOpenAI") as mock_openai:
            mock_client = AsyncMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_openai.return_value = mock_client

            service = AIOptimizationService(api_key="test-key")

            with pytest.raises(AIOptimizationError) as exc_info:
                await service.optimize_resume(
                    resume_text=sample_resume_text,
                    job_description=sample_job_description,
                )

        assert "Campo obrigatório ausente" in str(exc_info.value)

    async def test_optimize_resume_invalid_match_percentage(
        self,
        sample_resume_text: str,
        sample_job_description: str,
    ):
        """Test resume optimization with invalid match percentage."""
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content=json.dumps(
                        {
                            "optimized_text": "Optimized content",
                            "match_percentage": 150,  # Invalid (> 100)
                            "suggestions": ["Suggestion 1"],
                            "keywords": ["keyword1"],
                        }
                    )
                )
            )
        ]

        with patch("openai.AsyncOpenAI") as mock_openai:
            mock_client = AsyncMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_openai.return_value = mock_client

            service = AIOptimizationService(api_key="test-key")
            result = await service.optimize_resume(
                resume_text=sample_resume_text,
                job_description=sample_job_description,
            )

        # Should clamp to valid range
        assert result.match_percentage == 100

    async def test_estimate_token_usage(
        self,
        sample_resume_text: str,
        sample_job_description: str,
    ):
        """Test token usage estimation."""
        service = AIOptimizationService(api_key="test-key")
        usage = await service.estimate_token_usage(
            resume_text=sample_resume_text,
            job_description=sample_job_description,
        )

        assert "estimated_input_tokens" in usage
        assert "estimated_output_tokens" in usage
        assert "estimated_total_tokens" in usage
        assert usage["estimated_output_tokens"] == 4000  # Default max_tokens
        assert usage["estimated_total_tokens"] == usage["estimated_input_tokens"] + 4000

    async def test_optimization_result_to_dict(self):
        """Test OptimizationResult to_dict method."""
        result = OptimizationResult(
            optimized_text="Test content",
            match_percentage=85,
            suggestions=["Suggestion 1", "Suggestion 2"],
            keywords=["keyword1", "keyword2"],
        )

        result_dict = result.to_dict()

        assert result_dict["optimized_text"] == "Test content"
        assert result_dict["match_percentage"] == 85
        assert result_dict["suggestions"] == ["Suggestion 1", "Suggestion 2"]
        assert result_dict["keywords"] == ["keyword1", "keyword2"]


@pytest.mark.asyncio
class TestPaidResumeImprovementService:
    """Test paid resume improvement service integration."""

    async def test_improve_resume_success(
        self,
        mock_db_session: MagicMock,
        test_resume_id: str,
        test_job_id: str,
        test_payment_intent_id: str,
        test_user_id: str,
        mock_resume_data: dict,
        mock_job_data: dict,
        mock_optimization_result: dict,
        mock_docx_content: bytes,
    ):
        """Test successful paid resume improvement."""
        # Mock database operations
        mock_db_ops = MagicMock()
        mock_db_ops.select_by_id.side_effect = [
            mock_resume_data,  # resume query
            {"extracted_keywords": ["keyword1", "keyword2"]},  # processed_resume query
            mock_job_data,  # job query
            {"extracted_keywords": ["job_keyword1", "job_keyword2"]},  # processed_job query
        ]
        mock_db_session.db_ops = mock_db_ops

        # Mock services
        with (
            patch("app.services.paid_resume_improvement_service.get_stripe_service") as mock_stripe,
            patch("app.services.paid_resume_improvement_service.get_ai_optimization_service") as mock_ai,
            patch("app.services.paid_resume_improvement_service.get_docx_generation_service") as mock_docx,
            patch("app.core.supabase_client.get_supabase_admin_client") as mock_supabase,
        ):
            # Mock Stripe service
            mock_stripe_service = AsyncMock()
            mock_stripe_service.get_payment_intent.return_value = {"status": "succeeded"}
            mock_stripe.return_value = mock_stripe_service

            # Mock AI service
            mock_ai_service = AsyncMock()
            mock_ai_result = MagicMock()
            mock_ai_result.to_dict.return_value = mock_optimization_result
            mock_ai_service.optimize_resume.return_value = mock_ai_result
            mock_ai.return_value = mock_ai_service

            # Mock DOCX service
            mock_docx_service = AsyncMock()
            mock_docx_service.generate_docx.return_value = mock_docx_content
            mock_docx.return_value = mock_docx_service

            # Mock Supabase storage
            mock_supabase_client = MagicMock()
            mock_supabase_client.storage.from_.return_value.upload.return_value = MagicMock(data={"path": "test/path"})
            mock_supabase.return_value = mock_supabase_client

            service = PaidResumeImprovementService(mock_db_session)
            result = await service.improve_resume(
                resume_id=test_resume_id,
                job_id=test_job_id,
                payment_intent_id=test_payment_intent_id,
                user_id=test_user_id,
            )

        assert result["resume_id"] == test_resume_id
        assert result["job_id"] == test_job_id
        assert result["payment_intent_id"] == test_payment_intent_id
        assert "optimized_text" in result
        assert "match_percentage" in result
        assert "suggestions" in result
        assert "keywords" in result
        assert "download" in result
        assert "ai_metadata" in result

    async def test_improve_resume_payment_not_succeeded(
        self,
        mock_db_session: MagicMock,
        test_resume_id: str,
        test_job_id: str,
        test_payment_intent_id: str,
    ):
        """Test resume improvement with non-successful payment."""
        with patch("app.services.paid_resume_improvement_service.get_stripe_service") as mock_stripe:
            mock_stripe_service = AsyncMock()
            mock_stripe_service.get_payment_intent.return_value = {"status": "failed"}
            mock_stripe.return_value = mock_stripe_service

            service = PaidResumeImprovementService(mock_db_session)

            with pytest.raises(PaymentVerificationError) as exc_info:
                await service.improve_resume(
                    resume_id=test_resume_id,
                    job_id=test_job_id,
                    payment_intent_id=test_payment_intent_id,
                )

        assert "Pagamento não confirmado" in str(exc_info.value)

    async def test_improve_resume_not_found(
        self,
        mock_db_session: MagicMock,
        test_resume_id: str,
        test_job_id: str,
        test_payment_intent_id: str,
    ):
        """Test resume improvement with non-existent resume."""
        mock_db_ops = MagicMock()
        mock_db_ops.select_by_id.return_value = None  # Resume not found
        mock_db_session.db_ops = mock_db_ops

        with patch("app.services.paid_resume_improvement_service.get_stripe_service") as mock_stripe:
            mock_stripe_service = AsyncMock()
            mock_stripe_service.get_payment_intent.return_value = {"status": "succeeded"}
            mock_stripe.return_value = mock_stripe_service

            service = PaidResumeImprovementService(mock_db_session)

            with pytest.raises(Exception) as exc_info:  # ResumeNotFoundError
                await service.improve_resume(
                    resume_id=test_resume_id,
                    job_id=test_job_id,
                    payment_intent_id=test_payment_intent_id,
                )

        assert "not found" in str(exc_info.value).lower()

    async def test_improve_resume_ai_optimization_failure(
        self,
        mock_db_session: MagicMock,
        test_resume_id: str,
        test_job_id: str,
        test_payment_intent_id: str,
        mock_resume_data: dict,
        mock_job_data: dict,
    ):
        """Test resume improvement with AI optimization failure."""
        # Mock database operations
        mock_db_ops = MagicMock()
        mock_db_ops.select_by_id.side_effect = [
            mock_resume_data,
            {"extracted_keywords": ["keyword1", "keyword2"]},
            mock_job_data,
            {"extracted_keywords": ["job_keyword1", "job_keyword2"]},
        ]
        mock_db_session.db_ops = mock_db_ops

        with (
            patch("app.services.paid_resume_improvement_service.get_stripe_service") as mock_stripe,
            patch("app.services.paid_resume_improvement_service.get_ai_optimization_service") as mock_ai,
        ):
            # Mock Stripe service
            mock_stripe_service = AsyncMock()
            mock_stripe_service.get_payment_intent.return_value = {"status": "succeeded"}
            mock_stripe.return_value = mock_stripe_service

            # Mock AI service failure
            mock_ai_service = AsyncMock()
            mock_ai_service.optimize_resume.side_effect = AIOptimizationError("AI service failed")
            mock_ai.return_value = mock_ai_service

            service = PaidResumeImprovementService(mock_db_session)

            with pytest.raises(AIOptimizationError) as exc_info:
                await service.improve_resume(
                    resume_id=test_resume_id,
                    job_id=test_job_id,
                    payment_intent_id=test_payment_intent_id,
                )

        assert "AI service failed" in str(exc_info.value)


@pytest.mark.asyncio
class TestResumeImprovementEndpoint:
    """Test resume improvement API endpoint."""

    async def test_improve_resume_endpoint_success(
        self,
        async_client: AsyncClient,
        test_resume_id: str,
        test_job_id: str,
        test_payment_intent_id: str,
        mock_db_session: MagicMock,
        mock_resume_data: dict,
        mock_job_data: dict,
        mock_optimization_result: dict,
    ):
        """Test successful resume improvement endpoint."""
        # Mock database operations
        mock_db_ops = MagicMock()
        mock_db_ops.select_by_id.side_effect = [
            mock_resume_data,
            {"extracted_keywords": ["keyword1", "keyword2"]},
            mock_job_data,
            {"extracted_keywords": ["job_keyword1", "job_keyword2"]},
        ]
        mock_db_session.db_ops = mock_db_ops

        with (
            patch("app.core.get_db_session", return_value=mock_db_session),
            patch("app.services.paid_resume_improvement_service.get_stripe_service") as mock_stripe,
            patch("app.services.paid_resume_improvement_service.get_ai_optimization_service") as mock_ai,
            patch("app.services.paid_resume_improvement_service.get_docx_generation_service") as mock_docx,
            patch("app.core.supabase_client.get_supabase_admin_client") as mock_supabase,
        ):
            # Mock all services
            mock_stripe_service = AsyncMock()
            mock_stripe_service.get_payment_intent.return_value = {"status": "succeeded"}
            mock_stripe.return_value = mock_stripe_service

            mock_ai_service = AsyncMock()
            mock_ai_result = MagicMock()
            mock_ai_result.to_dict.return_value = mock_optimization_result
            mock_ai_service.optimize_resume.return_value = mock_ai_result
            mock_ai.return_value = mock_ai_service

            mock_docx_service = AsyncMock()
            mock_docx_service.generate_docx.return_value = b"mock_docx_content"
            mock_docx.return_value = mock_docx_service

            mock_supabase_client = MagicMock()
            mock_supabase_client.storage.from_.return_value.upload.return_value = MagicMock(data={"path": "test/path"})
            mock_supabase.return_value = mock_supabase_client

            response = await async_client.post(
                "/api/v1/resumes/improve",
                json={
                    "resume_id": test_resume_id,
                    "job_id": test_job_id,
                    "payment_intent_id": test_payment_intent_id,
                },
            )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert data["data"]["resume_id"] == test_resume_id
        assert data["data"]["job_id"] == test_job_id
        assert data["data"]["payment_intent_id"] == test_payment_intent_id

    async def test_improve_resume_endpoint_missing_fields(
        self,
        async_client: AsyncClient,
    ):
        """Test resume improvement endpoint with missing required fields."""
        response = await async_client.post(
            "/api/v1/resumes/improve",
            json={
                "resume_id": "test-resume-id",
                # Missing job_id and payment_intent_id
            },
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_improve_resume_endpoint_payment_verification_failed(
        self,
        async_client: AsyncClient,
        test_resume_id: str,
        test_job_id: str,
        test_payment_intent_id: str,
        mock_db_session: MagicMock,
    ):
        """Test resume improvement endpoint with payment verification failure."""
        with (
            patch("app.core.get_db_session", return_value=mock_db_session),
            patch("app.services.paid_resume_improvement_service.get_stripe_service") as mock_stripe,
        ):
            mock_stripe_service = AsyncMock()
            mock_stripe_service.get_payment_intent.return_value = {"status": "failed"}
            mock_stripe.return_value = mock_stripe_service

            response = await async_client.post(
                "/api/v1/resumes/improve",
                json={
                    "resume_id": test_resume_id,
                    "job_id": test_job_id,
                    "payment_intent_id": test_payment_intent_id,
                },
            )

        assert response.status_code == status.HTTP_402_PAYMENT_REQUIRED
        assert "Pagamento não confirmado" in response.json()["detail"]


@pytest.fixture
def sample_resume_text():
    """Sample resume text for testing."""
    return """
    JOÃO SILVA
    joao.silva@email.com
    (11) 98765-4321

    OBJETIVO
    Desenvolvedor Python com experiência em desenvolvimento web.

    EXPERIÊNCIA
    Desenvolvedor Python | TechCorp | 2020-Presente
    - Desenvolvimento de APIs com FastAPI
    - Trabalho com PostgreSQL

    EDUCAÇÃO
    Bacharel em Ciência da Computação | USP | 2018
    """


@pytest.fixture
def sample_job_description():
    """Sample job description for testing."""
    return """
    VAGA: Desenvolvedor Python Sênior

    REQUISITOS:
    - 5+ anos de experiência com Python
    - Experiência com FastAPI e Django
    - Conhecimento em PostgreSQL
    - Experiência com Docker e AWS

    SALÁRIO: R$ 10.000 - R$ 15.000
    LOCAL: São Paulo/SP (Remoto)
    """


@pytest.fixture
def mock_docx_content():
    """Mock DOCX file content."""
    return b"mock_docx_file_content_bytes"
