"""
Pytest fixtures for Gryphon API tests.

Each test gets an isolated SQLite database and a fresh bootstrap API key.
"""

from __future__ import annotations

import os
from collections.abc import AsyncGenerator, Generator
from pathlib import Path

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# Force test env before app imports that cache settings
_TEST_SECRET = "test-secret-key-for-hmac"
_TEST_API_KEY = "test-api-key-primary"
_TEST_USER_ID = "user_test"


@pytest.fixture()
def tmp_db_url(tmp_path: Path) -> str:
    return f"sqlite+aiosqlite:///{tmp_path / 'test.db'}"


@pytest.fixture()
def app_env(tmp_db_url: str, monkeypatch: pytest.MonkeyPatch) -> Generator[dict, None, None]:
    env = {
        "DATABASE_URL": tmp_db_url,
        "SECRET_KEY": _TEST_SECRET,
        "GRYPHON_API_KEY": _TEST_API_KEY,
        "DEFAULT_USER_ID": _TEST_USER_ID,
        "PUBLIC_BASE_URL": "http://testserver",
        "ESCALATION_TTL_SECONDS": "3600",
        "RESOLVE_TOKEN_TTL_SECONDS": "600",
        "SLACK_BOT_TOKEN": "",
        "SLACK_DEFAULT_CHANNEL": "",
        "ENVIRONMENT": "test",
        "BROWSERBASE_USE_FAKE": "true",
        "BROWSERBASE_API_KEY": "",
    }
    for key, value in env.items():
        monkeypatch.setenv(key, value)

    # Clear cached settings so new env is picked up
    from app.config import get_settings

    get_settings.cache_clear()

    from app.db import session as db_session
    from app.services.browserbase import (
        FakeBrowserbaseClient,
        set_browserbase_client_override,
    )

    db_session.configure_engine(tmp_db_url)
    set_browserbase_client_override(FakeBrowserbaseClient())

    yield env

    set_browserbase_client_override(None)
    get_settings.cache_clear()


@pytest_asyncio.fixture()
async def client(app_env: dict) -> AsyncGenerator[AsyncClient, None]:
    from app.db.session import init_db, async_session_factory
    from app.main import app
    from app.services.api_keys import seed_bootstrap_credentials
    from app.config import get_settings

    await init_db()
    async with async_session_factory() as session:
        await seed_bootstrap_credentials(session, get_settings())
        await session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


@pytest.fixture()
def api_key() -> str:
    return _TEST_API_KEY


@pytest.fixture()
def auth_headers(api_key: str) -> dict[str, str]:
    return {"X-API-Key": api_key}
