"""
Authentication middleware for FastAPI endpoints.

This module provides middleware for:
- JWT token validation
- User session management
- Protected route enforcement
- Profile auto-creation for new users
"""

import logging
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.supabase_client import get_supabase_admin_client
from supabase import Client

logger = logging.getLogger(__name__)

# HTTP Bearer token scheme for authentication
security = HTTPBearer(auto_error=False)


async def get_optional_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    supabase: Client = Depends(get_supabase_admin_client),
) -> dict | None:
    """
    Get authenticated user if token is provided, but don't require authentication.

    Args:
        credentials: Optional Bearer token from Authorization header
        supabase: Supabase admin client

    Returns:
        Optional[dict]: User information if token is valid, None otherwise
    """
    if not credentials:
        return None

    try:
        user_response = supabase.auth.get_user(credentials.credentials)
        return user_response.user.model_dump() if user_response.user else None
    except Exception as e:
        logger.warning(f"Optional authentication failed: {str(e)}")
        return None


async def get_required_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    supabase: Client = Depends(get_supabase_admin_client),
) -> dict:
    """
    Validate JWT token and return authenticated user information.

    This is a dependency for protected endpoints that require authentication.

    Args:
        credentials: Bearer token from Authorization header
        supabase: Supabase admin client

    Returns:
        dict: User information from validated JWT token

    Raises:
        HTTPException: If token is invalid or missing
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_response = supabase.auth.get_user(credentials.credentials)

        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_data = user_response.user.model_dump()

        # Auto-create profile if it doesn't exist
        await ensure_user_profile(user_data, supabase)

        return user_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def ensure_user_profile(user_data: dict, supabase: Client) -> None:
    """
    Ensure user profile exists in the database, create if missing.

    Args:
        user_data: User information from Supabase auth
        supabase: Supabase admin client
    """
    try:
        # Check if profile exists
        profile_response = supabase.table("profiles").select("id").eq("id", user_data["id"]).single()

        if profile_response.data is None:
            # Create profile if it doesn't exist
            profile_data = {
                "id": user_data["id"],
                "email": user_data["email"],
                "full_name": user_data.get("user_metadata", {}).get("full_name"),
                "created_at": user_data["created_at"],
                "updated_at": user_data.get("updated_at"),
            }

            create_response = supabase.table("profiles").insert(profile_data).execute()

            if create_response.data is None:
                logger.error(f"Failed to create profile for user {user_data['id']}")
            else:
                logger.info(f"Created profile for user {user_data['id']}")

    except Exception as e:
        logger.error(f"Error ensuring user profile: {str(e)}")
        # Don't raise exception here to avoid breaking authentication flow


def require_auth(user_data: Annotated[dict, Depends(get_required_user)]) -> dict:
    """
    Simple wrapper to make authentication requirement explicit.

    Args:
        user_data: Authenticated user data

    Returns:
        dict: User data (for chaining with other dependencies)
    """
    return user_data


def optional_auth(user_data: Annotated[dict | None, Depends(get_optional_user)]) -> dict | None:
    """
    Simple wrapper to make optional authentication explicit.

    Args:
        user_data: Optional authenticated user data

    Returns:
        Optional[dict]: User data or None
    """
    return user_data


class AuthenticatedUser:
    """
    Utility class for working with authenticated users in endpoints.
    """

    def __init__(self, user_data: dict):
        self.user_data = user_data
        self.id = user_data["id"]
        self.email = user_data["email"]
        self.created_at = user_data["created_at"]
        self.metadata = user_data.get("user_metadata", {})

    @property
    def full_name(self) -> str | None:
        """Get user's full name from metadata."""
        return self.metadata.get("full_name")

    @property
    def is_new_user(self) -> bool:
        """Check if user was created recently (within last 5 minutes)."""
        from datetime import datetime, timedelta

        created_at = datetime.fromisoformat(self.created_at.replace("Z", "+00:00"))
        return datetime.now(created_at.tzinfo) - created_at < timedelta(minutes=5)

    def get_profile(self, supabase: Client) -> dict | None:
        """Get user's profile from database."""
        try:
            response = supabase.table("profiles").select("*").eq("id", self.id).single()
            return response.data
        except Exception as e:
            logger.error(f"Error getting profile for user {self.id}: {str(e)}")
            return None


async def get_authenticated_user(user_data: Annotated[dict, Depends(get_required_user)]) -> AuthenticatedUser:
    """
    Get authenticated user as AuthenticatedUser object.

    Args:
        user_data: Raw user data from JWT token

    Returns:
        AuthenticatedUser: User data wrapper with utility methods
    """
    return AuthenticatedUser(user_data)
