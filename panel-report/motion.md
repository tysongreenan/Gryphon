# Motion Critic — MOTION.md

**Phase:** 4

---

## Inventory

| Motion | File | Purpose? | Verdict | Suggestion |
|--------|------|----------|---------|------------|
| Hero agent journeys | `hero-architecture.tsx` | Orientation | **Keep** | Already respects `prefers-reduced-motion` via `useSyncExternalStore` — **good** |
| Loop step cycle 2s | `loop-section.tsx` | Hierarchy 01–04 | **Keep** | **M1:** Gate interval + CSS anims on reduced-motion; show step 0 or static “all cards equal” |
| Loop orbit / dashflow / spin | `loop-section.tsx` + CSS | Circuit metaphor | **Fix** | **M2:** Disable `gorbit`, `gdashflow`, `gspin` under reduced-motion |
| gpulse / gblink / gwave | System + Loop | Attention / live | **Keep** sparingly | **M3:** Include in global reduced-motion kill list |
| Waitlist rays (static rotate) | `waitlist-section-v6.tsx` | Ornament | **Delete** | **M4:** Remove (Craft C4) — no motion job |
| CTA `active:scale-[0.96]` | hero | Press feedback | **Keep** | Fine for high-frequency? Click is OK subtle |
| Global `@media (prefers-reduced-motion)` | `globals.css` | Only `.animate-hub-pulse` | **Fail** | **M5:** Extend media query to all `.animate-g*` classes |

---

## Hard bans

| Ban | Hit? |
|-----|------|
| Layout anim for no reason | No |
| Scale(0) bouncy cards | No |
| Motion delaying primary action | No (CTA static) |
| Ornamental motion with enough visual weight | Yes — waitlist rays; busy Loop if System already heavy |

---

## Suggestions (Motion) only

1. **M5** — Global reduced-motion: `animation: none` on marketing animate utilities.  
2. **M1–M2** — Loop JS: don’t `setInterval` when reduced; freeze decorative SVG motion.  
3. **M4** — Delete waitlist rays.  
4. Do **not** add more scroll-triggered entrance animations.

**Motion score: 6 / 10** (hero good; Loop/CSS incomplete)  
**Approve ship as-is:** **no** (a11y motion gap)  
**Approve suggestion set:** yes
