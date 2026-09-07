-- Repair the BI trend aggregation, align function privileges with their
-- callers, and remove equivalent permissive policies reported by advisors.

begin;

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

  select coalesce(
    json_agg(
      json_build_object('label', t.label, 'value', t.value)
      order by t.day
    ),
    '[]'::json
  )
  into v_trend
  from (
    select
      d.day,
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

-- These SECURITY DEFINER helpers require a signed-in caller and perform their
-- own owner/admin checks. Anonymous execution is unnecessary.
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

revoke all on function public.bi_owned_vendor_ids() from public, anon;
grant execute on function public.bi_owned_vendor_ids() to authenticated;

revoke all on function public.get_vendor_bi_metrics(uuid, int) from public, anon;
grant execute on function public.get_vendor_bi_metrics(uuid, int) to authenticated;

-- Trigger functions are invoked by their triggers, never directly by clients.
revoke all on function public.lomar_touch_updated_at()
  from public, anon, authenticated, service_role;

-- This legacy RPC only exists on environments that installed the website
-- analytics module. Keep the migration replayable on a fresh CLI database.
do $do$
begin
  if to_regprocedure('public.get_admin_website_analytics(integer)') is not null then
    execute 'revoke all on function public.get_admin_website_analytics(integer) from public, anon';
    execute 'grant execute on function public.get_admin_website_analytics(integer) to authenticated';
  end if;
end
$do$;

-- Keep only the canonical BI policy family.
drop policy if exists "admin all bi_agent_definitions" on public.bi_agent_definitions;
drop policy if exists "admin all bi_agent_runs" on public.bi_agent_runs;
drop policy if exists "admin all bi_activities" on public.bi_activities;
drop policy if exists "admin all bi_recommendations" on public.bi_recommendations;
drop policy if exists "admin all bi_reports" on public.bi_reports;

-- The support migration superseded these four equivalent policy names.
drop policy if exists "admin manage wedding_plans" on public.wedding_plans;
drop policy if exists "public select active wedding_plans" on public.wedding_plans;
drop policy if exists "admin manage wedding_plan_items" on public.wedding_plan_items;
drop policy if exists "public select active wedding_plan_items" on public.wedding_plan_items;

commit;
