-- Clean, schema-only baseline for the canonical LOMAR v2 database.
-- The original objects were created through legacy SQL Editor scripts, while
-- active migrations start by altering them. Fresh CLI resets need them first.

begin;

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  username text unique,
  full_name text,
  email text,
  avatar_url text,
  role text not null default 'customer',
  onboarding_status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('customer', 'vendor_admin', 'admin')),
  constraint profiles_onboarding_status_check
    check (onboarding_status in ('new', 'active', 'completed'))
);

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  name text not null,
  slug text not null unique,
  category text not null,
  description text,
  address text,
  city text,
  phone text,
  email text,
  website_url text,
  image_url text,
  rating_avg numeric(3,2) not null default 0 check (rating_avg between 0 and 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  status text not null default 'active' check (status in ('draft', 'active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendors_v2_owner_id_fkey
    foreign key (owner_id) references public.profiles(id) on delete set null
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  category text not null,
  name text not null,
  description text,
  base_price numeric(12,2) not null check (base_price >= 0),
  currency text not null default 'VND',
  thumbnail_url text,
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index services_vendor_id_idx on public.services(vendor_id);
create index services_category_idx on public.services(category);

create table public.service_images (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  image_url text not null,
  alt_text text,
  is_main boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);
create unique index one_main_image_per_service
  on public.service_images(service_id) where is_main = true;

create table public.user_favorite_services (
  user_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, service_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  status text not null default 'published' check (status in ('published', 'hidden', 'flagged')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint review_target_check check (vendor_id is not null or service_id is not null)
);
create unique index one_review_per_user_service
  on public.reviews(user_id, service_id) where service_id is not null;

create table public.journey_tasks (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_mandatory boolean not null default false,
  display_order integer not null default 0,
  active boolean not null default true
);

create table public.user_journey_tasks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid not null references public.journey_tasks(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, task_id)
);

create table public.vouchers (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  code text not null unique,
  title text not null,
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  min_order_value numeric(12,2),
  required_task_id uuid references public.journey_tasks(id) on delete set null,
  starts_at timestamptz,
  expires_at timestamptz,
  max_redemptions integer,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.user_vouchers (
  user_id uuid not null references public.profiles(id) on delete cascade,
  voucher_id uuid not null references public.vouchers(id) on delete cascade,
  status text not null default 'locked'
    check (status in ('locked', 'unlocked', 'redeemed', 'expired')),
  unlocked_at timestamptz,
  redeemed_at timestamptz,
  primary key (user_id, voucher_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  content text not null,
  cover_image_url text,
  views_count integer not null default 0 check (views_count >= 0),
  status text not null default 'published' check (status in ('draft', 'published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.post_comments(id) on delete cascade,
  content text not null,
  status text not null default 'published' check (status in ('published', 'hidden', 'flagged')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);
create table public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followee_type text not null check (followee_type in ('user', 'vendor')),
  followee_user_id uuid references public.profiles(id) on delete cascade,
  followee_vendor_id uuid references public.vendors(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint follows_single_target_chk check (
    (followee_type = 'user' and followee_user_id is not null and followee_vendor_id is null)
    or (followee_type = 'vendor' and followee_vendor_id is not null and followee_user_id is null)
  ),
  constraint follows_no_self_follow_chk
    check (followee_user_id is null or followee_user_id <> follower_id)
);

create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  context_type text not null default 'general'
    check (context_type in ('general', 'design', 'service', 'vendor')),
  design_project_id uuid,
  service_id uuid references public.services(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_design_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  title text not null default 'Untitled design',
  category text not null,
  bride_image_url text,
  groom_image_url text,
  reference_image_url text,
  selected_generation_id uuid,
  status text not null default 'draft'
    check (status in ('draft', 'generating', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.chat_threads
  add constraint chat_threads_design_project_fk
  foreign key (design_project_id) references public.ai_design_projects(id) on delete set null;

create table public.ai_design_generations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.ai_design_projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt text not null,
  negative_prompt text,
  model_name text not null,
  input_payload jsonb not null default '{}'::jsonb,
  output_image_url text,
  output_metadata jsonb not null default '{}'::jsonb,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  error_message text,
  cost_estimate numeric(12,4),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
alter table public.ai_design_projects
  add constraint ai_design_projects_selected_generation_fk
  foreign key (selected_generation_id) references public.ai_design_generations(id) on delete set null;

create table public.ai_design_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.ai_design_projects(id) on delete cascade,
  generation_id uuid references public.ai_design_generations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  asset_type text not null
    check (asset_type in ('bride_input', 'groom_input', 'reference', 'generated_output', 'mask', 'other')),
  file_url text not null,
  mime_type text,
  width integer,
  height integer,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  suggested_service_id uuid references public.services(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  design_project_id uuid references public.ai_design_projects(id) on delete set null,
  event_date date,
  budget_min numeric(12,2),
  budget_max numeric(12,2),
  message text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'quoted', 'booked', 'cancelled', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.analytics_page_views (
  id uuid primary key,
  session_id uuid not null,
  visitor_id uuid not null,
  user_id uuid references auth.users(id) on delete set null,
  page_path text not null check (char_length(page_path) between 1 and 500),
  page_title text check (char_length(page_title) <= 300),
  referrer_host text check (char_length(referrer_host) <= 255),
  duration_seconds integer not null default 0 check (duration_seconds between 0 and 86400),
  max_scroll_percent smallint not null default 0 check (max_scroll_percent between 0 and 100),
  occurred_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS is enabled at baseline; later migrations install final core policies.
alter table public.profiles enable row level security;
alter table public.vendors enable row level security;
alter table public.services enable row level security;
alter table public.service_images enable row level security;
alter table public.user_favorite_services enable row level security;
alter table public.reviews enable row level security;
alter table public.journey_tasks enable row level security;
alter table public.user_journey_tasks enable row level security;
alter table public.vouchers enable row level security;
alter table public.user_vouchers enable row level security;
alter table public.posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;
alter table public.follows enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
alter table public.ai_design_projects enable row level security;
alter table public.ai_design_generations enable row level security;
alter table public.ai_design_assets enable row level security;
alter table public.service_requests enable row level security;
alter table public.analytics_page_views enable row level security;

create policy "Users can view own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Users can update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy "Public can view active vendors" on public.vendors
  for select to anon, authenticated using (status = 'active');
create policy "Public can view active services" on public.services
  for select to anon, authenticated using (status = 'active');

create policy "Users can manage own favorites" on public.user_favorite_services
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Public can view journey tasks" on public.journey_tasks
  for select to anon, authenticated using (true);
create policy "Users can manage own journey progress" on public.user_journey_tasks
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can manage own vouchers" on public.user_vouchers
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Public can view published posts" on public.posts
  for select to anon, authenticated using (status = 'published');
create policy "Authors can manage own posts" on public.posts
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Public can view published comments" on public.post_comments
  for select to anon, authenticated using (status = 'published');
create policy "Users can manage own comments" on public.post_comments
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Public can view post likes" on public.post_likes
  for select to anon, authenticated using (true);
create policy "Users can manage own likes" on public.post_likes
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can manage own chat threads" on public.chat_threads
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can manage own chat messages" on public.chat_messages
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can view own service requests" on public.service_requests
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own service requests" on public.service_requests
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own service requests" on public.service_requests
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- New public tables are not automatically exposed through the Data API.
grant select on public.vendors, public.services, public.journey_tasks,
  public.posts, public.post_comments, public.post_likes to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.user_favorite_services,
  public.user_journey_tasks, public.user_vouchers, public.chat_threads,
  public.chat_messages to authenticated;
grant select, insert, update on public.service_requests to authenticated;

commit;
