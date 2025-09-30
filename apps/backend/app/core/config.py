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
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    DB_ECHO: bool = False
    PYTHONDONTWRITEBYTECODE: int = 1
    SYNC_DATABASE_URL: str | None = None
    ASYNC_DATABASE_URL: str | None = None
    SESSION_SECRET_KEY: str | None = None
    LLM_PROVIDER: str | None = "ollama"
    LLM_API_KEY: str | None = None
    LLM_BASE_URL: str | None = None
    LL_MODEL: str | None = "gemma3:4b"
    EMBEDDING_PROVIDER: str | None = "ollama"
    EMBEDDING_API_KEY: str | None = None
    EMBEDDING_BASE_URL: str | None = None
    EMBEDDING_MODEL: str | None = "dengcao/Qwen3-Embedding-0.6B:Q8_0"

    # Stripe Configuration
    stripe_secret_key: str | None = None
    stripe_webhook_secret: str | None = None
    stripe_price_id: str | None = None

    # Supabase Configuration
    supabase_url: str | None = None
    supabase_service_role_key: str | None = None

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), os.pardir, os.pardir, ".env"),
        env_file_encoding="utf-8",
    )


settings = Settings()


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
