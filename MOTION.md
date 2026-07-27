# MOTION.md
## Motion critic (Emil Kowalski standard)

Use when anything moves.

### Core rules
From Emil Kowalski’s design-eng skills:

- Motion must have a purpose (feedback, orientation, hierarchy)
- Prefer subtle over decorative
- High-frequency actions (typing, hovering menus, scrolling) should almost never animate heavily
- Respect `prefers-reduced-motion`
- GPU-friendly only (transform/opacity)

### Hard bans
- Animating layout properties that cause reflow for no reason
- Scale(0) / bouncy entrances on every card
- Motion that delays the primary action
- Ornamental motion on marketing sections that already have enough visual weight

### Review output
- Keep / Fix / Delete for each motion
- One-line reason
- Prefer delete when purpose is unclear

Optional deep pack (when installed with `--full`): `skills/motion/` — STANDARDS, REVIEW, OPPORTUNITIES.
