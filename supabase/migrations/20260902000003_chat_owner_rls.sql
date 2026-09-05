-- Owner-scoped RLS for the consult-style chat threads used by the couple app.
-- Existing chat tables had admin-only policies; authenticated users could not
-- create or read their own consult threads under the caller-JWT client.

alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
create policy "owner chat_threads"
on public.chat_threads
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
create policy "owner chat_messages"
on public.chat_messages
for all to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.chat_threads t
    where t.id = thread_id and t.user_id = auth.uid()
  )
);
grant select, insert, update, delete on public.chat_threads, public.chat_messages to authenticated;
commit;
