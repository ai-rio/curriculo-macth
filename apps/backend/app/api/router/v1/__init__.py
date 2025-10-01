from fastapi import APIRouter

from .job import job_router
from .payments import router as payments_router
from .resume import resume_router
from .webhooks import router as webhooks_router

v1_router = APIRouter(prefix="/api/v1")

v1_router.include_router(resume_router)
v1_router.include_router(job_router)
v1_router.include_router(payments_router)
v1_router.include_router(webhooks_router)
