-- James-Day initial schema
-- All times stored as TIMESTAMPTZ (UTC). Family TZ stored on `families` for display.

create extension if not exists "pgcrypto";

-- ============================================================
-- FAMILIES & MEMBERS
-- ============================================================
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'America/New_York',
  invite_code text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists family_members (
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('parent','nanny','viewer')),
  created_at timestamptz not null default now(),
  primary key (family_id, user_id)
);
create index if not exists family_members_user_idx on family_members(user_id);

-- ============================================================
-- CHILDREN
-- ============================================================
create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  dob date not null,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists children_family_idx on children(family_id);

-- ============================================================
-- DAILY REPORTS — one per (child, day) per source paste
-- A re-paste of the same day replaces the previous report's events.
-- ============================================================
create table if not exists daily_reports (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  report_date date not null,
  author_user_id uuid references auth.users(id) on delete set null,
  author_display_name text not null,
  source text not null check (source in ('nanny_paste','parent_paste','manual')),
  raw_text text,
  summary text,
  handoff_note text,
  parse_confidence numeric(3,2),
  parse_model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists daily_reports_one_per_day on daily_reports(child_id, report_date);
create index if not exists daily_reports_date_idx on daily_reports(report_date desc);

-- ============================================================
-- EVENTS — the timeline. Every action is here.
-- ============================================================
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  report_id uuid references daily_reports(id) on delete set null,

  type text not null check (type in (
    'nap','feed','diaper','outing','milestone','song','book','sensory','sign','medication','mood','handoff_note','note'
  )),
  occurred_at timestamptz not null,
  ended_at timestamptz,

  -- Type-specific structured fields, all optional
  -- nap
  nap_location text,
  nap_quality text,
  -- feed
  feed_method text check (feed_method in ('breast','bottle_breastmilk','bottle_formula','bottle_mixed','solids','nursed','other')),
  feed_oz numeric(4,2),
  feed_foods text[],
  -- diaper
  diaper_wet boolean,
  diaper_bm boolean,
  diaper_dry boolean,
  -- medication
  med_name text,
  med_dose text,

  notes text,
  confidence numeric(3,2),
  flagged_for_review boolean not null default false,
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),

  constraint nap_has_end check (type <> 'nap' or ended_at is null or ended_at >= occurred_at)
);
create index if not exists events_child_time_idx on events(child_id, occurred_at desc);
create index if not exists events_child_type_time_idx on events(child_id, type, occurred_at desc);
create index if not exists events_report_idx on events(report_id);

-- ============================================================
-- PUSH SUBSCRIPTIONS
-- ============================================================
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  unique(endpoint)
);
create index if not exists push_subs_family_idx on push_subscriptions(family_id);

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================
alter table families enable row level security;
alter table family_members enable row level security;
alter table children enable row level security;
alter table daily_reports enable row level security;
alter table events enable row level security;
alter table push_subscriptions enable row level security;

-- Helper: is the calling user in this family?
create or replace function is_family_member(fid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from family_members fm
    where fm.family_id = fid and fm.user_id = auth.uid()
  );
$$;

-- families
drop policy if exists families_select on families;
create policy families_select on families
  for select using (is_family_member(id));

-- family_members
drop policy if exists fm_select on family_members;
create policy fm_select on family_members
  for select using (is_family_member(family_id));

-- children
drop policy if exists children_all on children;
create policy children_all on children
  for all using (is_family_member(family_id))
  with check (is_family_member(family_id));

-- daily_reports
drop policy if exists dr_all on daily_reports;
create policy dr_all on daily_reports
  for all using (
    exists(select 1 from children c
           where c.id = child_id and is_family_member(c.family_id))
  )
  with check (
    exists(select 1 from children c
           where c.id = child_id and is_family_member(c.family_id))
  );

-- events
drop policy if exists events_all on events;
create policy events_all on events
  for all using (
    exists(select 1 from children c
           where c.id = child_id and is_family_member(c.family_id))
  )
  with check (
    exists(select 1 from children c
           where c.id = child_id and is_family_member(c.family_id))
  );

-- push_subscriptions — user can only see/manage their own
drop policy if exists push_own on push_subscriptions;
create policy push_own on push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists daily_reports_updated_at on daily_reports;
create trigger daily_reports_updated_at before update on daily_reports
  for each row execute function set_updated_at();
