"""
Public waitlist — no API key for signup. List requires X-API-Key.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import require_api_key
from app.db.session import get_db
from app.models.waitlist import WaitlistCreate, WaitlistListResponse, WaitlistResult
from app.services.waitlist_service import WaitlistService

router = APIRouter()


@router.post(
    "/",
    response_model=WaitlistResult,
    status_code=status.HTTP_200_OK,
    summary="Join the Gryphon waitlist",
)
async def join_waitlist(
    payload: WaitlistCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Public endpoint for landing-page signups.

    Idempotent on email: re-submits return ``created=false`` without error.
    """
    service = WaitlistService(db)
    return await service.signup(payload)


@router.get(
    "/",
    response_model=WaitlistListResponse,
    status_code=status.HTTP_200_OK,
    summary="List waitlist signups (API key required)",
)
async def list_waitlist(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    _user_id: str = Depends(require_api_key),
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticated list of marketing waitlist signups.

    Newest first. Requires ``X-API-Key`` (same bootstrap key as other product routes).
    """
    service = WaitlistService(db)
    return await service.list_signups(limit=limit, offset=offset)


@router.get(
    "/admin",
    response_class=HTMLResponse,
    include_in_schema=False,
    summary="Browser UI for waitlist (enter API key in page)",
)
async def waitlist_admin_page():
    """
    Lightweight browser page to inspect signups.

    Key is entered in the page and sent as ``X-API-Key`` to ``GET /v1/waitlist/``.
    Nothing is stored server-side.
    """
    return HTMLResponse(_ADMIN_HTML)


_ADMIN_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Gryphon — Waitlist</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #0c0d10;
      --muted: #5c6370;
      --faint: #8b919c;
      --line: rgba(12, 13, 16, 0.1);
      --paper: #f7f6f3;
      --blue: #1d4ed8;
      --ok: #166534;
      --err: #991b1b;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: var(--paper);
      color: var(--ink);
      line-height: 1.45;
    }
    main {
      max-width: 920px;
      margin: 0 auto;
      padding: 2rem 1.25rem 3rem;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.03em;
      margin: 0 0 0.35rem;
    }
    .sub { color: var(--muted); font-size: 0.95rem; margin-bottom: 1.5rem; }
    .bar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      align-items: center;
      margin-bottom: 1rem;
    }
    input[type="password"], input[type="text"] {
      flex: 1 1 220px;
      min-width: 180px;
      height: 2.5rem;
      padding: 0 0.75rem;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      font: inherit;
    }
    button {
      height: 2.5rem;
      padding: 0 1rem;
      border: 0;
      border-radius: 8px;
      background: var(--ink);
      color: #fff;
      font: inherit;
      font-weight: 500;
      cursor: pointer;
    }
    button:hover { background: var(--blue); }
    button:disabled { opacity: 0.55; cursor: wait; }
    .meta { color: var(--faint); font-size: 0.85rem; margin: 0.5rem 0 1rem; }
    .status { font-size: 0.9rem; min-height: 1.25rem; margin-bottom: 0.75rem; }
    .status.ok { color: var(--ok); }
    .status.err { color: var(--err); }
    table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 10px;
      overflow: hidden;
      font-size: 0.92rem;
    }
    th, td {
      text-align: left;
      padding: 0.65rem 0.75rem;
      border-bottom: 1px solid var(--line);
      vertical-align: top;
    }
    th {
      background: #f0efeb;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
      font-weight: 600;
    }
    tr:last-child td { border-bottom: 0; }
    td.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.82rem; }
    .empty { color: var(--muted); padding: 1.5rem; text-align: center; }
    .hint {
      margin-top: 1.25rem;
      font-size: 0.85rem;
      color: var(--muted);
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.82em;
      background: rgba(12,13,16,0.06);
      padding: 0.1em 0.35em;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <main>
    <h1>Waitlist</h1>
    <p class="sub">Signups stored in Railway SQLite (<code>waitlist_signups</code>). API key stays in this browser only.</p>
    <div class="bar">
      <input id="key" type="password" autocomplete="off" placeholder="X-API-Key (GRYPHON_API_KEY)" />
      <button id="load" type="button">Load signups</button>
    </div>
    <div id="status" class="status" aria-live="polite"></div>
    <p id="meta" class="meta"></p>
    <div id="table-wrap"><div class="empty">Enter your API key and load.</div></div>
    <p class="hint">
      Or via curl:<br />
      <code>curl -sH "X-API-Key: $GRYPHON_API_KEY" https://api-production-cc4e.up.railway.app/v1/waitlist/ | jq</code>
    </p>
  </main>
  <script>
    const keyEl = document.getElementById("key");
    const statusEl = document.getElementById("status");
    const metaEl = document.getElementById("meta");
    const wrap = document.getElementById("table-wrap");
    const btn = document.getElementById("load");
    const storageKey = "gryphon_waitlist_api_key";

    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) keyEl.value = saved;
    } catch (_) {}

    function setStatus(msg, kind) {
      statusEl.textContent = msg || "";
      statusEl.className = "status" + (kind ? " " + kind : "");
    }

    function fmtDate(iso) {
      if (!iso) return "—";
      try {
        return new Date(iso).toLocaleString(undefined, {
          year: "numeric", month: "short", day: "numeric",
          hour: "2-digit", minute: "2-digit", timeZoneName: "short"
        });
      } catch (_) {
        return iso;
      }
    }

    function render(data) {
      metaEl.textContent = data.total + " total · showing " + data.count
        + " (limit " + data.limit + ", offset " + data.offset + ")";
      if (!data.items || !data.items.length) {
        wrap.innerHTML = '<div class="empty">No signups yet.</div>';
        return;
      }
      const rows = data.items.map((item) => {
        return "<tr>"
          + "<td>" + escapeHtml(item.email) + "</td>"
          + "<td>" + escapeHtml(item.use_case || "—") + "</td>"
          + "<td>" + escapeHtml(item.source || "—") + "</td>"
          + '<td class="mono">' + escapeHtml(fmtDate(item.created_at)) + "</td>"
          + "</tr>";
      }).join("");
      wrap.innerHTML = "<table><thead><tr>"
        + "<th>Email</th><th>Use case</th><th>Source</th><th>Created</th>"
        + "</tr></thead><tbody>" + rows + "</tbody></table>";
    }

    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    async function load() {
      const key = keyEl.value.trim();
      if (!key) {
        setStatus("Paste your API key first.", "err");
        return;
      }
      btn.disabled = true;
      setStatus("Loading…");
      try {
        sessionStorage.setItem(storageKey, key);
      } catch (_) {}
      try {
        const res = await fetch("/v1/waitlist/?limit=200", {
          headers: { "X-API-Key": key },
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = (body.detail && body.detail.message) || body.detail || res.statusText;
          throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
        }
        setStatus("Loaded.", "ok");
        render(body);
      } catch (err) {
        setStatus(err.message || String(err), "err");
        metaEl.textContent = "";
        wrap.innerHTML = '<div class="empty">Could not load signups.</div>';
      } finally {
        btn.disabled = false;
      }
    }

    btn.addEventListener("click", load);
    keyEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") load();
    });
  </script>
</body>
</html>
"""
