"""
Paid resume improvement service for Resume-Matcher.

Handles payment verification, AI optimization, and DOCX generation for paid SaaS functionality.
"""

import logging
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from app.core.database import DatabaseOperations, SupabaseSession
from app.services.ai_optimization import AIOptimizationError, get_ai_optimization_service
from app.services.docx_generation import DOCXGenerationError, get_docx_generation_service
from app.services.exceptions import (
    JobKeywordExtractionError,
    JobNotFoundError,
    JobParsingError,
    ResumeKeywordExtractionError,
    ResumeNotFoundError,
    ResumeParsingError,
)
from app.services.payment_verification import get_payment_verification_service
from app.services.resume_service import ResumeService
from app.services.stripe_service import get_stripe_service

logger = logging.getLogger(__name__)


class PaymentVerificationError(Exception):
    """Raised when payment verification fails."""

    pass


class PaidResumeImprovementService:
    """Service for handling paid resume improvements with mandatory payment verification."""

    def __init__(self, db: SupabaseSession):
        self.db = db
        self.db_ops = DatabaseOperations(db)
        self.resume_service = ResumeService(db)
        self.payment_verification_service = get_payment_verification_service()
        self.stripe_service = get_stripe_service()
        self.ai_optimization_service = get_ai_optimization_service()
        self.docx_generation_service = get_docx_generation_service()

    async def improve_resume(
        self,
        resume_id: UUID,
        job_id: UUID,
        payment_intent_id: str,
        user_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Improve a resume after verifying payment status.

        This method:
        1. Verifies the payment_intent_id is in "succeeded" status
        2. Retrieves resume and job data
        3. Optimizes resume using OpenRouter AI
        4. Generates DOCX file
        5. Stores optimized content in database
        6. Returns download-ready results

        Args:
            resume_id: Resume UUID
            job_id: Job UUID
            payment_intent_id: Stripe payment intent ID (must be "succeeded")
            user_id: Optional user ID for tracking

        Returns:
            Dict containing optimization results and download information

        Raises:
            PaymentVerificationError: If payment verification fails
            ResumeNotFoundError: If resume is not found
            JobNotFoundError: If job is not found
            AIOptimizationError: If AI optimization fails
            DOCXGenerationError: If DOCX generation fails
        """
        try:
            logger.info(
                f"Starting paid resume improvement - Resume: {resume_id}, Job: {job_id}, "
                f"Payment: {payment_intent_id}, User: {user_id or 'anonymous'}"
            )

            # Step 1: Verify payment status
            await self._verify_payment_status(payment_intent_id)

            # Step 2: Retrieve resume and job data
            resume_data, job_data = await self._retrieve_resume_and_job_data(resume_id, job_id)

            # Step 3: Optimize resume using AI
            optimization_result = await self._optimize_resume_with_ai(
                resume_data["content"], job_data["content"], user_id
            )

            # Step 4: Generate DOCX file
            docx_content = await self._generate_docx_file(optimization_result["optimized_text"], user_id)

            # Step 5: Store results and prepare response
            result = await self._store_and_prepare_response(
                resume_id=resume_id,
                job_id=job_id,
                payment_intent_id=payment_intent_id,
                user_id=user_id,
                optimization_result=optimization_result,
                docx_content=docx_content,
                resume_filename=resume_data["filename"],
            )

            logger.info(
                f"Paid resume improvement completed successfully - Resume: {resume_id}, "
                f"Match: {optimization_result['match_percentage']}%, "
                f"DOCX size: {len(docx_content)} bytes"
            )

            return result

        except (
            PaymentVerificationError,
            ResumeNotFoundError,
            JobNotFoundError,
            AIOptimizationError,
            DOCXGenerationError,
        ) as e:
            logger.error(f"Paid resume improvement failed: {str(e)}")
            raise e
        except Exception as e:
            logger.exception(f"Unexpected error in paid resume improvement: {str(e)}")
            raise AIOptimizationError(f"Erro inesperado na otimização: {str(e)}") from e

    async def _verify_payment_status(self, payment_intent_id: str) -> None:
        """
        Verify that the payment intent is in "succeeded" status.

        Args:
            payment_intent_id: Stripe payment intent ID

        Raises:
            PaymentVerificationError: If payment is not succeeded or verification fails
        """
        try:
            payment_details = await self.stripe_service.get_payment_intent(payment_intent_id)

            if payment_details["status"] != "succeeded":
                raise PaymentVerificationError(f"Pagamento não confirmado. Status atual: {payment_details['status']}")

            logger.info(f"Payment verified successfully: {payment_intent_id}")

        except Exception as e:
            logger.error(f"Payment verification failed for {payment_intent_id}: {str(e)}")
            raise PaymentVerificationError(f"Verificação de pagamento falhou: {str(e)}") from e

    async def _retrieve_resume_and_job_data(
        self, resume_id: UUID, job_id: UUID
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        """
        Retrieve resume and job data from database.

        Args:
            resume_id: Resume UUID
            job_id: Job UUID

        Returns:
            Tuple of (resume_data, job_data) dictionaries

        Raises:
            ResumeNotFoundError: If resume is not found
            JobNotFoundError: If job is not found
        """
        # Get resume data using Supabase
        resume = await self.db_ops.select_by_id("resumes", "resume_id", str(resume_id))

        if not resume:
            raise ResumeNotFoundError(resume_id=str(resume_id))

        processed_resume = await self.db_ops.select_by_id("processed_resumes", "resume_id", str(resume_id))

        if not processed_resume:
            raise ResumeParsingError(resume_id=str(resume_id))

        # Validate resume keywords
        if not processed_resume.get("extracted_keywords"):
            raise ResumeKeywordExtractionError(resume_id=str(resume_id))

        # Get job data using Supabase
        job = await self.db_ops.select_by_id("jobs", "job_id", str(job_id))

        if not job:
            raise JobNotFoundError(job_id=str(job_id))

        processed_job = await self.db_ops.select_by_id("processed_jobs", "job_id", str(job_id))

        if not processed_job:
            raise JobParsingError(job_id=str(job_id))

        # Validate job keywords
        if not processed_job.get("extracted_keywords"):
            raise JobKeywordExtractionError(job_id=str(job_id))

        resume_data = {
            "id": resume["resume_id"],
            "filename": "",  # Not stored in our schema
            "content": resume["content"],
            "keywords": processed_resume.get("extracted_keywords"),
        }

        job_data = {
            "id": job["job_id"],
            "content": job["content"],
            "keywords": processed_job.get("extracted_keywords"),
        }

        return resume_data, job_data

    async def _optimize_resume_with_ai(
        self, resume_text: str, job_description: str, user_id: str | None = None
    ) -> dict[str, Any]:
        """
        Optimize resume using AI service.

        Args:
            resume_text: Original resume text
            job_description: Job description
            user_id: Optional user ID

        Returns:
            Optimization result dictionary

        Raises:
            AIOptimizationError: If optimization fails
        """
        try:
            result = await self.ai_optimization_service.optimize_resume(
                resume_text=resume_text,
                job_description=job_description,
                user_id=user_id,
            )

            return result.to_dict()

        except AIOptimizationError as e:
            logger.error(f"AI optimization failed: {str(e)}")
            raise e
        except Exception as e:
            logger.exception(f"Unexpected error in AI optimization: {str(e)}")
            raise AIOptimizationError(f"Erro na otimização por IA: {str(e)}") from e

    async def _generate_docx_file(self, optimized_text: str, user_id: str | None = None) -> bytes:
        """
        Generate DOCX file from optimized text.

        Args:
            optimized_text: Optimized resume text
            user_id: Optional user ID

        Returns:
            DOCX file content as bytes

        Raises:
            DOCXGenerationError: If DOCX generation fails
        """
        try:
            docx_content = await self.docx_generation_service.generate_docx(
                optimized_text=optimized_text, user_name=user_id
            )

            return docx_content

        except DOCXGenerationError as e:
            logger.error(f"DOCX generation failed: {str(e)}")
            raise e
        except Exception as e:
            logger.exception(f"Unexpected error in DOCX generation: {str(e)}")
            raise DOCXGenerationError(f"Erro na geração do arquivo: {str(e)}") from e

    async def _store_and_prepare_response(
        self,
        resume_id: UUID,
        job_id: UUID,
        payment_intent_id: str,
        user_id: str | None,
        optimization_result: dict[str, Any],
        docx_content: bytes,
        resume_filename: str,
    ) -> dict[str, Any]:
        """
        Store optimization results and prepare response.

        Args:
            resume_id: Resume UUID
            job_id: Job UUID
            payment_intent_id: Stripe payment intent ID
            user_id: Optional user ID
            optimization_result: AI optimization result
            docx_content: Generated DOCX content
            resume_filename: Original resume filename

        Returns:
            Response dictionary with optimization results
        """
        # Generate filename for optimized resume
        timestamp = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")
        base_name = resume_filename.rsplit(".", 1)[0]
        optimized_filename = f"{base_name}_otimizado_{timestamp}.docx"

        # Store in Supabase Storage
        storage_path = f"optimized-resumes/{user_id or 'anonymous'}/{optimized_filename}"

        try:
            from app.core.supabase_client import get_supabase_admin_client

            supabase = get_supabase_admin_client()

            # Upload DOCX to Supabase Storage
            storage_result = supabase.storage.from_("optimized-resumes").upload(
                path=storage_path,
                file=docx_content,
                file_options={
                    "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                },
            )

            if storage_result.data is None:
                logger.warning(f"Failed to upload DOCX to storage: {storage_result}")
                storage_path = None

        except Exception as e:
            logger.error(f"Error uploading DOCX to storage: {str(e)}")
            storage_path = None

        # Prepare response
        response = {
            "optimization_id": None,  # Will be set when optimizations table is integrated
            "resume_id": str(resume_id),
            "job_id": str(job_id),
            "payment_intent_id": payment_intent_id,
            "optimized_text": optimization_result["optimized_text"],
            "match_percentage": optimization_result["match_percentage"],
            "suggestions": optimization_result["suggestions"],
            "keywords": optimization_result["keywords"],
            "download": {
                "filename": optimized_filename,
                "storage_path": storage_path,
                "content_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "size_bytes": len(docx_content),
            },
            "ai_metadata": {
                "model_used": "anthropic/claude-3.5-sonnet",  # Default model
                "processed_at": datetime.now(UTC).isoformat(),
            },
        }

        return response
