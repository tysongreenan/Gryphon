# Phase 2 — Browserbase Contexts + `get_session`

**Status:** Active (D in sequence C → D → B)  
**Goal:** After one human resolve, later agent runs can call `get_session(site)` and get a ready authenticated browser session.

## Product boundary

Still only auth + sessions + human escalation. No site-specific actions.

## Happy path (first vertical slice)

1. Agent calls `get_session(site)`
2. No active context for that user+site → create escalation, return `{ status: "needs_auth", escalation_id }`
3. Human gets Slack notification with the signed resolve link
4. Resolve flow:
   - Creates a real Browserbase **Context**
   - Creates a **Session** with that context + `persist: true`
   - Gives the human the Browserbase **Live View** so they can log in / complete 2FA
   - Human confirms → Gryphon stores the `context_id` against `(user, site)` and marks the escalation resolved
5. Agent polls / calls `get_session(site)` again
6. Gryphon creates a fresh Browserbase Session from the stored context (`persist: false` for agent runs) and returns connect URL / session details

## Key surfaces

| Surface | Role |
|---------|------|
| `POST /v1/sessions/get` + MCP `get_session` | Agent entrypoint |
| Human resolve page | Provisions Context + Live View session; confirms → store |
| Escalation | Recovery when context missing or stale |
| `site_sessions` table | Durable `(user, site) → browserbase_context_id` |

## Suggested coding order

1. Browserbase client (contexts, sessions, live view / debug)
2. Schema (`site_sessions` + escalation BB fields)
3. Resolve flow (provision on open, store on confirm)
4. `get_session` endpoint + service
5. MCP + E2E example
6. Tests + docs

## Definition of done

- After one human resolve, later `get_session` calls return `status: "ready"` with a usable session
- Missing context triggers escalation (`needs_auth`)
- **Stale/dead stored context** (Browserbase rejects session create) → soft-fail to `needs_auth`, mark site session `stale`, reuse or create escalation — never return a broken `ready`
- Tests cover ready / needs_auth / multi-user isolation / stale context
- Docs match the working loop

## Stale context handling

When `get_session` finds an active `(user, site) → browserbase_context_id` but `create_session` fails with a Browserbase API error:

1. Mark the `site_sessions` row `status=stale` (not reused on the next call)
2. Prefer an existing **pending** escalation for that user+site
3. Otherwise create a new escalation (reason mentions unusable context)
4. Return `{ status: "needs_auth", escalation_id, message }`

`BrowserbaseNotConfiguredError` is different: local/dev without keys still returns `ready` with `context_id` only (no connect URL).

## Live View path

`ensure_human_login_session` provisions:

1. Browserbase **Context** (stored on the escalation as `bb_context_id`)
2. **Session** with `persist: true` (human login)
3. **Live View** debug URL (`live_view_url`)

If Live View cannot be provisioned, the human resolve page still loads with a clear warning and optional manual context-id field. Reload after fixing credentials retries provisioning when `live_view_url` is missing.

## Manual test (real Browserbase)

See **[docs/MANUAL_BROWSERBASE_TEST.md](../docs/MANUAL_BROWSERBASE_TEST.md)** for step-by-step checks with live API keys. CI uses the Fake client only.

## Env

```
BROWSERBASE_API_KEY=
BROWSERBASE_PROJECT_ID=
# Optional: force Fake client even without keys
BROWSERBASE_USE_FAKE=false
```

Without Browserbase credentials, `get_session` still creates escalations; resolve accepts a manual `resolved_context_id` (dev fallback). Live View provisioning requires real credentials (or the Fake client in tests/local).
