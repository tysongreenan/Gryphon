"""
Session service — get_session(site) for agents.
"""

from __future__ import annotations

import logging
from typing import Optional, Union

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.models import EscalationRecord
from app.models.escalation import EscalationCreate, EscalationStatus
from app.models.session import SessionNeedsAuth, SessionReady
from app.services.browserbase import (
    BrowserbaseError,
    BrowserbaseNotConfiguredError,
    get_browserbase_client,
)
from app.services.escalation_service import EscalationService
from app.services.site_sessions import (
    get_active_site_session,
    normalize_site,
    touch_site_session,
)

logger = logging.getLogger("gryphon.sessions")

GetSessionResult = Union[SessionReady, SessionNeedsAuth]


class SessionService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.settings = get_settings()

    async def get_session(
        self,
        user_id: str,
        site: str,
        *,
        create_browser_session: bool = True,
    ) -> GetSessionResult:
        site_key = normalize_site(site)
        stored = await get_active_site_session(self.session, user_id, site_key)

        if stored is not None:
            return await self._ready_from_stored(
                user_id=user_id,
                site=site_key,
                context_id=stored.browserbase_context_id,
                site_session=stored,
                create_browser_session=create_browser_session,
            )

        # Reuse an existing pending escalation for this user+site if any
        pending = await self._find_pending_escalation(user_id, site_key)
        if pending is not None:
            logger.info(
                "session.needs_auth_existing user_id=%s site=%s escalation_id=%s",
                user_id,
                site_key,
                pending.id,
            )
            return SessionNeedsAuth(
                site=site_key,
                escalation_id=pending.id,
                message=(
                    "Authentication still pending for this site. "
                    "Wait for the human to resolve the existing escalation."
                ),
            )

        # Create new escalation
        esc_service = EscalationService(self.session)
        escalation = await esc_service.create(
            user_id=user_id,
            payload=EscalationCreate(
                site=site_key,
                reason=f"No authenticated Browserbase context for {site_key}",
                agent_metadata={"source": "get_session"},
            ),
        )
        logger.info(
            "session.needs_auth_created user_id=%s site=%s escalation_id=%s",
            user_id,
            site_key,
            escalation.id,
        )
        return SessionNeedsAuth(site=site_key, escalation_id=escalation.id)

    async def _ready_from_stored(
        self,
        *,
        user_id: str,
        site: str,
        context_id: str,
        site_session,
        create_browser_session: bool,
    ) -> SessionReady:
        await touch_site_session(self.session, site_session)

        if not create_browser_session:
            return SessionReady(
                site=site,
                context_id=context_id,
                message="Stored context ready (no Browserbase session created)",
            )

        try:
            client = get_browserbase_client(self.settings, allow_fake=True)
            bb_session = await client.create_session(
                context_id=context_id,
                persist=False,
                timeout_seconds=self.settings.browserbase_agent_session_timeout,
            )
        except BrowserbaseNotConfiguredError:
            logger.warning(
                "session.ready_context_only user_id=%s site=%s (browserbase not configured)",
                user_id,
                site,
            )
            return SessionReady(
                site=site,
                context_id=context_id,
                message=(
                    "Stored context ready. Configure BROWSERBASE_API_KEY to "
                    "receive a live connect_url for agent runs."
                ),
            )
        except BrowserbaseError:
            logger.exception(
                "session.browserbase_failed user_id=%s site=%s — falling back to context id",
                user_id,
                site,
            )
            return SessionReady(
                site=site,
                context_id=context_id,
                message=(
                    "Stored context available but failed to create a Browserbase session. "
                    "Use context_id directly or retry."
                ),
            )

        logger.info(
            "session.ready user_id=%s site=%s session_id=%s context_id=%s",
            user_id,
            site,
            bb_session.id,
            context_id,
        )
        return SessionReady(
            site=site,
            context_id=context_id,
            session_id=bb_session.id,
            connect_url=bb_session.connect_url,
            selenium_remote_url=bb_session.selenium_remote_url,
            signing_key=bb_session.signing_key,
            persist=False,
            message="Authenticated session ready",
        )

    async def _find_pending_escalation(
        self, user_id: str, site: str
    ) -> Optional[EscalationRecord]:
        result = await self.session.execute(
            select(EscalationRecord).where(
                EscalationRecord.user_id == user_id,
                EscalationRecord.site == site,
                EscalationRecord.status == EscalationStatus.PENDING.value,
            )
        )
        return result.scalar_one_or_none()
