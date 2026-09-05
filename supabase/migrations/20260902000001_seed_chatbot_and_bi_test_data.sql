-- Live-test seed data for the chatbot / user-plan / BI surfaces.
-- Keeps existing rows untouched; every INSERT is idempotent so this file can be
-- re-applied after partial manual edits.

begin;
-- ---------------------------------------------------------------------------
-- Seed prerequisites
-- ---------------------------------------------------------------------------
-- A clean CLI reset has no Auth users, profiles, vendors, or services. The
-- demo rows below reference all four, so create deterministic local/demo
-- fixtures before inserting the dependent data.
insert into auth.users (
  id, aud, role, email, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values (
  '908c86b1-ed30-41d8-a38b-8809720972bd',
  'authenticated',
  'authenticated',
  'mai.phuong@email.com',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
)
on conflict (id) do nothing;

insert into public.profiles (id, username, full_name, email, onboarding_status)
values (
  '908c86b1-ed30-41d8-a38b-8809720972bd',
  'mai_phuong',
  'Mai Phương',
  'mai.phuong@email.com',
  'active'
)
on conflict (id) do update
set username = excluded.username,
    full_name = excluded.full_name,
    onboarding_status = excluded.onboarding_status;

insert into public.vendors (
  id, owner_id, name, slug, category, description, city, status
)
values (
  '90000000-0000-0000-0000-000000000001',
  '908c86b1-ed30-41d8-a38b-8809720972bd',
  'LOMAR Demo Vendor',
  'lomar-demo-vendor',
  'Wedding',
  'Deterministic vendor used by local migration tests.',
  'Ho Chi Minh City',
  'active'
)
on conflict (id) do nothing;

insert into public.services (
  id, vendor_id, category, name, description, base_price, currency, status
)
values
  ('91000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001',
   'Venue', 'Demo Venue', 'Local migration fixture.', 20000000, 'VND', 'active'),
  ('91000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000001',
   'Studio', 'Demo Studio', 'Local migration fixture.', 10000000, 'VND', 'active'),
  ('91000000-0000-0000-0000-000000000003', '90000000-0000-0000-0000-000000000001',
   'Váy Cưới', 'Demo Wedding Dress', 'Local migration fixture.', 9000000, 'VND', 'active')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- BI tables (the BI module needs them; create before seeding).
-- ---------------------------------------------------------------------------
create table if not exists public.bi_agent_definitions (
  id         text primary key,
  name       text not null,
  detail     text,
  enabled    boolean not null default true,
  sort_order integer not null default 0
);
create table if not exists public.bi_agent_runs (
  id           uuid primary key default gen_random_uuid(),
  agent_id     text not null references public.bi_agent_definitions(id),
  vendor_id    uuid,
  triggered_by text,
  status       text not null default 'completed',
  finding      text,
  started_at   timestamptz not null default now(),
  finished_at  timestamptz not null default now()
);
create table if not exists public.bi_activities (
  id          uuid primary key default gen_random_uuid(),
  vendor_id   uuid,
  title       text not null,
  detail      text,
  kind        text,
  occurred_at timestamptz not null default now(),
  created_by  text
);
create table if not exists public.bi_recommendations (
  id           text primary key,
  vendor_id    uuid,
  title        text not null,
  detail       text,
  impact       text,
  action_label text,
  status       text not null default 'open',
  created_at   timestamptz not null default now()
);
create table if not exists public.bi_reports (
  id          uuid primary key default gen_random_uuid(),
  vendor_id   uuid,
  title       text not null,
  period      text,
  status      text not null default 'draft',
  summary     text,
  payload     jsonb not null default '{}'::jsonb,
  created_by  text,
  created_at  timestamptz not null default now()
);
alter table public.bi_agent_definitions enable row level security;
alter table public.bi_agent_runs enable row level security;
alter table public.bi_activities enable row level security;
alter table public.bi_recommendations enable row level security;
alter table public.bi_reports enable row level security;
create policy "admin all bi_agent_definitions" on public.bi_agent_definitions
  for all using (public.is_admin());
create policy "admin all bi_agent_runs" on public.bi_agent_runs
  for all using (public.is_admin());
create policy "admin all bi_activities" on public.bi_activities
  for all using (public.is_admin());
create policy "admin all bi_recommendations" on public.bi_recommendations
  for all using (public.is_admin());
create policy "admin all bi_reports" on public.bi_reports
  for all using (public.is_admin());
grant select, insert, update, delete on public.bi_agent_definitions to authenticated;
grant select, insert, update, delete on public.bi_agent_runs to authenticated;
grant select, insert, update, delete on public.bi_activities to authenticated;
grant select, insert, update, delete on public.bi_recommendations to authenticated;
grant select, insert, update, delete on public.bi_reports to authenticated;
-- ---------------------------------------------------------------------------
-- BI seed
-- ---------------------------------------------------------------------------
insert into public.bi_agent_definitions (id, name, detail, enabled, sort_order)
values
  ('sales-analyst',        'Sales Analyst',        'Finds demand patterns and pipeline growth opportunities', true, 10),
  ('customer-insights',    'Customer Insights',    'Segments interested customers and repeat demand',        true, 20),
  ('campaign-optimizer',   'Campaign Optimizer',   'Monitors outreach quality and budget signals',           true, 30),
  ('operations-monitor',   'Operations Monitor',   'Surfaces operational risks in the lead pipeline',        true, 40)
on conflict (id) do nothing;
insert into public.bi_recommendations (id, vendor_id, title, detail, impact, action_label, status)
values
  ('respond-fast-to-leads', null, 'Trả lời lead nhanh hơn', 'Các lead mới thường chốt trong 6 giờ đầu; phản hồi dưới 2 giờ giúp tăng tỉ lệ chốt.', 'Bảo vệ tỉ lệ chốt', 'Xem chi tiết', 'open'),
  ('boost-photo-upsell',    null, 'Đẩy mạnh upsell gói chụp', 'Khách hàng xem gói Studio có tỉ lệ hỏi giá cao hơn 30%.', 'Tăng doanh thu trung bình', 'Tạo chiến dịch', 'open')
on conflict (id) do nothing;
insert into public.bi_agent_runs (id, agent_id, vendor_id, triggered_by, status, finding, started_at, finished_at)
values
  ('71000000-0000-0000-0000-000000000001', 'sales-analyst', null, 'admin', 'completed', 'Pipeline tăng 18% so với tuần trước.', now() - interval '1 day', now() - interval '1 day'),
  ('71000000-0000-0000-0000-000000000002', 'customer-insights', null, 'admin', 'completed', 'Nhóm khách ngân sách 50-100 triệu đang tăng.', now() - interval '2 days', now() - interval '2 days')
on conflict (id) do nothing;
insert into public.bi_activities (id, vendor_id, title, detail, kind, occurred_at, created_by)
values
  ('72000000-0000-0000-0000-000000000001', null, 'Seed BI demo', 'Hoàn tất dữ liệu demo cho khu vực BI.', 'seed', now(), 'admin'),
  ('72000000-0000-0000-0000-000000000002', null, 'Pipeline mới', 'Một lead Stage 1 mới được tạo.', 'lead', now() - interval '1 hour', 'admin')
on conflict (id) do nothing;
insert into public.bi_reports (id, vendor_id, title, period, status, summary, payload, created_by, created_at)
values
  ('73000000-0000-0000-0000-000000000001', null, 'Báo cáo tuần demo', '2026-08-31/2026-09-06', 'completed', 'Lead ổn định, pipeline tăng nhẹ.', '{"leads": 40, "pipelineValue": 3200000000}'::jsonb, 'admin', now() - interval '12 hours')
on conflict (id) do nothing;
-- ---------------------------------------------------------------------------
-- Wedding plans + items
-- ---------------------------------------------------------------------------
insert into public.wedding_plans (
  id, name, description, style, min_guests, max_guests,
  min_budget, max_budget, currency, cover_image_url, status
)
values
  ('10000000-0000-0000-0000-000000000001', 'Gói Cưới Cổ Điển', 'Trọn gói cổ điển cho 100-180 khách.', 'Cổ Điển', 100, 180, 60000000, 90000000, 'VND', 'https://images.example.test/plans/classic.jpg', 'active'),
  ('10000000-0000-0000-0000-000000000002', 'Gói Cưới Tối Giản', 'Gói tinh gọn cho 50-120 khách.', 'Tối Giản', 50, 120, 25000000, 45000000, 'VND', 'https://images.example.test/plans/minimal.jpg', 'active'),
  ('10000000-0000-0000-0000-000000000003', 'Gói Cưới Ngoài Trời', 'Tiệc ngoài trời và studio chụp trọn vẹn.', 'Garden', 80, 150, 50000000, 75000000, 'VND', 'https://images.example.test/plans/garden.jpg', 'active'),
  ('10000000-0000-0000-0000-000000000004', 'Gói Cưới Cao Cấp', 'Trải nghiệm cao cấp, 200-300 khách.', 'Luxury', 200, 300, 120000000, 180000000, 'VND', 'https://images.example.test/plans/luxury.jpg', 'active'),
  ('10000000-0000-0000-0000-000000000005', 'Gói Cưới Tiết Kiệm', 'Chi phí hợp lý cho tiệc gia đình.', 'Tiết Kiệm', 20, 60, 12000000, 22000000, 'VND', 'https://images.example.test/plans/budget.jpg', 'active')
on conflict (id) do nothing;
insert into public.wedding_plan_items (id, wedding_plan_id, service_id, role, sort_order, quantity, unit_price, currency)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   (select id from public.services where category = 'Venue' and status = 'active' order by base_price limit 1), 'địa điểm', 0, 1, 20000000, 'VND'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   (select id from public.services where category = 'Studio' and status = 'active' order by base_price limit 1), 'chụp ảnh', 1, 1, 15000000, 'VND'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001',
   (select id from public.services where category = 'Váy Cưới' and status = 'active' order by base_price limit 1), 'váy cưới', 2, 1, 12000000, 'VND'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002',
   (select id from public.services where category = 'Venue' and status = 'active' order by base_price limit 1), 'địa điểm', 0, 1, 10000000, 'VND'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002',
   (select id from public.services where category = 'Studio' and status = 'active' order by base_price limit 1), 'chụp ảnh', 1, 1, 8000000, 'VND'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003',
   (select id from public.services where category = 'Venue' and status = 'active' order by base_price limit 1), 'địa điểm', 0, 1, 18000000, 'VND'),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003',
   (select id from public.services where category = 'Studio' and status = 'active' order by base_price limit 1), 'chụp ảnh', 1, 1, 10000000, 'VND'),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004',
   (select id from public.services where category = 'Venue' and status = 'active' order by base_price limit 1), 'địa điểm', 0, 1, 40000000, 'VND'),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000004',
   (select id from public.services where category = 'Studio' and status = 'active' order by base_price limit 1), 'chụp ảnh', 1, 1, 25000000, 'VND'),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005',
   (select id from public.services where category = 'Venue' and status = 'active' order by base_price limit 1), 'địa điểm', 0, 1, 6000000, 'VND'),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000005',
   (select id from public.services where category = 'Studio' and status = 'active' order by base_price limit 1), 'chụp ảnh', 1, 1, 4000000, 'VND')
