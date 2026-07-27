# Panel report — Gryphon homepage (FULL)

**Surface:** `apps/dashboard` `/`  
**Live:** https://gryphon-self.vercel.app  
**Run class:** `full` · **Protocol:** `full` (personas/DESIGN.md/FRONTEND.md stubbed from AGENTS + shipped UI)  
**Mode:** **Suggestions only** — what to change. No implement this run.  
**Consensus:** **REVISE** → backlog ready · see `council.md#consensus`  
**Priority persona:** Avery · **Secondary:** Jordan, Sam  

### Role artifacts (all agents)

| Agent | Artifact |
|-------|----------|
| Orchestrator | `run-state.yaml`, `council.md` |
| Product Analyst | `product.md` |
| Empathy Mapper + PMs | `empathy-maps.md` |
| Journey Critic | `journeys.md` |
| Heuristic Auditor | `heuristics.md` |
| Design System Checker | `design-system.md` |
| Craft Critic | `craft.md` |
| Prose Critic | `prose.md` |
| Motion Critic | `motion.md` |
| Frontend Design | `design-brief.md`, `frontend-proposals.md` |
| Report Writer | this file |

---

## Executive summary (suggestion-oriented)

| | |
|--|--|
| **Primary job** | Make clear Gryphon is the auth layer for browser agents → **join waitlist** |
| **Overall score** | **6.5 / 10** as-shipped for full-crew bar (clarity high; craft/density/motion gates fail) |
| **Ship as-is?** | **No** — dual-font H2 + density + reduced-motion gaps |
| **What to do** | Apply change catalog below in priority order; preserve waitlist path |

### Top 3 changes (do these first)

1. **One font on System H2** — remove serif italic on “nothing else.”  
2. **Cut System 03 (Handback) or collapse it to one line** — story already in Loop 04.  
3. **Align waitlist subcopy with the form** (email-only today vs “tell us the site…”).  

---

## Scores (crew)

| Axis | Score | Owner |
|------|------:|-------|
| Clarity | 8 | Journey / Product |
| Density | 5 | Heuristic |
| Hierarchy | 7 | Journey / Heuristic |
| Craft | 6 | Craft |
| Motion | 6 | Motion |
| Prose | 7 | Prose |
| Design system | 5 | Design System |
| Professionalism | 7 | Craft + DS |
| Conversion | 7 | Product + Journey |

---

## Preserve (do not change away)

- Waitlist CTAs (header, hero, `#waitlist`) and real `/api/waitlist` flow  
- Hero promise: “Agents that never die on a login.”  
- Eyebrow: “AUTH LAYER FOR BROWSER AGENTS”  
- Scope boundary: not a framework / not a browser platform  
- Real product concepts in demos: `get_session`, `needs_auth`, contexts, Live View  
- Brand stack: ink / paper / blue · Helvetica · JetBrains Mono  
- Serif **wordmark** in footer (if System H2 serif is removed)  

---

# Change catalog

Every item is a **suggestion for what to change**.  
**Type:** Delete · Merge · Relabel · Restructure · Add (last resort)  
**Priority:** P0 ship-block · P1 strong · P2 polish  

---

## P0 — Ship blockers

### S1 · One typeface on System H2  
| | |
|--|--|
| **Owners** | Craft, Design System, PM-Sam, Prose |
| **Where** | `system-section.tsx` — first page `<h2>` |
| **Problem** | “Three things, and *nothing else.*” = Helvetica + Instrument Serif italic (user-flagged) |
| **Change** | **Delete** `font-serif` / special `<em>` sizing. Keep words in heading sans. Optional: “Three things. Nothing else.” |
| **Removes** | Dual-font headline |
| **Why** | Other H2s are pure sans; this reads as a bug. Sam non-negotiable. |
| **IDs** | C1, DS1, R1, J3a |

### S2 · Global `prefers-reduced-motion` for marketing motion  
| | |
|--|--|
| **Owners** | Motion |
| **Where** | `globals.css` (`.animate-g*`), `loop-section.tsx` interval |
| **Problem** | Only hero journeys + `.animate-hub-pulse` respect reduced motion; Loop orbit/spin/dash/pulse keep moving |
| **Change** | **Fix:** media query kills marketing animations; Loop skips `setInterval` when reduced |
| **Removes** | Motion for users who opted out |
| **Why** | MOTION hard rule; professionalism/a11y |
| **IDs** | M1, M2, M3, M5 |

