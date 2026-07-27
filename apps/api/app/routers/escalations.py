"""
Escalation routes — create, poll, resolve (API key + signed human link).
"""

from __future__ import annotations

from html import escape
from typing import Optional

from fastapi import APIRouter, Body, Depends, Form, HTTPException, Query, status
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import require_api_key
from app.db.session import get_db
from app.models.escalation import Escalation, EscalationCreate, EscalationResolve
from app.services.escalation_service import (
    EscalationExpiredError,
    EscalationNotFoundError,
    EscalationNotPendingError,
    EscalationService,
)
from app.services.resolve_tokens import verify_resolve_token

router = APIRouter()


def _http_error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={"code": code, "message": message},
    )


@router.post("/", response_model=Escalation, status_code=status.HTTP_201_CREATED)
async def create_escalation(
    payload: EscalationCreate,
    user_id: str = Depends(require_api_key),
    db: AsyncSession = Depends(get_db),
):
    """
    Called by an agent when it needs human help with authentication.
    Creates an escalation and notifies the human owner.
    """
    service = EscalationService(db)
    return await service.create(user_id=user_id, payload=payload)


@router.get("/{escalation_id}", response_model=Escalation)
async def get_escalation(
    escalation_id: str,
    user_id: str = Depends(require_api_key),
    db: AsyncSession = Depends(get_db),
):
    """Get the current status of an escalation (used by agents to poll)."""
    service = EscalationService(db)
    escalation = await service.get(escalation_id)
    # Ownership: other users get the same 404 as missing (no existence leak)
    if escalation is None or escalation.user_id != user_id:
        raise _http_error(
            status.HTTP_404_NOT_FOUND,
            "escalation_not_found",
            "Escalation not found",
        )
    return escalation


@router.post("/{escalation_id}/resolve", response_model=Escalation)
async def resolve_escalation(
    escalation_id: str,
    payload: EscalationResolve = Body(default_factory=EscalationResolve),
    user_id: str = Depends(require_api_key),
    db: AsyncSession = Depends(get_db),
):
    """
    Programmatic resolve (API key). Marks the escalation as resolved,
    stores a durable site session when a context id is available.
    """
    service = EscalationService(db)
    existing = await service.get(escalation_id)
    if existing is None or existing.user_id != user_id:
        raise _http_error(
            status.HTTP_404_NOT_FOUND,
            "escalation_not_found",
            "Escalation not found",
        )

    return await _do_resolve(
        service,
        escalation_id=escalation_id,
        resolved_context_id=payload.resolved_context_id,
    )


