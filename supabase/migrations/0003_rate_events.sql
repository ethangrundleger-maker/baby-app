-- Durable rate-limit events table. Insert one row per rate-limited call; query
-- count over a sliding window. Stays small because we prune rows older than
-- the window before each insert.

create table if not exists rate_events (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);
create index if not exists rate_events_user_kind_time
  on rate_events(user_id, kind, created_at desc);

alter table rate_events enable row level security;
-- Only server-side (service role) can read/write. Users cannot.
drop policy if exists rate_events_admin_only on rate_events;
create policy rate_events_admin_only on rate_events
  for all using (false) with check (false);
