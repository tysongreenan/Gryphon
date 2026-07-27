# PANEL.md
## Panel — Buyer-Level UX Review

When the user asks to “run a panel”, “Panel”, “UX review”, or similar, follow these rules exactly.

**This file is always on** — source of truth for buyer job and reduction bias.  
Optimize. Do not expand.

### What loads when

| User says | Load |
|-----------|------|
| Run a panel / Panel review | **this file** + `playbook.md` |
| UI / craft / anti-slop | + `ANTI-SLOP.md` |
| Animations / motion | + `MOTION.md` |
| Design system / colors / type | + `FRONTEND.md` + `skills/ui-ux-pro-max` |

### Priority of truth

1. **PANEL.md** — buyer job + reduction bias  
2. **ANTI-SLOP.md** — does this look AI-made?  
3. **MOTION.md** — Emil Kowalski standard  
4. **playbook.md** — shared principles  
5. Heavy packs — only when explicitly needed  

### Goal
Act as a skeptical buyer. Improve the product so it feels **clear, light, and professional**.  
Optimize. Do not expand.

---

### Non-negotiable rules (read these first)

1. **Reduction bias**
   - Prefer delete, merge, or restructure over adding text or sections.
   - If you cannot improve the page without adding words, say so and stop.
   - Never “improve” by dumping more explanation.

2. **Density check (required)**
   Before any change, answer:
   - Is this page already full?
   - Does every block earn its place for a first-time buyer?
   - What can be removed or combined without losing the main job?
   If the page is dense, your first job is to reduce, not decorate.

3. **One primary job per screen**
   Every page/section must have one clear job (e.g. “get them to install”, “show proof”, “explain the product”).
   Extra stories, extra cards, and extra “helpful” copy fight that job. Cut them.

4. **Preserve the conversion path**
   Do not remove the main install / signup / primary CTA just to make the audit look cleaner.
   Incomplete implementation → label it honestly or fix the backend. Do not delete the pattern.

5. **Don’t Make Me Think**
   - Self-evident > clever
   - Scannable > readable essays
   - Conventions > novelty
   - Omit needless words
   - The right next action must be obvious

---

### Process (keep it short)

**0. Run class (one line)**
- `lite` · `standard` · `full` · `implement` — see `AGENTS.md`.  
- Multi-persona / marketing redesign → load **full** pack (`PANEL.full.md` + `COLLABORATION.md`) and write `panel-report/run-state.yaml` from `docs/run-state.template.yaml` (or the copy under `panel-report/`).  
- **No implement without consensus PROCEED** on standard/full (see `COLLABORATION.md`).

**1. Intent**
- What is the page’s primary job for a first-time buyer?
- What is the one action we want them to take?
- List anything that must be preserved (install command, brand, specific libraries).

**2. Density & hierarchy pass**
- Mark what is competing for attention.
- Identify repeated explanations, redundant sections, and low-value text.
- Propose cuts and merges before any new content.

**3. Buyer walkthrough**
Walk the primary path only:
- First impression
- Understand what it is
- Decide to try / install
- See proof

Note friction, confusion, and places that make the buyer think.

**4. Critique (only what matters)**
Score 1–10:
- Clarity (self-evident?)
- Density (too much on the page?)
- Hierarchy (is the primary action obvious?)
- Professionalism / craft
- Conversion readiness

**5. Recommendations**
Order of preference for every fix:
1. Delete
2. Merge / shorten
3. Relabel / clarify
4. Restructure
5. Add (last resort — must justify why existing content cannot work)

Every recommendation must state:
- What changes
- What is removed or reduced
- Why this helps a skeptical buyer

---

### Output format

```markdown
## Executive Summary
- Primary job of this page:
- Overall score (1–10):
- Top 3 problems:
- Top 3 cuts/simplifications:

## Density Notes
- What feels overcrowded:
- What can be removed or combined:

## Buyer Path
- Friction points (only real ones):

## Recommendations (reduction-first)
1. ...
2. ...
3. ...

## Preserve
- What must not be deleted:
```

---

### Hard bans

- Do not add new sections “for completeness.”
- Do not add marketing paragraphs that restate what’s already visible.
- Do not create more cards, more steps, or more badges unless something essential is missing.
- Do not rewrite the product’s story into a different product.
- Do not optimize for audit purity at the cost of the install/conversion path.

---

### Definition of success

A good run makes the page **lighter, clearer, and more obvious** — not longer.
If the page has more words after your recommendations than before, you failed this skill.
