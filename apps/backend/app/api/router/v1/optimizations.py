"""
Optimization API endpoints for Resume-Matcher.

Handles resume optimization job creation and status retrieval.
"""

import logging
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.supabase_client import get_supabase_client
from app.services.ai_optimization import AIOptimizationService, get_ai_optimization_service
from app.services.docx_generation import DOCXGenerationService, get_docx_generation_service
from app.services.text_extraction import TextExtractionService, get_text_extraction_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/optimizations", tags=["optimizations"])


# Request/Response Models
class CreateOptimizationRequest(BaseModel):
    """Request model for creating optimization job."""

    resume_storage_path: str = Field(..., description="Supabase storage path to uploaded resume")
    resume_filename: str = Field(..., description="Original resume filename")
    job_description: str = Field(..., min_length=50, max_length=10000, description="Job description text")
    user_id: str = Field(..., description="Supabase user ID")


class CreateOptimizationResponse(BaseModel):
    """Response model for optimization creation."""

    optimization_id: str
    status: str
    message: str


class OptimizationStatusResponse(BaseModel):
    """Response model for optimization status."""

    id: str
    user_id: str
    status: str
    optimized_text: str | None
    docx_storage_path: str | None
    match_percentage: int | None
    suggestions: list[str] | None
    keywords: list[str] | None
    error_message: str | None
    created_at: str
    processing_started_at: str | None
    processing_completed_at: str | None


class OptimizationListResponse(BaseModel):
    """Response model for optimization list."""

    optimizations: list[dict[str, Any]]
    total: int


@router.post(
    "/",
    response_model=CreateOptimizationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Optimization Job",
    description="Create a new resume optimization job after payment verification",
)
async def create_optimization(
    request: CreateOptimizationRequest,
    background_tasks: BackgroundTasks,
    text_extraction: TextExtractionService = Depends(get_text_extraction_service),
    ai_service: AIOptimizationService = Depends(get_ai_optimization_service),
    docx_service: DOCXGenerationService = Depends(get_docx_generation_service),
) -> CreateOptimizationResponse:
    """
    Create a resume optimization job.

    This endpoint:
    1. Creates optimization record in database
    2. Extracts text from uploaded resume
    3. Triggers AI optimization in background
    4. Generates DOCX file
    5. Updates record with results

    Args:
        request: Optimization creation request
        background_tasks: FastAPI background tasks
        text_extraction: Text extraction service
        ai_service: AI optimization service
        docx_service: DOCX generation service

    Returns:
        CreateOptimizationResponse with optimization ID

    Raises:
        HTTPException: If creation fails
    """
    try:
        logger.info(f"Creating optimization for user {request.user_id}")

        # Get Supabase client
        supabase = get_supabase_client()

        # Create optimization record in database
        optimization_data = {
            "user_id": request.user_id,
            "input_resume_filename": request.resume_filename,
            "input_resume_storage_path": request.resume_storage_path,
            "input_job_description": request.job_description,
            "status": "pending_payment",
        }

        result = supabase.table("optimizations").insert(optimization_data).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Falha ao criar registro de otimização",
            )

        optimization_id = result.data[0]["id"]

        logger.info(f"Optimization record created: {optimization_id}")

        # Add background task to process optimization
        # Note: This will only run AFTER payment is verified
        # Payment verification service will update status to 'processing'

        return CreateOptimizationResponse(
            optimization_id=optimization_id,
            status="pending_payment",
            message="Registro de otimização criado. Aguardando confirmação de pagamento.",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error creating optimization: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=r"Erro ao criar otimização: {str(e)}",
        ) from e


@router.get(
    "/{optimization_id}",
    response_model=OptimizationStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Optimization Status",
    description="Retrieve optimization job status and results",
)
async def get_optimization_status(
    optimization_id: str,
) -> OptimizationStatusResponse:
    """
    Get optimization job status and results.

    Args:
        optimization_id: Optimization record ID

    Returns:
        OptimizationStatusResponse with job details

    Raises:
        HTTPException: If optimization not found
    """
    try:
        logger.info(f"Retrieving optimization status: {optimization_id}")

        # Get Supabase client
        supabase = get_supabase_client()

        # Query optimization record
        result = supabase.table("optimizations").select("*").eq("id", optimization_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Otimização não encontrada",
            )

        optimization = result.data[0]

        # Parse metadata if available
        suggestions = None
        keywords = None
        match_percentage = None

        # TODO: Store suggestions, keywords, match_percentage in separate JSONB column
        # For now, return None if not implemented

        response = OptimizationStatusResponse(
            id=optimization["id"],
            user_id=optimization["user_id"],
            status=optimization["status"],
            optimized_text=optimization.get("output_optimized_resume"),
            docx_storage_path=optimization.get("storage_path_docx"),
            match_percentage=match_percentage,
            suggestions=suggestions,
            keywords=keywords,
            error_message=optimization.get("error_message"),
            created_at=optimization["created_at"],
            processing_started_at=optimization.get("processing_started_at"),
            processing_completed_at=optimization.get("processing_completed_at"),
        )

        logger.info(f"Optimization status retrieved: {optimization_id} - Status: {optimization['status']}")

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error retrieving optimization status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=r"Erro ao buscar status da otimização: {str(e)}",
        ) from e


