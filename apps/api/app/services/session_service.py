"""
Session service — get_session(site) for agents.
"""

from __future__ import annotations

import logging
from typing import Optional, Union

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.models import EscalationRecord, SiteSession
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
    mark_site_session_stale,
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

        return await self._needs_auth(
            user_id=user_id,
            site=site_key,
            reason=f"No authenticated Browserbase context for {site_key}",
            agent_metadata={"source": "get_session"},
            pending_message=(
                "Authentication still pending for this site. "
                "Wait for the human to resolve the existing escalation."
            ),
        )

    async def _ready_from_stored(
        self,
        *,
        user_id: str,
        site: str,
        context_id: str,
        site_session: SiteSession,
        create_browser_session: bool,
    ) -> GetSessionResult:
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
            # No real BB client: still report ready with the durable context id
            # so local/dev can proceed without connect_url.
            await touch_site_session(self.session, site_session)
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
        except BrowserbaseError as exc:
            # Stored context is dead/expired/invalid — soft-fail to needs_auth
            logger.warning(
                "session.stale_context user_id=%s site=%s status_code=%s — "
                "marking site session stale and escalating",
                user_id,
                site,
                exc.status_code,
            )
            await mark_site_session_stale(self.session, site_session)
            return await self._needs_auth(
                user_id=user_id,
                site=site,
                reason=(
                    f"Stored Browserbase context is no longer usable for {site}. "
                    "Human re-authentication required."
                ),
                current_context_id=context_id,
                agent_metadata={
                    "source": "get_session",
                    "cause": "stale_context",
                },
                pending_message=(
                    "Stored auth context is no longer valid. "
                    "Wait for the human to re-authenticate via the existing escalation."
                ),
                created_message=(
                    "Stored auth context is no longer valid. "
                    "A human has been notified to re-authenticate."
                ),
            )

        await touch_site_session(self.session, site_session)
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

    async def _needs_auth(
        self,
        *,
        user_id: str,
        site: str,
        reason: str,
        agent_metadata: Optional[dict] = None,
        current_context_id: Optional[str] = None,
        pending_message: Optional[str] = None,
        created_message: Optional[str] = None,
    ) -> SessionNeedsAuth:
        """Reuse pending escalation for user+site, or create a new one."""
        pending = await self._find_pending_escalation(user_id, site)
        if pending is not None:
            logger.info(
                "session.needs_auth_existing user_id=%s site=%s escalation_id=%s",
                user_id,
                site,
                pending.id,
            )
            return SessionNeedsAuth(
                site=site,
                escalation_id=pending.id,
                message=pending_message
                or (
                    "Authentication still pending for this site. "
                    "Wait for the human to resolve the existing escalation."
                ),
            )

        esc_service = EscalationService(self.session)
        escalation = await esc_service.create(
            user_id=user_id,
            payload=EscalationCreate(
                site=site,
                reason=reason,
                current_context_id=current_context_id,
                agent_metadata=agent_metadata or {"source": "get_session"},
            ),
        )
        logger.info(
            "session.needs_auth_created user_id=%s site=%s escalation_id=%s",
            user_id,
            site,
            escalation.id,
        )
        kwargs: dict = {"site": site, "escalation_id": escalation.id}
        if created_message is not None:
            kwargs["message"] = created_message
        return SessionNeedsAuth(**kwargs)

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
