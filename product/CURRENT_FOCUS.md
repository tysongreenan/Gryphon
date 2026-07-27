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
- [x] Storage backends (Gryphon API / Supabase / webhook / dev file)
- [x] Public API: `POST /v1/waitlist/` → `waitlist_signups` (idempotent on email)
- [x] Placeholder social proof removed (use-cases instead of fake quotes)
- [x] Deployed to Vercel with production backend configured
  - Landing: https://gryphon-self.vercel.app
  - API: https://api-production-cc4e.up.railway.app (`POST /v1/waitlist/`)
  - Vercel env: `GRYPHON_API_URL` → Railway API
- [x] Authenticated waitlist list + browser admin
  - `GET /v1/waitlist/` (X-API-Key)
  - Admin UI: https://api-production-cc4e.up.railway.app/v1/waitlist/admin
- [ ] Domain (optional) + first outreach links live

### App

- Next.js marketing app: `apps/dashboard`
- **Homepage v6** (product demos + waitlist): `/`
- **Sign-in** (mock OAuth / magic link): `/sign-in`
- **Operator console** (escalations + sessions, mock data): `/dashboard`
- **Install agents** (MCP + REST + agent contract): `/dashboard/install`
- **Profile** (on-call + rescues, mock data): `/dashboard/profile`
- Design source: `UI mockup component review/uploads/Gryphon homepage design brief/`
- Form → `POST /api/waitlist` → storage cascade in `src/lib/waitlist.ts`
- Preferred store: Gryphon API (`GRYPHON_API_URL`)
- Local run: `cd apps/dashboard && npm run dev` (+ API on `:8000` for real writes)

### Production storage (pick one)

1. **Gryphon API** (preferred) — deploy `apps/api`, set `GRYPHON_API_URL` on Vercel
2. **Webhook** — set `WAITLIST_WEBHOOK_URL` (Zapier / Make / n8n / Google Apps Script)
3. **Supabase** — run `waitlist.sql`, set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`

Local/dev without any of the above falls back to `.data/waitlist.jsonl`.

### Parallel reliability (D polish)

Shipped alongside waitlist work:

- [x] Stale/dead Browserbase context → `needs_auth` + mark site session `stale` (tested)
- [x] Live View provision failures show graceful resolve-page fallback
- [x] Manual real-Browserbase checklist: `docs/MANUAL_BROWSERBASE_TEST.md`
