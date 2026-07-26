-- Historical bootstrap: LOMAR website analytics.
-- Prerequisite: supabase/legacy/admin_policies.sql (public.is_admin()).
-- Replay-safe: all objects are created/replaced idempotently.

create table if not exists public.analytics_page_views (
  id uuid primary key,
  session_id uuid not null,
  visitor_id uuid not null,
  user_id uuid null references auth.users(id) on delete set null,
  page_path text not null check (char_length(page_path) between 1 and 500),
  page_title text null check (char_length(page_title) <= 300),
  referrer_host text null check (char_length(referrer_host) <= 255),
  duration_seconds integer not null default 0
    check (duration_seconds between 0 and 86400),
  max_scroll_percent smallint not null default 0
    check (max_scroll_percent between 0 and 100),
  occurred_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists analytics_page_views_occurred_at_idx
  on public.analytics_page_views (occurred_at desc);
create index if not exists analytics_page_views_page_path_idx
  on public.analytics_page_views (page_path, occurred_at desc);
create index if not exists analytics_page_views_session_idx
  on public.analytics_page_views (session_id, occurred_at);
create index if not exists analytics_page_views_visitor_idx
  on public.analytics_page_views (visitor_id, occurred_at);

alter table public.analytics_page_views enable row level security;

drop policy if exists "Admins can read website analytics"
  on public.analytics_page_views;
create policy "Admins can read website analytics"
  on public.analytics_page_views
  for select
  using (public.is_admin());

-- Anonymous/authenticated visitors write through this narrow RPC. The user id
-- always comes from auth.uid(); callers cannot impersonate another account.
create or replace function public.record_page_view(
  p_id uuid,
  p_session_id uuid,
  p_visitor_id uuid,
  p_page_path text,
  p_page_title text default null,
  p_referrer_host text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  normalized_path text;
begin
  normalized_path := left(split_part(coalesce(p_page_path, ''), '?', 1), 500);
  if normalized_path = '' or left(normalized_path, 1) <> '/' then
    raise exception 'Invalid page path';
  end if;

  insert into public.analytics_page_views (
    id,
    session_id,
    visitor_id,
    user_id,
    page_path,
    page_title,
    referrer_host
  )
  values (
    p_id,
    p_session_id,
    p_visitor_id,
    auth.uid(),
    normalized_path,
    nullif(left(trim(coalesce(p_page_title, '')), 300), ''),
    nullif(left(lower(trim(coalesce(p_referrer_host, ''))), 255), '')
  )
  on conflict (id) do nothing;

  return p_id;
end;
$$;

create or replace function public.record_page_engagement(
  p_id uuid,
  p_session_id uuid,
  p_visitor_id uuid,
  p_duration_seconds integer,
  p_max_scroll_percent integer
)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.analytics_page_views
  set
    duration_seconds = greatest(
      duration_seconds,
      least(greatest(coalesce(p_duration_seconds, 0), 0), 86400)
    ),
    max_scroll_percent = greatest(
      max_scroll_percent,
      least(greatest(coalesce(p_max_scroll_percent, 0), 0), 100)::smallint
    ),
    updated_at = now()
  where id = p_id
    and session_id = p_session_id
    and visitor_id = p_visitor_id;
$$;

revoke all on function public.record_page_view(
  uuid, uuid, uuid, text, text, text
) from public;
revoke all on function public.record_page_engagement(
  uuid, uuid, uuid, integer, integer
) from public;
grant execute on function public.record_page_view(
  uuid, uuid, uuid, text, text, text
) to anon, authenticated;
grant execute on function public.record_page_engagement(
  uuid, uuid, uuid, integer, integer
) to anon, authenticated;

-- Admin-only aggregate. Behaviour segments are exclusive and evaluated in
-- priority order: high_intent -> engaged -> quick_exit -> casual.
create or replace function public.get_admin_website_analytics(p_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  result jsonb;
  safe_days integer := least(greatest(coalesce(p_days, 30), 1), 365);
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  with filtered as (
    select *
    from public.analytics_page_views
    where occurred_at >= now() - make_interval(days => safe_days)
  ),
  session_stats as (
    select
      session_id,
      visitor_id,
      count(*)::integer as page_views,
      count(distinct page_path)::integer as unique_pages,
      sum(duration_seconds)::integer as duration_seconds,
      bool_or(
        page_path = '/customize'
        or page_path = '/ai-consultant'
        or page_path like '/vendor/%'
      ) as has_high_intent_page
    from filtered
    group by session_id, visitor_id
  ),
  classified_sessions as (
    select
      *,
      case
        when has_high_intent_page then 'high_intent'
        when page_views >= 3 or duration_seconds >= 60 then 'engaged'
        when page_views = 1 and duration_seconds < 10 then 'quick_exit'
        else 'casual'
      end as behaviour
    from session_stats
  ),
  page_rows as (
    select
      page_path,
      max(page_title) as page_title,
      count(*)::integer as views,
      count(distinct visitor_id)::integer as unique_visitors,
      round(avg(duration_seconds))::integer as avg_duration_seconds,
      round(avg(max_scroll_percent))::integer as avg_scroll_percent
    from filtered
    group by page_path
    order by views desc, page_path
  ),
  behaviour_rows as (
    select behaviour, count(*)::integer as sessions
    from classified_sessions
    group by behaviour
  ),
  daily_rows as (
    select
      series.day::date as day,
      count(filtered.id)::integer as views,
      count(distinct filtered.visitor_id)::integer as unique_visitors
    from generate_series(
      current_date - (safe_days - 1),
      current_date,
      interval '1 day'
    ) as series(day)
    left join filtered
      on filtered.occurred_at >= series.day
      and filtered.occurred_at < series.day + interval '1 day'
    group by series.day
    order by series.day
  )
  select jsonb_build_object(
    'summary', jsonb_build_object(
      'views', (select count(*) from filtered),
      'uniqueVisitors', (select count(distinct visitor_id) from filtered),
      'sessions', (select count(*) from session_stats),
      'avgDurationSeconds', coalesce(
        (select round(avg(duration_seconds)) from filtered), 0
      ),
      'bounceRate', coalesce(
        (
          select round(
            100.0 * count(*) filter (where behaviour = 'quick_exit')
            / nullif(count(*), 0),
            1
          )
          from classified_sessions
        ),
        0
      )
    ),
    'pages', coalesce(
      (select jsonb_agg(to_jsonb(page_rows)) from page_rows),
      '[]'::jsonb
    ),
    'behaviours', coalesce(
      (select jsonb_agg(to_jsonb(behaviour_rows)) from behaviour_rows),
      '[]'::jsonb
    ),
    'daily', coalesce(
      (select jsonb_agg(to_jsonb(daily_rows)) from daily_rows),
      '[]'::jsonb
    )
  )
  into result;

  return result;
end;
$$;

revoke all on function public.get_admin_website_analytics(integer) from public;
grant execute on function public.get_admin_website_analytics(integer)
  to authenticated;

comment on table public.analytics_page_views is
  'Privacy-minimal page-view analytics. No IP address or raw user agent is stored.';
comment on function public.get_admin_website_analytics(integer) is
  'Returns admin-only page, daily, summary, and rule-based behaviour analytics.';
