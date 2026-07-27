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

    async def release_session(self, session_id: str) -> None: ...

    async def navigate_session(self, connect_url: str, url: str) -> None: ...


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

    async def release_session(self, session_id: str) -> None:
        """
        End a Browserbase session so persist:true contexts flush cookies.

        POST /v1/sessions/{id} with status REQUEST_RELEASE.
        """
        await self._request(
            "POST",
            f"/sessions/{session_id}",
            json={"status": "REQUEST_RELEASE"},
            expected=200,
            allow_statuses={200, 201, 204, 404, 409},
        )
        logger.info("browserbase.session_released session_id=%s", session_id)

    async def navigate_session(self, connect_url: str, url: str) -> None:
        """Open a URL in the remote browser (so Live View is not a blank tab)."""
        await _cdp_navigate(connect_url, url)

    async def _request(
        self,
        method: str,
        path: str,
        *,
        json: Optional[dict] = None,
        expected: int = 200,
        allow_statuses: Optional[set[int]] = None,
    ) -> dict:
        url = f"{API_BASE}{path}"
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.request(
                method, url, headers=self._headers(), json=json
            )
        ok = {expected}
        if allow_statuses:
            ok |= allow_statuses
        if resp.status_code not in ok:
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
        try:
            return resp.json()
        except Exception:
            return {}


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
        self.released_sessions: list[str] = []
        self.fail_create_session_for: set[str] = set()
        self.fail_create_session: bool = False
        self.fail_live_view: bool = False
        self.empty_live_view: bool = False
        # When True, create_session fails if the human session for that context
        # was never released (simulates BB simultaneous-use / empty context).
        self.require_release_before_reuse: bool = False

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
        if self.require_release_before_reuse and not persist:
            open_human = [
                s
                for s in self.sessions
                if s["context_id"] == context_id
                and s.get("persist") is True
                and s["id"] not in self.released_sessions
            ]
            if open_human:
                raise BrowserbaseError(
                    "Simulated failure: human persist session still open for context",
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

    async def release_session(self, session_id: str) -> None:
        self.released_sessions.append(session_id)

    async def navigate_session(self, connect_url: str, url: str) -> None:
        if not hasattr(self, "navigated_urls"):
            self.navigated_urls: list[str] = []
        self.navigated_urls.append(url)
        logger.info("browserbase.fake_navigate url=%s", url)


async def _cdp_navigate(connect_url: str, url: str) -> None:
    """
    Connect over CDP and navigate the default page to ``url``.

    Prefer Playwright when installed; fall back to a minimal websockets CDP path.
    Never closes the browser — Live View must stay open for the human.
    """
    # 1) Playwright (best support for Browserbase connect_url)
    try:
        from playwright.async_api import async_playwright  # type: ignore

        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(connect_url)
            try:
                context = browser.contexts[0] if browser.contexts else None
                if context is None:
                    raise BrowserbaseError("No browser context on CDP connect")
                page = context.pages[0] if context.pages else await context.new_page()
                await page.goto(url, wait_until="domcontentloaded", timeout=45_000)
                logger.info("browserbase.navigated via=playwright url=%s", url)
            finally:
                # Detach without stopping the remote session
                await browser.close()
        return
    except ImportError:
        pass
    except Exception as exc:
        logger.warning("browserbase.playwright_navigate_failed err=%s", exc)

    # 2) Minimal CDP over websockets
    try:
        import websockets  # type: ignore
    except ImportError as exc:
        raise BrowserbaseError(
            "Cannot navigate session: install playwright or websockets"
        ) from exc

    import json
    import asyncio

    async with websockets.connect(connect_url, max_size=None) as ws:
        msg_id = 0

        async def call(method: str, params: Optional[dict] = None, session_id: Optional[str] = None) -> dict:
            nonlocal msg_id
            msg_id += 1
            payload: dict = {"id": msg_id, "method": method}
            if params:
                payload["params"] = params
            if session_id:
                payload["sessionId"] = session_id
            await ws.send(json.dumps(payload))
            while True:
                raw = await asyncio.wait_for(ws.recv(), timeout=30.0)
                data = json.loads(raw)
                if data.get("id") == msg_id:
                    if "error" in data:
                        raise BrowserbaseError(str(data["error"]))
                    return data.get("result") or {}

        # Discover a page target
        targets = await call("Target.getTargets")
        page_target = None
        for t in targets.get("targetInfos", []):
            if t.get("type") == "page":
                page_target = t
                break
        if page_target is None:
            created = await call("Target.createTarget", {"url": "about:blank"})
            target_id = created.get("targetId")
        else:
            target_id = page_target["targetId"]

        attached = await call("Target.attachToTarget", {"targetId": target_id, "flatten": True})
        session_id = attached.get("sessionId")
        await call("Page.enable", session_id=session_id)
        await call("Page.navigate", {"url": url}, session_id=session_id)
        logger.info("browserbase.navigated via=cdp url=%s", url)


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
