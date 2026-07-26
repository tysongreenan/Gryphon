# Gryphon — Architecture

## High-Level Overview

```
Agent Side (LangGraph / Stagehand / Claude / custom)
│ MCP tools / REST API
▼
Gryphon Core
┌─ Session Manager  ─────────────── Browserbase Contexts
┌─ Escalation Service ──────────── Slack / Email
┌─ User & API Key Auth
┌─ Audit / Logging
```

---

## Core Components

### 1. API Layer (FastAPI)
- REST endpoints for session management and escalation
- Authentication via hashed API keys mapped to users (MVP)
- Human resolve via short-lived signed links (no API key in Slack)
- Later: user dashboard auth

### 2. MCP Server
Primary interface for agents. Exposes tools such as:

- `get_session`
- `request_human_auth`
- `check_session_health`
- `list_available_sites` (later)

### 3. Session Manager
Responsible for:
- Storing durable `(user, site) → Browserbase Context ID` mappings (`site_sessions`)
- `get_session(site)`: return ready session or create escalation (`needs_auth`)
- Creating short-lived Browserbase Sessions from a stored context (`persist: false` for agents)
- Human resolve: create Context + Session (`persist: true`) + Live View URL
- Tracking last-used timestamps (health / expiry later)

### 4. Escalation Service
- Receives escalation requests from agents
- Creates an escalation record
- Sends rich notification to the human owner
- Provides a resolution endpoint / flow for the human
- Returns updated session to the waiting agent

### 5. Notification Adapters
- Slack (priority #1)
- Email
- Later: Telegram, Discord, webhooks, mobile push

### 6. Data Store
- Users / API keys
- Connected sites / session references
- Escalation history
- Audit logs

---

## Session Handling Strategy (MVP)

**Primary path:** Browserbase Contexts

- Gryphon creates or reuses Browserbase Contexts that contain the authenticated state
- When an agent asks for a session, Gryphon returns a context ID (or a new session created from that context)
- This keeps Gryphon from having to manage raw cookies and browser fingerprints itself in v1

**Secondary path (later):**
- Accept and return Playwright storage_state
- Support local / self-hosted browser sessions

---

## Escalation Flow (Detailed)

1. Agent calls `request_human_auth` with:
   - site
   - reason
   - optional screenshot / URL / current context ID
   - callback or wait mechanism
2. Gryphon creates an `Escalation` record (status = pending)
3. Notification is sent to the configured channel
4. Human opens the resolution link / interacts with the Slack message
5. Human completes the required action (login, 2FA, etc.)
6. Gryphon updates the session and marks escalation as resolved
7. Waiting agent receives the new session material and continues

For MVP, a simple polling or long-polling approach from the agent side is acceptable. Later we can add webhooks or better async patterns.

---

## Security Considerations

- API keys must be treated as secrets (stored as HMAC-SHA256 hashes only)
- Session material and any stored credentials must be encrypted at rest
- Escalation resolve links are HMAC-signed and short-lived (`RESOLVE_TOKEN_TTL_SECONDS`)
- Escalations auto-expire (`ESCALATION_TTL_SECONDS`) if not resolved
- Escalations are scoped to the owning user (cross-user access returns 404)
- Logs must never include raw API keys or `SECRET_KEY`
- Easy revocation of sessions and API keys (`api_keys.revoked_at`)
- Principle of least privilege for any stored credentials

---

## Suggested Implementation Structure

```
apps/
  api/
    app/
      main.py
      routers/
        sessions.py
        escalations.py
        health.py
      services/
        session_manager.py
        escalation_service.py
        notifications/
      models/
      db/
  mcp-server/
    server.py
    tools.py
  dashboard/          # future
examples/
  stagehand_example.py
  langgraph_example.py
```

---

## Technology Choices (Rationale)

- **FastAPI**: Fast to develop, excellent typing, great ecosystem fit for AI tools
- **MCP**: Becoming the standard way agents discover and call tools
- **Browserbase Contexts**: Already solves a large part of session persistence; Gryphon adds management + human recovery on top
- **Slack-first notifications**: Highest chance humans actually respond quickly
