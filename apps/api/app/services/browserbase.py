"""
Browserbase HTTP client — contexts, sessions, live-view debug URLs.

When BROWSERBASE_API_KEY is unset, operations raise BrowserbaseNotConfiguredError
so callers can fall back to manual context ids (local dev without BB).
"""

from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass
from typing import Optional, Protocol

import httpx

from app.config import Settings, get_settings

logger = logging.getLogger("gryphon.browserbase")

API_BASE = "https://api.browserbase.com/v1"


class BrowserbaseError(Exception):
    def __init__(self, message: str, *, status_code: Optional[int] = None):
        self.status_code = status_code
        super().__init__(message)


class BrowserbaseNotConfiguredError(BrowserbaseError):
    def __init__(self):
        super().__init__("Browserbase is not configured (set BROWSERBASE_API_KEY)")


@dataclass(frozen=True)
class BrowserbaseContext:
    id: str


@dataclass(frozen=True)
class BrowserbaseSession:
    id: str
    connect_url: Optional[str] = None
    selenium_remote_url: Optional[str] = None
    signing_key: Optional[str] = None
    context_id: Optional[str] = None
    status: Optional[str] = None


@dataclass(frozen=True)
class LiveViewLinks:
    debugger_url: Optional[str] = None
    debugger_fullscreen_url: Optional[str] = None
    pages: Optional[list] = None

    @property
    def preferred_url(self) -> Optional[str]:
        return self.debugger_fullscreen_url or self.debugger_url


class BrowserbaseClient(Protocol):
    async def create_context(self) -> BrowserbaseContext: ...

    async def create_session(
        self,
        *,
        context_id: str,
        persist: bool,
        timeout_seconds: Optional[int] = None,
    ) -> BrowserbaseSession: ...

    async def get_live_view(self, session_id: str) -> LiveViewLinks: ...


class HttpBrowserbaseClient:
    """Real Browserbase REST API client."""

    def __init__(self, settings: Optional[Settings] = None):
        self.settings = settings or get_settings()
        if not self.settings.browserbase_api_key:
            raise BrowserbaseNotConfiguredError()
        self._api_key = self.settings.browserbase_api_key
        self._project_id = self.settings.browserbase_project_id

    def _headers(self) -> dict[str, str]:
        return {
            "X-BB-API-Key": self._api_key,
            "Content-Type": "application/json",
        }

    async def create_context(self) -> BrowserbaseContext:
        payload: dict = {}
        if self._project_id:
            payload["projectId"] = self._project_id
        data = await self._request("POST", "/contexts", json=payload, expected=201)
        context_id = data["id"]
        logger.info("browserbase.context_created context_id=%s", context_id)
        return BrowserbaseContext(id=context_id)

    async def create_session(
        self,
        *,
        context_id: str,
        persist: bool,
        timeout_seconds: Optional[int] = None,
    ) -> BrowserbaseSession:
        payload: dict = {
            "browserSettings": {
                "context": {
                    "id": context_id,
                    "persist": persist,
                }
            }
        }
        if self._project_id:
            payload["projectId"] = self._project_id
        if timeout_seconds is not None:
            payload["timeout"] = timeout_seconds

        data = await self._request("POST", "/sessions", json=payload, expected=201)
        session = BrowserbaseSession(
            id=data["id"],
            connect_url=data.get("connectUrl"),
            selenium_remote_url=data.get("seleniumRemoteUrl"),
            signing_key=data.get("signingKey"),
            context_id=data.get("contextId") or context_id,
            status=data.get("status"),
        )
        logger.info(
            "browserbase.session_created session_id=%s context_id=%s persist=%s",
            session.id,
            context_id,
            persist,
        )
        return session

    async def get_live_view(self, session_id: str) -> LiveViewLinks:
        data = await self._request("GET", f"/sessions/{session_id}/debug", expected=200)
        links = LiveViewLinks(
            debugger_url=data.get("debuggerUrl"),
            debugger_fullscreen_url=data.get("debuggerFullscreenUrl"),
            pages=data.get("pages"),
        )
        logger.info(
            "browserbase.live_view session_id=%s has_url=%s",
            session_id,
            bool(links.preferred_url),
        )
        return links

    async def _request(
        self,
        method: str,
        path: str,
        *,
        json: Optional[dict] = None,
        expected: int = 200,
    ) -> dict:
        url = f"{API_BASE}{path}"
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.request(
                method, url, headers=self._headers(), json=json
            )
        if resp.status_code != expected:
            # Never log API key; response body may include error detail only
            detail = resp.text[:500]
            logger.error(
                "browserbase.http_error method=%s path=%s status=%s body=%s",
                method,
                path,
                resp.status_code,
                detail,
            )
            raise BrowserbaseError(
                f"Browserbase {method} {path} failed ({resp.status_code})",
                status_code=resp.status_code,
            )
        if not resp.content:
            return {}
        return resp.json()


