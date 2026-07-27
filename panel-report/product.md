# Product Analyst — homepage

**Phase:** 1 · **Budget:** deep · **Surface:** `/` marketing homepage  
**Sources:** `docs/PRODUCT.md`, `product/CURRENT_FOCUS.md`, `product/PHASE_B_WAITLIST.md`, shipped marketing components

---

## What the product is (shipped promise)

| Concept | Meaning on page |
|---------|-----------------|
| Auth layer | Eyebrow + Scope stack |
| Session | System 01 demo |
| Escalation | System 02 Slack + Loop 03 phone |
| Handback / resume | System 03 + Loop 04 |
| Waitlist | Header, hero, closing form → `/api/waitlist` |

**One-sentence (docs):** Reliable logged-in sessions + human help when auth is required.  
**One-sentence (page):** Agents never die on a login — pause, human, warm resume.

---

## Promised vs shipped (homepage only)

| Promise | Shipped on `/`? | Gap |
|---------|-----------------|-----|
| Auth reliability for agents | Yes — hero + demos | — |
| MCP-native | Hint only (`gryphon · mcp` in handback UI) | No explicit “works as MCP tools” line |
| REST API | No | Fine for waitlist phase |
| Dashboard for humans | “Sign in” link only | Sign-in exists; no screenshot of operator console |
| Not a framework / browser platform | Yes — Scope footer line | — |
| Waitlist capture | Yes — email form | Closing copy says “Tell us the site that keeps breaking” but form has **email only** — promise mismatch |
| Real (not fake) social proof | Yes — product demos, no quotes | — |
| Public install (`npx …`) | No | Correct for Phase B waitlist |

---

## Features the page sells

1. Persistent sessions per site  
2. Human escalation (Slack / WhatsApp / Live View)  
3. Clean handback without credentials in agent code  
4. Fits under existing agent + Playwright + Browserbase stack  

---

## Suggestions (Product) — what to change

| ID | Suggestion | Why |
|----|------------|-----|
| **P1** | Align waitlist form fields with closing copy: either add optional “site that keeps breaking” field **or** remove that sentence from copy. | Promised input not collectable. |
| **P2** | Add one short MCP/API credibility line near hero secondary or Scope (not a new section) — e.g. “MCP tools + API” — only if accurate for waitlist audience. | Docs say MCP-first; page almost silent. |
| **P3** | Soften or annotate header **Sign in** if console is mock/internal (e.g. hide until GA, or “Console” for invited users). | Avoid “do I already have an account?” for waitlist visitors. |
| **P4** | Do not add pricing, feature matrices, or agent-framework claims. | Out of product scope; would fight Phase B job. |
| **P5** | Keep demos grounded in real concepts (`get_session`, `needs_auth`, contexts). If cutting density, cut chrome/length — not the API words. | Product truth is the moat vs generic AI landings. |

**Product score contribution:** conversion story strong; form/copy honesty and MCP signal weak spots.
