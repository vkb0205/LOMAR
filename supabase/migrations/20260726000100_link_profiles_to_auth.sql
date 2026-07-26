-- Link public profiles to Supabase Auth and provision profiles automatically.
-- Preserve legacy identities without silently deleting or remapping them.

begin;

do $$
declare
  orphan_count bigint;
  auth_user_count bigint;
  email_matchable_count bigint;
  dependent_row_count bigint;
begin
  select count(*)
    into orphan_count
  from public.profiles p
  left join auth.users u on u.id = p.id
  where u.id is null;

  select count(*) into auth_user_count from auth.users;

  select count(*)
    into email_matchable_count
  from public.profiles p
  where not exists (select 1 from auth.users u where u.id = p.id)
    and p.email is not null
    and (
      select count(*)
      from auth.users u
      where lower(u.email) = lower(p.email)
    ) = 1;

  select count(*)
    into dependent_row_count
  from (
    select owner_id as profile_id from public.vendors
    union all select user_id from public.user_favorite_services
    union all select user_id from public.reviews
    union all select user_id from public.user_journey_tasks
    union all select user_id from public.user_vouchers
    union all select user_id from public.posts
    union all select user_id from public.post_comments
    union all select user_id from public.post_likes
    union all select user_id from public.chat_threads
    union all select user_id from public.chat_messages
    union all select user_id from public.ai_design_projects
    union all select user_id from public.ai_design_generations
    union all select user_id from public.ai_design_assets
    union all select user_id from public.service_requests
    union all select follower_id from public.follows
    union all select followee_user_id from public.follows
  ) refs
  join public.profiles p on p.id = refs.profile_id
  left join auth.users u on u.id = p.id
  where u.id is null;

  if orphan_count > 0 then
    raise warning
      'Preserving legacy data: % orphan profile(s), % Auth user(s), % unique email match(es), % dependent row(s). The new FK will remain NOT VALID until cleanup.',
      orphan_count,
      auth_user_count,
      email_matchable_count,
      dependent_row_count;
  end if;
end
$$;

alter table public.profiles alter column id drop default;
alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users(id) on delete cascade
  not valid;

do $$
begin
  if not exists (
    select 1
    from public.profiles p
    left join auth.users u on u.id = p.id
    where u.id is null
  ) then
    alter table public.profiles validate constraint profiles_id_fkey;
  end if;
end
$$;

insert into public.profiles (id, email, full_name, avatar_url)
select
  u.id,
  u.email,
  nullif(u.raw_user_meta_data ->> 'full_name', ''),
  nullif(u.raw_user_meta_data ->> 'avatar_url', '')
from auth.users u
on conflict (id) do nothing;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can delete own profile" on public.profiles;

commit;
