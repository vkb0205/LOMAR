-- Canonical LOMAR application roles and API authorization policies.
--
-- This migration replaces the unexecuted app_role transition. The existing
-- profiles.role column is normalized in place to the final vocabulary:
-- customer | vendor | admin.

begin;

-- --------------------------------------------------------------------------
-- Canonical application role
-- --------------------------------------------------------------------------

alter table public.profiles
  drop constraint if exists profiles_role_check;

update public.profiles
set role = case lower(role)
  when 'admin' then 'admin'
  when 'vendor' then 'vendor'
  when 'vendor_admin' then 'vendor'
  else 'customer'
end;

alter table public.profiles
  alter column role set default 'customer',
  alter column role set not null,
  add constraint profiles_role_check
    check (role in ('customer', 'vendor', 'admin'));

drop index if exists public.profiles_role_idx;
create index profiles_role_idx on public.profiles (id, role);

comment on column public.profiles.role is
  'Authoritative application role: customer, vendor, or admin.';

-- The function bypasses profiles RLS only to read the caller's own role.
-- It is unavailable to PUBLIC and anon, and it cannot inspect another user.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- --------------------------------------------------------------------------
-- RLS and Data API privileges
-- --------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.vendors enable row level security;
alter table public.services enable row level security;
alter table public.service_requests enable row level security;
alter table public.vouchers enable row level security;

revoke all on public.profiles from anon;
revoke update on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, avatar_url, username, onboarding_status)
  on public.profiles to authenticated;

revoke insert, update, delete on public.vendors, public.services, public.vouchers
  from anon;
grant select on public.vendors, public.services, public.vouchers
  to anon, authenticated;
grant insert, update, delete on public.vendors, public.services, public.vouchers
  to authenticated;

revoke all on public.service_requests from anon;
grant select, insert, update on public.service_requests to authenticated;

-- --------------------------------------------------------------------------
-- Remove superseded profile policies and install the final pair.
-- --------------------------------------------------------------------------

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can manage all profiles" on public.profiles;
drop policy if exists "lomar profile owner select" on public.profiles;
drop policy if exists "lomar profile owner update" on public.profiles;

create policy "lomar profile owner select" on public.profiles
for select to authenticated
using ((select auth.uid()) = id);

create policy "lomar profile owner update" on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- --------------------------------------------------------------------------
-- Vendor ownership and public catalog access
-- --------------------------------------------------------------------------

drop policy if exists "Public can view active vendors" on public.vendors;
drop policy if exists "Owners can view own vendor" on public.vendors;
drop policy if exists "Owners can insert own vendor" on public.vendors;
drop policy if exists "Owners can update own vendor" on public.vendors;
drop policy if exists "Owners can delete own vendor" on public.vendors;
drop policy if exists "Admins can manage all vendors" on public.vendors;
drop policy if exists "lomar vendor owner all" on public.vendors;
drop policy if exists "lomar active vendors public" on public.vendors;

create policy "lomar vendor owner all" on public.vendors
for all to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "lomar active vendors public" on public.vendors
for select to anon, authenticated
using (status = 'active');

drop policy if exists "Public can view active services" on public.services;
drop policy if exists "Vendor owners can view own services" on public.services;
drop policy if exists "Vendor owners can insert services" on public.services;
drop policy if exists "Vendor owners can update services" on public.services;
drop policy if exists "Vendor owners can delete services" on public.services;
drop policy if exists "Admins can manage all services" on public.services;
drop policy if exists "lomar service owner all" on public.services;
drop policy if exists "lomar active services public" on public.services;

create policy "lomar service owner all" on public.services
for all to authenticated
using (exists (
  select 1
  from public.vendors v
  where v.id = services.vendor_id
    and v.owner_id = (select auth.uid())
))
with check (exists (
  select 1
  from public.vendors v
  where v.id = services.vendor_id
    and v.owner_id = (select auth.uid())
));

create policy "lomar active services public" on public.services
for select to anon, authenticated
using (status = 'active');

-- --------------------------------------------------------------------------
-- Service-request parties
-- --------------------------------------------------------------------------

drop policy if exists "Users can view own service requests" on public.service_requests;
drop policy if exists "Vendor owners can view incoming requests" on public.service_requests;
drop policy if exists "Users can insert own service requests" on public.service_requests;
drop policy if exists "Users can update own service requests" on public.service_requests;
drop policy if exists "Users can delete own service requests" on public.service_requests;
drop policy if exists "Admins can manage all service requests" on public.service_requests;
drop policy if exists "lomar service request parties" on public.service_requests;
drop policy if exists "lomar service request user insert" on public.service_requests;
drop policy if exists "lomar service request user update" on public.service_requests;

create policy "lomar service request parties" on public.service_requests
for select to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.vendors v
    where v.id = service_requests.vendor_id
      and v.owner_id = (select auth.uid())
  )
);

create policy "lomar service request user insert" on public.service_requests
for insert to authenticated
with check (user_id = (select auth.uid()));

create policy "lomar service request user update" on public.service_requests
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- --------------------------------------------------------------------------
-- Voucher ownership and public availability
-- --------------------------------------------------------------------------

drop policy if exists "Public can view active vouchers" on public.vouchers;
drop policy if exists "Vendor owners can view own vouchers" on public.vouchers;
drop policy if exists "Vendor owners can insert vouchers" on public.vouchers;
drop policy if exists "Vendor owners can update vouchers" on public.vouchers;
drop policy if exists "Vendor owners can delete vouchers" on public.vouchers;
drop policy if exists "Admins can manage all vouchers" on public.vouchers;
drop policy if exists "lomar voucher owner all" on public.vouchers;
drop policy if exists "lomar active vouchers public" on public.vouchers;

create policy "lomar voucher owner all" on public.vouchers
for all to authenticated
using (exists (
  select 1
  from public.vendors v
  where v.id = vouchers.vendor_id
    and v.owner_id = (select auth.uid())
))
with check (exists (
  select 1
  from public.vendors v
  where v.id = vouchers.vendor_id
    and v.owner_id = (select auth.uid())
));

create policy "lomar active vouchers public" on public.vouchers
for select to anon, authenticated
using (active = true);

commit;