### S3 · Waitlist copy ↔ form honesty  
| | |
|--|--|
| **Owners** | Product, Prose, Journey |
| **Where** | `waitlist-section-v6.tsx` + `waitlist-inline.tsx` |
| **Problem** | Subcopy: “Tell us the site that keeps breaking…” — form collects **email only** |
| **Change (pick one)** | **A:** Add optional “site” field · **B:** Rewrite subcopy so it doesn’t promise a site capture |
| **Removes** | Broken expectation |
| **Why** | Promised vs shipped gap kills trust at conversion |
| **IDs** | P1, R7, J1d |

---

## P1 — Density & hierarchy (Avery primary)

### S4 · Remove or collapse System 03 (Handback)  
| | |
|--|--|
| **Owners** | Journey, Heuristic, Product, Frontend |
| **Where** | `system-section.tsx` — third grid block |
| **Change** | **Delete** full demo **or merge** to one line under 02: agent gets `connect_url`; credentials stay in Gryphon |
| **Removes** | Third full window + paragraph that retells Loop 04 |
| **Why** | Same job twice; page already full |
| **Guard** | Keep eng words if merging; don’t delete Loop without Jordan |
| **IDs** | H4, J1b, C3, B1, R4 |

### S5 · One primary “how it works” center  
| | |
|--|--|
| **Owners** | Journey, Heuristic, Frontend, PM-Jordan |
| **Where** | System + Loop pairing |
| **Change** | **Restructure:** System owns product proof; Loop stays as eng runtime trace **but** shorter — **or** opposite. Do **not** run two full retellings. |
| **Recommended** | Keep Loop for Jordan; cut System 03 + trim System body (S4 + S6). Avoid deleting Loop. |
| **IDs** | H5, J1c, B2 (B2 only with Jordan Approve) |

### S6 · Shorten System 01 / 02 body copy  
| | |
|--|--|
| **Owners** | Prose, Heuristic |
| **Where** | System section paragraphs |
| **Change** | **Merge/shorten** ~20–30%: 01 = persist context, no cookie plumbing · 02 = ping + Live View, you clear, run continues |
| **Removes** | Restated pause/resume essays |
| **IDs** | H2, R2, R3, B3 |

### S7 · Delete waitlist decorative rays  
| | |
|--|--|
| **Owners** | Craft, Motion, Frontend |
| **Where** | `waitlist-section-v6.tsx` absolute ray stack |
| **Change** | **Delete** ornament; leave type + form |
| **Why** | No job; competes with conversion |
| **IDs** | C4, M4, J3d |

### S8 · Reduce repeated fake browser chrome  
| | |
|--|--|
| **Owners** | Craft, ANTI-SLOP, PM-Sam |
| **Where** | `WindowChrome` in System (+ Loop card chrome) |
| **Change** | **Restructure:** full chrome on **one** flagship demo; simpler frames on others |
| **Removes** | Traffic-light theater repetition |
| **Guard** | Jordan: keep product UI *content* (rows, statuses), not necessarily Mac dots |
| **IDs** | C2, J3b |

---

## P1 — Type system & UI consistency

### S9 · Document type roles (and write DESIGN.md)  
| | |
|--|--|
| **Owners** | Design System, Frontend |
| **Change** | **Add** `web/DESIGN.md` (or dashboard DESIGN): sans = UI/H*; mono = system; **serif = wordmark only** |
| **Removes** | Ambiguity that created dual-font H2 |
| **IDs** | DS1, DS2, A2 |

### S10 · Unify primary CTA shape  
| | |
|--|--|
| **Owners** | Design System, Craft, Avery |
| **Where** | Header waitlist (rect) vs hero (pill) |
| **Change** | **Restructure:** same geometry both places (pick one) |
| **IDs** | DS5, A3 |

### S11 · Paper / radius / gray token cleanup  
| | |
|--|--|
| **Owners** | Design System |
| **Change** | **Merge** hero `#F7F6F3` into a named paper step; map hard-coded grays to faint/ghost/muted; document radius rules (chrome 10px vs sharp scope cards) |
| **Priority** | P2 if timeboxed after S1–S8 |
| **IDs** | DS3, DS4, DS6 |

---

## P1 — Product / conversion clarity

