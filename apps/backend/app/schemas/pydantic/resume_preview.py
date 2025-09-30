from pydantic import BaseModel


class PersonalInfo(BaseModel):
    name: str
    title: str | None = None
    email: str
    phone: str
    location: str | None = None
    website: str | None = None
    linkedin: str | None = None
    github: str | None = None


class ExperienceItem(BaseModel):
    id: int
    title: str
    company: str | None = None
    location: str | None = None
    years: str | None = None
    description: list[str | None] = []


class EducationItem(BaseModel):
    id: int
    institution: str
    degree: str
    years: str | None = None
    description: str | None = None


class ResumePreviewerModel(BaseModel):
    personalInfo: PersonalInfo
    summary: str | None = None
    experience: list[ExperienceItem]
    education: list[EducationItem]
    skills: list[str]
