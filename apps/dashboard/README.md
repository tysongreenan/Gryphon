# Gryphon marketing / waitlist

Next.js landing page for Gryphon with a real waitlist form.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without storage env vars, signups append to `.data/waitlist.jsonl`.

## Waitlist API

`POST /api/waitlist`

```json
{
  "email": "you@company.com",
  "useCase": "LinkedIn research agent",
  "source": "landing-cta"
}
```

## Production storage

See `supabase/waitlist.sql` and repo `product/PHASE_B_WAITLIST.md`.

| Backend | Env |
|---------|-----|
| Supabase | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Webhook | `WAITLIST_WEBHOOK_URL` |

## Deploy (Vercel)

1. Import repo; set **Root Directory** to `apps/dashboard`
2. Add storage env vars
3. Deploy and submit a test signup