on conflict (id) do nothing;
-- ---------------------------------------------------------------------------
-- User plan decisions (uses the existing customer profile that owns posts)
-- ---------------------------------------------------------------------------
insert into public.user_plan_items (user_id, item_type, service_id, plan_id, status, unit_price, currency, accepted_at)
select '908c86b1-ed30-41d8-a38b-8809720972bd', 'service',
  (select id from public.services where category = 'Venue' and status = 'active' order by base_price limit 1),
  null, 'accepted', 20000000, 'VND', now() - interval '2 days'
where not exists (
  select 1 from public.user_plan_items
  where user_id = '908c86b1-ed30-41d8-a38b-8809720972bd'
    and service_id = (select id from public.services where category = 'Venue' and status = 'active' order by base_price limit 1)
);
insert into public.user_plan_items (user_id, item_type, service_id, plan_id, status, unit_price, currency, accepted_at)
select '908c86b1-ed30-41d8-a38b-8809720972bd', 'service',
  (select id from public.services where category = 'Váy Cưới' and status = 'active' order by base_price limit 1),
  null, 'accepted', 9000000, 'VND', now() - interval '1 day'
where not exists (
  select 1 from public.user_plan_items
  where user_id = '908c86b1-ed30-41d8-a38b-8809720972bd'
    and service_id = (select id from public.services where category = 'Váy Cưới' and status = 'active' order by base_price limit 1)
);
insert into public.user_plan_items (user_id, item_type, service_id, plan_id, status, unit_price, currency, accepted_at)
select '908c86b1-ed30-41d8-a38b-8809720972bd', 'plan', null,
  '10000000-0000-0000-0000-000000000001', 'accepted', 60000000, 'VND', now() - interval '1 day'
