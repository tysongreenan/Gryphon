# Phase B — Landing page + waitlist

## Goal

A live public page that converts agent builders into waitlist emails.

## Implementation

| Piece | Location |
|-------|----------|
| Landing UI | `apps/dashboard/src/app/page.tsx` |
| Waitlist form | `apps/dashboard/src/components/waitlist-form.tsx` |
| CTA section | `apps/dashboard/src/components/waitlist-section.tsx` |
| Use cases (honest social proof) | `apps/dashboard/src/components/use-cases.tsx` |
| Next route | `apps/dashboard/src/app/api/waitlist/route.ts` |
| Storage cascade | `apps/dashboard/src/lib/waitlist.ts` |
| **Preferred store** | FastAPI `POST /v1/waitlist/` → `waitlist_signups` table |
| Optional Supabase schema | `apps/dashboard/supabase/waitlist.sql` |

## Storage cascade (first match wins)

1. **`GRYPHON_API_URL`** → `POST {url}/v1/waitlist/` (same SQLite/Postgres as product)
2. **Supabase** — `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
3. **Webhook** — `WAITLIST_WEBHOOK_URL` (Zapier / Make / n8n / Sheet)
4. **Local file** — dev only (`apps/dashboard/.data/waitlist.jsonl`)

## Env (dashboard / Vercel)

```bash
# Preferred — point at the deployed Gryphon API
GRYPHON_API_URL=https://api.your-domain.com

# Alternatives
# SUPABASE_URL=https://xxxx.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=...
# WAITLIST_TABLE=waitlist_signups
# WAITLIST_WEBHOOK_URL=https://hooks.zapier.com/...
```

## Local

```bash
# Terminal 1 — API (creates waitlist_signups on startup)
cd apps/api && source .venv/bin/activate
export BROWSERBASE_USE_FAKE=true
uvicorn app.main:app --reload --port 8000

# Terminal 2 — marketing site
cd apps/dashboard
export GRYPHON_API_URL=http://localhost:8000
npm run dev
# open http://localhost:3000 → submit form → row in apps/api/gryphon.db
```

Without `GRYPHON_API_URL`, the form still works via local JSONL in development.

## Deploy checklist

1. [x] Deploy Gryphon API on Railway (`apps/api` Dockerfile + `/data` volume)
2. [x] Vercel project `gryphon` from `apps/dashboard`
3. [x] `GRYPHON_API_URL=https://api-production-cc4e.up.railway.app`
4. [x] Production deploy: https://gryphon-self.vercel.app
5. [x] Smoke-test form → backend `gryphon-api`
6. [ ] Optional: custom domain + outreach links

### Live URLs (Phase B)

| Surface | URL |
|---------|-----|
| Landing | https://gryphon-self.vercel.app |
| API health | https://api-production-cc4e.up.railway.app/health |
| Waitlist | `POST https://api-production-cc4e.up.railway.app/v1/waitlist/` |

**Inspect waitlist rows (Railway):** `railway run` / volume SQLite at `/data/gryphon.db`, or hit the API logs for `waitlist.created`.
