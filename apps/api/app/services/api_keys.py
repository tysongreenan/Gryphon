"""
API key creation, hashing, lookup, and bootstrap seeding.
"""

from __future__ import annotations

import hashlib
import hmac
import logging
import secrets
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.db.models import ApiKey, User

logger = logging.getLogger("gryphon.auth")


@dataclass(frozen=True)
class AuthenticatedPrincipal:
    user_id: str
    api_key_id: str
    key_prefix: str


def hash_api_key(raw_key: str, secret_key: Optional[str] = None) -> str:
    """HMAC-SHA256 hash of the raw API key (never store plaintext)."""
    secret = secret_key if secret_key is not None else get_settings().secret_key
    return hmac.new(
        secret.encode("utf-8"),
        raw_key.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def generate_api_key() -> str:
    """Generate a new raw API key (shown once)."""
    return f"gry_{secrets.token_urlsafe(32)}"


async def create_user_with_api_key(
    session: AsyncSession,
    *,
    email: Optional[str] = None,
    name: Optional[str] = None,
    key_name: str = "default",
    raw_key: Optional[str] = None,
    user_id: Optional[str] = None,
    slack_channel: Optional[str] = None,
    settings: Optional[Settings] = None,
) -> tuple[User, ApiKey, str]:
    """
    Create a user and an API key.

    Returns (user, api_key_record, raw_key). The raw key is only available here.
    """
    settings = settings or get_settings()
    raw = raw_key or generate_api_key()
    uid = user_id or str(uuid.uuid4())
    key_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    user = User(
        id=uid,
        email=email,
        name=name,
        slack_channel=slack_channel,
        created_at=now,
    )
    session.add(user)

    api_key = ApiKey(
        id=key_id,
        user_id=uid,
        key_prefix=raw[:8],
        key_hash=hash_api_key(raw, settings.secret_key),
        name=key_name,
        created_at=now,
    )
    session.add(api_key)
    await session.flush()

    logger.info(
        "api_key.created user_id=%s key_id=%s key_prefix=%s name=%s",
        uid,
        key_id,
        api_key.key_prefix,
        key_name,
    )
    return user, api_key, raw


async def authenticate_api_key(
    session: AsyncSession,
    raw_key: str,
    *,
    settings: Optional[Settings] = None,
) -> Optional[AuthenticatedPrincipal]:
    """Look up a non-revoked API key by raw value. Updates last_used_at."""
    settings = settings or get_settings()
    if not raw_key:
        return None

    digest = hash_api_key(raw_key, settings.secret_key)
    result = await session.execute(
        select(ApiKey).where(ApiKey.key_hash == digest, ApiKey.revoked_at.is_(None))
    )
    record = result.scalar_one_or_none()
    if record is None:
        return None

    record.last_used_at = datetime.now(timezone.utc)
    await session.flush()

    return AuthenticatedPrincipal(
        user_id=record.user_id,
        api_key_id=record.id,
        key_prefix=record.key_prefix,
    )


async def seed_bootstrap_credentials(session: AsyncSession, settings: Optional[Settings] = None) -> None:
    """
    Ensure the bootstrap user + API key from env exist.

    Local dev always has a working GRYPHON_API_KEY after startup.
    Idempotent: skips if the key hash already exists.
    """
    settings = settings or get_settings()
    raw_key = settings.gryphon_api_key
    if not raw_key:
        logger.warning("bootstrap.skip reason=empty_gryphon_api_key")
        return

    digest = hash_api_key(raw_key, settings.secret_key)
    existing = await session.execute(select(ApiKey).where(ApiKey.key_hash == digest))
    if existing.scalar_one_or_none() is not None:
        logger.info("bootstrap.ok key already present prefix=%s", raw_key[:8])
        return

    user_id = settings.default_user_id or "user_dev"
    # Reuse user row if present (e.g. re-seed after key change)
    user_result = await session.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if user is None:
        user = User(
            id=user_id,
            email="dev@localhost",
            name="Dev User",
            slack_channel=settings.slack_default_channel,
            created_at=datetime.now(timezone.utc),
        )
        session.add(user)
    elif settings.slack_default_channel and not user.slack_channel:
        user.slack_channel = settings.slack_default_channel

    api_key = ApiKey(
        id=str(uuid.uuid4()),
        user_id=user_id,
        key_prefix=raw_key[:8],
        key_hash=digest,
        name="bootstrap",
        created_at=datetime.now(timezone.utc),
    )
    session.add(api_key)
    await session.flush()
    logger.info(
        "bootstrap.seeded user_id=%s key_prefix=%s",
        user_id,
        api_key.key_prefix,
    )


async def get_user(session: AsyncSession, user_id: str) -> Optional[User]:
    result = await session.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