where not exists (
  select 1 from public.user_plan_items
  where user_id = '908c86b1-ed30-41d8-a38b-8809720972bd'
    and plan_id = '10000000-0000-0000-0000-000000000001'
);
-- ---------------------------------------------------------------------------
-- Chat threads + messages
-- ---------------------------------------------------------------------------
insert into public.chat_threads (id, user_id, title, context_type, service_id, vendor_id)
values
  ('30000000-0000-0000-0000-000000000001', '908c86b1-ed30-41d8-a38b-8809720972bd', 'Tư vấn gói cưới', 'general', null, null),
  ('30000000-0000-0000-0000-000000000002', '908c86b1-ed30-41d8-a38b-8809720972bd', 'Hỏi về studio', 'service',
   (select id from public.services where category = 'Studio' and status = 'active' order by base_price limit 1), null)
on conflict (id) do nothing;
insert into public.chat_messages (id, thread_id, user_id, role, content, metadata, suggested_service_id, created_at)
values
  ('31000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '908c86b1-ed30-41d8-a38b-8809720972bd', 'user', 'Mình muốn cưới tầm 150 khách, chi phí khoảng 80 triệu.', '{}'::jsonb, null, now() - interval '3 days'),
  ('31000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '908c86b1-ed30-41d8-a38b-8809720972bd', 'assistant', 'Mình gợi ý Gói Cưới Cổ Điển phù hợp với 100-180 khách và ngân sách 60-90 triệu nhé.', '{}'::jsonb, null, now() - interval '3 days'),
  ('31000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '908c86b1-ed30-41d8-a38b-8809720972bd', 'user', 'Gói chụp studio giá nào ổn nhất?', '{}'::jsonb, null, now() - interval '2 days')
on conflict (id) do nothing;
-- ---------------------------------------------------------------------------
-- Service requests (lead pipeline used by BI metrics)
-- ---------------------------------------------------------------------------
insert into public.service_requests (id, user_id, vendor_id, service_id, event_date, budget_min, budget_max, message, status)
values
  ('40000000-0000-0000-0000-000000000001', '908c86b1-ed30-41d8-a38b-8809720972bd',
   (select vendor_id from public.services where category = 'Venue' and status = 'active' order by base_price limit 1),
   (select id from public.services where category = 'Venue' and status = 'active' order by base_price limit 1),
    '2026-12-20', 50000000, 80000000, 'Cần tổ chức đám cưới 150 khách.', 'new'),
  ('40000000-0000-0000-0000-000000000002', '908c86b1-ed30-41d8-a38b-8809720972bd',
   (select vendor_id from public.services where category = 'Studio' and status = 'active' order by base_price limit 1),
   (select id from public.services where category = 'Studio' and status = 'active' order by base_price limit 1),
    '2026-12-05', 10000000, 20000000, 'Chụp ảnh cưới trọn gói.', 'booked'),
  ('40000000-0000-0000-0000-000000000003', '908c86b1-ed30-41d8-a38b-8809720972bd',
   (select vendor_id from public.services where category = 'Váy Cưới' and status = 'active' order by base_price limit 1),
   (select id from public.services where category = 'Váy Cưới' and status = 'active' order by base_price limit 1),
    '2026-11-18', 8000000, 15000000, 'Muốn xem váy cưới nhập khẩu.', 'cancelled')
on conflict (id) do nothing;
-- ---------------------------------------------------------------------------
-- Content: posts, comments, likes
-- ---------------------------------------------------------------------------
insert into public.posts (id, user_id, title, content, cover_image_url, status, views_count)
values
  ('50000000-0000-0000-0000-000000000001', '908c86b1-ed30-41d8-a38b-8809720972bd', 'Cẩm nang chọn ngày cưới', 'Kinh nghiệm chọn ngày đẹp và thời tiết cho đám cưới.', 'https://images.example.test/posts/date.jpg', 'published', 120),
  ('50000000-0000-0000-0000-000000000002', '908c86b1-ed30-41d8-a38b-8809720972bd', 'Checklist đám cưới 6 tháng', 'Danh sách việc cần làm trước ngày cưới 6 tháng.', 'https://images.example.test/posts/checklist.jpg', 'published', 84)
on conflict (id) do nothing;
insert into public.post_comments (id, post_id, user_id, content, status)
values
  ('51000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '908c86b1-ed30-41d8-a38b-8809720972bd', 'Bài viết rất hữu ích, cảm ơn bạn!', 'published'),
  ('51000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', '908c86b1-ed30-41d8-a38b-8809720972bd', 'Mình đã save lại checklist.', 'published')
on conflict (id) do nothing;
insert into public.post_likes (post_id, user_id)
values
  ('50000000-0000-0000-0000-000000000001', '908c86b1-ed30-41d8-a38b-8809720972bd'),
  ('50000000-0000-0000-0000-000000000002', '908c86b1-ed30-41d8-a38b-8809720972bd')
on conflict (post_id, user_id) do nothing;

-- This post exists in the legacy dataset but not in a clean CLI database.
insert into public.post_likes (post_id, user_id)
select
  '4911c7bb-f9cf-4507-b807-da1b8003e7ca',
  '908c86b1-ed30-41d8-a38b-8809720972bd'
where exists (
  select 1 from public.posts
  where id = '4911c7bb-f9cf-4507-b807-da1b8003e7ca'
)
on conflict (post_id, user_id) do nothing;
-- ---------------------------------------------------------------------------
-- Favorites
-- ---------------------------------------------------------------------------
insert into public.user_favorite_services (user_id, service_id, saved_at)
select '908c86b1-ed30-41d8-a38b-8809720972bd', s.id, now()
from public.services s
where s.status = 'active'
  and s.category in ('Venue', 'Studio', 'Váy Cưới')
  and s.id in (
    select id from public.services where category = s.category and status = 'active' order by base_price limit 1
  )
on conflict (user_id, service_id) do nothing;
-- ---------------------------------------------------------------------------
-- Journey + vouchers
-- ---------------------------------------------------------------------------
insert into public.user_journey_tasks (user_id, task_id, status, completed_at)
select '908c86b1-ed30-41d8-a38b-8809720972bd', t.id, 'completed', now() - interval '5 days'
from public.journey_tasks t
order by t.display_order
limit 2
on conflict (user_id, task_id) do nothing;
insert into public.vouchers (id, code, title, description, discount_type, discount_value, min_order_value, active)
values
  ('60000000-0000-0000-0000-000000000001', 'SEED_WEDDING_10', 'Giảm 10% gói cưới', 'Dùng cho gói cưới trên 30 triệu.', 'percent', 10, 30000000, true),
  ('60000000-0000-0000-0000-000000000002', 'SEED_PHOTO_2M', 'Giảm 2 triệu gói chụp ảnh', 'Áp dụng cho gói Studio.', 'fixed', 2000000, 10000000, true)
on conflict (id) do nothing;
insert into public.user_vouchers (user_id, voucher_id, status, unlocked_at)
values
  ('908c86b1-ed30-41d8-a38b-8809720972bd', '60000000-0000-0000-0000-000000000001', 'unlocked', now()),
  ('908c86b1-ed30-41d8-a38b-8809720972bd', '60000000-0000-0000-0000-000000000002', 'unlocked', now())
on conflict (user_id, voucher_id) do nothing;
commit;
