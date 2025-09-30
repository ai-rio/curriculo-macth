import enum

from pydantic import BaseModel, Field


class EmploymentTypeEnum(str, enum.Enum):
    """Case-insensitive Enum for employment types."""

    FULL_TIME = "Full-time"
    FULL_TIME_NO_DASH = "Full time"
    PART_TIME = "Part-time"
    PART_TIME_NO_DASH = "Part time"
    CONTRACT = "Contract"
    INTERNSHIP = "Internship"
    TEMPORARY = "Temporary"
    NOT_SPECIFIED = "Not Specified"

    @classmethod
    def _missing_(cls, value: object):
        """Handles case-insensitive lookup."""
        if isinstance(value, str):
            # Handle the case where the AI returns "string" as a literal value
            if value.lower() == "string":
                return cls.NOT_SPECIFIED

            value_lower = value.lower()
            mapping = {member.value.lower(): member for member in cls}
            if value_lower in mapping:
                return mapping[value_lower]

        raise ValueError(
            "employment type must be one of: Full-time, Full time, Part-time, Part time, Contract, Internship, Temporary, Not Specified (case insensitive)"
        )


class RemoteStatusEnum(str, enum.Enum):
    """Case-insensitive Enum for remote work status."""

    FULLY_REMOTE = "Fully Remote"
    HYBRID = "Hybrid"
    ON_SITE = "On-site"
    REMOTE = "Remote"
    NOT_SPECIFIED = "Not Specified"
    MULTIPLE_LOCATIONS = "Multiple Locations"

    @classmethod
    def _missing_(cls, value: object):
        """Handles case-insensitive lookup."""
        if isinstance(value, str):
            # Handle the case where the AI returns "string" as a literal value
            if value.lower() == "string":
                return cls.NOT_SPECIFIED

            value_lower = value.lower()
            mapping = {member.value.lower(): member for member in cls}
            if value_lower in mapping:
                return mapping[value_lower]

        raise ValueError(
            "remote_status must be one of: Fully Remote, Hybrid, On-site, Remote, Not Specified, Multiple Locations (case insensitive)"
        )


class CompanyProfile(BaseModel):
    company_name: str = Field(..., alias="companyName")
    industry: str | None = None
    website: str | None = None
    description: str | None = None


class Location(BaseModel):
    city: str | None = None
    state: str | None = None
    country: str | None = None
    remote_status: RemoteStatusEnum = Field(..., alias="remoteStatus")


class Qualifications(BaseModel):
    required: list[str]
    preferred: list[str] | None = None


class CompensationAndBenefits(BaseModel):
    salary_range: str | None = Field(..., alias="salaryRange")
    benefits: list[str] | None = None


class ApplicationInfo(BaseModel):
    how_to_apply: str | None = Field(..., alias="howToApply")
    apply_link: str | None = Field(..., alias="applyLink")
    contact_email: str | None = Field(..., alias="contactEmail")


class StructuredJobModel(BaseModel):
    job_title: str = Field(..., alias="jobTitle")
    company_profile: CompanyProfile = Field(..., alias="companyProfile")
    location: Location
    date_posted: str = Field(..., alias="datePosted")
    employment_type: EmploymentTypeEnum = Field(..., alias="employmentType")
    job_summary: str = Field(..., alias="jobSummary")
    key_responsibilities: list[str] = Field(..., alias="keyResponsibilities")
    qualifications: Qualifications
    compensation_and_benefits: CompensationAndBenefits | None = Field(None, alias="compensationAndBenefits")
    application_info: ApplicationInfo | None = Field(None, alias="applicationInfo")
    extracted_keywords: list[str] = Field(..., alias="extractedKeywords")

    class ConfigDict:
        validate_by_name = True
        str_strip_whitespace = True
