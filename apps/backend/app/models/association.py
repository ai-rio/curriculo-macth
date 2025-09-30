from sqlalchemy import Column, ForeignKey, String, Table

from .base import Base

job_resume_association = Table(
    "job_resume",
    Base.metadata,
    Column(
        "processed_job_id",
        String,
        ForeignKey("processed_jobs.job_id"),
        primary_key=True,
    ),
    Column(
        "processed_resume_id",
        String,
        ForeignKey("processed_resumes.resume_id"),
        primary_key=True,
    ),
)