### S12 · Optional MCP credibility line (no new section)  
| | |
|--|--|
| **Owners** | Product, Prose, Jordan |
| **Where** | Hero sub **or** Scope mono line |
| **Change** | **Add** (only if true): short “MCP tools + API” phrase into existing copy |
| **Why** | Docs lead with MCP; homepage nearly silent |
| **IDs** | P2, J2b, D2 |

### S13 · Revisit header “Sign in” for waitlist visitors  
| | |
|--|--|
| **Owners** | Product, Journey, Avery |
| **Change** | **Relabel/hide** until GA, or clarify invited console — reduce “do I already have an account?” |
| **IDs** | P3, D3 |

### S14 · Nav link trim if Loop demoted  
| | |
|--|--|
| **Owners** | Prose, Journey |
| **Change** | If Loop is shortened/hidden: **remove** header “The loop” link |
| **IDs** | R9 |

---

## P2 — Motion polish (after P0 S2)

### S15 · Loop decorative motion only when teaching  
| | |
|--|--|
| **Owners** | Motion, Craft |
| **Change** | Keep step highlight; **tone down** orbit/spin if System already heavy; never add entrance bounce |
| **IDs** | M2, C6 |

### S16 · Hero diagram: readable without animation  
| | |
|--|--|
| **Owners** | Journey, Motion |
| **Change** | Confirm reduced-motion static still shows agents → Gryphon → sites (hero already has reduced path — verify labels) |
| **IDs** | J1a |

---

## Explicit non-changes (do not do)

| Don’t | Why |
|-------|-----|
| Add new marketing sections | Density already high |
| Add fake testimonials / logos as social proof | Phase B honesty |
| Delete waitlist CTAs | Conversion preserve |
| Full visual rebrand / new font pairing | Out of scope; fix system first |
| Delete Loop *and* System eng language | Hurts Jordan without Approve |
| More decorative motion | MOTION / ANTI-SLOP |
| Pricing / feature matrix | Product scope |
| “Improve” by adding paragraphs | PANEL reduction bias |

---

## Suggested implementation order (when you approve code)

| Step | Suggestion IDs | Approves needed |
|------|----------------|-----------------|
| 1 | **S1** type fix | Craft + PM-Sam + Orchestrator |
| 2 | **S3** form/copy honesty | Product + Prose + Journey |
| 3 | **S2** reduced-motion | Motion + Orchestrator |
| 4 | **S4 + S6 + S7** density | Journey + Craft + PM-Avery (+ Jordan if Loop touched) |
| 5 | **S8 + S10** chrome/CTA | Craft + Design System |
| 6 | **S9 + S11–S14** system/docs/nav | Design System + Product as relevant |

One **Executor** after **PROCEED**; critics re-score only — no mid-edit redesign.

---

## Multi-persona impact (full backlog)

| Persona | If we ship S1–S8 | Risk if we cut wrong |
|---------|------------------|----------------------|
| **Avery** | Help — faster scan, clear convert | Hurt if we add length |
| **Jordan** | Help — truth kept; Loop kept | Hurt if Loop + eng labels gutted |
| **Sam** | Help — type + less chrome | Hurt if only copy-tweaks and dual-font remains |

---

## Buyer path → mapped fixes

| Step | Friction | Fix with |
|------|----------|----------|
| First impression | Strong | — |
| First H2 | Dual font | **S1** |
| Proof | Too long / retold | **S4–S6** |
| Loop | Motion a11y | **S2, S15** |
| Scope | Good | Optional **S12** |
| Waitlist | Copy/form mismatch; rays | **S3, S7** |

---

## Consensus

**Decision: REVISE** — full suggestion backlog accepted; **not** PROCEED to code.

| Role | Ship UI as-is | Accept suggestions |
|------|---------------|--------------------|
| Orchestrator | no | **yes** |
| Product | no (S3) | **yes** |
| Empathy / PMs | — | **yes** (Sam: S1 required) |
| Journey | no (density) | **yes** |
| Heuristic | **no** | **yes** |
| Design System | **no** | **yes** |
| Craft | **no** | **yes** |
| Prose | yes* | **yes** |
| Motion | **no** | **yes** |
| Frontend | n/a | **yes** (A–D) |

\*Prose alone would not block; combined craft/density does.

---

## Definition of success for the next implement

Page becomes **lighter and more consistent**:

- One type system on headlines  
- One fewer full proof retelling  
- Honest waitlist form  
- Reduced-motion respected  
- Waitlist path unchanged  
- **Fewer** words and sections, not more  

If implement adds sections or length, the next panel fails PANEL.md.
