-- 0004_workers.sql
-- Worker management (admin Settings > Workers):
-- * profiles get the worker's email (shown in the list) and an active flag.
-- * Admins can deactivate / reactivate a worker (only that column, never themselves).
-- * Inactive users can't create forms or photos, and an inactive admin loses admin rights.
-- Run after 0001-0003. Safe to read top to bottom; each block is independent.

-- =========================================================
-- 1. New columns
-- =========================================================
alter table public.profiles
  add column email     text,
  add column is_active boolean not null default true;

-- Fill the email for users that already exist (auth.users is only readable here, in SQL).
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id;

-- =========================================================
-- 2. New users: copy the email into the profile too
-- =========================================================
-- Same as 0002, plus `email`. Role still always starts as 'framer'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

-- =========================================================
-- 3. Helpers
-- =========================================================
-- An inactive admin is no longer treated as an admin anywhere (all admin policies use this).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active
  );
$$;

-- True if the signed-in user's profile is active. SECURITY DEFINER for the same
-- reason as is_admin(): read profiles without going through profiles' own RLS.
create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active
  );
$$;

grant execute on function public.is_active_user() to authenticated;

-- =========================================================
-- 4. Admins can change a profile's active flag (and nothing else)
-- =========================================================
-- `id <> auth.uid()`: an admin can't deactivate themselves (and lock everyone out).
create policy "profiles: admins set active"
  on public.profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin() and id <> auth.uid());

-- Column-level grant: even an admin can only update is_active (not role, name or email).
grant update (is_active) on public.profiles to authenticated;

-- =========================================================
-- 5. Inactive users can't add forms or photos
-- =========================================================
-- Same rules as 0002, plus `public.is_active_user()`.
drop policy "submissions: framers create own" on public.submissions;
create policy "submissions: framers create own"
  on public.submissions for insert to authenticated
  with check (
    public.is_active_user()
    and user_id = auth.uid()
    and status = 'submitted'
    and reviewed_by is null
    and reviewed_at is null
    and work_date <= (now() at time zone 'America/Vancouver')::date
    and exists (
      select 1 from public.sites s
      where s.id = site_id and s.is_active
    )
  );

drop policy "photos: framers add to own submission" on public.submission_photos;
create policy "photos: framers add to own submission"
  on public.submission_photos for insert to authenticated
  with check (
    public.is_active_user()
    and storage_path like auth.uid()::text || '/%'
    and exists (
      select 1 from public.submissions s
      where s.id = submission_id and s.user_id = auth.uid()
    )
  );

drop policy "storage: framers upload to own folder" on storage.objects;
create policy "storage: framers upload to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'submission-photos'
    and public.is_active_user()
    and (storage.foldername(name))[1] = auth.uid()::text
  );
