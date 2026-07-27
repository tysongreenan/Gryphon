"""
Public waitlist persistence.
"""

from __future__ import annotations

import logging
import re
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import WaitlistSignup
from app.models.waitlist import WaitlistCreate, WaitlistResult

logger = logging.getLogger("gryphon.waitlist")

_WS_RE = re.compile(r"\s+")


def _clean_optional(value: str | None, max_len: int) -> str | None:
    if value is None:
        return None
    cleaned = _WS_RE.sub(" ", value).strip()
    if not cleaned:
        return None
    return cleaned[:max_len]


class WaitlistService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def signup(self, payload: WaitlistCreate) -> WaitlistResult:
        email = str(payload.email).strip().lower()
        use_case = _clean_optional(payload.use_case, 500)
        source = _clean_optional(payload.source, 80) or "landing"

        existing = await self.db.scalar(
            select(WaitlistSignup).where(WaitlistSignup.email == email)
        )
        if existing is not None:
            logger.info("waitlist.duplicate email=%s", email)
            return WaitlistResult(
                ok=True,
                email=existing.email,
                created=False,
                created_at=existing.created_at,
            )

        now = datetime.now(timezone.utc)
        row = WaitlistSignup(
            id=str(uuid.uuid4()),
            email=email,
            use_case=use_case,
            source=source,
            created_at=now,
        )
        self.db.add(row)
        await self.db.flush()
        logger.info("waitlist.created email=%s source=%s", email, source)
        return WaitlistResult(
            ok=True,
            email=row.email,
            created=True,
            created_at=row.created_at,
        )
