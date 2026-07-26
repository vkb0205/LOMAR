-- All legacy profiles have been migrated to real Supabase Auth identities.

do $$
begin
  if exists (
    select 1
    from public.profiles p
    left join auth.users u on u.id = p.id
    where u.id is null
  ) then
    raise exception
      'Cannot validate profiles_id_fkey while orphan profiles remain.';
  end if;
end
$$;

alter table public.profiles validate constraint profiles_id_fkey;
