# Panel is installed

This project was onboarded with `npx @tysongreenan/panel init`.

**Lean core always on. Heavy packs optional. Reduction over addition.**

## Run a review

```
Run a panel
```

### What to load

| User says | Load |
|-----------|------|
| Run a panel / Panel review | `PANEL.md` + `playbook.md` |
| UI / craft / anti-slop | + `ANTI-SLOP.md` |
| Animations / motion | + `MOTION.md` |
| Design system / colors / type | + `FRONTEND.md` + `skills/ui-ux-pro-max` |

### Priority of truth

1. `PANEL.md` — buyer job + reduction bias  
2. `ANTI-SLOP.md` — does this look AI-made?  
3. `MOTION.md` — Emil motion standard  
4. `playbook.md` — shared principles  
5. Heavy packs — only when explicitly needed  

### Cursor / Claude

- Cursor: **`/panel`** · `.cursor/rules/panel.mdc`
- Claude Code: `.claude/skills/panel/`

## Files

| Path | Role |
|------|------|
| `PANEL.md` | Core — always on |
| `playbook.md` | Don’t Make Me Think + density |
| `ANTI-SLOP.md` | Craft / anti-template |
| `MOTION.md` | Motion (when anything moves) |
| *(lean)* | `npx @tysongreenan/panel init --full` for packs + FRONTEND |
| `AGENTS.md` | Roster · run classes · protocol pack |
| `COLLABORATION.md` | Handoffs · Approves · consensus |
| `panel-report/` | Reports + `run-state.template.yaml` |

### Full multi-agent runs

1. Copy `panel-report/run-state.template.yaml` → `run-state.yaml`  
2. Set `run_class` + `protocol`  
3. No implement without consensus **PROCEED** (see `COLLABORATION.md`)

## Re-run

```bash
npx @tysongreenan/panel init --force
npx @tysongreenan/panel init --full --force
```
