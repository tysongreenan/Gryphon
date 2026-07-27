"""
Escalation Service

Handles creation of escalations, notifying humans, provisioning Browserbase
login sessions for resolve, and storing durable site contexts on resolve.
"""

from __future__ import annotations

import asyncio
import json
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.models import EscalationRecord
from app.models.escalation import (
    Escalation,
    EscalationCreate,
    EscalationStatus,
)
from app.services.api_keys import get_user
from app.services.browserbase import (
    BrowserbaseError,
    BrowserbaseNotConfiguredError,
    get_browserbase_client,
)
from app.services.notifications.slack import send_escalation_notification
from app.services.resolve_tokens import create_resolve_token
from app.services.site_sessions import normalize_site, upsert_site_session
from app.services.site_urls import resolve_start_url

logger = logging.getLogger("gryphon.escalation")


class EscalationNotFoundError(Exception):
    pass


class EscalationNotPendingError(Exception):
    def __init__(self, status: str):
        self.status = status
        super().__init__(f"Escalation is not pending (status={status})")


class EscalationExpiredError(Exception):
    pass


class EscalationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.settings = get_settings()

    async def create(self, user_id: str, payload: EscalationCreate) -> Escalation:
        """Create a new escalation and notify the human."""
        escalation_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(seconds=self.settings.escalation_ttl_seconds)
        site = normalize_site(payload.site)

        meta = dict(payload.agent_metadata or {})
        start = resolve_start_url(
            site,
            explicit_url=payload.start_url,
            agent_metadata=meta,
        )
        if start:
            meta.setdefault("start_url", start)

        record = EscalationRecord(
            id=escalation_id,
            user_id=user_id,
            site=site,
            reason=payload.reason,
            status=EscalationStatus.PENDING.value,
            screenshot_url=payload.screenshot_url,
            current_context_id=payload.current_context_id,
            agent_metadata_json=_dump_metadata(meta or None),
            created_at=now,
            expires_at=expires_at,
        )
        self.session.add(record)
        await self.session.flush()

        token = create_resolve_token(escalation_id)
        resolve_url = (
            f"{self.settings.public_base_url.rstrip('/')}"
            f"/v1/escalations/{escalation_id}/human-resolve?token={token}"
        )

        channel = self.settings.slack_default_channel or ""
        user = await get_user(self.session, user_id)
        if user and user.slack_channel:
            channel = user.slack_channel

        try:
            await send_escalation_notification(
                channel=channel,
                escalation_id=escalation_id,
                site=site,
                reason=payload.reason,
                screenshot_url=payload.screenshot_url,
                resolve_url=resolve_url,
                expires_at=expires_at,
            )
        except Exception:
            # Notification failure must not leave the agent without an escalation record
            logger.exception(
                "escalation.notify_failed escalation_id=%s user_id=%s",
                escalation_id,
                user_id,
            )

        logger.info(
            "escalation.created escalation_id=%s user_id=%s site=%s expires_at=%s",
            escalation_id,
            user_id,
            site,
            expires_at.isoformat(),
        )
        return _to_api_model(record)

    async def get(self, escalation_id: str) -> Optional[Escalation]:
        record = await self._get_record(escalation_id)
        if record is None:
            return None
        await self._expire_if_needed(record)
        return _to_api_model(record)

    async def ensure_human_login_session(self, escalation_id: str) -> Escalation:
        """
        Provision Browserbase Context + Session (persist=true) + Live View
        for the human resolve page. Idempotent if already provisioned.
        """
        record = await self._get_record(escalation_id)
        if record is None:
            raise EscalationNotFoundError(escalation_id)

        await self._expire_if_needed(record)
        if record.status != EscalationStatus.PENDING.value:
            return _to_api_model(record)

        # Already fully provisioned
        if record.bb_context_id and record.live_view_url:
            return _to_api_model(record)

        try:
            client = get_browserbase_client(self.settings, allow_fake=True)
            if not record.bb_context_id:
                context = await client.create_context()
                record.bb_context_id = context.id
                await self.session.flush()

            # Re-create a human session if we only have a context (or lost live view)
            if not record.live_view_url:
                bb_session = await client.create_session(
                    context_id=record.bb_context_id,
                    persist=True,
                    timeout_seconds=self.settings.browserbase_human_session_timeout,
                )
                record.bb_session_id = bb_session.id
                live = await client.get_live_view(bb_session.id)
                record.live_view_url = live.preferred_url
                await self.session.flush()

                # Open the site login page so the human isn't staring at a blank tab
                start_url = self._start_url_for(record)
                if start_url and bb_session.connect_url:
                    try:
                        await client.navigate_session(bb_session.connect_url, start_url)
                        logger.info(
                            "escalation.navigated escalation_id=%s url=%s",
                            escalation_id,
                            start_url,
                        )
                    except Exception:
                        logger.exception(
                            "escalation.navigate_failed escalation_id=%s url=%s",
                            escalation_id,
                            start_url,
                        )

                if record.live_view_url:
                    logger.info(
                        "escalation.login_session_ready escalation_id=%s "
                        "context_id=%s session_id=%s has_live_view=true",
                        escalation_id,
                        record.bb_context_id,
                        record.bb_session_id,
                    )
                else:
                    # Session exists but BB returned no debugger URL — resolve
                    # page shows manual fallback; human can still confirm.
                    logger.warning(
                        "escalation.live_view_missing escalation_id=%s "
                        "context_id=%s session_id=%s",
                        escalation_id,
                        record.bb_context_id,
                        record.bb_session_id,
                    )
        except BrowserbaseNotConfiguredError:
            logger.warning(
                "escalation.no_browserbase escalation_id=%s — human must paste context id",
                escalation_id,
            )
        except BrowserbaseError as exc:
            # Keep any partial context id so resolve can still store a durable
            # mapping if the human pastes a context or we already created one.
            logger.warning(
                "escalation.browserbase_provision_failed escalation_id=%s "
                "status_code=%s has_context=%s",
                escalation_id,
                exc.status_code,
                bool(record.bb_context_id),
            )

        return _to_api_model(record)

    async def resolve(
        self,
        escalation_id: str,
        resolved_context_id: Optional[str] = None,
    ) -> Escalation:
        """
        Mark escalation resolved, persist site session context, attach resolved_context_id.

        Critical Browserbase detail: cookies/localStorage are written to a Context
        only when a session with persist=true **closes**. We therefore release the
        human Live View session first, wait for context sync, then store the mapping.
        Otherwise the next get_session reuses an empty/stale context and fails.
        """
        record = await self._get_record(escalation_id)
        if record is None:
            raise EscalationNotFoundError(escalation_id)

        await self._expire_if_needed(record)

        if record.status == EscalationStatus.EXPIRED.value:
            raise EscalationExpiredError(escalation_id)

        if record.status != EscalationStatus.PENDING.value:
            raise EscalationNotPendingError(record.status)

        # Prefer explicit id, then context provisioned for the human login session
        context_id = resolved_context_id or record.bb_context_id

        # Close human session so persist:true flushes auth into the Context.
        # Also avoids simultaneous sessions on the same context (sites force logout).
        await self._release_human_session(record)

        if context_id is not None:
            record.resolved_context_id = context_id
            await upsert_site_session(
                self.session,
                user_id=record.user_id,
                site=record.site,
                browserbase_context_id=context_id,
            )

        record.status = EscalationStatus.RESOLVED.value
        record.resolved_at = datetime.now(timezone.utc)

        await self.session.flush()
        logger.info(
            "escalation.resolved escalation_id=%s has_context=%s site=%s",
            escalation_id,
            bool(context_id),
            record.site,
        )
        return _to_api_model(record)

    async def _release_human_session(self, record: EscalationRecord) -> None:
        """
        End the Browserbase login session (if any) and wait for context sync.

        Best-effort: resolve still succeeds if release fails (session already gone).
        """
        session_id = getattr(record, "bb_session_id", None)
        if not session_id:
            return

        try:
            client = get_browserbase_client(self.settings, allow_fake=True)
            await client.release_session(session_id)
            logger.info(
                "escalation.human_session_released escalation_id=%s session_id=%s",
                record.id,
                session_id,
            )
        except BrowserbaseNotConfiguredError:
            logger.warning(
                "escalation.release_skipped_no_bb escalation_id=%s",
                record.id,
            )
            return
        except BrowserbaseError as exc:
            # Session may already be timed out / released — continue with wait
            logger.warning(
                "escalation.release_failed escalation_id=%s session_id=%s status=%s",
                record.id,
                session_id,
                exc.status_code,
            )

        wait = float(self.settings.browserbase_context_sync_seconds or 0)
        if wait > 0:
            await asyncio.sleep(wait)
            logger.info(
                "escalation.context_sync_wait escalation_id=%s seconds=%s",
                record.id,
                wait,
            )

    async def _get_record(self, escalation_id: str) -> Optional[EscalationRecord]:
        result = await self.session.execute(
            select(EscalationRecord).where(EscalationRecord.id == escalation_id)
        )
        return result.scalar_one_or_none()

    def _start_url_for(self, record: EscalationRecord) -> Optional[str]:
        meta = _load_metadata(record.agent_metadata_json)
        return resolve_start_url(
            record.site,
            agent_metadata=meta,
        )

    async def _expire_if_needed(self, record: EscalationRecord) -> None:
        if record.status != EscalationStatus.PENDING.value:
            return
        if record.expires_at is None:
            return
        expires = record.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if expires <= datetime.now(timezone.utc):
            record.status = EscalationStatus.EXPIRED.value
            await self.session.flush()
            logger.info("escalation.expired escalation_id=%s", record.id)


def _dump_metadata(metadata: Optional[dict]) -> Optional[str]:
    if metadata is None:
        return None
    return json.dumps(metadata)


def _load_metadata(raw: Optional[str]) -> Optional[dict]:
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def _to_api_model(record: EscalationRecord) -> Escalation:
    return Escalation(
        id=record.id,
        user_id=record.user_id,
        site=record.site,
        reason=record.reason,
        status=EscalationStatus(record.status),
        screenshot_url=record.screenshot_url,
        current_context_id=record.current_context_id,
        resolved_context_id=record.resolved_context_id,
        bb_context_id=getattr(record, "bb_context_id", None),
        bb_session_id=getattr(record, "bb_session_id", None),
        live_view_url=getattr(record, "live_view_url", None),
        created_at=record.created_at,
        expires_at=record.expires_at,
        resolved_at=record.resolved_at,
        agent_metadata=_load_metadata(record.agent_metadata_json),
    )
