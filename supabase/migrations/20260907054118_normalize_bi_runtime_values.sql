begin;

-- Normalize rows written by the legacy BI demo seed to the runtime/API
-- vocabulary before enforcing it at the database boundary.
update public.bi_activities
set kind = 'system'
where kind is null
   or kind not in ('agent', 'report', 'action', 'system');

update public.bi_reports
set status = case
  when status in ('generating', 'pending', 'running') then 'generating'
  else 'ready'
end
where status is null
   or status not in ('ready', 'generating');

alter table public.bi_activities
  alter column kind set default 'system',
  alter column kind set not null;

alter table public.bi_reports
  alter column status set default 'ready',
  alter column status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bi_activities_kind_check'
      and conrelid = 'public.bi_activities'::regclass
  ) then
    alter table public.bi_activities
      add constraint bi_activities_kind_check
      check (kind in ('agent', 'report', 'action', 'system'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bi_reports_status_check'
      and conrelid = 'public.bi_reports'::regclass
  ) then
    alter table public.bi_reports
      add constraint bi_reports_status_check
      check (status in ('ready', 'generating'));
  end if;
end
$$;

commit;
