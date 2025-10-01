from uuid import UUID

from pydantic import BaseModel, Field


class ResumeImprovementRequest(BaseModel):
    job_id: UUID = Field(..., description="DB UUID reference to the job")
    resume_id: UUID = Field(..., description="DB UUID reference to the resume")
    payment_intent_id: str = Field(..., description="Stripe payment intent ID (must be in 'succeeded' status)")
