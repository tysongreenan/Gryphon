# Phase 1 Hardening Spec

**Status:** In progress (C in sequence C → D → B)  
**Goal:** Make the Phase 1 human-escalation loop solid enough for early users.

## Product boundary (still applies)

Only authentication, sessions, and human escalation.  
Do **not** build site-specific actions or a general agent platform.

## Tasks (priority order)

### 1. Real multi-user / API keys
- Replace single hardcoded `user_dev` auth check
- Persist `users` + `api_keys` (hashed secrets only)
- Scope escalations to the authenticated user
- Bootstrap key from `GRYPHON_API_KEY` on startup
- Script to mint additional users/keys: `python scripts/create_api_key.py`

### 2. Better Slack resolution UX
- Clearer Block Kit copy (what happened + what to do)
- Signed, short-lived resolve link (no API key in Slack)
- Browser confirmation page: `GET/POST .../human-resolve?token=...`
- Keep programmatic `POST .../resolve` with API key for agents/scripts

### 3. Tests
Happy path + edge cases:
- create → resolve → poll
- double resolve → 409
- not found → 404
- bad / missing API key → 401
- multi-user isolation (404, not 403)
- signed human-resolve link

### 4. Docs + README
A new person can run the full loop from README + `.env` alone.

### 5. Reliability
- Escalation expiry (`expires_at`, status → `expired`)
- Structured error bodies `{ code, message }`
- Structured logging without secrets / raw keys

## Definition of done

- [x] Multiple API keys / users work
- [x] Slack notification + resolve experience is clean
- [x] Core tests pass
- [x] Docs match reality
- [x] New person can run E2E with README + `.env`

## After hardening

| Order | Focus |
|-------|--------|
| **D** | Phase 2 — Browserbase Contexts + `get_session` |
| **B** | Landing page + waitlist |
