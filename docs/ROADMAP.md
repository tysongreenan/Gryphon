# Gryphon — Roadmap

## Phase 0 — Foundation
- [x] Product vision and PRD
- [x] Architecture outline
- [x] Repository structure
- [x] Basic project scaffolding (FastAPI + MCP server)
- [x] Local development environment setup

## Phase 1 — Core MVP + Hardening
**Goal:** An agent can request human help for auth and resume with a new session.

- [x] User + API key model (hashed keys, multi-user isolation)
- [x] Slack notification integration (incoming escalation + log fallback)
- [x] `request_human_auth` endpoint + MCP tool
- [x] Human resolution flow (signed short-lived link + programmatic resolve)
- [x] Basic session handoff field (`resolved_context_id`)
- [x] Escalation status tracking (pending → resolved / expired)
- [x] Structured logging (no secrets)
- [x] Automated tests for core loop + error cases
- [x] End-to-end example script (`examples/agent-integrations/escalation_loop.py`)

**Success criteria for Phase 1:**  
A developer can run an agent that hits a login wall, calls Gryphon, receives a Slack message, resolves it, and the agent continues.

**Done:** Phase 1 hardening complete.

## Phase 2 — Persistent Sessions
**Goal:** After one human resolve, later `get_session(site)` returns a ready authenticated session.

- [x] `get_session(site)` API + MCP tool (`POST /v1/sessions/get`)
- [x] Browserbase Context create + Session with persist for human login
- [x] Live View on human resolve page
- [x] Durable `(user, site) → context_id` storage (`site_sessions`)
- [x] Agent sessions from stored context with `persist: false`
- [x] Escalation remains recovery when context missing
- [x] E2E example `get_session_loop.py` + tests
- [ ] Guided account connection flow from dashboard (later)
- [ ] Session health checking / proactive re-auth
- [ ] Basic dashboard to view connected sites and recent escalations

## Phase B — Landing + waitlist (active)
**Goal:** Public page that captures agent-builder demand.

- [x] Marketing Next app (`apps/dashboard`) with product copy
- [x] Waitlist form (email + optional use-case) + `POST /api/waitlist`
- [x] Storage cascade: Gryphon API (`POST /v1/waitlist/`) / Supabase / webhook / local file
- [x] Honest use-case section (no fake testimonials)
- [x] Vercel deploy + production storage env (`GRYPHON_API_URL` → Railway API)
- [ ] Light outreach with research language

## Phase 3 — Reliability & DX
- [ ] Better async / webhook patterns for agents waiting on escalation
- [ ] Multiple notification channels
- [ ] Session expiry prediction / proactive refresh attempts
- [ ] Richer MCP tools and documentation
- [ ] Usage metrics and simple billing hooks

## Phase 4 — Expansion (Only after strong product-market fit)
- [ ] Support for additional browser providers
- [ ] Team / multi-user support
- [ ] More advanced policy controls
- [ ] Optional vertical helpers (still keep core pure)

---

## Guiding Rule

Stay focused on making **authentication reliable**.  
Do not expand into general agent frameworks or high-level website actions until the core loop is excellent and people are paying for it.
