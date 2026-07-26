-- ============================================================================
-- Historical bootstrap: admin authority foundation and RLS overrides.
-- ============================================================================
-- Purpose
--   Grant platform authorities (profiles.role = 'admin') full read/moderation
--   control over the whole system THROUGH THE NORMAL anon/authenticated
--   Supabase client — no service_role key is ever shipped to the browser.
--   Admin power lives entirely in the RLS policies below, keyed on is_admin().
--
-- Safety / idempotency
--   * Every statement is replay-safe (create or replace / drop if exists).
--   * These policies are PERMISSIVE and are OR'd on top of the existing
--     owner-scoped policies from migrate_to_v2.sql — running this file does not
--     weaken any existing restriction for non-admins.
--   * HIGH BLAST RADIUS: this grants cross-user data access to admins. Review
--     carefully and run against a backup/staging database first.
--
-- Order of execution
--   Run AFTER migrate_to_v2.sql (Sections 5, 6, 6b) has created the tables and
--   base policies. This file only adds the is_admin() function and admin
--   override policies; it does not create tables.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. is_admin() — SECURITY DEFINER helper
-- ----------------------------------------------------------------------------
-- Reads profiles.role for the current auth user. Declared SECURITY DEFINER and
-- with a fixed search_path so the lookup BYPASSES RLS on profiles. This is
-- required to avoid infinite recursion: if an admin policy on `profiles` called
-- a function that itself queried `profiles` under RLS, Postgres would recurse.
-- SECURITY DEFINER runs the body as the function owner (table owner), so the
-- internal SELECT is not subject to the caller's RLS policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

comment on function public.is_admin() is
  'Returns true when the current auth.uid() maps to a profiles row with role = admin. SECURITY DEFINER so the profiles lookup bypasses RLS (prevents recursive policy evaluation).';

-- Lock down execution: only end-user roles need it (RLS evaluates as these).
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 2. Ensure RLS is enabled (idempotent — Sections 5/6b already do this)
-- ----------------------------------------------------------------------------
alter table if exists profiles enable row level security;
alter table if exists vendors enable row level security;
alter table if exists services enable row level security;
alter table if exists service_images enable row level security;
alter table if exists user_favorite_services enable row level security;
alter table if exists reviews enable row level security;
alter table if exists journey_tasks enable row level security;
alter table if exists user_journey_tasks enable row level security;
alter table if exists vouchers enable row level security;
alter table if exists user_vouchers enable row level security;
alter table if exists posts enable row level security;
alter table if exists post_comments enable row level security;
alter table if exists post_likes enable row level security;
alter table if exists tags enable row level security;
alter table if exists post_tags enable row level security;
alter table if exists chat_threads enable row level security;
alter table if exists chat_messages enable row level security;
alter table if exists ai_design_projects enable row level security;
alter table if exists ai_design_generations enable row level security;
alter table if exists ai_design_assets enable row level security;
alter table if exists service_requests enable row level security;

-- ----------------------------------------------------------------------------
-- 3. Admin override policies
-- ----------------------------------------------------------------------------
-- Convention: one "Admins can manage <table>" policy per table using
-- FOR ALL (covers SELECT/INSERT/UPDATE/DELETE) with both USING and WITH CHECK
-- gated on is_admin(). Because these are PERMISSIVE, they are OR'd with the
-- existing owner-scoped policies: a normal user keeps exactly their old access,
-- while an admin additionally gets full access to every row.

-- profiles ------------------------------------------------------------------
drop policy if exists "Admins can manage all profiles" on profiles;
create policy "Admins can manage all profiles" on profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- vendors -------------------------------------------------------------------
drop policy if exists "Admins can manage all vendors" on vendors;
create policy "Admins can manage all vendors" on vendors
  for all using (public.is_admin()) with check (public.is_admin());

-- services ------------------------------------------------------------------
drop policy if exists "Admins can manage all services" on services;
create policy "Admins can manage all services" on services
  for all using (public.is_admin()) with check (public.is_admin());

-- service_images ------------------------------------------------------------
drop policy if exists "Admins can manage all service images" on service_images;
create policy "Admins can manage all service images" on service_images
  for all using (public.is_admin()) with check (public.is_admin());

-- user_favorite_services ----------------------------------------------------
drop policy if exists "Admins can manage all favorites" on user_favorite_services;
create policy "Admins can manage all favorites" on user_favorite_services
  for all using (public.is_admin()) with check (public.is_admin());

-- reviews -------------------------------------------------------------------
drop policy if exists "Admins can manage all reviews" on reviews;
create policy "Admins can manage all reviews" on reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- journey_tasks (dictionary — admin write path via app client) ---------------
drop policy if exists "Admins can manage journey tasks" on journey_tasks;
create policy "Admins can manage journey tasks" on journey_tasks
  for all using (public.is_admin()) with check (public.is_admin());

