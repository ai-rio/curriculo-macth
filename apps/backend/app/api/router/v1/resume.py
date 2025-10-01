import logging
import traceback
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    Request,
    UploadFile,
    status,
)
from fastapi.responses import JSONResponse

from app.core import get_db_session
from app.core.database import SupabaseSession
from app.schemas.pydantic import ResumeImprovementRequest
from app.services import (
    JobKeywordExtractionError,
    JobNotFoundError,
    JobParsingError,
    PaidResumeImprovementService,
    PaymentVerificationError,
    ResumeKeywordExtractionError,
    ResumeNotFoundError,
    ResumeParsingError,
    ResumeService,
    ResumeValidationError,
)

resume_router = APIRouter(prefix="/resumes", tags=["resumes"])
logger = logging.getLogger(__name__)


@resume_router.post(
    "/upload",
    summary="Upload a resume in PDF or DOCX format and store it into DB in HTML/Markdown format",
)
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    db: SupabaseSession = Depends(get_db_session),
):
    """
    Accepts a PDF or DOCX file, converts it to HTML/Markdown, and stores it in the database.

    Raises:
        HTTPException: If the file type is not supported or if the file is empty.
    """
    request_id = getattr(request.state, "request_id", str(uuid4()))

    allowed_content_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF and DOCX files are allowed.",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file. Please upload a valid file.",
        )

    try:
        resume_service = ResumeService(db)
        resume_id = await resume_service.convert_and_store_resume(
            file_bytes=file_bytes,
            file_type=file.content_type,
            filename=file.filename,
            content_type="md",
        )
    except ResumeValidationError as e:
        logger.warning(f"Resume validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error processing file: {str(e)} - traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing file: {str(e)}",
        )

    return {
        "message": f"File {file.filename} successfully processed as MD and stored in the DB",
        "request_id": request_id,
        "resume_id": resume_id,
    }


@resume_router.post(
    "/improve",
    summary="Optimize a resume against a job description (requires payment verification)",
)
async def improve_resume_paid(
    request: Request,
    payload: ResumeImprovementRequest,
    db: SupabaseSession = Depends(get_db_session),
):
    """
    Optimizes a resume against a job description using AI after verifying payment.

    This endpoint requires a successful Stripe payment (payment_intent_id with "succeeded" status).
    It uses OpenRouter AI to optimize the resume and generates a downloadable DOCX file.

    Args:
        request: FastAPI request object
        payload: Request containing resume_id, job_id, and payment_intent_id
        db: Database session

    Returns:
        JSON response with optimized resume content and download information

    Raises:
        HTTPException: If payment verification fails, resume/job not found, or processing fails
    """
    request_id = getattr(request.state, "request_id", str(uuid4()))
    headers = {"X-Request-ID": request_id}

    try:
        # Extract request payload
        request_payload = payload.model_dump()
        resume_id = request_payload.get("resume_id")
        job_id = request_payload.get("job_id")
        payment_intent_id = request_payload.get("payment_intent_id")

        # Validate required fields
        if not resume_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="resume_id is required",
            )
        if not job_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="job_id is required",
            )
        if not payment_intent_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="payment_intent_id is required",
            )

        # Get user ID from request state (set by auth middleware)
        user_id = getattr(request.state, "user_id", None)

        # Initialize paid resume improvement service
        paid_service = PaidResumeImprovementService(db=db)

        # Process the improvement with payment verification
        result = await paid_service.improve_resume(
            resume_id=resume_id,
            job_id=job_id,
            payment_intent_id=payment_intent_id,
            user_id=user_id,
        )

        # Return successful response
        return JSONResponse(
            content={
                "request_id": request_id,
                "success": True,
                "message": "Resume optimized successfully",
                "data": result,
            },
            headers=headers,
        )

    except PaymentVerificationError as e:
        logger.error(f"Payment verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=str(e),
        )
    except ResumeNotFoundError as e:
        logger.error(str(e))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except JobNotFoundError as e:
        logger.error(str(e))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except ResumeParsingError as e:
        logger.error(str(e))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except JobParsingError as e:
        logger.error(str(e))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except ResumeKeywordExtractionError as e:
        logger.warning(str(e))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except JobKeywordExtractionError as e:
        logger.warning(str(e))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error in resume improvement: {str(e)} - traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your resume optimization",
        )


@resume_router.get(
    "",
    summary="Get resume data from both resume and processed_resume models",
)
async def get_resume(
    request: Request,
    resume_id: str = Query(..., description="Resume ID to fetch data for"),
    db: SupabaseSession = Depends(get_db_session),
):
    """
    Retrieves resume data from both resume_model and processed_resume model by resume_id.

    Args:
        resume_id: The ID of the resume to retrieve

    Returns:
        Combined data from both resume and processed_resume models

    Raises:
        HTTPException: If the resume is not found or if there's an error fetching data.
    """
    request_id = getattr(request.state, "request_id", str(uuid4()))
    headers = {"X-Request-ID": request_id}

    try:
        if not resume_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="resume_id is required",
            )

        resume_service = ResumeService(db)
        resume_data = await resume_service.get_resume_with_processed_data(resume_id=resume_id)

        if not resume_data:
            raise ResumeNotFoundError(message=f"Resume with id {resume_id} not found")

        return JSONResponse(
            content={
                "request_id": request_id,
                "data": resume_data,
            },
            headers=headers,
        )

    except ResumeNotFoundError as e:
        logger.error(str(e))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error fetching resume: {str(e)} - traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching resume data",
        )
