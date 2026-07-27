# Panel report — Operator dashboard (post sign-in)

**Date:** 2026-07-27  
**Run class:** standard · **Protocol:** short (`PANEL.md` + `playbook.md`)  
**Surfaces:** `/dashboard`, `/dashboard/install`, `/dashboard/profile`, sidebar  
**Trigger:** Signed-in user: “extremely confused… random things… idk what I’m looking at.”

---

## Executive Summary

| | |
|--|--|
| **Primary job (should be)** | First-time account: *get an API key → wire MCP/agent → connect first site* |
| **Primary job (current UI pretends)** | On-call operator clearing fake auth escalations for Mara’s team |
| **Overall score** | **2.5 / 10** for first-time signed-in user |
| **Craft of the mock** | 7/10 (looks intentional as a *vision* UI) |
| **Honesty / usability at day 0** | 2/10 |

### Top 3 problems

1. **Fake world, real login** — Clerk signs *you* in; the page still shows Mara’s escalations, Stripe 2FA, 6 connected sites, “27 runs saved,” and demo mode toggles. Nothing is yours.
2. **Wrong first screen** — Day-0 job is setup. Day-0 UI is a mature ops floor. No “you have zero data — do this next.”
3. **Broken / lying chrome** — Nav “API keys” jumps to `#api-keys` (doesn’t exist). “Open Live View,” “Mark resolved,” “+ connect a site,” Profile “Edit/Manage” look clickable but are props. Profile still hardcodes **Mara Kimura**.

### Top 3 cuts / simplifications

1. **Delete demo state switcher** (“One open / Queue / All clear”) from the product path — or hide behind an explicit “Preview demo” mode.
2. **Replace default Escalations view with a zero-state** when there are no real escalations/sessions (your real account state today).
3. **Collapse nav to three things that exist:** Home (setup or escalations), Install, Profile. Drop or stub-label Sessions/API keys until real.

---

## Density Notes

### What feels overcrowded / competing

| Block | Why it confuses |
|-------|-----------------|
| Stats row (median rescue / runs saved / human time) | Looks like *your* metrics; all invented |
| “Needs you now” Stripe card | Urgency theater for an account with no agents |
| Demo mode pills under the title | Reads as product control, not designer tool |
| Sessions table (6 sites, `bb_ctx_*`) | Looks like you already connected Stripe, Gmail… |
| Resolved list + queue | History for a life you never lived |
| Profile rescues / on-call / Dev Patel | Multi-tenant ops product you didn’t buy yet |
| Install page CONNECTION + 4 MCP sections | Real, but buried *after* you already drowned on Escalations |

### What can be removed or combined (day-0)

