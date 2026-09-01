-- ============================================================================
-- Schema simplification: drop unneeded feature tables and orphaned references.
-- ============================================================================
-- Context: data_schema.md (redesigned). Removes features slated for later
-- redesign (social follows/reviews/tags, service image child table, AI-design
-- workspace) and the FK columns that pointed at them.
--
-- Tables: 23 -> 15
--   DROPPED: ai_design_assets, ai_design_generations, ai_design_projects,
--            post_tags, tags, service_images, reviews, follows
--   KEPT  : profiles, vendors, services, user_favorite_services, journey_tasks,
--            user_journey_tasks, vouchers, user_vouchers, posts, post_comments,
--            post_likes, chat_threads, chat_messages, service_requests,
--            analytics_page_views
--
-- Replay-safe / idempotent: every statement is guarded with IF EXISTS.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Drop orphaned FK columns on surviving tables.
--    Their targets (ai_design_projects) are removed below.
-- ---------------------------------------------------------------------------

alter table public.chat_threads
  drop column if exists design_project_id;

alter table public.service_requests
  drop column if exists design_project_id;

-- ---------------------------------------------------------------------------
-- 2. Drop removed tables, children first (FK-dependency order).
-- ---------------------------------------------------------------------------

-- AI-design workspace (projects -> generations -> assets).
-- Note: ai_design_projects.selected_generation_id and
-- ai_design_generations.project_id reference each other (a cycle), so the
-- generations drop uses CASCADE to also detach that FK before projects drops.
drop table if exists public.ai_design_assets;
drop table if exists public.ai_design_generations cascade;
drop table if exists public.ai_design_projects;

-- Blog taxonomy: post_tags references tags.
drop table if exists public.post_tags;
drop table if exists public.tags;

-- Catalog child images.
drop table if exists public.service_images;

-- Ratings and social follows (pending feature redesign).
drop table if exists public.reviews;
drop table if exists public.follows;

commit;

-- ============================================================================
-- OPTIONAL (disabled): strengthen enum-like text columns to Postgres enums.
-- ============================================================================
-- WHY disabled: converting a live `text` column with `USING col::enum` FAILS if
-- any existing row holds a value not in the enum label set. The enumerated
-- values below are the design intent (see docs/data_schema.md -> Enums); confirm
-- them against real data before enabling.
--
-- To enable: remove the surrounding block comment, review each enum's labels,
-- and optionally run a data-audit SELECT first, e.g.:
--   select status, count(*) from public.vendors group by 1;
--   select role, count(*) from public.profiles group by 1;
--
-- begin;
--
-- do $$ begin
--   create type public.user_role as enum ('customer','vendor_admin','admin');
--   create type public.entity_status as enum ('active','inactive','pending');
--   create type public.publication_status as enum ('draft','published','archived');
--   create type public.moderation_status as enum ('visible','hidden','flagged');
--   create type public.task_progress as enum ('pending','completed');
--   create type public.voucher_claim_status as enum ('locked','unlocked','redeemed');
--   create type public.chat_context as enum ('general','service','vendor');
--   create type public.chat_role as enum ('user','assistant');
--   create type public.request_status as enum ('pending','accepted','declined','cancelled');
-- exception when duplicate_object then null; end $$;
--
-- alter table public.profiles
--   alter column role type public.user_role using role::public.user_role;
--
-- alter table public.vendors
--   alter column status type public.entity_status using status::public.entity_status;
-- alter table public.services
--   alter column status type public.entity_status using status::public.entity_status;
--
-- alter table public.posts
--   alter column status type public.publication_status using status::public.publication_status;
--
-- alter table public.post_comments
--   alter column status type public.moderation_status using status::public.moderation_status;
--
-- alter table public.user_journey_tasks
--   alter column status type public.task_progress using status::public.task_progress;
--
-- alter table public.user_vouchers
--   alter column status type public.voucher_claim_status using status::public.voucher_claim_status;
--
-- alter table public.chat_threads
--   alter column context_type type public.chat_context using context_type::public.chat_context;
--
-- alter table public.chat_messages
--   alter column role type public.chat_role using role::public.chat_role;
--
-- alter table public.service_requests
--   alter column status type public.request_status using status::public.request_status;
--
-- commit;
-- ============================================================================