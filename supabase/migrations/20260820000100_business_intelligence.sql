-- ============================================================================
-- Business Intelligence workspace tables, RLS, seeds, and demand-proxy RPC.
-- ============================================================================
-- Catalog reality: there is no orders/GMV table yet. Metrics are demand /
-- pipeline proxies derived from service_requests (+ services.category).
-- GMV / order labels are deferred until an orders domain exists.
-- ============================================================================
-- Prerequisite: public.is_admin() from legacy/admin_policies.sql (recreated
-- below if missing so this migration is self-contained on fresh DBs).
-- Replay-safe / idempotent.
-- ============================================================================

create extension if not exists pgcrypto;

-- Ensure is_admin() exists (no-op replace when already present).
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

-- Owned-vendor helper (vendors.owner_id = auth.uid()).
create or replace function public.bi_owned_vendor_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select v.id
  from public.vendors v
  where v.owner_id = auth.uid();
$$;

revoke all on function public.bi_owned_vendor_ids() from public;
grant execute on function public.bi_owned_vendor_ids() to authenticated;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.bi_agent_definitions (
  id text primary key,
  name text not null,
  detail text not null,
  enabled boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.bi_agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null references public.bi_agent_definitions(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete cascade,
  triggered_by uuid references public.profiles(id) on delete set null,
  status text not null default 'ready'
    check (status in ('ready', 'running', 'completed', 'approval_required', 'failed')),
  finding text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.bi_activities (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  title text not null,
  detail text not null default '',
  kind text not null default 'system'
    check (kind in ('agent', 'report', 'action', 'system')),
  occurred_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

create table if not exists public.bi_recommendations (
  id text primary key,
  vendor_id uuid references public.vendors(id) on delete cascade,
  title text not null,
  detail text not null default '',
  impact text not null default '',
  action_label text not null default 'Preview',
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.bi_reports (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  title text not null,
  period text not null default '',
  status text not null default 'ready'
    check (status in ('ready', 'generating')),
  summary text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists bi_agent_runs_vendor_started_idx
  on public.bi_agent_runs (vendor_id, started_at desc);
create index if not exists bi_activities_vendor_occurred_idx
  on public.bi_activities (vendor_id, occurred_at desc);
create index if not exists bi_recommendations_vendor_created_idx
  on public.bi_recommendations (vendor_id, created_at desc);
create index if not exists bi_reports_vendor_created_idx
  on public.bi_reports (vendor_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.bi_agent_definitions enable row level security;
alter table public.bi_agent_runs enable row level security;
alter table public.bi_activities enable row level security;
alter table public.bi_recommendations enable row level security;
alter table public.bi_reports enable row level security;

-- Definitions: any authenticated user may read enabled rows; admin writes.
drop policy if exists bi_agent_definitions_select on public.bi_agent_definitions;
create policy bi_agent_definitions_select on public.bi_agent_definitions
  for select to authenticated
  using (enabled = true or public.is_admin());

drop policy if exists bi_agent_definitions_admin_write on public.bi_agent_definitions;
create policy bi_agent_definitions_admin_write on public.bi_agent_definitions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Scoped tables: admin full access; vendor_admin on owned vendors; platform
-- rows (vendor_id is null) are admin-only for writes and visible to admins.
-- Vendor owners may read platform recommendations (vendor_id is null) as well
-- as their own vendor-scoped rows.

drop policy if exists bi_agent_runs_select on public.bi_agent_runs;
create policy bi_agent_runs_select on public.bi_agent_runs
  for select to authenticated
  using (
    public.is_admin()
    or vendor_id in (select public.bi_owned_vendor_ids())
  );

drop policy if exists bi_agent_runs_insert on public.bi_agent_runs;
create policy bi_agent_runs_insert on public.bi_agent_runs
  for insert to authenticated
  with check (
    public.is_admin()
    or vendor_id in (select public.bi_owned_vendor_ids())
  );

drop policy if exists bi_agent_runs_update on public.bi_agent_runs;
create policy bi_agent_runs_update on public.bi_agent_runs
  for update to authenticated
  using (
    public.is_admin()
    or vendor_id in (select public.bi_owned_vendor_ids())
  )
  with check (
    public.is_admin()
    or vendor_id in (select public.bi_owned_vendor_ids())
  );

drop policy if exists bi_activities_select on public.bi_activities;
create policy bi_activities_select on public.bi_activities
  for select to authenticated
  using (
    public.is_admin()
    or vendor_id in (select public.bi_owned_vendor_ids())
  );

drop policy if exists bi_activities_insert on public.bi_activities;
create policy bi_activities_insert on public.bi_activities
  for insert to authenticated
  with check (
    public.is_admin()
    or vendor_id in (select public.bi_owned_vendor_ids())
  );

drop policy if exists bi_recommendations_select on public.bi_recommendations;
create policy bi_recommendations_select on public.bi_recommendations
  for select to authenticated
  using (
    public.is_admin()
    or vendor_id in (select public.bi_owned_vendor_ids())
    or vendor_id is null
  );

drop policy if exists bi_recommendations_insert on public.bi_recommendations;
create policy bi_recommendations_insert on public.bi_recommendations
  for insert to authenticated
  with check (
    public.is_admin()
    or vendor_id in (select public.bi_owned_vendor_ids())
  );

drop policy if exists bi_reports_select on public.bi_reports;
create policy bi_reports_select on public.bi_reports
  for select to authenticated
  using (
    public.is_admin()
    or vendor_id in (select public.bi_owned_vendor_ids())
  );

drop policy if exists bi_reports_insert on public.bi_reports;
create policy bi_reports_insert on public.bi_reports
  for insert to authenticated
  with check (
    public.is_admin()
    or vendor_id in (select public.bi_owned_vendor_ids())
  );

grant select on public.bi_agent_definitions to authenticated;
grant select, insert, update on public.bi_agent_runs to authenticated;
grant select, insert on public.bi_activities to authenticated;
grant select, insert on public.bi_recommendations to authenticated;
grant select, insert on public.bi_reports to authenticated;

-- ---------------------------------------------------------------------------
-- Seeds
-- ---------------------------------------------------------------------------

insert into public.bi_agent_definitions (id, name, detail, enabled, sort_order) values
  ('sales-analyst', 'Sales Analyst', 'Finds demand patterns and pipeline growth opportunities', true, 10),
  ('customer-insights', 'Customer Insights', 'Segments interested customers and repeat demand', true, 20),
  ('campaign-optimizer', 'Campaign Optimizer', 'Monitors outreach quality and budget signals', true, 30),
  ('operations-monitor', 'Operations Monitor', 'Surfaces operational risks in the lead pipeline', true, 40)
on conflict (id) do update set
  name = excluded.name,
  detail = excluded.detail,
  enabled = excluded.enabled,
  sort_order = excluded.sort_order;

insert into public.bi_recommendations (id, vendor_id, title, detail, impact, action_label, status) values
  (
    'respond-fast-to-leads',
    null,
    'Respond to new leads within 24 hours',
    'Service requests without a budget still convert when vendors reply quickly. Prioritise "new" status leads first.',
    'Protect pipeline conversion',
    'Preview playbook',
    'open'
  ),
  (
    'capture-budget-on-intake',
    null,
    'Ask for a budget range on every inquiry',
    'Pipeline value is only measurable when budget_min/budget_max are present. Nudge requesters to share a range.',
    'Improve pipeline visibility',
    'Preview form tip',
    'open'
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- RPC: demand / pipeline proxies from service_requests
-- Comment: GMV labels deferred until orders exist.
-- ---------------------------------------------------------------------------

create or replace function public.get_vendor_bi_metrics(
  p_vendor_id uuid default null,
  p_days int default 7
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_days int := greatest(coalesce(p_days, 7), 1);
  v_is_admin boolean := public.is_admin();
  v_owns boolean := false;
  v_start timestamptz := now() - make_interval(days => v_days);
  v_prev_start timestamptz := now() - make_interval(days => v_days * 2);
  v_leads bigint := 0;
  v_prev_leads bigint := 0;
  v_pipeline numeric := 0;
  v_prev_pipeline numeric := 0;
  v_budgeted bigint := 0;
  v_customers bigint := 0;
  v_prev_customers bigint := 0;
  v_trend json;
  v_categories json;
begin
  if p_vendor_id is not null then
    select exists (
      select 1 from public.vendors v
      where v.id = p_vendor_id and v.owner_id = auth.uid()
    ) into v_owns;
    if not v_is_admin and not v_owns then
      raise exception 'not authorized' using errcode = '42501';
    end if;
  elsif not v_is_admin then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  -- Current period leads / pipeline / customers
  select
    count(*)::bigint,
    coalesce(sum(
      coalesce((sr.budget_min + sr.budget_max) / 2.0, sr.budget_max, sr.budget_min, 0)
    ), 0),
    count(*) filter (
      where sr.budget_min is not null or sr.budget_max is not null
    )::bigint,
    count(distinct sr.user_id)::bigint
  into v_leads, v_pipeline, v_budgeted, v_customers
  from public.service_requests sr
  where sr.created_at >= v_start
    and (p_vendor_id is null or sr.vendor_id = p_vendor_id);

  select
    count(*)::bigint,
    coalesce(sum(
      coalesce((sr.budget_min + sr.budget_max) / 2.0, sr.budget_max, sr.budget_min, 0)
    ), 0),
    count(distinct sr.user_id)::bigint
  into v_prev_leads, v_prev_pipeline, v_prev_customers
  from public.service_requests sr
  where sr.created_at >= v_prev_start
    and sr.created_at < v_start
    and (p_vendor_id is null or sr.vendor_id = p_vendor_id);

  select coalesce(json_agg(row_to_json(t) order by t.day), '[]'::json)
  into v_trend
  from (
    select
      to_char(d.day, 'DD/MM') as label,
      coalesce(c.cnt, 0)::float as value
    from generate_series(
      date_trunc('day', v_start),
      date_trunc('day', now()),
      interval '1 day'
    ) as d(day)
    left join lateral (
      select count(*)::int as cnt
      from public.service_requests sr
      where date_trunc('day', sr.created_at) = d.day
        and (p_vendor_id is null or sr.vendor_id = p_vendor_id)
    ) c on true
  ) t;

  select coalesce(json_agg(row_to_json(c) order by c.pipeline_value desc), '[]'::json)
  into v_categories
  from (
    select
      coalesce(nullif(s.category, ''), 'Other') as name,
      coalesce(sum(
        coalesce((sr.budget_min + sr.budget_max) / 2.0, sr.budget_max, sr.budget_min, 0)
      ), 0) as pipeline_value
    from public.service_requests sr
    left join public.services s on s.id = sr.service_id
    where sr.created_at >= v_start
      and (p_vendor_id is null or sr.vendor_id = p_vendor_id)
    group by 1
    order by pipeline_value desc
    limit 8
  ) c;

  return json_build_object(
    'days', v_days,
    'leads', v_leads,
    'previousLeads', v_prev_leads,
    'pipelineValue', v_pipeline,
    'previousPipelineValue', v_prev_pipeline,
    'budgetedLeads', v_budgeted,
    'interestedCustomers', v_customers,
    'previousInterestedCustomers', v_prev_customers,
    'trend', v_trend,
    'categories', v_categories,
    'note', 'GMV deferred until orders exist; values are demand/pipeline proxies from service_requests.'
  );
end;
$$;

comment on function public.get_vendor_bi_metrics(uuid, int) is
  'BI demand/pipeline proxies from service_requests. GMV labels deferred until orders exist.';

revoke all on function public.get_vendor_bi_metrics(uuid, int) from public;
grant execute on function public.get_vendor_bi_metrics(uuid, int) to authenticated;
