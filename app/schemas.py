# app/schemas.py
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional

class UserCreate(BaseModel):
    name: str = Field(...)
    email: EmailStr = Field(...)
    mobile: str = Field(...)
    current_location: str = Field(...)
    preferred_job_location: str = Field(...)
    highest_qualification: str = Field(...)
    job_role: str = Field(...)
    # resume_path not needed here: resume is handled separately

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("name should be at least 3 characters")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 5:
            raise ValueError("email should be at least 5 characters")
        return v

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        v = v.strip()
        if not v.isdigit():
            raise ValueError("mobile should contain only digits")
        if len(v) < 10:
            raise ValueError("mobile should be at least 10 characters")
        return v

    @field_validator("current_location")
    @classmethod
    def validate_current_location(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("current location should be at least 2 characters")
        return v

    @field_validator("preferred_job_location")
    @classmethod
    def validate_preferred_job_location(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("preferred job location should be at least 2 characters")
        return v

    @field_validator("highest_qualification")
    @classmethod
    def validate_highest_qualification(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("highest qualification should be at least 2 characters")
        return v

    @field_validator("job_role")
    @classmethod
    def validate_job_role(cls, v: str) -> str:
        v = v.strip()
        allowed = {"devops", "software_developer"}
        if v not in allowed:
            raise ValueError("job role must be either devops or software_developer")
        return v


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    current_location: Optional[str] = None
    preferred_job_location: Optional[str] = None
    highest_qualification: Optional[str] = None
    job_role: Optional[str] = None

    @field_validator("*")
    @classmethod
    def strip_fields(cls, v):
        if v is not None and isinstance(v, str):
            return v.strip()
        return v
