-- Align data-layer authorization with the application hierarchy:
-- customer < vendor < admin. Vendors remain owner-scoped; admins may use
-- inherited vendor routes against any vendor-owned resource.

begin;

drop policy if exists "lomar vendor owner all" on public.vendors;
create policy "lomar vendor owner all" on public.vendors
for all to authenticated
using (
  (select auth.uid()) = owner_id
  or (select public.is_admin())
)
with check (
  (select auth.uid()) = owner_id
  or (select public.is_admin())
);

drop policy if exists "lomar service owner all" on public.services;
create policy "lomar service owner all" on public.services
for all to authenticated
using (
  (select public.is_admin())
  or exists (
    select 1
    from public.vendors v
    where v.id = services.vendor_id
      and v.owner_id = (select auth.uid())
  )
)
with check (
  (select public.is_admin())
  or exists (
    select 1
    from public.vendors v
    where v.id = services.vendor_id
      and v.owner_id = (select auth.uid())
  )
);

drop policy if exists "lomar service request parties" on public.service_requests;
create policy "lomar service request parties" on public.service_requests
for select to authenticated
using (
  (select public.is_admin())
  or user_id = (select auth.uid())
  or exists (
    select 1
    from public.vendors v
    where v.id = service_requests.vendor_id
      and v.owner_id = (select auth.uid())
  )
);

drop policy if exists "lomar service request user insert" on public.service_requests;
create policy "lomar service request user insert" on public.service_requests
for insert to authenticated
with check (
  (select public.is_admin())
  or user_id = (select auth.uid())
);

drop policy if exists "lomar service request user update" on public.service_requests;
create policy "lomar service request user update" on public.service_requests
for update to authenticated
using (
  (select public.is_admin())
  or user_id = (select auth.uid())
)
with check (
  (select public.is_admin())
  or user_id = (select auth.uid())
);

drop policy if exists "lomar voucher owner all" on public.vouchers;
create policy "lomar voucher owner all" on public.vouchers
for all to authenticated
using (
  (select public.is_admin())
  or exists (
    select 1
    from public.vendors v
    where v.id = vouchers.vendor_id
      and v.owner_id = (select auth.uid())
  )
)
with check (
  (select public.is_admin())
  or exists (
    select 1
    from public.vendors v
    where v.id = vouchers.vendor_id
      and v.owner_id = (select auth.uid())
  )
);

commit;