class FakeBrowserbaseClient:
    """
    In-memory fake for tests and local runs without Browserbase credentials.

    Generates deterministic-looking ids; no network calls.

    Test knobs (opt-in):
    - fail_create_session_for: context ids that raise BrowserbaseError on create_session
    - fail_create_session: raise on every create_session
    - fail_live_view: raise on get_live_view
    - empty_live_view: return LiveViewLinks with no URLs
    """

    def __init__(self):
        self.contexts: list[str] = []
        self.sessions: list[dict] = []
        self.fail_create_session_for: set[str] = set()
        self.fail_create_session: bool = False
        self.fail_live_view: bool = False
        self.empty_live_view: bool = False

    async def create_context(self) -> BrowserbaseContext:
        cid = f"ctx_fake_{uuid.uuid4().hex[:12]}"
        self.contexts.append(cid)
        return BrowserbaseContext(id=cid)

    async def create_session(
        self,
        *,
        context_id: str,
        persist: bool,
        timeout_seconds: Optional[int] = None,
    ) -> BrowserbaseSession:
        if self.fail_create_session or context_id in self.fail_create_session_for:
            raise BrowserbaseError(
                f"Simulated Browserbase session create failure for context",
                status_code=400,
            )
        sid = f"ses_fake_{uuid.uuid4().hex[:12]}"
        self.sessions.append(
            {"id": sid, "context_id": context_id, "persist": persist}
        )
        return BrowserbaseSession(
            id=sid,
            connect_url=f"wss://connect.fake.browserbase.local/sessions/{sid}",
            selenium_remote_url=f"https://connect.fake.browserbase.local/sessions/{sid}/selenium",
            signing_key=f"sign_fake_{sid[-8:]}",
            context_id=context_id,
            status="RUNNING",
        )

    async def get_live_view(self, session_id: str) -> LiveViewLinks:
        if self.fail_live_view:
            raise BrowserbaseError(
                "Simulated Live View provisioning failure",
                status_code=500,
            )
        if self.empty_live_view:
            return LiveViewLinks()
        return LiveViewLinks(
            debugger_url=f"https://www.browserbase.com/devtools/inspector.html?session={session_id}",
            debugger_fullscreen_url=(
                f"https://www.browserbase.com/devtools/inspector.html"
                f"?session={session_id}&fullscreen=true"
            ),
        )


# Process-wide override for tests (None = use real or raise not configured)
_client_override: Optional[BrowserbaseClient] = None


def set_browserbase_client_override(client: Optional[BrowserbaseClient]) -> None:
    global _client_override
    _client_override = client


def get_browserbase_client(
    settings: Optional[Settings] = None,
    *,
    allow_fake: bool = False,
) -> BrowserbaseClient:
    """
    Return the active Browserbase client.

    - Test override wins if set
    - Real client when API key present
    - Fake client when allow_fake=True and no key (dev-friendly resolve provisioning)
    - Else raises BrowserbaseNotConfiguredError
    """
    if _client_override is not None:
        return _client_override

    settings = settings or get_settings()
    if settings.browserbase_api_key:
        return HttpBrowserbaseClient(settings)
    if allow_fake or settings.browserbase_use_fake:
        return FakeBrowserbaseClient()
    raise BrowserbaseNotConfiguredError()
