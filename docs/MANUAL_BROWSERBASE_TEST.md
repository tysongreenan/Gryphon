# Manual test — real Browserbase Live View path

Use this checklist when you have real Browserbase credentials. CI keeps using the Fake client; this doc is for local/staging validation only.

## Prerequisites

1. Browserbase account with an API key and project id
2. API running from `apps/api` with env set:

```bash
export BROWSERBASE_API_KEY="bb_..."
export BROWSERBASE_PROJECT_ID="..."
# Optional but useful for Slack links:
export PUBLIC_BASE_URL="http://localhost:8000"
# Do NOT set BROWSERBASE_USE_FAKE when testing real BB
```

3. Seeded API key (default local: `dev-api-key`, or create via `scripts/create_api_key.py`)

```bash
cd apps/api
uvicorn app.main:app --reload --port 8000
```

## Path A — Full human resolve with Live View

### 1. Agent needs auth

```bash
curl -s -X POST http://localhost:8000/v1/sessions/get \
  -H "X-API-Key: $GRYPHON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"site":"linkedin"}' | jq
```

Expect:

```json
{
  "status": "needs_auth",
  "site": "linkedin",
  "escalation_id": "<uuid>",
  "message": "..."
}
```

Note `escalation_id`.

### 2. Open human resolve page

If Slack is configured, open the signed link from the notification.

Otherwise build a token via Python in `apps/api`:

```bash
cd apps/api
python -c "
from app.services.resolve_tokens import create_resolve_token
eid = '<escalation_id>'
print(f'http://localhost:8000/v1/escalations/{eid}/human-resolve?token={create_resolve_token(eid)}')
"
```

Open the URL in a browser.

### 3. Confirm Live View provisioning

On the page you should see:

- Site name and reason
- **Open Live View →** link (Browserbase debugger / fullscreen URL)
- Context id hint (optional muted line)
- **I've logged in — Mark resolved**

If Live View fails (wrong project, network, BB outage), the page must still load with a yellow/warn message and an optional context-id field — not a 500.

### 4. Log in inside Live View

1. Click **Open Live View**
2. In the remote browser, complete login / 2FA for the target site
3. Leave the tab until cookies/session are clearly established
4. Return to the Gryphon resolve page → **Mark resolved**

### 5. Agent gets a ready session

```bash
curl -s -X POST http://localhost:8000/v1/sessions/get \
  -H "X-API-Key: $GRYPHON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"site":"linkedin"}' | jq
```

Expect:

```json
{
  "status": "ready",
  "site": "linkedin",
  "context_id": "ctx_...",
  "session_id": "ses_...",
  "connect_url": "wss://...",
  "persist": false,
  "message": "Authenticated session ready"
}
```

`connect_url` should be a real Browserbase WebSocket URL (not `fake.browserbase.local`).

## Path B — Stale / dead context (optional)

After a successful resolve, force the stored context to be unusable (e.g. delete the context in the Browserbase dashboard, or wait until it is gone). Then:

```bash
curl -s -X POST http://localhost:8000/v1/sessions/get \
  -H "X-API-Key: $GRYPHON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"site":"linkedin"}' | jq
```

Expect **`status: needs_auth`** (not `ready`), a new or reused `escalation_id`, and a message about re-authentication. A second call should reuse the same pending escalation.

## Path C — Live View failure graceful degradation

Temporarily break credentials (wrong API key) or use a project without access:

1. Create escalation via `get_session`
2. Open human-resolve URL
3. Page should load with a clear “Live View could not be provisioned” style message
4. Optional: paste a known-good context id and mark resolved
5. Or fix credentials, reload the resolve page, and confirm Live View appears on retry

## What “good” looks like (summary)

| Step | Pass criteria |
|------|----------------|
| First `get_session` | `needs_auth` + escalation |
| Resolve page open | Context + Session (`persist=true`) + Live View URL |
| After human login + resolve | Escalation `resolved`, site session `active` |
| Second `get_session` | `ready` + real `connect_url` |
| Dead stored context | `needs_auth`, site session not left `active` |
| BB API failure on resolve | HTML page with fallback, no 500 |

## Security notes

- Never commit `BROWSERBASE_API_KEY` or paste it into logs/issues
- Resolve links are signed and time-limited; do not share publicly
- Logs should include session/context **ids**, never API keys
