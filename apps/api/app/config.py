"""
Application configuration loaded from environment / .env.
"""

from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

# Repo root .env (two levels up from apps/api/app/) and local apps/api/.env
_API_DIR = Path(__file__).resolve().parent.parent
_REPO_ROOT = _API_DIR.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(
            str(_REPO_ROOT / ".env"),
            str(_API_DIR / ".env"),
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: str = "development"
    debug: bool = True
    secret_key: str = "dev-secret-change-me"

    # SQLite path is absolute so cwd does not matter
    database_url: str = f"sqlite+aiosqlite:///{_API_DIR / 'gryphon.db'}"

    # Bootstrap API key seeded into the DB on startup (local dev / single deploy)
    gryphon_api_key: str = "dev-api-key"
    # Bootstrap user id for the seeded key
    default_user_id: str = "user_dev"

    # Used to build resolve links in Slack messages
    public_base_url: str = "http://localhost:8000"

    # Escalation reliability
    escalation_ttl_seconds: int = 86_400  # 24h
    resolve_token_ttl_seconds: int = 3_600  # 1h signed Slack resolve link

    # Slack (optional for local E2E — falls back to logging)
    slack_bot_token: Optional[str] = None
    slack_signing_secret: Optional[str] = None
    slack_default_channel: Optional[str] = None

    browserbase_api_key: Optional[str] = None
    browserbase_project_id: Optional[str] = None
    # When true (or in tests via override), use FakeBrowserbaseClient without real keys
    browserbase_use_fake: bool = False
    # Human login session length (Browserbase timeout, seconds)
    browserbase_human_session_timeout: int = 900
    # Agent session length
    browserbase_agent_session_timeout: int = 600
    # After releasing a persist=true human session, wait before agents reuse
    # the context (Browserbase flushes cookies on session close).
    browserbase_context_sync_seconds: float = 4.0

    api_host: str = "0.0.0.0"
    api_port: int = 8000


@lru_cache
def get_settings() -> Settings:
    return Settings()
