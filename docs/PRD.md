# Gryphon — Product Requirements Document

## 1. Vision

Gryphon makes authenticated web access reliable for AI agents.

Agents frequently fail because of expired sessions, 2FA challenges, CAPTCHAs, or unexpected login pages. Gryphon removes this failure mode by providing:

- Ready-to-use authenticated browser sessions
- Human-in-the-loop recovery when authentication is required
- Clean session handoff so agents can continue their work

Gryphon is infrastructure. It does not attempt to complete the agent's overall goal.

---

## 2. Problem

Current reality for agent builders:

- Manually pasting cookies into agents
- Sessions dying mid-task
- Agents getting stuck on login or 2FA screens
- No clean way for an agent to request human help and resume
- Browserbase Contexts help, but still require management, monitoring, and recovery flows

This creates constant babysitting and low reliability for any agent that needs to stay logged in.

---

## 3. Solution

Gryphon provides two core capabilities:

### A. Get Authenticated Session
An agent (or developer) can request a ready-to-use authenticated session for a specific site.

```
get_session(site="linkedin") → returns Browserbase context / storage state / cookies
```

### B. Human Escalation + Resume
When an agent hits an auth wall:

1. Agent calls `request_human_auth(...)`
2. Agent pauses
3. Human receives a rich notification (Slack preferred) with context + screenshot
4. Human resolves the login / 2FA / CAPTCHA
5. Gryphon returns a fresh session
6. Agent continues

---

## 4. Target Users (Early)

Primary:
- Indie developers and small teams building browser agents
- Users of Browserbase, Stagehand, Playwright, Claude Computer Use, etc.
- People currently pasting cookies or watching agents fail on auth

Secondary (later):
- Production agent platforms
- Internal enterprise agent teams

---

## 5. Core Features (MVP)

### Must Have (Phase 1)
- [ ] User accounts + API keys
- [ ] Connect notification channel (Slack first)
- [ ] `get_session(site)` API + MCP tool
- [ ] `request_human_auth(...)` API + MCP tool
- [ ] Human notification with context + one-tap style resolution flow
- [ ] Session storage / handoff (Browserbase Contexts primary)
- [ ] Basic session health / validity tracking
- [ ] Simple audit log of escalations and session usage
- [ ] Secure credential / session handling

### Nice to Have (Phase 2)
- Pre-connected accounts with guided login capture
- Multiple notification channels (Telegram, email, Discord)
- Automatic proactive re-auth detection
- Dashboard for managing connected sites and viewing history
- Support for additional browser providers beyond Browserbase
- Session sharing policies / multi-agent access

### Explicitly Out of Scope (for core product)
- High-level site-specific actions ("send LinkedIn message", "archive Gmail", etc.)
- Full non-human identity / enterprise IAM platform
- Running the agent itself
- Solving every CAPTCHA automatically (human escalation is the primary path)

---

## 6. Key User Flows

### Flow 1 — Get Session at Start of Task
1. Developer registers Gryphon MCP server or SDK
2. Agent (or orchestrator) calls `get_session("linkedin")`
3. Gryphon returns a usable authenticated context
4. Agent injects it into Browserbase / Playwright and proceeds

### Flow 2 — Mid-task Recovery
1. Agent detects it is no longer authenticated (or hits login page)
2. Agent calls `request_human_auth(site, reason, screenshot, current_context)`
3. Agent pauses / interrupts
4. Human receives Slack message with screenshot and context
5. Human completes login or enters 2FA
6. Gryphon updates the session and marks escalation as resolved
7. Agent resumes with the new session

### Flow 3 — First-time Account Connection (later)
1. User goes to Gryphon dashboard
2. Clicks "Connect LinkedIn"
3. Guided browser login occurs
4. Gryphon captures and stores the session securely
5. Future `get_session` calls can reuse it

---

## 7. Success Metrics (Early)

- Time from escalation notification → agent resumed
- % of escalations successfully resolved by human
- Number of successful `get_session` calls
- Reduction in agent auth-related failures (qualitative from users)
- Willingness of users to pay for the service

---

## 8. Design Principles

1. **Agent DX first** — MCP tools should feel native and simple.
2. **Human experience matters** — Escalation notifications must be fast and clear.
3. **Narrow focus** — Resist adding site-specific action tools in the core product.
4. **Security by default** — Encrypt sensitive material, short TTLs where sensible, easy revocation.
5. **Composability** — Work excellently with Browserbase + Stagehand rather than trying to replace them.

---

## 9. Open Questions

- Exact session format returned to agents (Browserbase context ID vs full storage state vs cookies)
- How much session monitoring Gryphon should do proactively vs reactively
- Pricing model (per escalation, per active session, monthly per agent, etc.)
- Whether to support local Playwright sessions in addition to Browserbase in MVP
