-- ============================================================================
-- Wedding plans: curated bundled offers across catalog services.
-- ============================================================================
-- Feature 002-wedding-plan-chatbot (see LOMAR_backend/docs/data_schema.md,
-- "Catalog" group). A wedding plan groups existing `services` rows (possibly
-- from different vendors) into one priced, presentable offer so the couple
-- chatbot can recommend a coherent package instead of a loose service list.
--
--   wedding_plans ──< wedding_plan_items ──> services.id ──> vendors.id
--
-- Public visibility convention mirrors `vendors`/`services`:
--   * only rows with status = 'active' are visible on couple surfaces.
-- Published budget is authoritative *display* data; it is not recomputed from
-- the items (same philosophy as services.base_price).
--
-- Replay-safe / idempotent: guarded with IF NOT EXISTS / CREATE OR REPLACE.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- wedding_plans
-- ---------------------------------------------------------------------------
create table if not exists public.wedding_plans (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  description     text,
  style           text,               -- e.g. classic / minimal / garden (free-text)
  min_guests      integer not null default 0,
  max_guests      integer not null default 0,
  min_budget      numeric not null default 0,
  max_budget      numeric not null default 0,
  currency        text not null default 'VND',
  cover_image_url text,
  status          text not null default 'active',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.wedding_plans is
  'Curated wedding package bundling catalog services into one priced offer.';

-- ---------------------------------------------------------------------------
-- wedding_plan_items
-- ---------------------------------------------------------------------------
create table if not exists public.wedding_plan_items (
  id              uuid primary key default gen_random_uuid(),
  wedding_plan_id uuid not null references public.wedding_plans(id) on delete cascade,
  service_id      uuid not null references public.services(id) on delete restrict,
  role            text not null,      -- venue / catering / photography / attire / ...
  sort_order      integer not null default 0,
  quantity        integer not null default 1,
  unit_price      numeric not null default 0,
  currency        text not null default 'VND',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.wedding_plan_items is
  'Line item linking a wedding plan to a catalog service.';

create index if not exists wedding_plan_items_plan_idx
  on public.wedding_plan_items (wedding_plan_id);

create index if not exists wedding_plans_status_budget_idx
  on public.wedding_plans (status, min_budget);

-- ---------------------------------------------------------------------------
-- is_admin() helper (no-op when already present; makes migration self-contained)
-- ---------------------------------------------------------------------------
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

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.wedding_plans      enable row level security;
alter table public.wedding_plan_items enable row level security;

-- Admin manages all rows on both tables.
drop policy if exists "admin manage wedding_plans" on public.wedding_plans;
create policy "admin manage wedding_plans"
  on public.wedding_plans
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin manage wedding_plan_items" on public.wedding_plan_items;
create policy "admin manage wedding_plan_items"
  on public.wedding_plan_items
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Public read of active plans.
drop policy if exists "public select active wedding_plans" on public.wedding_plans;
create policy "public select active wedding_plans"
  on public.wedding_plans
  for select
  using (status = 'active');

-- Public read of items belonging to an active plan.
drop policy if exists "public select active wedding_plan_items" on public.wedding_plan_items;
create policy "public select active wedding_plan_items"
  on public.wedding_plan_items
  for select
  using (
    exists (
      select 1 from public.wedding_plans p
      where p.id = wedding_plan_id
        and p.status = 'active'
    )
  );

commit;