from pydantic import BaseModel, Field


class Location(BaseModel):
    city: str
    country: str


class PersonalData(BaseModel):
    firstName: str = Field(..., alias="firstName")
    lastName: str | None = Field(..., alias="lastName")
    email: str
    phone: str
    linkedin: str | None = None
    portfolio: str | None = None
    location: Location


class Experience(BaseModel):
    job_title: str = Field(..., alias="jobTitle")
    company: str
    location: str
    start_date: str = Field(..., alias="startDate")
    end_date: str = Field(..., alias="endDate")
    description: list[str]
    technologies_used: list[str] | None = Field(default_factory=list, alias="technologiesUsed")


class Project(BaseModel):
    project_name: str = Field(..., alias="projectName")
    description: str
    technologies_used: list[str] = Field(..., alias="technologiesUsed")
    link: str | None = None
    start_date: str | None = Field(None, alias="startDate")
    end_date: str | None = Field(None, alias="endDate")


class Skill(BaseModel):
    category: str
    skill_name: str = Field(..., alias="skillName")


class ResearchWork(BaseModel):
    title: str | None = None
    publication: str | None = None
    date: str | None = None
    link: str | None = None
    description: str | None = None


class Education(BaseModel):
    institution: str
    degree: str
    field_of_study: str | None = Field(None, alias="fieldOfStudy")
    start_date: str = Field(..., alias="startDate")
    end_date: str = Field(..., alias="endDate")
    grade: str | None = None
    description: str | None = None


class StructuredResumeModel(BaseModel):
    personal_data: PersonalData = Field(..., alias="Personal Data")
    experiences: list[Experience] = Field(..., alias="Experiences")
    projects: list[Project] = Field(..., alias="Projects")
    skills: list[Skill] = Field(..., alias="Skills")
    research_work: list[ResearchWork] = Field(default_factory=list, alias="Research Work")
    achievements: list[str] = Field(default_factory=list, alias="Achievements")
    education: list[Education] = Field(..., alias="Education")
    extracted_keywords: list[str] = Field(default_factory=list, alias="Extracted Keywords")

    class ConfigDict:
        validate_by_name = True
        str_strip_whitespace = True
