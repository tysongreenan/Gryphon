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
| API | `apps/dashboard/src/app/api/waitlist/route.ts` |
| Storage | `apps/dashboard/src/lib/waitlist.ts` |
| Supabase schema | `apps/dashboard/supabase/waitlist.sql` |

## Env (dashboard / Vercel)

```bash
# Preferred
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
# optional table name override
WAITLIST_TABLE=waitlist_signups

# Or instead of Supabase
WAITLIST_WEBHOOK_URL=https://hooks.zapier.com/...
```

## Local

```bash
cd apps/dashboard
npm install
npm run dev
# open http://localhost:3000
# submit form → apps/dashboard/.data/waitlist.jsonl
```

## Deploy checklist

1. Create Vercel project from `apps/dashboard` (root directory)
2. Configure storage env vars
3. Run Supabase SQL if using Supabase
4. Deploy production
5. Smoke-test form submit
6. Point domain when ready