@router.get("/{escalation_id}/human-resolve", response_class=HTMLResponse)
async def human_resolve_page(
    escalation_id: str,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Browser page opened from Slack.

    Provisions a Browserbase Context + Live View session (persist=true) so the
    human can log in, then shows a confirm form.
    """
    if not verify_resolve_token(escalation_id, token):
        return HTMLResponse(
            _page(
                title="Invalid or expired link",
                body=(
                    "<p>This resolve link is invalid or has expired.</p>"
                    "<p>Ask the agent to create a new escalation, or resolve via API key.</p>"
                ),
                ok=False,
            ),
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    service = EscalationService(db)
    try:
        escalation = await service.ensure_human_login_session(escalation_id)
    except EscalationNotFoundError:
        return HTMLResponse(
            _page(
                title="Not found",
                body="<p>This escalation does not exist.</p>",
                ok=False,
            ),
            status_code=status.HTTP_404_NOT_FOUND,
        )

    if escalation.status.value == "resolved":
        ctx = escape(escalation.resolved_context_id or "")
        return HTMLResponse(
            _page(
                title="Already resolved",
                body=(
                    f"<p>Escalation <code>{escape(escalation_id)}</code> is already "
                    f"<strong>resolved</strong>. The agent can call "
                    f"<code>get_session</code> for <strong>{escape(escalation.site)}</strong>."
                    + (f"</p><p>Context: <code>{ctx}</code>" if ctx else "")
                    + "</p>"
                ),
                ok=True,
            )
        )

    if escalation.status.value == "expired":
        return HTMLResponse(
            _page(
                title="Escalation expired",
                body=(
                    f"<p>Escalation <code>{escape(escalation_id)}</code> has expired. "
                    "The agent should create a new one.</p>"
                ),
                ok=False,
            ),
            status_code=status.HTTP_410_GONE,
        )

    if escalation.status.value != "pending":
        return HTMLResponse(
            _page(
                title="Cannot resolve",
                body=(
                    f"<p>Escalation status is <code>{escape(escalation.status.value)}</code>.</p>"
                ),
                ok=False,
            ),
            status_code=status.HTTP_409_CONFLICT,
        )

    from app.services.site_urls import resolve_start_url

    site = escape(escalation.site)
    reason = escape(escalation.reason)
    eid = escape(escalation_id)
    tok = escape(token)
    start_url = resolve_start_url(
        escalation.site,
        agent_metadata=escalation.agent_metadata,
    )
    start_esc = escape(start_url) if start_url else ""

    live_section = ""
    if escalation.live_view_url:
        live = escape(escalation.live_view_url)
        url_chip = (
            f'<p class="url-chip">Opening → <code>{start_esc}</code></p>'
            if start_url
            else '<p class="muted">No login URL on file — go to the site login page in Live View.</p>'
        )
        live_section = f"""
        {url_chip}
        <a class="btn primary" href="{live}" target="_blank" rel="noopener">Open Live View →</a>
        <ol class="steps">
          <li>Live View should already be on the login page (if we know the URL).</li>
          <li>Sign in fully — including 2FA if prompted.</li>
          <li>Stay on the logged-in screen a few seconds.</li>
          <li>Come back here → <strong>Mark resolved</strong> (closes Live View so the login is saved).</li>
        </ol>
        <p class="muted small">
          Gryphon saves the <em>browser session</em> (cookies), not your password.
          Agents reuse that session — they never see your credentials.
        </p>
        """
    else:
        has_ctx = bool(escalation.bb_context_id)
        provision_note = (
            "A browser context was created, but Live View could not open. "
            if has_ctx
            else "Live View could not be provisioned. "
        )
        live_section = f"""
        <p class="warn">
          {provision_note}
          You can still unblock the agent by pasting a Browserbase context id, or leave blank.
        </p>
        <label for="resolved_context_id">Browserbase context id (optional)</label>
        <input id="resolved_context_id" name="resolved_context_id"
               type="text" placeholder="ctx_…" form="resolve-form" />
        """

    body = f"""
    <p class="kicker">Agent needs you</p>
    <p class="lede">Sign in to <strong>{site}</strong> once. Your agents keep working after that.</p>
    <p class="muted">{reason}</p>
    {live_section}
    <form id="resolve-form" method="post" action="/v1/escalations/{eid}/human-resolve">
      <input type="hidden" name="token" value="{tok}" />
      <button class="btn ink" type="submit">I've logged in — Mark resolved</button>
    </form>
    """
    auto_open = escalation.live_view_url or ""
    return HTMLResponse(
        _page(
            title=f"Connect {escalation.site}",
            body=body,
            ok=True,
            auto_open_url=auto_open,
        )
    )


@router.post("/{escalation_id}/human-resolve", response_class=HTMLResponse)
async def human_resolve_submit(
    escalation_id: str,
    token: str = Form(...),
    resolved_context_id: Optional[str] = Form(default=None),
    db: AsyncSession = Depends(get_db),
):
    """Form POST from the human-resolve page (signed token, no API key)."""
    if not verify_resolve_token(escalation_id, token):
        return HTMLResponse(
            _page(
                title="Invalid or expired link",
                body="<p>This resolve link is invalid or has expired.</p>",
                ok=False,
            ),
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    service = EscalationService(db)
    ctx = resolved_context_id.strip() if resolved_context_id else None
    if ctx == "":
        ctx = None

    try:
        escalation = await service.resolve(
            escalation_id=escalation_id,
            resolved_context_id=ctx,
        )
    except EscalationNotFoundError:
        return HTMLResponse(
            _page(
                title="Not found",
                body="<p>This escalation does not exist.</p>",
                ok=False,
            ),
            status_code=status.HTTP_404_NOT_FOUND,
        )
    except EscalationExpiredError:
        return HTMLResponse(
            _page(
                title="Escalation expired",
                body="<p>This escalation has expired. Create a new one.</p>",
                ok=False,
            ),
            status_code=status.HTTP_410_GONE,
        )
    except EscalationNotPendingError as exc:
        return HTMLResponse(
            _page(
                title="Already handled",
                body=(
                    f"<p>Escalation cannot be resolved "
                    f"(status=<code>{escape(exc.status)}</code>).</p>"
                ),
                ok=False,
            ),
            status_code=status.HTTP_409_CONFLICT,
        )

    site = escape(escalation.site)
    context_line = ""
    if escalation.resolved_context_id:
        context_line = (
            f"<p>Durable context stored for <strong>{site}</strong>: "
            f"<code>{escape(escalation.resolved_context_id)}</code></p>"
            f"<p>Live View was closed so cookies could flush into storage. "
            f"The agent can now call <code>get_session(\"{site}\")</code> "
            f"(wait a few seconds if it still says needs_auth).</p>"
        )
    else:
        context_line = (
            f"<p>Escalation resolved without a stored context. "
            f"The agent is unblocked but <code>get_session</code> may need auth again.</p>"
        )

    return HTMLResponse(
        _page(
            title="Resolved",
            body=(
                f"<p>Escalation <code>{escape(escalation.id)}</code> is now "
                f"<strong>resolved</strong>.</p>"
                f"{context_line}"
            ),
            ok=True,
        )
    )


async def _do_resolve(
    service: EscalationService,
    *,
    escalation_id: str,
    resolved_context_id: Optional[str],
) -> Escalation:
    try:
        return await service.resolve(
            escalation_id=escalation_id,
            resolved_context_id=resolved_context_id,
        )
    except EscalationNotFoundError:
        raise _http_error(
            status.HTTP_404_NOT_FOUND,
            "escalation_not_found",
            "Escalation not found",
        )
    except EscalationExpiredError:
        raise _http_error(
            status.HTTP_410_GONE,
            "escalation_expired",
            "Escalation has expired",
        )
    except EscalationNotPendingError as exc:
        raise _http_error(
            status.HTTP_409_CONFLICT,
            "escalation_not_pending",
            f"Escalation cannot be resolved (status={exc.status})",
        )


def _page(
    *,
    title: str,
    body: str,
    ok: bool,
    auto_open_url: str = "",
) -> str:
    # Gryphon brand tokens (match marketing dashboard)
    ink = "#0c0d10"
    paper = "#fbfbfa"
    blue = "#1d4ed8" if ok else "#b91c1c"
    muted = "#4a4d55"
    faint = "#7a7d85"
    auto_script = ""
    if auto_open_url:
        import json as _json

        auto_script = f"""
  <script>
    (function () {{
      try {{
        var key = "gryphon_lv_" + location.pathname;
        if (!sessionStorage.getItem(key)) {{
          sessionStorage.setItem(key, "1");
          window.open({_json.dumps(auto_open_url)}, "_blank", "noopener");
        }}
      }} catch (e) {{}}
    }})();
  </script>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{escape(title)} · Gryphon</title>
  <style>
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      min-height: 100vh;
      font-family: "Helvetica Neue", Helvetica, Arial, ui-sans-serif, system-ui, sans-serif;
      background: {paper};
      color: {ink};
      line-height: 1.5;
    }}
    .shell {{
      max-width: 28rem;
      margin: 0 auto;
      padding: 2.5rem 1.25rem 3rem;
    }}
    .brand {{
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      margin-bottom: 1.75rem;
      color: {ink};
    }}
    .brand-mark {{
      width: 1.35rem;
      height: 1.35rem;
      border-radius: 0.3rem;
      background: {ink};
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: 700;
    }}
    .card {{
      background: #fff;
      border: 1px solid rgba(12,13,16,0.09);
      border-radius: 0.75rem;
      padding: 1.35rem 1.4rem 1.5rem;
      box-shadow: 0 18px 44px -32px rgba(12,13,16,0.35);
    }}
    h1 {{
      font-size: 1.35rem;
      letter-spacing: -0.03em;
      margin: 0 0 0.75rem;
      font-weight: 500;
      color: {ink};
    }}
    .kicker {{
      margin: 0 0 0.35rem;
      font-family: ui-monospace, "JetBrains Mono", Menlo, monospace;
      font-size: 0.6875rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: {faint};
    }}
    .lede {{ margin: 0 0 0.5rem; font-size: 1rem; letter-spacing: -0.015em; }}
    .muted {{ color: {muted}; font-size: 0.875rem; }}
    .small {{ font-size: 0.8125rem; margin-top: 1rem; }}
    .url-chip {{
      margin: 1rem 0 0.75rem;
      padding: 0.55rem 0.7rem;
      background: rgba(29,78,216,0.06);
      border-radius: 0.4rem;
      font-size: 0.8125rem;
      color: {muted};
      word-break: break-all;
    }}
    .url-chip code {{
      font-family: ui-monospace, Menlo, monospace;
      font-size: 0.75rem;
      color: {ink};
    }}
    .warn {{
      color: #7c3e06;
      background: #fdf6ec;
      border: 1px solid rgba(180,83,9,0.28);
      border-radius: 0.5rem;
      padding: 0.75rem 0.9rem;
      font-size: 0.875rem;
      margin: 1rem 0;
    }}
    .steps {{
      margin: 1.1rem 0 0;
      padding-left: 1.15rem;
      color: {muted};
      font-size: 0.875rem;
    }}
    .steps li {{ margin: 0.35rem 0; }}
    label {{
      display: block;
      font-size: 0.75rem;
      font-family: ui-monospace, Menlo, monospace;
      color: {faint};
      margin: 1rem 0 0.35rem;
    }}
    input[type=text] {{
      width: 100%;
      padding: 0.6rem 0.7rem;
      border-radius: 0.4rem;
      border: 1px solid rgba(12,13,16,0.14);
      font: inherit;
      background: {paper};
    }}
    .btn {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-top: 0.85rem;
      border: 0;
      border-radius: 0.4rem;
      padding: 0.7rem 1.1rem;
      font: inherit;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
    }}
    .btn.primary {{
      background: {blue};
      color: #fff;
    }}
    .btn.primary:hover {{ filter: brightness(1.05); }}
    .btn.ink {{
      background: {ink};
      color: #fff;
      width: 100%;
      margin-top: 1.25rem;
    }}
    .btn.ink:hover {{ background: {blue}; }}
    code {{ font-size: 0.9em; }}
  </style>
</head>
<body>
  <div class="shell">
    <div class="brand">
      <span class="brand-mark">G</span>
      Gryphon
    </div>
    <div class="card">
      <h1>{escape(title)}</h1>
      {body}
    </div>
  </div>
  {auto_script}
</body>
</html>
"""
