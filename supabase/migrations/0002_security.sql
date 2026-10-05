-- 0002_security.sql
-- Profile trigger, role helper, Row Level Security (RLS) and photo storage.
-- Run after 0001_schema.sql.

-- =========================================================
-- 1. Role helper
-- =========================================================
-- SECURITY DEFINER lets this read profiles without being blocked by
-- profiles' own RLS (avoids infinite recursion in policies).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =========================================================
-- 2. Auto-create a profile for every new auth user
-- =========================================================
-- Role is NOT taken from user metadata (a user could fake it).
-- Everyone starts as 'framer'; admins are promoted manually / in the seed.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- 3. Row Level Security
-- =========================================================
alter table public.profiles          enable row level security;
alter table public.sites             enable row level security;
alter table public.submissions       enable row level security;
alter table public.submission_photos enable row level security;

-- ---------- profiles ----------
-- Users see their own profile; admins see everyone (needed for the
-- worker filter and "who has not submitted today").
create policy "profiles: read own or admin"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
-- No insert/update/delete policies: the trigger creates profiles,
-- and nobody can change their own role from the app.

-- ---------- sites ----------
create policy "sites: read for signed-in users"
  on public.sites for select to authenticated
  using (true);

create policy "sites: admins manage"
  on public.sites for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- submissions ----------
create policy "submissions: read own or admin"
  on public.submissions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Framers create only their own forms, on an active site, not for a future
-- date (Pacific time), and cannot pre-set review fields.
create policy "submissions: framers create own"
  on public.submissions for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'submitted'
    and reviewed_by is null
    and reviewed_at is null
    and work_date <= (now() at time zone 'America/Vancouver')::date
    and exists (
      select 1 from public.sites s
      where s.id = site_id and s.is_active
    )
  );

-- Only admins update, and only the review columns (column-level grant below).
create policy "submissions: admins review"
  on public.submissions for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke update on public.submissions from authenticated;
grant update (status, reviewed_by, reviewed_at) on public.submissions to authenticated;
-- No delete policy: submitted forms are a safety record.

-- ---------- submission_photos ----------
create policy "photos: read own or admin"
  on public.submission_photos for select to authenticated
  using (
    exists (
      select 1 from public.submissions s
      where s.id = submission_id
        and (s.user_id = auth.uid() or public.is_admin())
    )
  );

-- Photo row must belong to the user's own submission and point to
-- a file inside the user's own storage folder.
create policy "photos: framers add to own submission"
  on public.submission_photos for insert to authenticated
  with check (
    storage_path like auth.uid()::text || '/%'
    and exists (
      select 1 from public.submissions s
      where s.id = submission_id and s.user_id = auth.uid()
    )
  );

-- =========================================================
-- 4. Photo storage
-- =========================================================
-- Private bucket. File path convention: {user_id}/{submission_id}/{file}
-- Size and type limits are enforced by Storage itself.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'submission-photos',
  'submission-photos',
  false,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "storage: framers upload to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'submission-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage: read own or admin"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'submission-photos'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
