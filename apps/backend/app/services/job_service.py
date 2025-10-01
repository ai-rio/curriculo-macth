import json
import logging
import uuid
from typing import Any

from pydantic import ValidationError

from app.agent import AgentManager
from app.core.database import DatabaseOperations, SupabaseSession
from app.prompt import prompt_factory
from app.schemas.json import json_schema_factory
from app.schemas.pydantic import StructuredJobModel

from .exceptions import JobNotFoundError

logger = logging.getLogger(__name__)


class JobService:
    def __init__(self, db: SupabaseSession):
        self.db = db
        self.db_ops = DatabaseOperations(db)
        self.json_agent_manager = AgentManager()

    async def create_and_store_job(self, job_data: dict) -> list[str]:
        """
        Stores job data in the database and returns a list of job IDs.
        """
        resume_id = str(job_data.get("resume_id"))

        if not await self._is_resume_available(resume_id):
            raise AssertionError(f"resume corresponding to resume_id: {resume_id} not found")

        job_ids = []
        for job_description in job_data.get("job_descriptions", []):
            job_id = str(uuid.uuid4())

            job_data_entry = {
                "job_id": job_id,
                "resume_id": str(resume_id),
                "content": job_description,
                "content_type": "text/markdown",
            }

            # Insert job using Supabase
            await self.db_ops.insert("jobs", job_data_entry)

            await self._extract_and_store_structured_job(job_id=job_id, job_description_text=job_description)
            logger.info(f"Job ID: {job_id}")
            job_ids.append(job_id)

        return job_ids

    async def _is_resume_available(self, resume_id: str) -> bool:
        """
        Checks if a resume exists in the database.
        """
        resume = await self.db_ops.select_by_id("resumes", "resume_id", resume_id)
        return resume is not None

    async def _extract_and_store_structured_job(self, job_id, job_description_text: str):
        """
        extract and store structured job data in the database
        """
        structured_job = await self._extract_structured_json(job_description_text)
        if not structured_job:
            logger.info("Structured job extraction failed.")
            return None

        processed_job_data = {
            "job_id": job_id,
            "job_title": structured_job.get("job_title"),
            "company_profile": structured_job.get("company_profile") if structured_job.get("company_profile") else None,
            "location": structured_job.get("location") if structured_job.get("location") else None,
            "date_posted": structured_job.get("date_posted"),
            "employment_type": structured_job.get("employment_type"),
            "job_summary": structured_job.get("job_summary"),
            "key_responsibilities": {"key_responsibilities": structured_job.get("key_responsibilities", [])}
            if structured_job.get("key_responsibilities")
            else None,
            "qualifications": structured_job.get("qualifications", [])
            if structured_job.get("qualifications")
            else None,
            "compensation_and_benfits": structured_job.get("compensation_and_benfits", [])
            if structured_job.get("compensation_and_benfits")
            else None,
            "application_info": structured_job.get("application_info", [])
            if structured_job.get("application_info")
            else None,
            "extracted_keywords": {"extracted_keywords": structured_job.get("extracted_keywords", [])}
            if structured_job.get("extracted_keywords")
            else None,
        }

        # Insert processed job using Supabase
        await self.db_ops.insert("processed_jobs", processed_job_data)

        return job_id

    async def _extract_structured_json(self, job_description_text: str) -> dict[str, Any] | None:
        """
        Uses the AgentManager+JSONWrapper to ask the LLM to
        return the data in exact JSON schema we need.
        """
        prompt_template = prompt_factory.get("structured_job")
        prompt = prompt_template.format(
            json.dumps(json_schema_factory.get("structured_job"), indent=2),
            job_description_text,
        )
        logger.info(f"Structured Job Prompt: {prompt}")
        raw_output = await self.json_agent_manager.run(prompt=prompt)

        try:
            structured_job: StructuredJobModel = StructuredJobModel.model_validate(raw_output)
        except ValidationError as e:
            logger.info(f"Validation error: {e}")
            error_details = []
            for error in e.errors():
                field = " -> ".join(str(loc) for loc in error["loc"])
                error_details.append(f"{field}: {error['msg']}")

            logger.info(f"Validation error details: {'; '.join(error_details)}")
            return None
        return structured_job.model_dump(mode="json")

    async def get_job_with_processed_data(self, job_id: str) -> dict | None:
        """
        Fetches both job and processed job data from the database and combines them.

        Args:
            job_id: The ID of the job to retrieve

        Returns:
            Combined data from both job and processed_job models

        Raises:
            JobNotFoundError: If the job is not found
        """
        # Fetch job data using Supabase
        job = await self.db_ops.select_by_id("jobs", "job_id", job_id)

        if not job:
            raise JobNotFoundError(job_id=job_id)

        # Fetch processed job data using Supabase
        processed_job = await self.db_ops.select_by_id("processed_jobs", "job_id", job_id)

        combined_data = {
            "job_id": job["job_id"],
            "raw_job": {
                "id": job["id"],
                "resume_id": job["resume_id"],
                "content": job["content"],
                "created_at": job["created_at"],
            },
            "processed_job": None,
        }

        if processed_job:
            combined_data["processed_job"] = {
                "job_title": processed_job.get("job_title"),
                "company_profile": processed_job.get("company_profile"),
                "location": processed_job.get("location"),
                "date_posted": processed_job.get("date_posted"),
                "employment_type": processed_job.get("employment_type"),
                "job_summary": processed_job.get("job_summary"),
                "key_responsibilities": processed_job.get("key_responsibilities", {}).get("key_responsibilities", [])
                if processed_job.get("key_responsibilities")
                else None,
                "qualifications": processed_job.get("qualifications", [])
                if processed_job.get("qualifications")
                else None,
                "compensation_and_benfits": processed_job.get("compensation_and_benfits", [])
                if processed_job.get("compensation_and_benfits")
                else None,
                "application_info": processed_job.get("application_info", [])
                if processed_job.get("application_info")
                else None,
                "extracted_keywords": processed_job.get("extracted_keywords", {}).get("extracted_keywords", [])
                if processed_job.get("extracted_keywords")
                else None,
                "processed_at": processed_job.get("processed_at"),
            }

        return combined_data
