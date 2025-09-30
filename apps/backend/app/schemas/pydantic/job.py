from uuid import UUID

from pydantic import BaseModel, Field


class JobUploadRequest(BaseModel):
    job_descriptions: list[str] = Field(..., description="List of job descriptions in markdown format")
    resume_id: UUID = Field(..., description="UUID reference to the resume")
