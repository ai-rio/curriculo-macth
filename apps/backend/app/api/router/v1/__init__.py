from fastapi import APIRouter

from .job import router as job_router
from .optimizations import router as optimizations_router
from .payments import router as payments_router
from .resume import router as resume_router
from .webhooks import router as webhooks_router

v1_router = APIRouter(prefix="/api/v1")

v1_router.include_router(resume_router)
v1_router.include_router(job_router)
v1_router.include_router(payments_router)
v1_router.include_router(webhooks_router)
v1_router.include_router(optimizations_router)
