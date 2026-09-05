-- Keep admin-only RLS helpers out of anonymous policy evaluation while
-- restoring the author read needed to assemble the public social feed.

begin;

-- public.is_admin() is intentionally executable only by authenticated users.
-- Any policy that calls it must therefore be limited to that database role;
-- otherwise PostgreSQL evaluates the policy for anon requests and raises
-- `permission denied for function is_admin` before permissive public policies
-- can allow the row.
do $$
declare
  admin_policy record;
begin
  for admin_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and (
        coalesce(qual, '') ilike '%is_admin(%'
        or coalesce(with_check, '') ilike '%is_admin(%'
      )
  loop
    execute format(
      'alter policy %I on %I.%I to authenticated',
      admin_policy.policyname,
      admin_policy.schemaname,
      admin_policy.tablename
    );
  end loop;
end;
$$;

-- The feed exposes only the public identity fields of authors who have at
-- least one published post. Keep email, role, and other profile fields hidden
-- from anonymous Data API callers through column-level privileges.
grant select (id, username, avatar_url) on public.profiles to anon;

drop policy if exists "lomar public blog authors" on public.profiles;
create policy "lomar public blog authors" on public.profiles
for select to anon, authenticated
using (
  exists (
    select 1
    from public.posts
    where posts.user_id = profiles.id
      and posts.status = 'published'
  )
);

commit;
