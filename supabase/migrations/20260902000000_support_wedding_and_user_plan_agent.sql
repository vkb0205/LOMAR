-- Chatbot-agent support: wedding-plan discovery and per-user plan decisions.
--
-- The consultant agent's `list_wedding_plans` / `get_wedding_plan` / `get_user_plan`
-- tools, plus the authenticated `/chat/consult` route, read these tables. They
-- did not exist in the remote schema. Everything is idempotent so it is safe to
-- re-run / apply against an existing project.

begin;
-- ---------------------------------------------------------------------------
-- Shared updated_at helper (uniquely named to avoid clashing with any existing
-- trigger function).
-- ---------------------------------------------------------------------------
create or replace function public.lomar_touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
-- ---------------------------------------------------------------------------
-- Wedding plans: curated bundles of catalog services offered to couples.
-- ---------------------------------------------------------------------------
create table if not exists public.wedding_plans (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  description    text,
  style          text,
  min_guests     integer,
  max_guests     integer,
  min_budget     numeric,
  max_budget     numeric,
  currency       text not null default 'VND',
  cover_image_url text,
  status         text not null default 'active',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint wedding_plans_status_check
    check (status in ('active', 'inactive', 'draft')),
  constraint wedding_plans_guests_band_check
    check (min_guests is null or max_guests is null or min_guests <= max_guests),
  constraint wedding_plans_budget_band_check
    check (min_budget is null or max_budget is null or min_budget <= max_budget)
);
drop trigger if exists wedding_plans_touch_updated_at on public.wedding_plans;
create trigger wedding_plans_touch_updated_at
  before update on public.wedding_plans
  for each row execute function public.lomar_touch_updated_at();
-- ---------------------------------------------------------------------------
-- Wedding plan items: one bundled catalog service per line item.
-- ---------------------------------------------------------------------------
create table if not exists public.wedding_plan_items (
  id               uuid primary key default gen_random_uuid(),
  wedding_plan_id  uuid not null references public.wedding_plans(id) on delete cascade,
  service_id       uuid not null references public.services(id) on delete cascade,
  role             text,
  sort_order       integer not null default 0,
  quantity         integer not null default 1 check (quantity > 0),
  unit_price       numeric,
  currency         text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists wedding_plan_items_plan_idx
  on public.wedding_plan_items (wedding_plan_id);
create index if not exists wedding_plan_items_service_idx
  on public.wedding_plan_items (service_id);
drop trigger if exists wedding_plan_items_touch_updated_at on public.wedding_plan_items;
create trigger wedding_plan_items_touch_updated_at
  before update on public.wedding_plan_items
  for each row execute function public.lomar_touch_updated_at();
-- ---------------------------------------------------------------------------
-- Per-user plan decisions. Exactly one of service_id / plan_id is set,
-- matching `item_type`; partial unique indexes keep re-accepting idempotent,
-- which the backend relies on for `upsert(..., on_conflict=...)`.
-- ---------------------------------------------------------------------------
create table if not exists public.user_plan_items (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  item_type         text not null check (item_type in ('service', 'plan')),
  service_id        uuid references public.services(id) on delete cascade,
  plan_id           uuid references public.wedding_plans(id) on delete cascade,
  status            text not null default 'proposed'
                    check (status in ('proposed', 'accepted', 'declined', 'removed')),
  unit_price        numeric,
  currency          text,
  source_thread_id  uuid references public.chat_threads(id) on delete set null,
  accepted_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint user_plan_items_type_id_check check (
    (item_type = 'service' and service_id is not null and plan_id is null)
    or (item_type = 'plan' and plan_id is not null and service_id is null)
  )
);
create unique index if not exists user_plan_items_user_service_uniq
  on public.user_plan_items (user_id, service_id) where service_id is not null;
create unique index if not exists user_plan_items_user_plan_uniq
  on public.user_plan_items (user_id, plan_id) where plan_id is not null;
drop trigger if exists user_plan_items_touch_updated_at on public.user_plan_items;
create trigger user_plan_items_touch_updated_at
  before update on public.user_plan_items
  for each row execute function public.lomar_touch_updated_at();
-- ---------------------------------------------------------------------------
-- Accepted-plan view (security invoker). Only `accepted` rows surface, grouped
-- by a derived category; removed/inactive catalog rows yield NULL display fields
-- instead of dropping the caller's decision.
-- ---------------------------------------------------------------------------
create or replace view public.v_user_accepted_plan
with (security_invoker = on) as
select
  u.user_id,
  u.item_type,
  coalesce(s.category, w.style) as category,
  u.service_id,
  s.name as service_name,
  coalesce(u.unit_price, s.base_price) as service_price,
  u.plan_id,
  w.name as plan_name,
  u.accepted_at
from public.user_plan_items u
left join public.services s on s.id = u.service_id
left join public.wedding_plans w on w.id = u.plan_id
where u.status = 'accepted';
-- ---------------------------------------------------------------------------
-- Admin helper (only created if the project does not already define it).
-- ---------------------------------------------------------------------------
do $do$
begin
  if not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_admin'
  ) then
    create function public.is_admin() returns boolean
    language sql
    stable
    security definer
    set search_path = ''
    as $func$
      select exists (
        select 1
        from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
    $func$;
  end if;
end
$do$;
-- ---------------------------------------------------------------------------
-- Row-level security. Default admin-all policy mirrors the project convention;
-- public catalog reads are limited to `active`; user decisions are owner-scoped.
-- ---------------------------------------------------------------------------
alter table public.wedding_plans enable row level security;
alter table public.wedding_plan_items enable row level security;
alter table public.user_plan_items enable row level security;
create policy "admin all wedding_plans" on public.wedding_plans
  for all using (public.is_admin());
create policy "pub read wedding_plans active" on public.wedding_plans
  for select to anon, authenticated
  using (status = 'active');
create policy "admin all wedding_plan_items" on public.wedding_plan_items
  for all using (public.is_admin());
create policy "pub read wedding_plan_items active" on public.wedding_plan_items
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.wedding_plans p
      where p.id = wedding_plan_items.wedding_plan_id and p.status = 'active'
    )
  );
create policy "admin all user_plan_items" on public.user_plan_items
  for all using (public.is_admin());
create policy "owner user_plan_items" on public.user_plan_items
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
-- ---------------------------------------------------------------------------
-- PostgREST role grants (new tables are not auto-granted by the SQL editor).
-- ---------------------------------------------------------------------------
grant select on public.wedding_plans to anon, authenticated;
grant select on public.wedding_plan_items to anon, authenticated;
grant select, insert, update, delete on public.user_plan_items to authenticated;
grant select on public.v_user_accepted_plan to anon, authenticated;
commit;
