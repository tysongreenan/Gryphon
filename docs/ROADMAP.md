# Gryphon — Roadmap

## Phase 0 — Foundation (Current)
- [x] Product vision and PRD
- [x] Architecture outline
- [x] Repository structure
- [ ] Basic project scaffolding (FastAPI + MCP server stubs)
- [ ] Local development environment setup

## Phase 1 — Core MVP (Build this next)
**Goal:** An agent can request human help for auth and resume with a new session.

- [ ] User + API key model
- [ ] Slack notification integration (incoming escalation)
- [ ] `request_human_auth` endpoint + MCP tool
- [ ] Simple human resolution flow (link or Slack interaction)
- [ ] Basic session handoff (even if manual/simple at first)
- [ ] Escalation status tracking (pending → resolved / expired)
- [ ] Minimal audit logging
- [ ] End-to-end example with a Stagehand or Playwright agent

**Success criteria for Phase 1:**  
A developer can run an agent that hits a login wall, calls Gryphon, receives a Slack message, resolves it, and the agent continues.

## Phase 2 — Persistent Sessions
- [ ] Guided account connection flow (capture session once)
- [ ] `get_session(site)` that returns a reusable authenticated context
- [ ] Browserbase Context integration as primary storage
- [ ] Session health checking
- [ ] Basic dashboard to view connected sites and recent escalations

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
