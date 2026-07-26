"""
Durable (user, site) → Browserbase context storage.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import SiteSession

logger = logging.getLogger("gryphon.site_sessions")


def normalize_site(site: str) -> str:
    return site.strip().lower()


async def get_active_site_session(
    session: AsyncSession, user_id: str, site: str
) -> Optional[SiteSession]:
    site_key = normalize_site(site)
    result = await session.execute(
        select(SiteSession).where(
            SiteSession.user_id == user_id,
            SiteSession.site == site_key,
            SiteSession.status == "active",
        )
    )
    return result.scalar_one_or_none()


async def upsert_site_session(
    session: AsyncSession,
    *,
    user_id: str,
    site: str,
    browserbase_context_id: str,
) -> SiteSession:
    """Create or update the durable context mapping for (user, site)."""
    site_key = normalize_site(site)
    now = datetime.now(timezone.utc)

    result = await session.execute(
        select(SiteSession).where(
            SiteSession.user_id == user_id,
            SiteSession.site == site_key,
        )
    )
    record = result.scalar_one_or_none()
    if record is None:
        record = SiteSession(
            id=str(uuid.uuid4()),
            user_id=user_id,
            site=site_key,
            browserbase_context_id=browserbase_context_id,
            status="active",
            created_at=now,
            updated_at=now,
            last_used_at=None,
        )
        session.add(record)
        logger.info(
            "site_session.created user_id=%s site=%s context_id=%s",
            user_id,
            site_key,
            browserbase_context_id,
        )
    else:
        record.browserbase_context_id = browserbase_context_id
        record.status = "active"
        record.updated_at = now
        logger.info(
            "site_session.updated user_id=%s site=%s context_id=%s",
            user_id,
            site_key,
            browserbase_context_id,
        )
    await session.flush()
    return record


async def touch_site_session(session: AsyncSession, record: SiteSession) -> None:
    record.last_used_at = datetime.now(timezone.utc)
    record.updated_at = record.last_used_at
    await session.flush()


async def mark_site_session_stale(
    session: AsyncSession, record: SiteSession
) -> None:
    """
    Mark a site session inactive so its Browserbase context is not reused.

    Called when session create from the stored context fails (expired/deleted/invalid).
    """
    if record.status == "stale":
        return
    record.status = "stale"
    record.updated_at = datetime.now(timezone.utc)
    await session.flush()
    logger.info(
        "site_session.stale user_id=%s site=%s context_id=%s",
        record.user_id,
        record.site,
        record.browserbase_context_id,
    )
