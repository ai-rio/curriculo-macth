"""
Authentication endpoints for user management.

This module handles user authentication flows including:
- User session validation
- Profile creation and management
- User data retrieval for authenticated users
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.supabase_client import get_supabase_admin_client
from app.schemas.pydantic.user import UserProfile, UserProfileCreate
from supabase import Client

logger = logging.getLogger(__name__)

# HTTP Bearer token scheme for authentication
security = HTTPBearer(auto_error=False)

# Create router
auth_router = APIRouter(prefix="/auth", tags=["authentication"])


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    supabase: Client = Depends(get_supabase_admin_client),
) -> dict:
    """
    Validate JWT token and return current user information.

    Args:
        credentials: Bearer token from Authorization header
        supabase: Supabase admin client

    Returns:
        dict: User information from validated JWT token

    Raises:
        HTTPException: If token is invalid or user not found
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # Verify JWT token and get user
        user_response = supabase.auth.get_user(credentials.credentials)

        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )

        return user_response.user.model_dump()

    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )


@auth_router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client),
):
    """
    Get current user's profile information.

    Args:
        current_user: Authenticated user from JWT token
        supabase: Supabase admin client

    Returns:
        UserProfile: User profile data

    Raises:
        HTTPException: If profile not found or access denied
    """
    try:
        # Get user profile from profiles table
        response = supabase.table("profiles").select("*").eq("id", current_user["id"]).single()

        if response.data is None:
            # Profile doesn't exist, create it
            profile_data = {
                "id": current_user["id"],
                "email": current_user["email"],
                "full_name": current_user.get("user_metadata", {}).get("full_name"),
                "created_at": current_user["created_at"],
                "updated_at": current_user["updated_at"] if "updated_at" in current_user else None,
            }

            create_response = supabase.table("profiles").insert(profile_data).execute()

            if create_response.data is None:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user profile",
                )

            return UserProfile(**create_response.data[0])

        return UserProfile(**response.data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile",
        )


@auth_router.post("/profile", response_model=UserProfile)
async def create_or_update_profile(
    profile_data: UserProfileCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client),
):
    """
    Create or update user profile.

    Args:
        profile_data: Profile data to create/update
        current_user: Authenticated user from JWT token
        supabase: Supabase admin client

    Returns:
        UserProfile: Updated profile data

    Raises:
        HTTPException: If profile creation/update fails
    """
    try:
        # Ensure user can only modify their own profile
        profile_dict = profile_data.model_dump()
        profile_dict["id"] = current_user["id"]  # Force ID to match authenticated user

        # Upsert profile (create if not exists, update if exists)
        response = supabase.table("profiles").upsert(profile_dict).execute()

        if response.data is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create/update user profile",
            )

        return UserProfile(**response.data[0])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating/updating user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create/update user profile",
        )


@auth_router.get("/session")
async def validate_session(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    supabase: Client = Depends(get_supabase_admin_client),
):
    """
    Validate user session and return session information.

    Args:
        credentials: Bearer token from Authorization header
        supabase: Supabase admin client

    Returns:
        dict: Session validation result

    Raises:
        HTTPException: If session is invalid
    """
    try:
        user_response = supabase.auth.get_user(credentials.credentials)

        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session",
            )

        return {
            "valid": True,
            "user_id": user_response.user.id,
            "email": user_response.user.email,
            "created_at": user_response.user.created_at,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session",
        )


@auth_router.post("/refresh")
async def refresh_session(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    supabase: Client = Depends(get_supabase_admin_client),
):
    """
    Refresh user session token.

    Args:
        credentials: Bearer token from Authorization header
        supabase: Supabase admin client

    Returns:
        dict: New session tokens

    Raises:
        HTTPException: If token refresh fails
    """
    try:
        # For Supabase, session refresh is typically handled client-side
        # This endpoint can be used to validate if refresh is needed
        user_response = supabase.auth.get_user(credentials.credentials)

        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        return {
            "message": "Session is still valid. Refresh should be handled client-side.",
            "user_id": user_response.user.id,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session refresh error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to refresh session",
        )
