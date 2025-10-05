"""
User-related Pydantic schemas for data validation and serialization.

This module contains schemas for:
- User profiles
- Profile creation and updates
- User session information
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserProfileBase(BaseModel):
    """Base user profile schema with common fields."""

    email: EmailStr = Field(..., description="User's email address")
    full_name: str | None = Field(None, max_length=255, description="User's full name")
    avatar_url: str | None = Field(None, description="URL to user's avatar image")
    bio: str | None = Field(None, max_length=1000, description="User's bio or description")

    model_config = ConfigDict(from_attributes=True)


class UserProfileCreate(UserProfileBase):
    """Schema for creating or updating user profiles."""

    # These fields are typically set by the system, not the user
    id: str | None = Field(None, description="User ID from auth system")
    created_at: datetime | None = Field(None, description="Profile creation timestamp")
    updated_at: datetime | None = Field(None, description="Profile last update timestamp")


class UserProfile(UserProfileBase):
    """Complete user profile schema with all fields."""

    id: str = Field(..., description="User ID from auth system")
    created_at: datetime = Field(..., description="Profile creation timestamp")
    updated_at: datetime | None = Field(None, description="Profile last update timestamp")


class UserSession(BaseModel):
    """Schema for user session information."""

    valid: bool = Field(..., description="Whether the session is valid")
    user_id: str = Field(..., description="Authenticated user ID")
    email: EmailStr = Field(..., description="User's email address")
    created_at: datetime = Field(..., description="Session creation timestamp")
    expires_at: datetime | None = Field(None, description="Session expiration timestamp")


class SessionRefresh(BaseModel):
    """Schema for session refresh response."""

    message: str = Field(..., description="Refresh status message")
    user_id: str = Field(..., description="Authenticated user ID")
    requires_refresh: bool = Field(False, description="Whether client-side refresh is needed")


class AuthError(BaseModel):
    """Schema for authentication error responses."""

    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Human-readable error message")
    details: dict | None = Field(None, description="Additional error details")


class AuthSuccess(BaseModel):
    """Schema for successful authentication responses."""

    success: bool = Field(True, description="Operation success status")
    message: str = Field(..., description="Success message")
    user_id: str | None = Field(None, description="User ID if applicable")
    session_info: dict | None = Field(None, description="Additional session information")
