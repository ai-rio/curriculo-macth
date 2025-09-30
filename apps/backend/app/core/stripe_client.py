"""
Stripe client configuration for Resume-Matcher.

This module provides a centralized Stripe client instance and configuration
following the patterns from QuoteKit but adapted for Resume-Matcher's needs.
"""

import os

import stripe
from stripe import StripeClient

# Get Stripe API key from environment
_STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
_STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

if not _STRIPE_SECRET_KEY:
    raise ValueError("STRIPE_SECRET_KEY environment variable is required")

# Type-safe constants (we know they're not None after the check)
STRIPE_SECRET_KEY: str = _STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET: str | None = _STRIPE_WEBHOOK_SECRET

# Configure Stripe with API version and app info
stripe.api_key = STRIPE_SECRET_KEY
stripe.api_version = "2024-11-20.acacia"  # Latest API version

# Singleton Stripe client instance
stripe_client: StripeClient | None = None


def get_stripe_client() -> StripeClient:
    """
    Get or create the singleton Stripe client instance.

    Returns:
        StripeClient: Configured Stripe client instance
    """
    global stripe_client

    if stripe_client is None:
        stripe_client = StripeClient(
            api_key=STRIPE_SECRET_KEY,
            # Set app info for Stripe dashboard
            stripe_version="2024-11-20.acacia",
        )

    return stripe_client


def get_webhook_secret() -> str:
    """
    Get the Stripe webhook signing secret.

    Returns:
        str: Webhook signing secret

    Raises:
        ValueError: If webhook secret is not configured
    """
    if not STRIPE_WEBHOOK_SECRET:
        raise ValueError("STRIPE_WEBHOOK_SECRET environment variable is required")

    return STRIPE_WEBHOOK_SECRET
