-- ============================================================================
-- LOMAR — Social graph: `follows` table (user→user and user→vendor)
-- ============================================================================
-- Purpose
--   Let an authenticated user follow OTHER USERS (profiles) and VENDORS.
--   Powers follower counts and "following" feeds on the community/social layer.
--
-- Safety / idempotency
--   * Standalone add-on migration — run AFTER migrate_to_v2.sql (Sections 1–6b)
--     has created `profiles` and renamed `vendors_v2` → `vendors`.
--   * Every statement is replay-safe (create if not exists / drop if exists).
--   * Follows the same ownership model as post_likes: public SELECT for counts,
--     owner-scoped INSERT/DELETE keyed on auth.uid() = follower_id.
--   * If admin_policies.sql (is_admin()) has been applied, the admin override
--     at the bottom activates; otherwise that block is harmless to skip.
--
-- Order of execution
--   migrate_to_v2.sql  →  add_follows.sql  →  (optional) admin_policies.sql
--   (admin_policies.sql may also be re-run afterwards to (re)assert the override)
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Table
-- ----------------------------------------------------------------------------
-- A single follow edge. `followee_type` discriminates the target; exactly one
-- of followee_user_id / followee_vendor_id is populated (enforced by a check).
create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references profiles(id) on delete cascade,
  followee_type text not null check (followee_type in ('user','vendor')),
  followee_user_id uuid references profiles(id) on delete cascade,
  followee_vendor_id uuid references vendors(id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Exactly one target, consistent with followee_type.
  constraint follows_single_target_chk check (
    (followee_type = 'user'   and followee_user_id   is not null and followee_vendor_id is null) or
    (followee_type = 'vendor' and followee_vendor_id is not null and followee_user_id   is null)
  ),
  -- A user cannot follow themselves.
  constraint follows_no_self_follow_chk check (
    followee_user_id is null or followee_user_id <> follower_id
  )
);

-- One follow edge per (follower, target). Partial unique indexes because the
-- target column varies by type.
create unique index if not exists follows_user_unique_idx
  on follows(follower_id, followee_user_id)
  where followee_user_id is not null;
create unique index if not exists follows_vendor_unique_idx
  on follows(follower_id, followee_vendor_id)
  where followee_vendor_id is not null;

-- Lookups: "who follows X" (counts) and "who does U follow" (feeds).
create index if not exists follows_followee_user_idx   on follows(followee_user_id);
create index if not exists follows_followee_vendor_idx on follows(followee_vendor_id);
create index if not exists follows_follower_idx        on follows(follower_id);

-- ----------------------------------------------------------------------------
-- 2. Row-Level Security
-- ----------------------------------------------------------------------------
alter table if exists follows enable row level security;

-- Public can read follow edges (needed for follower/following counts). This
-- mirrors post_likes' public-read posture; the rows contain no private data.
drop policy if exists "Public can view follows" on follows;
create policy "Public can view follows" on follows
  for select using (true);

-- Only the follower may create their own follow edge.
drop policy if exists "Users can insert own follows" on follows;
create policy "Users can insert own follows" on follows
  for insert with check (auth.uid() = follower_id);

-- Only the follower may remove their own follow edge (unfollow).
drop policy if exists "Users can delete own follows" on follows;
create policy "Users can delete own follows" on follows
  for delete using (auth.uid() = follower_id);

-- ----------------------------------------------------------------------------
-- 3. Admin override (activates only if public.is_admin() exists)
-- ----------------------------------------------------------------------------
-- Wrapped in a DO block so this file still runs cleanly on a database where
-- admin_policies.sql has not been applied yet.
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_admin'
  ) then
    execute 'drop policy if exists "Admins can manage all follows" on follows';
    execute 'create policy "Admins can manage all follows" on follows
               for all using (public.is_admin()) with check (public.is_admin())';
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 4. Verification (run separately)
-- ----------------------------------------------------------------------------
-- select followee_type, count(*) from follows group by followee_type;
