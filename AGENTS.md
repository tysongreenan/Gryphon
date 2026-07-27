# Panel agent roster

Skills are the source of truth. Collaboration law: **`COLLABORATION.md`**.

## Install

```bash
npx @tysongreenan/panel init
```

Then: **Run a panel** or Cursor **`/panel`**.

---

## Protocol pack (Orchestrator declares every run)

| Pack | Load | When |
|------|------|------|
| **short** | `PANEL.md` + `playbook.md` (+ craft/motion skills as needed) | Buyer density pass, single surface, lite craft |
| **full** | short + `PANEL.full.md` + `COLLABORATION.md` + this file + `docs/personas.md` | Multi-persona council, homepage/marketing, implement after report |

Write the choice into **`panel-report/run-state.yaml`** (`protocol: short | full`).  
Do not half-load the full crew while pretending it is a short pass.

### Shared run-state (context engineering)

At Phase 0, copy `docs/run-state.template.yaml` → `panel-report/run-state.yaml` and fill it.

Every specialist **reads** run-state before working. Orchestrator **updates** priority, preserve, brief, scores, approves, artifact paths.  
Handoffs reference artifacts and run-state fields — they do not re-tell the whole run (anti–telephone-game).

---

## Run classes (scale seats to the job)

| Class | When | Seats (approx) |
|-------|------|----------------|
| **lite** | One component / focus ring / tiny craft fix | Orchestrator + 1 domain critic |
| **standard** | Single page or flow UX | Orchestrator + Product + Journey + Heuristic + **priority PM only** + relevant critics |
| **full** | Homepage / marketing redesign / multi-surface | Full roster + **all** Persona Managers + design brief |
| **implement** | After report PROCEED | Only Approves required for touched surfaces; one **Executor**; critics re-score only |

Full crew is **expensive** — default to **standard** unless the surface is conversion-critical marketing or the user asks for full.

Set `run_class` in run-state at preflight. Skipping run-class selection on a multi-role run is a process failure.

---

## Core crew

| # | Agent | Skill | Job |
|---|--------|-------|-----|
| 1 | **Orchestrator Manager** | `PANEL.md` | Preflight, phase order, mediate, report ship |
| 1b | **Persona Managers (×N)** | `docs/personas.md` | One per persona — advocate, negotiate priority, veto harm |
| 2 | **Product Analyst** | Codebase | Purpose, features, promised vs shipped |
| 3 | **Empathy Mapper** | Panel | Draft/quality of maps; seats with Persona Managers |
| 4 | **Journey Critic** | Panel | Flows for **all** in-scope personas |
| 5 | **Heuristic Auditor** | `playbook.md` | Hard gates |
| 6 | **Design System Checker** | `web/DESIGN.md` | Tokens / system vs shipped UI |
| 7 | **Craft Critic** | `ANTI-SLOP.md` | Visual craft |
| 8 | **Prose Critic** | stop-slop-prose | Copy |
| 9 | **Motion Critic** | `MOTION.md` | Motion |
| 10 | **Frontend Design** | `FRONTEND.md` + `web/DESIGN.md` | Brief first · load DESIGN.md · then library proposals only |
| 11 | **Report Writer** | Report template | Assemble; multi-persona coverage |

### Panel default Persona Managers

| Seat | Persona | Non-negotiable if secondary |
|------|---------|------------------------------|
| **PM-Avery** | Avery (founder) | Obvious install; report clear in minutes |
| **PM-Jordan** | Jordan (eng) | Real init / OSS credibility |
| **PM-Sam** | Sam (designer) | Sample looks serious, not a toy |

---

## Phase order (Orchestrator enforces)

```
0. Preflight
   ├─ run_class + protocol pack → write run-state.yaml
   ├─ Intent + preserve list
   ├─ Personas exist? (standard/full)
   ├─ Seat Persona Managers (PM-*)
   └─ Priority council → Priority / Secondary / Deferred
         │
         GO
         ▼
1–2. Product + maps
         ▼
3. Journeys (all in-scope PMs; weight priority)
         ▼
4. Critique — parallel read wave when possible
   (craft ∥ motion ∥ prose ∥ heuristics on frozen journey artifacts)
   then Orchestrator / Report Writer merges; any Block holds
         ▼
5. Frontend Design **asks** Orchestrator + all PMs for visual prefs (design brief)
   then library search · Craft · Motion · Prose · Design System
   (multi-persona impact on each proposal)
         ▼
6. Report
         ▼
7. Consensus log (evidence-cited Approves) → implement only if Approves met
   → one Executor applies plan; critics re-score (no mid-edit redesign)
```

**Parallel rule:** Workers in a fan-out must have **non-overlapping** tasks. Interdependent work stays serial in the pipeline.

**Frontend Design cannot invent taste.** No ui-ux-pro-max search or redesign until managers answer the brief (`FRONTEND.md` Step 0) **and** project `DESIGN.md` is loaded when marketing/`web/` is in scope (Step 0b).

### Priority council (not single-persona tunnel vision)

1. Each **Persona Manager** pitches for priority **this run**.  
2. Council sets **Priority** + **Secondary non-negotiables**.  
3. Later work must check: help priority? **hurt secondary?** → that PM must Approve.  
4. File “primary” is a **proposal**, re-negotiated each full run.

### Blocking

| Missing | Result |
|---------|--------|
| Personas | **NO-GO** |
| Priority never negotiated (full run) | **NO-GO** |
| Design brief unanswered (full UI work) | Frontend **BLOCKED** — no library/search/redesign |
| Implement without Approves | **BLOCK** |
| Harm secondary without PM Approve | **Persona coverage: weak** |

### Homepage / marketing redesign Approves

Orchestrator · **all Persona Managers** · Journey · Craft · Motion  
(+ Prose if copy-heavy). Frontend proposes only.

---

## Talk + consensus

Handoffs and consensus templates: **`COLLABORATION.md`**.

Before implement, always include **multi-persona impact**.

---

## Skills map

| Path | Domain |
|------|--------|
| `PANEL.md` | **Default** buyer review — reduction bias, density-first (short) |
| `PANEL.full.md` | Full multi-agent crew (personas, council, craft/motion gates) |
| `COLLABORATION.md` | Permissions, Persona Managers, consensus |
| `docs/personas.md` | Product humans + PM seats |
| `web/DESIGN.md` | Marketing design system (tokens, type, components, page order) |
| `ANTI-SLOP` / `MOTION` / `FRONTEND` | Domain skills — Frontend loads `web/DESIGN.md` before library search |
| `skills/*` | Deep packs |
