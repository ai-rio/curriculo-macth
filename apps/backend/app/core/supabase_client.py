"""
Supabase client configuration for Resume-Matcher backend.

Provides admin client with service role key for backend operations.
"""

import os

from supabase import Client, create_client

# Get Supabase credentials from environment
# Try both naming conventions for compatibility
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL environment variable is required")

if not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY environment variable is required")

# Singleton Supabase admin client instance
_supabase_admin_client: Client | None = None


def get_supabase_admin_client() -> Client:
    """
    Get or create the singleton Supabase admin client instance.

    This client uses the service role key and bypasses RLS policies.
    Should ONLY be used in backend code, NEVER exposed to frontend.

    Returns:
        Client: Configured Supabase client with admin privileges
    """
    global _supabase_admin_client

    if _supabase_admin_client is None:
        _supabase_admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    return _supabase_admin_client
