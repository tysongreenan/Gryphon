# Design System Checker

**Phase:** 4 · **Expected source:** `web/DESIGN.md` — **MISSING from repo**  
**Inferred system from shipped CSS:** `globals.css` + marketing components

---

## Inferred tokens (shipped)

| Token | Value |
|-------|--------|
| Ink | `#0c0d10` |
| Paper | `#fbfbfa` / hero `#F7F6F3` |
| Blue | `#1d4ed8` |
| Amber / green | `#b45309` / `#15803d` |
| Sans / heading | Helvetica Neue stack |
| Mono | JetBrains Mono |
| Serif | Instrument Serif (footer + **one H2 accent**) |

---

## System vs UI mismatches

| Issue | Where | Severity | Suggestion |
|-------|-------|----------|------------|
| **Dual type in one H2** | `system-section.tsx` | High | **DS1:** Headlines = single face (`font-sans` / heading). Serif reserved for brand wordmark only — document that rule. |
| No DESIGN.md | repo | High | **DS2:** Add `web/DESIGN.md` (or `apps/dashboard/DESIGN.md`) with type roles, radius, chrome rules. |
| Hero bg vs paper | `#F7F6F3` vs `#fbfbfa` | Low | **DS3:** Use one paper step token (e.g. `gryphon-paper` + optional `paper-muted`). |
| Radius mix | 10px windows, full rounded CTAs, sharp scope cards | Medium | **DS4:** Document: product chrome `rounded-[10px]`; marketing CTAs pill; scope cards 0 radius — intentional or unify. |
| CTA shape split | Hero pill vs header rectangular waitlist | Medium | **DS5:** Same CTA geometry header ↔ hero (pick pill *or* rect). |
| Hardcoded grays | Many `#A6A9AF`, `#8A8D94`, etc. | Low | **DS6:** Map to `faint` / `ghost` / `muted` tokens where possible. |
| Font-serif orphan | Only footer + System H2 | High | Same as DS1 |

---

## Suggestions (Design System)

1. **DS1** — Type role table: sans body/H*, mono system, serif wordmark only.  
2. **DS2** — Write DESIGN.md from inferred tokens (blocker for future Frontend library work).  
3. **DS5** — Unify primary button shape.  
4. **DS3 / DS4 / DS6** — Token cleanup (lower priority).

**Design System Approve (ship UI as-is):** **no**  
**Approve (suggestions):** yes
