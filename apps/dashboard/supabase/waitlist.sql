-- Gryphon waitlist table (run in Supabase SQL editor)
-- Dashboard env:
--   SUPABASE_URL=https://xxxx.supabase.co
--   SUPABASE_SERVICE_ROLE_KEY=...
--   WAITLIST_TABLE=waitlist_signups  (optional; this is the default)

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  use_case text,
  source text,
  created_at timestamptz not null default now(),
  unique (email)
);

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);

-- Service role bypasses RLS; enable RLS so anon/authenticated cannot read/write.
alter table public.waitlist_signups enable row level security;

-- No public policies: inserts go through the Next.js API with the service role key.
