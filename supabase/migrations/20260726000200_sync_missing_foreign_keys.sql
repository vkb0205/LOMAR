-- Foreign keys documented by the canonical v2 schema but missing remotely.

begin;

alter table public.vendors
  drop constraint if exists vendors_v2_owner_id_fkey;
alter table public.vendors
  add constraint vendors_v2_owner_id_fkey
  foreign key (owner_id) references public.profiles(id) on delete set null;

alter table public.chat_threads
  drop constraint if exists chat_threads_design_project_fk;
alter table public.chat_threads
  add constraint chat_threads_design_project_fk
  foreign key (design_project_id)
  references public.ai_design_projects(id) on delete set null;

commit;