- Remove: fake open escalation, resolved history, session table rows, rescue leaderboard, on-call rotation, night-owl stats  
- Remove or relegate: demo mode switcher  
- Merge: Sessions + Escalations into one “Activity” later; not needed until data exists  
- Keep but demote: Install (make it step 1 of empty home, not nav item #3)  
- Keep: Clerk UserButton (real)

**Density check:** Page is “full” of *someone else’s* product. First job is **reduce to empty-account truth**, not decorate.

---

## Buyer Path (first sign-in)

Walk-through as skeptical buyer who just finished Clerk:

| Step | What they see | Friction |
|------|----------------|----------|
| 1. Land `/dashboard` | Amber “Needs you now · Stripe · 2FA” | Panic / “did I break something?” / “whose Stripe?” |
| 2. Scan stats | “27 runs saved” | Feels like a SaaS template or wrong account |
| 3. Try “Open Live View” | Nothing real | Trust breaks |
| 4. Try “Mark resolved” | Fake card vanishes (demo mode) | “Is this a toy?” |
| 5. Sidebar Sessions 5/6 | Status without meaning | Jargon without glossary |
| 6. API keys | Dead hash link | Broken product |
| 7. Profile | **Mara Kimura** while sidebar shows *their* name | Split-brain identity |
| 8. Install agents | Repo path `/absolute/path/to/Gryphon`, `dev-api-key` | First useful page, but dense and assumes local monorepo clone |

**Verdict:** The path never answers: *What is this for me, and what’s my next action?*  
Playbook fail: **Don’t Make Me Think** + **one primary action**.

### Priority persona notes (lightweight)

- **Avery (founder):** Wants “am I set up?” in 30s. Sees fake fire drill → bounces.  
- **Jordan (eng):** Would survive Install if they found it; Escalations first wastes trust with fake Live View.  
- **Sam (designer):** Craft of mock is good; shipping mock as live data is craft *dishonesty*.

---

## Scores (1–10)

| Axis | Score | Note |
|------|------:|------|
| Clarity | 2 | Self-evident only if you already know Gryphon’s vision deck |
| Density | 3 | Too much *fake* content; not too much *useful* content |
| Hierarchy | 2 | Primary action should be setup; UI prioritizes fake urgency |
| Craft | 7 | Visual system strong; content honesty fails |
| Professionalism | 4 | Fake controls + wrong identity = unprofessional for signed-in product |
| Conversion / activation | 2 | No path from signed-in → first real `get_session` for *this* user |

---

## What’s actually real vs prop

| Element | Status |
|---------|--------|
| Clerk sign-in / protect `/dashboard` | **Real** |
| Sidebar UserButton + display name | **Real** (Clerk) |
| Escalations list / open card | **Mock** |
| Sessions table | **Mock** |
| Metrics (51s, 27 runs…) | **Mock** |
| Demo mode switcher | **Dev prop** left in UI |
| Open Live View / Mark resolved | **Non-functional / demo** |
| Profile Mara / on-call / rescues | **Mock** (name not from Clerk) |
| Install snippets | **Mostly real docs** |
| API key field default `dev-api-key` | Shared bootstrap — **not** “your key” |
| Nav “API keys” | **Broken** (no target) |

---

## Recommendations (reduction-first)

Order: delete → merge → relabel → restructure → add (last).

### 1. Default signed-in home = **zero state**, not ops floor

**What changes:** If user has 0 site_sessions and 0 open escalations (true for every new Clerk user today), `/dashboard` shows one screen:

- Title: **Get your agent online** (or **Set up Gryphon**)
- Three steps only:  
  1. Create API key  
  2. Install MCP / paste config  
  3. Connect a site (triggers real `needs_auth` / Live View)
- One primary button for the next incomplete step

**What is removed:** Fake Stripe urgency, fake stats, fake resolved list, fake sessions table from the default path.

**Why:** Matches actual account state. Answers “what am I looking at?” with “your setup checklist.”

---

### 2. Put the vision mock behind **“Preview product”** (optional)

**What changes:** A quiet link or secondary control: “Preview with sample data.” Only then show current Escalations/Sessions mock.

**What is removed:** Demo pills as default chrome; fake data as default truth.

**Why:** Keeps the craft investment without lying to first-time users.

---

### 3. Fix identity on Profile (relabel + reduce)

**What changes:**

- Profile header = Clerk `fullName` / email (same as sidebar)
- Sign out = real Clerk `SignOutButton` (not link to `/sign-in` that doesn’t clear properly)
- **Delete** until real: on-call rotation, Dev Patel, rescue leaderboard, night-owl, “Signed in via GitHub” mock

**Why:** One identity. No second fictional human after you just authenticated.

---

### 4. Nav: only what exists

| Keep | Change |
|------|--------|
| Home / Setup or Escalations | One entry; badge only if real open count |
| Install agents | Keep (Jordan non-negotiable) |
| Profile | Keep, slimmed |

**Remove or hide until shipped:** “API keys” dead link, “Sessions 5/6” fake meta, Escalations badge `1` when nothing is open.

**Why:** Dead nav is worse than short nav.

---

### 5. Install page: day-0 strip, not monorepo runbook first

**What changes (reduce/reorder, don’t expand essay):**

1. **Your API key** (generate / copy once) — no free-text “dev-api-key” default as if personal  
2. **One host** (Cursor default) + one copy block for MCP JSON with *their* key and **production** API URL default for non-devs  
3. Collapse local monorepo path + setup scripts under “Running the monorepo locally”

**What is removed from above the fold:** Absolute path requirement as step 0 for every user.

**Why:** Most buyers after Clerk sign-up are not cloning Gryphon; they need cloud API + key + Cursor snippet.

---

### 6. Honest empty copy for Escalations / Sessions (when real and empty)

When wired to API and empty:

- Escalations: **“Nothing waiting on you.”** + one line: agents pause here when auth breaks. No fake history.  
- Sessions: **“No sites connected.”** + single CTA **Connect a site** (real escalate/resolve flow).

**Why:** Empty is clearer than full of strangers’ data.

---

### 7. Do **not** add (hard ban this run)

- More explainer cards  
- Tour overlays / coach marks on top of the fake floor  
- Extra nav items  
- Second marketing story inside dashboard  

If the page gets longer, the panel failed.

---

## Proposed information architecture (minimal)

```
Signed in
├── Home
│   ├── if setup incomplete → Setup checklist (key → install → connect)
│   └── if setup complete   → Escalations (real) + Sessions (real)
├── Install   (MCP / REST — eng depth OK)
└── Profile   (you + sign out + later Slack channel)
```

Optional later: API keys page, team on-call, metrics — only with real data.

---

## Preserve

- Clerk authentication and route protection  
- Product concepts: escalations, Live View, site sessions, MCP tools  
- Install / agent contract content (move, don’t trash)  
- Visual craft language of the mock (reuse for *demo mode* and future live states)  
- Scope: auth reliability only — dashboard should not pretend to be a general agent platform

---

## Consensus

**Decision: PROCEED** (suggestion catalog for implement; not auto-implementing UI this run unless asked)

| Role | Approve? | Evidence |
|------|----------|----------|
| Orchestrator | yes | Day-0 confusion is product honesty failure; reduce-first plan clear |
| Journey | yes | First path fails before Install; zero-state is the fix |
| Heuristic | yes | One primary job, no fake primary actions, no dead nav |
| Craft | conditional | Mock craft stays if labeled demo; not as default live data |

**Implement order if you say go:**

1. Zero-state home for empty accounts  
2. Profile = Clerk user + real sign-out; strip Mara fiction  
3. Nav prune + kill `#api-keys` lie  
4. Demote mock ops to “Preview sample data”  
5. Install: key-first, production default, local under fold  

---

## One-line diagnosis (for the human)

You’re not looking at *your* Gryphon account. You’re looking at a polished **concept mock** of an ops console that was never swapped for an empty signed-in account after Clerk went live. The product that exists (API keys + MCP + get_session) is hidden behind fiction.

---

## Appendix — Screen jobs (target)

| Screen | One job |
|--------|---------|
| Home (empty) | Complete setup |
| Home (live) | Clear open escalations / see site health |
| Install | Get agent talking to *your* key |
| Profile | Confirm identity + notification prefs (later) |
| Preview demo | Understand future ops UI without mistaking it for live data |
