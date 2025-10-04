import logging
import os
import sys
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # The defaults here are just hardcoded to have 'something'. The main place to set defaults is in apps/backend/.env.sample,
    # which is copied to the user's .env file upon setup.
    PROJECT_NAME: str = "Resume Matcher"
    FRONTEND_PATH: str = os.path.join(os.path.dirname(__file__), "frontend", "assets")
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
    ]
    ENV: str = "development"  # Development environment by default
    DB_ECHO: bool = False
    PYTHONDONTWRITEBYTECODE: int = 1
    SYNC_DATABASE_URL: str | None = None
    ASYNC_DATABASE_URL: str | None = None
    SESSION_SECRET_KEY: str | None = None
    LLM_PROVIDER: str | None = "openrouter"
    LLM_API_KEY: str | None = None
    LLM_BASE_URL: str | None = "https://openrouter.ai/api/v1"
    LL_MODEL: str | None = "anthropic/claude-3.5-sonnet"
    EMBEDDING_PROVIDER: str | None = "openrouter"
    EMBEDDING_API_KEY: str | None = None
    EMBEDDING_BASE_URL: str | None = "https://openrouter.ai/api/v1"
    EMBEDDING_MODEL: str | None = "text-embedding-3-small"

    # Stripe Configuration
    stripe_secret_key: str | None = None
    stripe_webhook_secret: str | None = None
    stripe_price_id: str | None = None

    # Supabase Configuration
    supabase_url: str | None = None
    supabase_service_role_key: str | None = None

    # OpenRouter Configuration
    OPENROUTER_API_KEY: str | None = None
    OPENROUTER_MODEL: str = "anthropic/claude-3.5-sonnet"
    OPENROUTER_MAX_TOKENS: int = 4000
    OPENROUTER_TEMPERATURE: float = 0.7

    # Allow model override per request (security feature)
    ALLOW_MODEL_OVERRIDE: bool = False

    # Strict model validation (if True, only allowed models can be used)
    STRICT_MODEL_VALIDATION: bool = False

    # File Upload Configuration
    MAX_RESUME_SIZE_MB: int = 2
    MAX_JOB_DESC_CHARS: int = 10000
    MIN_JOB_DESC_CHARS: int = 50

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), os.pardir, os.pardir, ".env"),
        env_file_encoding="utf-8",
    )


settings = Settings()


# Supported OpenRouter Models
# See: https://openrouter.ai/models for full list
SUPPORTED_OPENROUTER_MODELS = [
    "anthropic/claude-3.5-sonnet",
    "anthropic/claude-3-opus",
    "anthropic/claude-3-haiku",
    "openai/gpt-4",
    "openai/gpt-4-turbo",
    "openai/gpt-4o",
    "google/gemini-pro",
    "google/gemini-flash",
    "meta-llama/llama-3.1-405b-instruct",
    "meta-llama/llama-3.1-70b-instruct",
    "mistralai/mistral-large",
    "cohere/command-r-plus",
]


def validate_model(model: str) -> bool:
    """
    Validate if the model is supported.

    Args:
        model: Model identifier (e.g., "anthropic/claude-3.5-sonnet")

    Returns:
        True if model is valid, False otherwise
    """
    if not settings.STRICT_MODEL_VALIDATION:
        return True
    return model in SUPPORTED_OPENROUTER_MODELS


_LEVEL_BY_ENV: dict[Literal["production", "staging", "local"], int] = {
    "production": logging.INFO,
    "staging": logging.DEBUG,
    "local": logging.DEBUG,
}


def setup_logging() -> None:
    """
    Configure the root logger exactly once,

    * Console only (StreamHandler -> stderr)
    * ISO - 8601 timestamps
    * Env - based log level: production -> INFO, else DEBUG
    * Prevents duplicate handler creation if called twice
    """
    root = logging.getLogger()
    if root.handlers:
        return

    env = settings.ENV.lower() if hasattr(settings, "ENV") else "production"
    level = _LEVEL_BY_ENV.get(env, logging.INFO)

    formatter = logging.Formatter(
        fmt="[%(asctime)s - %(name)s - %(levelname)s] %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S%z",
    )

    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(formatter)

    root.setLevel(level)
    root.addHandler(handler)

    for noisy in ("sqlalchemy.engine", "uvicorn.access"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
