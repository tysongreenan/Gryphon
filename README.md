# Gryphon

**Reliable authenticated sessions + human-in-the-loop recovery for AI agents.**

Gryphon is the missing reliability layer between AI agents and the authenticated web.

Agents using Browserbase, Stagehand, Playwright, Claude Computer Use, or similar tools often fail because sessions expire, 2FA appears, or logins die mid-task. Gryphon solves this by providing:

1. **Persistent authenticated sessions** — `get_session(site)` returns a ready Browserbase context / connect URL
2. **Human-in-the-loop escalation** — when auth is needed, pause the agent and notify the human owner
3. **Clean recovery** — human logs in via Live View; durable context is stored for later runs

Gryphon does **not** try to complete the user's tasks. It simply makes authentication reliable so agents can do more.

---

## Project status

**Phase 2 first slice:** `get_session(site)` → needs_auth escalation → human Live View resolve → durable Browserbase Context → later `get_session` returns a ready agent session.

**Active focus:** Landing page + waitlist (`apps/dashboard`) — see `product/CURRENT_FOCUS.md` · `product/PHASE_B_WAITLIST.md`

---

## Quick start (full E2E loop)

### 1. Environment

```bash
cd /path/to/Gryphon
cp .env.example .env
# Local without Browserbase account:
#   BROWSERBASE_USE_FAKE=true
# Real Browserbase:
#   BROWSERBASE_API_KEY=...  BROWSERBASE_PROJECT_ID=...
# Optional Slack: SLACK_BOT_TOKEN + SLACK_DEFAULT_CHANNEL
```

### 2. Run the API

```bash
cd apps/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# recommended for local demo without BB keys:
export BROWSERBASE_USE_FAKE=true
uvicorn app.main:app --reload --port 8000
```

On startup the API:

- Creates SQLite tables (`apps/api/gryphon.db` by default)
- Seeds a bootstrap user (`DEFAULT_USER_ID`, default `user_dev`) with API key `GRYPHON_API_KEY` (default `dev-api-key`)

Auth header for agent routes: `X-API-Key: <your key>`.

### 3. Prove Phase 2: get_session loop

```bash
cd apps/api && source .venv/bin/activate
python ../../examples/agent-integrations/get_session_loop.py
```

Expected: `needs_auth` → resolve stores context → `get_session` returns `status=ready` with `context_id` / `connect_url`.

### 4. Prove Phase 1 escalation loop (still works)

```bash
python ../../examples/agent-integrations/escalation_loop.py
```

### 5. Human resolve with Live View (real Browserbase)

1. Set `BROWSERBASE_API_KEY` (+ optional `BROWSERBASE_PROJECT_ID`) and restart the API
2. Agent calls `POST /v1/sessions/get` → `needs_auth`
3. Human opens signed Slack/link → resolve page provisions **Context** + **Session (persist=true)** + **Live View**
4. Human logs in / 2FA in Live View → **Mark resolved**
5. Gryphon stores `(user, site) → context_id`
6. Agent calls `get_session` again → new Session with `persist=false` + `connect_url`

Without Browserbase credentials, set `BROWSERBASE_USE_FAKE=true` for local demos, or resolve programmatically with a manual `resolved_context_id`.

If a stored context later fails (expired/deleted), `get_session` returns `needs_auth` again (site session marked stale) instead of a broken `ready`. Full live checklist: [`docs/MANUAL_BROWSERBASE_TEST.md`](docs/MANUAL_BROWSERBASE_TEST.md).

### 6. Create additional users / API keys

```bash
cd apps/api && source .venv/bin/activate
python scripts/create_api_key.py --email alice@example.com --name Alice
```

### 7. Run tests

```bash
cd apps/api && source .venv/bin/activate
pytest
```

### 8. MCP tools (Python 3.10+)

```bash
cd apps/mcp-server
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export GRYPHON_API_URL=http://localhost:8000 GRYPHON_API_KEY=dev-api-key
python server.py
```

Tools: **`get_session`**, `request_human_auth`, `get_escalation_status`. See `apps/mcp-server/README.md`.

---

## API cheat sheet

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/health` | none | Liveness |
| `POST` | `/v1/waitlist/` | none | Marketing waitlist signup (idempotent email) |
| `POST` | `/v1/sessions/get` | API key | **Primary agent entry** — ready or needs_auth |
| `POST` | `/v1/escalations/` | API key | Explicit human auth request |
| `GET` | `/v1/escalations/{id}` | API key | Agent polls escalation |
| `POST` | `/v1/escalations/{id}/resolve` | API key | Programmatic resolve (+ store context) |
| `GET` | `/v1/escalations/{id}/human-resolve?token=...` | signed token | Live View + confirm page |
| `POST` | `/v1/escalations/{id}/human-resolve` | signed token (form) | Human confirms resolve |

### Example: get_session

```bash
export KEY=dev-api-key

# May return needs_auth the first time
curl -s -X POST http://localhost:8000/v1/sessions/get \
  -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"site":"linkedin"}' | python3 -m json.tool

# After human resolve (or programmatic resolve with context id):
# { "status": "ready", "context_id": "...", "session_id": "...", "connect_url": "wss://..." }
```

### Error shape

```json
{ "detail": { "code": "invalid_api_key", "message": "Invalid or revoked API key" } }
```

---

## Core product principles

- Pure infrastructure focus (auth + sessions only)
- Excellent agent DX (MCP-first + simple API)
- Human escalation is a first-class feature, not an afterthought
- Start narrow, expand carefully
- Security and user control are non-negotiable

---

## Mental model

```
User's Agent
  → get_session(site)
       ├─ ready → Browserbase connect_url / context_id
       └─ needs_auth → Slack → Live View login → store context
            → get_session(site) again → ready
```

---

## Repository structure

Polyglot monorepo: each app owns its runtime. Node apps live under `apps/*` with their own `package.json`; the API and MCP server are Python.

```
Gryphon/
├── package.json             # root scripts only (proxies into apps)
├── README.md
├── .env.example             # API / product env template
├── product/                 # CURRENT_FOCUS, phase specs
├── docs/
├── apps/
│   ├── api/                 # FastAPI backend (Python)
│   │   ├── app/
│   │   ├── scripts/create_api_key.py
│   │   └── tests/
│   ├── mcp-server/          # MCP tools for agents (Python)
│   └── dashboard/           # Next.js marketing + operator UI
└── examples/
    └── agent-integrations/
        ├── get_session_loop.py
        └── escalation_loop.py
```

### Run from the repo root

```bash
# Marketing / operator Next app (apps/dashboard)
npm run dev

# First time only (installs dashboard deps):
npm run install:dashboard
```

API and MCP still start from their own directories (Python — no npm):

```bash
cd apps/api && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000
```

---

## For AI coding agents

1. **Product boundary:** only authentication and session reliability — no site-specific actions.
2. Prefer MCP tools (`get_session` first) as the agent interface.
3. Security: hash API keys, short-lived resolve tokens, no secrets in logs.
4. See `docs/ROADMAP.md` and `product/CURRENT_FOCUS.md`.

**Sequence:** C (harden Phase 1) done → D (Phase 2 Browserbase / get_session) shipped → **B (landing + waitlist)** active.

---

## License

Private / All Rights Reserved (for now)
