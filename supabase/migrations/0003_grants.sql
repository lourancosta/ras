-- 0003_grants.sql
-- Table privileges for the API roles.
-- GRANTs decide which operations a role may attempt on a table;
-- RLS (0002) then decides which rows it may touch.
-- No grants to `anon`: every screen in the app requires login.

grant usage on schema public to authenticated, service_role;

-- Server-side scripts (seed) using the secret key.
grant all on all tables in schema public to service_role;

-- Signed-in app users (framers and admins).
grant select on public.profiles to authenticated;

grant select, insert, update, delete on public.sites to authenticated;       -- writes: admins only (RLS)

grant select, insert on public.submissions to authenticated;
grant update (status, reviewed_by, reviewed_at) on public.submissions to authenticated; -- admins only (RLS)

grant select, insert on public.submission_photos to authenticated;

grant execute on function public.is_admin() to authenticated;