@router.get(
    "/",
    response_model=OptimizationListResponse,
    status_code=status.HTTP_200_OK,
    summary="List User Optimizations",
    description="List all optimizations for authenticated user",
)
async def list_user_optimizations(
    user_id: str,
    limit: int = 10,
    offset: int = 0,
) -> OptimizationListResponse:
    """
    List all optimizations for a user.

    Args:
        user_id: Supabase user ID
        limit: Max results per page (default: 10)
        offset: Pagination offset (default: 0)

    Returns:
        OptimizationListResponse with list of optimizations

    Raises:
        HTTPException: If query fails
    """
    try:
        logger.info(f"Listing optimizations for user {user_id}")

        # Get Supabase client
        supabase = get_supabase_client()

        # Query optimizations
        result = (
            supabase.table("optimizations")
            .select("*")
            .eq("user_id", user_id)
            .is_("deleted_at", "null")
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        # Count total
        count_result = (
            supabase.table("optimizations")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .is_("deleted_at", "null")
            .execute()
        )

        total = count_result.count if count_result.count else 0

        return OptimizationListResponse(
            optimizations=result.data if result.data else [],
            total=total,
        )

    except Exception as e:
        logger.exception(f"Error listing optimizations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=r"Erro ao listar otimizações: {str(e)}",
        ) from e


@router.post(
    "/{optimization_id}/process",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Process Optimization (Internal)",
    description="Trigger AI processing for optimization (called after payment verification)",
)
async def process_optimization(
    optimization_id: str,
    background_tasks: BackgroundTasks,
    text_extraction: TextExtractionService = Depends(get_text_extraction_service),
    ai_service: AIOptimizationService = Depends(get_ai_optimization_service),
    docx_service: DOCXGenerationService = Depends(get_docx_generation_service),
) -> dict[str, str]:
    """
    Process optimization job with AI (internal endpoint).

    This is triggered by payment verification service after successful payment.

    Args:
        optimization_id: Optimization record ID
        background_tasks: FastAPI background tasks
        text_extraction: Text extraction service
        ai_service: AI optimization service
        docx_service: DOCX generation service

    Returns:
        Dict with status message

    Raises:
        HTTPException: If processing fails
    """
    try:
        logger.info(f"Starting AI processing for optimization {optimization_id}")

        # Add background task
        background_tasks.add_task(
            _process_optimization_task,
            optimization_id,
            text_extraction,
            ai_service,
            docx_service,
        )

        return {
            "message": "Processamento iniciado em segundo plano",
            "optimization_id": optimization_id,
        }

    except Exception as e:
        logger.exception(f"Error starting optimization processing: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=r"Erro ao iniciar processamento: {str(e)}",
        ) from e


async def _process_optimization_task(
    optimization_id: str,
    text_extraction: TextExtractionService,
    ai_service: AIOptimizationService,
    docx_service: DOCXGenerationService,
) -> None:
    """
    Background task to process optimization with AI.

    Args:
        optimization_id: Optimization record ID
        text_extraction: Text extraction service
        ai_service: AI optimization service
        docx_service: DOCX generation service
    """
    supabase = get_supabase_client()

    try:
        logger.info(f"Background task: Processing optimization {optimization_id}")

        # Update status to processing
        supabase.table("optimizations").update(
            {
                "status": "processing",
                "processing_started_at": "now()",
            }
        ).eq("id", optimization_id).execute()

        # Get optimization record
        result = supabase.table("optimizations").select("*").eq("id", optimization_id).execute()

        if not result.data:
            raise Exception("Optimization record not found")

        optimization = result.data[0]

        # Download resume file from storage
        storage_path = optimization["input_resume_storage_path"]
        file_data = supabase.storage.from_("resumes").download(storage_path)

        # Extract file extension
        filename = optimization["input_resume_filename"]
        file_extension = "." + filename.rsplit(".", 1)[-1].lower()

        # Extract text from resume
        logger.info(f"Extracting text from {filename}")
        resume_text = await text_extraction.extract_text(file_data, file_extension)

        # Validate text length
        text_extraction.validate_text_length(resume_text)

        # Run AI optimization
        logger.info(f"Running AI optimization for {optimization_id}")
        ai_result = await ai_service.optimize_resume(
            resume_text=resume_text,
            job_description=optimization["input_job_description"],
            user_id=optimization["user_id"],
        )

        # Generate DOCX file
        logger.info(f"Generating DOCX file for {optimization_id}")
        docx_bytes = await docx_service.generate_docx(
            optimized_text=ai_result.optimized_text,
            user_name=None,  # TODO: Get from profile
        )

        # Upload DOCX to storage
        docx_filename = f"{optimization_id}.docx"
        docx_path = f"{optimization['user_id']}/{docx_filename}"

        supabase.storage.from_("optimized-resumes").upload(
            path=docx_path,
            file=docx_bytes,
            file_options={"content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"},
        )

        # Update optimization record with results
        supabase.table("optimizations").update(
            {
                "status": "completed",
                "output_optimized_resume": ai_result.optimized_text,
                "storage_path_docx": docx_path,
                "processing_completed_at": "now()",
                "ai_model_used": ai_service.model,
                # TODO: Store match_percentage, suggestions, keywords in JSONB column
            }
        ).eq("id", optimization_id).execute()

        logger.info(f"Optimization completed successfully: {optimization_id}")

    except Exception as e:
        logger.exception(f"Error processing optimization {optimization_id}: {str(e)}")

        # Update status to failed
        supabase.table("optimizations").update(
            {
                "status": "failed",
                "error_message": str(e),
                "processing_completed_at": "now()",
            }
        ).eq("id", optimization_id).execute()