-- user_journey_tasks --------------------------------------------------------
drop policy if exists "Admins can manage all user journey tasks" on user_journey_tasks;
create policy "Admins can manage all user journey tasks" on user_journey_tasks
  for all using (public.is_admin()) with check (public.is_admin());

-- vouchers (incl. platform-level vouchers with null vendor_id) ---------------
drop policy if exists "Admins can manage all vouchers" on vouchers;
create policy "Admins can manage all vouchers" on vouchers
  for all using (public.is_admin()) with check (public.is_admin());

-- user_vouchers -------------------------------------------------------------
drop policy if exists "Admins can manage all user vouchers" on user_vouchers;
create policy "Admins can manage all user vouchers" on user_vouchers
  for all using (public.is_admin()) with check (public.is_admin());

-- posts ---------------------------------------------------------------------
drop policy if exists "Admins can manage all posts" on posts;
create policy "Admins can manage all posts" on posts
  for all using (public.is_admin()) with check (public.is_admin());

-- post_comments -------------------------------------------------------------
drop policy if exists "Admins can manage all post comments" on post_comments;
create policy "Admins can manage all post comments" on post_comments
  for all using (public.is_admin()) with check (public.is_admin());

-- post_likes ----------------------------------------------------------------
drop policy if exists "Admins can manage all post likes" on post_likes;
create policy "Admins can manage all post likes" on post_likes
  for all using (public.is_admin()) with check (public.is_admin());

-- tags (dictionary — admin write path via app client) ------------------------
drop policy if exists "Admins can manage tags" on tags;
create policy "Admins can manage tags" on tags
  for all using (public.is_admin()) with check (public.is_admin());

-- post_tags -----------------------------------------------------------------
drop policy if exists "Admins can manage all post tags" on post_tags;
create policy "Admins can manage all post tags" on post_tags
  for all using (public.is_admin()) with check (public.is_admin());

-- chat_threads (oversight — read/moderate) ----------------------------------
drop policy if exists "Admins can manage all chat threads" on chat_threads;
create policy "Admins can manage all chat threads" on chat_threads
  for all using (public.is_admin()) with check (public.is_admin());

-- chat_messages (oversight — read/moderate) ---------------------------------
drop policy if exists "Admins can manage all chat messages" on chat_messages;
create policy "Admins can manage all chat messages" on chat_messages
  for all using (public.is_admin()) with check (public.is_admin());

-- ai_design_projects --------------------------------------------------------
drop policy if exists "Admins can manage all design projects" on ai_design_projects;
create policy "Admins can manage all design projects" on ai_design_projects
  for all using (public.is_admin()) with check (public.is_admin());

-- ai_design_generations (cost / failure monitoring) --------------------------
drop policy if exists "Admins can manage all generations" on ai_design_generations;
create policy "Admins can manage all generations" on ai_design_generations
  for all using (public.is_admin()) with check (public.is_admin());

-- ai_design_assets ----------------------------------------------------------
drop policy if exists "Admins can manage all design assets" on ai_design_assets;
create policy "Admins can manage all design assets" on ai_design_assets
  for all using (public.is_admin()) with check (public.is_admin());

-- service_requests (leads oversight) ----------------------------------------
drop policy if exists "Admins can manage all service requests" on service_requests;
create policy "Admins can manage all service requests" on service_requests
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- 4. Promote an authority account to admin (RUN MANUALLY, EDIT THE EMAIL)
-- ============================================================================
-- profiles.id equals auth.users.id. Set the desired authority account's role to
-- 'admin'. Replace the email literal before running. This is the only step that
-- actually grants a human admin power; everything above is inert until a
-- profiles row has role = 'admin'.
--
--   update public.profiles
--   set role = 'admin', updated_at = now()
--   where email = 'authority@lomar.vn';
--
-- If the profiles.email column is null for the account, resolve by auth.users:
--
--   update public.profiles p
--   set role = 'admin', updated_at = now()
--   from auth.users u
--   where p.id = u.id and u.email = 'authority@lomar.vn';

-- ============================================================================
-- 5. Verification (run separately)
-- ============================================================================
-- Confirm the function exists and current session admin status:
--   select public.is_admin();
-- List admin override policies:
--   select tablename, policyname from pg_policies
--   where schemaname = 'public' and policyname ilike 'Admins can%'
--   order by tablename;
-- List current admins:
--   select id, email, role from public.profiles where role = 'admin';

-- ============================================================================
-- END OF ADMIN POLICIES
-- ============================================================================
