-- Make user-plan upserts work through PostgREST.
--
-- The backend calls `insert ... on_conflict=user_id,service_id` (and
-- `user_id,plan_id`). PostgreSQL can only infer a partial unique index as an
-- ON CONFLICT arbiter if the query also repeats the index predicate, which
-- PostgREST does not do. Swapping the partial indexes for full unique indexes
-- keeps the same guarantees because the item-type check constraint ensures the
-- other id column is NULL, and NULLs are distinct in a unique index.

begin;
drop index if exists public.user_plan_items_user_service_uniq;
drop index if exists public.user_plan_items_user_plan_uniq;
create unique index if not exists user_plan_items_user_service_uniq
  on public.user_plan_items (user_id, service_id);
create unique index if not exists user_plan_items_user_plan_uniq
  on public.user_plan_items (user_id, plan_id);
commit;
