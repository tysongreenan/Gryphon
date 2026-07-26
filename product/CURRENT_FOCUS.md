# Current Focus

**Sequence: C → D → B**

| Order | Focus | Status |
|-------|--------|--------|
| **C** | Phase 1 Hardening | Done |
| **D** | Phase 2 — Browserbase Contexts + `get_session` | Shipped (usable for demos) |
| **B** | Landing page + waitlist | **Active** |

## Active work: B — Landing page + waitlist

Ship a public marketing page with real waitlist capture.

### DoD

- [x] Gryphon product copy on landing (hero, features, pricing directional)
- [x] Real waitlist form (email + optional use-case)
- [x] Storage backends (Supabase / webhook / dev file)
- [x] Placeholder social proof removed (use-cases instead of fake quotes)
- [ ] Deployed to Vercel with production backend configured
- [ ] Domain (optional) + first outreach links live

### App

- Next.js marketing app: `apps/dashboard`
- Form → `POST /api/waitlist`
- SQL for Supabase: `apps/dashboard/supabase/waitlist.sql`
- Local run: `cd apps/dashboard && npm run dev`

### Production storage (pick one)

1. **Supabase** — run `waitlist.sql`, set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
2. **Webhook** — set `WAITLIST_WEBHOOK_URL` (Zapier / Make / n8n / Google Apps Script)

Local/dev without either falls back to `.data/waitlist.jsonl`.

### Parallel (later)

D polish (Live View UX, stale contexts) can continue after the page is live.
