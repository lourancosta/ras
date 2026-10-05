-- 0001_schema.sql
-- Site Safety Forms app: core schema (tables, types, constraints, indexes).
-- RLS policies, the profile trigger and storage come in 0002 (Phase 2).

-- ---------- Types ----------
create type public.user_role as enum ('framer', 'admin');
create type public.submission_status as enum ('submitted', 'reviewed', 'flagged');

-- ---------- Profiles ----------
-- One row per auth user. Supabase Auth owns email/password in auth.users;
-- we keep app-specific data (name, role) here.
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null check (char_length(full_name) between 1 and 120),
  role        public.user_role not null default 'framer',
  created_at  timestamptz not null default now()
);

-- ---------- Sites ----------
create table public.sites (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  address     text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- Submissions ----------
-- Checklist items are explicit boolean columns (not JSON) so they are easy
-- to filter, report on, and show clearly in the ERD.
-- A "false" answer is still a valid submission: reporting an unsafe
-- condition is the point of the form.
create table public.submissions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles (id) on delete cascade,
  site_id             uuid not null references public.sites (id) on delete restrict,
  work_date           date not null default current_date,

  -- PPE
  ppe_hard_hat        boolean not null,
  ppe_vest            boolean not null,
  ppe_boots           boolean not null,
  ppe_eye_protection  boolean not null,

  -- Site checks
  fall_protection     boolean not null,
  ladders_inspected   boolean not null,
  tools_cords_ok      boolean not null,
  hazards_identified  boolean not null,

  notes               text check (char_length(notes) <= 2000),

  -- Admin review
  status              public.submission_status not null default 'submitted',
  reviewed_by         uuid references public.profiles (id) on delete set null,
  reviewed_at         timestamptz,

  created_at          timestamptz not null default now(),

  -- Assumption: one form per worker, per site, per day.
  constraint submissions_one_per_day unique (user_id, site_id, work_date)
);

-- Dashboard filters: by site + date range, and "who submitted today".
create index submissions_site_date_idx on public.submissions (site_id, work_date);
create index submissions_date_idx      on public.submissions (work_date);

-- ---------- Photos ----------
-- Files live in Supabase Storage; this table stores metadata + the path.
create table public.submission_photos (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null references public.submissions (id) on delete cascade,
  storage_path   text not null unique,
  mime_type      text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes     integer not null check (size_bytes > 0 and size_bytes <= 5242880), -- 5 MB
  created_at     timestamptz not null default now()
);

create index submission_photos_submission_idx on public.submission_photos (submission_id);
