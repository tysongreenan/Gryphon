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

    site = escape(escalation.site)
    reason = escape(escalation.reason)
    eid = escape(escalation_id)
    tok = escape(token)

    live_section = ""
    if escalation.live_view_url:
        live = escape(escalation.live_view_url)
        live_section = f"""
        <ol>
          <li>Open the <a href="{live}" target="_blank" rel="noopener">Browserbase Live View</a></li>
          <li>Log in / complete 2FA / CAPTCHA for <strong>{site}</strong></li>
          <li>Return here and click <strong>Mark resolved</strong></li>
        </ol>
        <p><a class="btn-link" href="{live}" target="_blank" rel="noopener">Open Live View →</a></p>
        """
    else:
        # Graceful degradation: BB missing, API error, or empty debug URLs
        has_ctx = bool(escalation.bb_context_id)
        provision_note = (
            "A Browserbase context was created, but Live View could not be opened. "
            if has_ctx
            else "Live View could not be provisioned (Browserbase not configured or API error). "
        )
        live_section = f"""
        <p class="warn">
          {provision_note}
          Complete auth in your own browser if needed, then paste a Browserbase
          context id below (or leave blank to unblock the agent without a durable session).
        </p>
        <label for="resolved_context_id">Browserbase context id (optional)</label>
        <input id="resolved_context_id" name="resolved_context_id"
               type="text" placeholder="context id from Browserbase" form="resolve-form" />
        """

    ctx_hint = ""
    if escalation.bb_context_id:
        ctx_hint = (
            f'<p class="muted">Context for this login: '
            f"<code>{escape(escalation.bb_context_id)}</code></p>"
        )

    body = f"""
    <p>An agent needs auth help for <strong>{site}</strong>.</p>
    <p class="muted">{reason}</p>
    {live_section}
    {ctx_hint}
    <form id="resolve-form" method="post" action="/v1/escalations/{eid}/human-resolve">
      <input type="hidden" name="token" value="{tok}" />
      <button type="submit">I've logged in — Mark resolved</button>
    </form>
    """
    return HTMLResponse(_page(title="Resolve auth escalation", body=body, ok=True))


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
            f"<p>The agent can now call <code>get_session(\"{site}\")</code>.</p>"
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


def _page(*, title: str, body: str, ok: bool) -> str:
    accent = "#0f766e" if ok else "#b91c1c"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{escape(title)} · Gryphon</title>
  <style>
    :root {{ color-scheme: light dark; }}
    body {{
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      max-width: 32rem;
      margin: 3rem auto;
      padding: 0 1.25rem;
      line-height: 1.5;
    }}
    h1 {{ font-size: 1.35rem; color: {accent}; margin-bottom: 0.75rem; }}
    .card {{
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.25rem 1.4rem;
    }}
    .muted {{ color: #6b7280; }}
    .warn {{
      color: #92400e;
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-radius: 8px;
      padding: 0.75rem 0.9rem;
    }}
    label {{ display: block; font-size: 0.875rem; margin: 1rem 0 0.35rem; }}
    input[type=text] {{
      width: 100%;
      box-sizing: border-box;
      padding: 0.55rem 0.65rem;
      border-radius: 8px;
      border: 1px solid #d1d5db;
      font: inherit;
    }}
    button, a.btn-link {{
      display: inline-block;
      margin-top: 1rem;
      background: {accent};
      color: white;
      border: 0;
      border-radius: 8px;
      padding: 0.65rem 1rem;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
    }}
    a.btn-link {{ margin-top: 0.5rem; }}
    code {{ font-size: 0.9em; }}
    .brand {{ font-size: 0.8rem; color: #9ca3af; margin-bottom: 1rem; }}
    ol {{ padding-left: 1.2rem; }}
  </style>
</head>
<body>
  <p class="brand">Gryphon</p>
  <div class="card">
    <h1>{escape(title)}</h1>
    {body}
  </div>
</body>
</html>
"""
