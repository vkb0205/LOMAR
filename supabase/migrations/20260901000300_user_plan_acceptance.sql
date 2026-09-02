-- ============================================================================
-- User wedding-plan acceptance & persistence.
-- ============================================================================
-- Feature 003-user-plan-acceptance (see LOMAR_backend/docs/data_schema.md,
-- "User plan" group). Stores one row per `(user, item)` describing the
-- couple's explicit decision about a catalog service or a whole wedding plan.
--
--   user_plan_items ──< profiles / services / wedding_plans / chat_threads
--   v_user_accepted_plan ── reads only `status = 'accepted'` rows
--
-- Design intent:
--   * `user_id` is always forced from auth.uid() by the owner RLS below.
--   * Exactly one of `service_id` / `plan_id` is set per `item_type`,
--     enforced by a CHECK constraint (FR-002).
--   * Re-accepting the same item is idempotent via a partial unique index on
--     the non-null id column per `item_type` (FR-004).
--   * `category` is NOT duplicated on the row; it is derived by the view from
--     `services.category` or, for whole-plan items, `wedding_plans.style`
--     (FR-005, Assumptions).
--   * The view is SECURITY INVOKER so it inherits the caller's RLS on
--     `user_plan_items` (FR-006) — it never grants read of another user's row.
--
-- Replay-safe / idempotent: guarded with IF NOT EXISTS / CREATE OR REPLACE.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- user_plan_items
-- ---------------------------------------------------------------------------
create table if not exists public.user_plan_items (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  item_type        text not null check (item_type in ('service', 'plan')),
  service_id       uuid references public.services(id) on delete cascade,
  plan_id          uuid references public.wedding_plans(id) on delete cascade,
  status           text not null default 'proposed'
                   check (status in ('proposed', 'accepted', 'declined', 'removed')),
  unit_price       numeric,
  currency         text not null default 'VND',
  source_thread_id uuid references public.chat_threads(id) on delete set null,
  accepted_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.user_plan_items is
  'One explicit couple decision (accept/decline/remove) about one catalog item.';

-- FR-002: exactly one reference per item_type — structurally impossible to
-- store both service_id and plan_id, or the wrong column for the type.
alter table public.user_plan_items
  add constraint user_plan_items_item_ref_check
  check (
    (item_type = 'service' and service_id is not null and plan_id is null)
    or
    (item_type = 'plan' and plan_id is not null and service_id is null)
  );

-- FR-004: idempotent upsert per (user, item). A partial unique index allows
-- multiple NULLs while enforcing a single accepted row per service/plan.
create unique index if not exists user_plan_items_user_service_idx
  on public.user_plan_items (user_id, service_id)
  where service_id is not null;

create unique index if not exists user_plan_items_user_plan_idx
  on public.user_plan_items (user_id, plan_id)
  where plan_id is not null;

-- Supporting indexes for the owner-scoped read path and the view's join.
create index if not exists user_plan_items_user_status_idx
  on public.user_plan_items (user_id, status);

create index if not exists user_plan_items_service_idx
  on public.user_plan_items (service_id);

create index if not exists user_plan_items_plan_idx
  on public.user_plan_items (plan_id);

-- ---------------------------------------------------------------------------
-- v_user_accepted_plan — security-invoker view of accepted rows only.
-- ---------------------------------------------------------------------------
-- FR-005 / FR-006: only rows with status = 'accepted'; category derived from
-- services.category, falling back to wedding_plans.style for whole-plan items.
-- SECURITY INVOKER + LEFT JOIN so a removed vendor/service/plan (on delete
-- cascade) or a deactivated row yields NULL display fields instead of dropping
-- the user's accepted decision (Edge Cases).
create or replace view public.v_user_accepted_plan
  with (security_invoker = on)
as
select
  upi.user_id,
  upi.item_type,
  upi.service_id,
  upi.plan_id,
  upi.status,
  coalesce(s.category, wp.style) as category,
  s.name   as service_name,
  s.base_price as service_price,
  wp.name  as plan_name,
  upi.accepted_at
from public.user_plan_items upi
left join public.services s
  on s.id = upi.service_id
left join public.wedding_plans wp
  on wp.id = upi.plan_id
where upi.status = 'accepted';

comment on view public.v_user_accepted_plan is
  'Accepted wedding-plan choices per owner, with category derived from service or plan style.';

-- ---------------------------------------------------------------------------
-- Row Level Security (owner pattern, mirrors user_journey_tasks).
-- ---------------------------------------------------------------------------
alter table public.user_plan_items enable row level security;

drop policy if exists "Users can view own plan items" on public.user_plan_items;
create policy "Users can view own plan items"
  on public.user_plan_items
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own plan items" on public.user_plan_items;
create policy "Users can insert own plan items"
  on public.user_plan_items
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own plan items" on public.user_plan_items;
create policy "Users can update own plan items"
  on public.user_plan_items
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own plan items" on public.user_plan_items;
create policy "Users can delete own plan items"
  on public.user_plan_items
  for delete
  using (auth.uid() = user_id);

commit;