# Gryphon

**Reliable authenticated sessions + human-in-the-loop recovery for AI agents.**

Gryphon is the missing reliability layer between AI agents and the authenticated web.

Agents using Browserbase, Stagehand, Playwright, Claude Computer Use, or similar tools often fail because sessions expire, 2FA appears, or logins die mid-task. Gryphon solves this by providing:

1. **Persistent authenticated sessions** — get a ready-to-use logged-in browser context
2. **Human-in-the-loop escalation** — when auth is needed, pause the agent and notify the human owner
3. **Clean recovery** — hand a fresh session back so the agent can continue

Gryphon does **not** try to complete the user's tasks. It simply makes authentication reliable so agents can do more.

---

## Core Product Principles

- Pure infrastructure focus (auth + sessions only)
- Excellent agent DX (MCP-first + simple API)
- Human escalation is a first-class feature, not an afterthought
- Start narrow, expand carefully
- Security and user control are non-negotiable

---

## Quick Mental Model

```
User's Agent
↓
Gryphon  (authenticated sessions + human recovery)
↓
Browserbase / Playwright / Computer Use
↓
Website
```

---

## Project Status

This repository contains the product foundation and starter structure.  
An AI coding agent (or human) should begin implementation from the documents in `/docs` and the skeleton in `/apps`.

**Start here:**
1. Read `docs/PRD.md`
2. Read `docs/ARCHITECTURE.md`
3. Read `docs/ROADMAP.md`
4. Implement Phase 1 features

---

## Suggested Tech Stack (MVP)

| Layer              | Choice                          | Notes                                      |
|--------------------|----------------------------------|--------------------------------------------|
| API                | FastAPI (Python)                 | Excellent for AI tooling ecosystem         |
| MCP Server         | Official MCP Python SDK          | First-class agent integration              |
| Database           | PostgreSQL (SQLite for local)    | Sessions, users, escalation logs           |
| Session Provider   | Browserbase Contexts             | Primary integration for v1                 |
| Notifications      | Slack + Email (Resend)           | Human escalation channels                  |
| Dashboard          | Next.js + Tailwind (later)       | Simple management UI                       |
| User Auth          | Clerk or Supabase Auth (later)   | For dashboard                              |

---

## Repository Structure

```
Gryphon/
├── README.md
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   └── PRODUCT.md
├── apps/
│   ├── api/                 # FastAPI backend
│   ├── mcp-server/          # MCP server for agents
│   └── dashboard/           # Future web UI
├── examples/
│   └── agent-integrations/
└── .env.example
```

---

## For AI Coding Agents

When continuing development:

1. Always respect the product boundary: **Gryphon only handles authentication and session reliability**. Do not build high-level site actions (e.g. "send LinkedIn message") in the core product.
2. Prefer MCP tools as the primary agent interface.
3. Make human escalation delightful and fast.
4. Security first: encrypt sensitive data, short-lived tokens where possible, clear audit logs, easy revocation.
5. Keep the MVP extremely focused. See `docs/ROADMAP.md`.

**Recommended first implementation order:**
1. Basic FastAPI app + health endpoint
2. Escalation model + `request_human_auth` endpoint
3. Slack notification for escalations
4. Simple resolution flow
5. MCP tool wrappers
6. End-to-end example with a real agent

---

## License

Private / All Rights Reserved (for now)
