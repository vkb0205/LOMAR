-- ============================================================================
-- LORMAR Schema Migration: v1 (option-based) → v2 (AI-first, multi-user)
-- ============================================================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- Apply changes from new_data_schema.md → DATA_Schema.md v2
-- ============================================================================
-- ORDER: 1) Create _v2 tables first (refs point to new tables)
--        2) Migrate data
--        3) Rename old→_old, _v2→canonical
--        4) Verify, then optionally drop old
-- ============================================================================

-- ============================================================================
-- Extensions (enabled FIRST so gen_random_uuid() / gen_random_bytes() are
-- available to table defaults in SECTION 1 and data migration in SECTION 3)
-- ============================================================================
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ============================================================================
-- SECTION 1: Create NEW _v2 tables (all FKs point to _v2 or new tables)
-- ============================================================================

-- 1a. vendors_v2 (strengthened v2 — created FIRST since services depends on it)
create table if not exists vendors_v2 (
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
  rating_count int not null default 0 check (rating_count >= 0),
  status text not null default 'active' check (status in ('draft','active','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1b. profiles (replaces users, linked to auth.users)
-- NOTE: We create profiles with a standalone PK first (no FK to auth.users yet)
-- so we can insert placeholder profiles for legacy data migration.
-- After auth is set up, the FK can be added: ALTER TABLE profiles ADD CONSTRAINT ... REFERENCES auth.users(id)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  username text unique,
  full_name text,
  email text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer','vendor_admin','admin')),
  onboarding_status text not null default 'new' check (onboarding_status in ('new','active','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add owner FK for vendors_v2 now that profiles exists
alter table vendors_v2 add column if not exists owner_id uuid references profiles(id) on delete set null;

-- 1c. services (replaces products — references vendors_v2)
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors_v2(id) on delete cascade,
  category text not null,
  name text not null,
  description text,
  base_price numeric(12,2) not null check (base_price >= 0),
  currency text not null default 'VND',
  thumbnail_url text,
  status text not null default 'active' check (status in ('draft','active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists services_vendor_id_idx on services(vendor_id);
create index if not exists services_category_idx on services(category);

-- 1d. service_images (replaces product_images)
create table if not exists service_images (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  image_url text not null,
  alt_text text,
  is_main boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists one_main_image_per_service
  on service_images(service_id) where is_main = true;

-- 1e. user_favorite_services (replaces user_favorite_products)
create table if not exists user_favorite_services (
  user_id uuid not null references profiles(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, service_id)
);

-- 1f. reviews_v2 (strengthened — references vendors_v2, services)
create table if not exists reviews_v2 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  vendor_id uuid references vendors_v2(id) on delete cascade,
  service_id uuid references services(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  status text not null default 'published' check (status in ('published','hidden','flagged')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint review_target_check check (vendor_id is not null or service_id is not null)
);
create unique index if not exists one_review_per_user_service
  on reviews_v2(user_id, service_id) where service_id is not null;

-- 1g. journey_tasks (replaces task_dictionary)
create table if not exists journey_tasks (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_mandatory boolean not null default false,
  display_order int not null default 0,
  active boolean not null default true
);

-- 1h. user_journey_tasks_v2 (composite PK — references profiles, journey_tasks)
create table if not exists user_journey_tasks_v2 (
  user_id uuid not null references profiles(id) on delete cascade,
  task_id uuid not null references journey_tasks(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','in_progress','completed','skipped')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, task_id)
);

-- 1i. vouchers_v2 (strengthened)
create table if not exists vouchers_v2 (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references vendors_v2(id) on delete cascade,
  code text not null unique,
  title text not null,
  description text,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  min_order_value numeric(12,2),
  required_task_id uuid references journey_tasks(id) on delete set null,
  starts_at timestamptz,
  expires_at timestamptz,
  max_redemptions int,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 1j. user_vouchers_v2 (composite PK)
create table if not exists user_vouchers_v2 (
  user_id uuid not null references profiles(id) on delete cascade,
  voucher_id uuid not null references vouchers_v2(id) on delete cascade,
  status text not null default 'locked' check (status in ('locked','unlocked','redeemed','expired')),
  unlocked_at timestamptz,
  redeemed_at timestamptz,
  primary key (user_id, voucher_id)
);

-- 1k. posts_v2 (strengthened)
create table if not exists posts_v2 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text,
  content text not null,
  cover_image_url text,
  views_count int not null default 0 check (views_count >= 0),
  status text not null default 'published' check (status in ('draft','published','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1l. post_comments_v2 (with nested replies)
create table if not exists post_comments_v2 (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts_v2(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  parent_comment_id uuid references post_comments_v2(id) on delete cascade,
  content text not null,
  status text not null default 'published' check (status in ('published','hidden','flagged')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1m. post_likes_v2 (composite PK)
create table if not exists post_likes_v2 (
  post_id uuid not null references posts_v2(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- 1n. tags_v2 (adds slug)
create table if not exists tags_v2 (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

-- 1o. post_tags_v2
create table if not exists post_tags_v2 (
  post_id uuid not null references posts_v2(id) on delete cascade,
  tag_id uuid not null references tags_v2(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- 1p. chat_threads (new — groups messages)
-- Must be created BEFORE ai_design_projects? No, ai_design_projects FK comes first.
create table if not exists chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text,
  context_type text not null default 'general' check (context_type in ('general','design','service','vendor')),
  design_project_id uuid, -- FK added after ai_design_projects created
  service_id uuid references services(id) on delete set null,
  vendor_id uuid references vendors_v2(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1q. ai_design_projects (replaces user_designs)
create table if not exists ai_design_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  title text not null default 'Untitled design',
  category text not null,
  bride_image_url text,
  groom_image_url text,
  reference_image_url text,
  selected_generation_id uuid, -- FK added after ai_design_generations
  status text not null default 'draft' check (status in ('draft','generating','completed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ai_design_projects_user_id_idx on ai_design_projects(user_id);

-- Add chat_threads FK to ai_design_projects
alter table chat_threads
  add constraint chat_threads_design_project_fk
  foreign key (design_project_id) references ai_design_projects(id) on delete set null;

-- 1r. ai_design_generations
create table if not exists ai_design_generations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references ai_design_projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  prompt text not null,
  negative_prompt text,
  model_name text not null,
  input_payload jsonb not null default '{}'::jsonb,
  output_image_url text,
  output_metadata jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','cancelled')),
  error_message text,
  cost_estimate numeric(12,4),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists ai_design_generations_project_id_idx on ai_design_generations(project_id);
create index if not exists ai_design_generations_user_id_idx on ai_design_generations(user_id);

-- Add FK for selected_generation (circular dependency resolved here)
alter table ai_design_projects drop constraint if exists ai_design_projects_selected_generation_fk;
alter table ai_design_projects
  add constraint ai_design_projects_selected_generation_fk
  foreign key (selected_generation_id)
  references ai_design_generations(id)
  on delete set null;

-- 1s. ai_design_assets
create table if not exists ai_design_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references ai_design_projects(id) on delete cascade,
  generation_id uuid references ai_design_generations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  asset_type text not null check (asset_type in ('bride_input','groom_input','reference','generated_output','mask','other')),
  file_url text not null,
  mime_type text,
  width int,
  height int,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

-- 1t. chat_messages_v2 (linked to threads)
create table if not exists chat_messages_v2 (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  suggested_service_id uuid references services(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_thread_id_created_at_idx
  on chat_messages_v2(thread_id, created_at);

-- 1u. service_requests (new — marketplace lead generation)
create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  vendor_id uuid not null references vendors_v2(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  design_project_id uuid references ai_design_projects(id) on delete set null,
  event_date date,
  budget_min numeric(12,2),
  budget_max numeric(12,2),
  message text,
  status text not null default 'new' check (status in ('new','contacted','quoted','booked','cancelled','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- SECTION 2: Enable UUID extension
-- ============================================================================
-- NOTE: Extension creation was moved to the TOP of this file (before SECTION 1)
--       so that gen_random_uuid() and gen_random_bytes() are available to table
--       defaults (SECTION 1) and data migration (SECTION 3) on a clean DB replay.

-- ============================================================================
-- SECTION 3: MIGRATE DATA from old tables to _v2 tables
-- ===========================================================================
-- NOTE: Old tables use varchar IDs (e.g. 'U01', 'P01'). The new schema
-- uses UUIDs. We generate new UUIDs and create mapping entries.
--
-- IMPORTANT: Step 3a MUST run first since all other migrations reference profiles.
-- ===========================================================================

-- 3a. Migrate users → profiles (MUST run before any profile-dependent migration)
-- Old users: id (varchar PK), username, email, avatar_url, is_new
do $$
declare
  rec record;
  inserted_id uuid;
  count_users int := 0;
begin
  -- Check if users table exists and has data
  if exists (select 1 from information_schema.tables where table_name = 'users' and table_schema = 'public') then
    for rec in select * from users loop
      insert into profiles (id, username, email, avatar_url, onboarding_status, created_at, updated_at)
      values (
        gen_random_uuid(),
        rec.username,
        rec.email,
        rec.avatar_url,
        case when rec.is_new then 'new' else 'active' end,
        now(),
        now()
      );
      count_users := count_users + 1;
    end loop;
    raise notice 'Migrated % users to profiles', count_users;
  end if;

  -- If no users were migrated, create a default placeholder profile
  -- so that other data migrations that depend on profiles.id have a valid target
  if not exists (select 1 from profiles) then
    insert into profiles (id, username, full_name, email, role, onboarding_status)
    values (
      gen_random_uuid(),
      'legacy',
      'Legacy User',
      'legacy@localhost',
      'customer',
      'active'
    );
    raise notice 'Created default legacy profile for data migration';
  end if;
end $$;

-- 3b. Migrate vendors → vendors_v2
do $$
declare
  rec record;
begin
  for rec in select * from vendors loop
    insert into vendors_v2 (id, name, slug, category, description, address, image_url, rating_avg, rating_count, status, created_at, updated_at)
    values (
      gen_random_uuid(),
      rec.name,
      coalesce(
        lower(regexp_replace(rec.name, '[^a-zA-Z0-9]+', '-', 'g')),
        'vendor-' || encode(gen_random_bytes(4), 'hex')
      ),
      rec.category,
      null,
      rec.address,
      rec.image_url,
      coalesce(rec.rating::numeric(3,2), 0),
      0,
      'active',
      now(),
      now()
    )
    on conflict (slug) do
      update set name = excluded.name
      where vendors_v2.name is null;
  end loop;
end $$;

-- 3c. Migrate products → services (maps old vendor_id to new vendors_v2)
do $$
declare
  rec record;
  v_id uuid;
  v_slug text;
  v_count int := 0;
begin
  for rec in select * from products loop
    -- Find matching vendor slug from old products
    select v2.id, v2.slug into v_id, v_slug
    from vendors_v2 v2
    join vendors old on old.id = rec.vendor_id
    where v2.slug like coalesce(
      lower(regexp_replace(old.name, '[^a-zA-Z0-9]+', '-', 'g')),
      ''
    ) || '%'
    limit 1;

    -- Fallback: use first vendors_v2
    if v_id is null then
      select id into v_id from vendors_v2 limit 1;
    end if;

    insert into services (id, vendor_id, category, name, base_price, thumbnail_url, status, created_at, updated_at)
    values (
      gen_random_uuid(),
      coalesce(v_id, (select id from vendors_v2 limit 1)),
      rec.category,
      rec.name,
      coalesce(rec.price::numeric(12,2), 0),
      rec.image_url,
      'active',
      now(),
      now()
    );

    v_count := v_count + 1;
  end loop;

  raise notice 'Migrated % products to services', v_count;
end $$;

-- 3d. Migrate task_dictionary → journey_tasks
do $$
declare
  rec record;
begin
  for rec in select * from task_dictionary loop
    insert into journey_tasks (id, code, name, is_mandatory, active)
    values (
      gen_random_uuid(),
      'TASK_' || encode(gen_random_bytes(4), 'hex'),
      rec.name,
      coalesce(rec.is_mandatory, false),
      true
    );
  end loop;
end $$;

-- 3e. Migrate vouchers → vouchers_v2
-- Old discount_value is varchar (e.g. "20%", "50000 VND"), parse accordingly
do $$
declare
  rec record;
  parsed_val numeric(12,2);
  parsed_type text;
  cleaned text;
begin
  for rec in select * from vouchers loop
    cleaned := trim(rec.discount_value);

    -- Detect type by looking at the raw string
    if cleaned ~ '^\s*[0-9.]+%' then
      -- Percent value: strip the % sign and any non-numeric chars
      parsed_val := coalesce(
        nullif(regexp_replace(cleaned, '[^0-9.]', '', 'g'), '')::numeric(12,2),
        0
      );
      parsed_type := 'percent';
    elsif cleaned ~ '^\s*[0-9.]+' then
      -- Pure numeric (possibly with commas, spaces, or currency prefix)
      parsed_val := coalesce(
        nullif(regexp_replace(cleaned, '[^0-9.]', '', 'g'), '')::numeric(12,2),
        0
      );
      parsed_type := 'fixed';
    else
      -- Can't parse anything meaningful
      parsed_val := 0;
      parsed_type := 'fixed';
    end if;

    if parsed_val = 0 and cleaned != '' and cleaned !~ '^\s*$' then
      raise notice 'Could not parse discount_value: "%" for voucher %', cleaned, rec.title;
    end if;

    insert into vouchers_v2 (id, title, discount_type, discount_value, code, active, created_at)
    values (
      gen_random_uuid(),
      rec.title,
      parsed_type,
      parsed_val,
      'VCH_' || encode(gen_random_bytes(4), 'hex'),
      true,
      now()
    );
  end loop;
end $$;

-- 3f. Migrate posts → posts_v2
-- Uses the legacy profile (first one) since old posts don't have real user mappings
do $$
declare
  rec record;
  legacy_profile_id uuid;
begin
  select id into legacy_profile_id from profiles order by created_at asc limit 1;

  for rec in select * from posts loop
    insert into posts_v2 (id, user_id, content, views_count, status, created_at, updated_at)
    values (
      gen_random_uuid(),
      legacy_profile_id,
      rec.content,
      coalesce(rec.views_count, 0),
      'published',
      coalesce(rec.created_at, now()),
      now()
    );
  end loop;
end $$;

-- 3g. Migrate tags → tags_v2
do $$
declare
  rec record;
begin
  for rec in select * from tags loop
    insert into tags_v2 (id, name, slug)
    values (
      gen_random_uuid(),
      rec.name,
      coalesce(
        lower(regexp_replace(rec.name, '[^a-zA-Z0-9]+', '-', 'g')),
        'tag-' || encode(gen_random_bytes(4), 'hex')
      )
    )
    on conflict (name) do nothing;
  end loop;
end $$;

-- ============================================================================
-- SECTION 4: RENAME tables
-- ============================================================================
-- Old tables → _old suffix
-- _v2 tables → canonical names
-- ===========================================================================

do $$
begin
  -- 4a. users → profiles (profiles already exists, just rename old)
  if exists (select 1 from information_schema.tables where table_name = 'users' and table_schema = 'public') then
    alter table if exists users rename to users_old;
  end if;

  -- 4b. vendors rename chain
  if exists (select 1 from information_schema.tables where table_name = 'vendors' and table_schema = 'public')
     and not exists (select 1 from information_schema.tables where table_name = 'vendors_old' and table_schema = 'public') then
    alter table if exists vendors rename to vendors_old;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'vendors_v2' and table_schema = 'public') then
    alter table if exists vendors_v2 rename to vendors;
  end if;

  -- 4c. products → services
  if exists (select 1 from information_schema.tables where table_name = 'products' and table_schema = 'public') then
    alter table if exists products rename to products_old;
  end if;

  -- 4d. product_images
  if exists (select 1 from information_schema.tables where table_name = 'product_images' and table_schema = 'public') then
    alter table if exists product_images rename to product_images_old;
  end if;

  -- 4e. user_favorite_products
  if exists (select 1 from information_schema.tables where table_name = 'user_favorite_products' and table_schema = 'public') then
    alter table if exists user_favorite_products rename to user_favorite_products_old;
  end if;

  -- 4f. reviews rename chain
  if exists (select 1 from information_schema.tables where table_name = 'reviews' and table_schema = 'public')
     and not exists (select 1 from information_schema.tables where table_name = 'reviews_old' and table_schema = 'public') then
    alter table if exists reviews rename to reviews_old;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'reviews_v2' and table_schema = 'public') then
    alter table if exists reviews_v2 rename to reviews;
  end if;

  -- 4g. task_dictionary
  if exists (select 1 from information_schema.tables where table_name = 'task_dictionary' and table_schema = 'public') then
    alter table if exists task_dictionary rename to task_dictionary_old;
  end if;

  -- 4h. user_journey_tasks rename chain
  if exists (select 1 from information_schema.tables where table_name = 'user_journey_tasks' and table_schema = 'public')
     and not exists (select 1 from information_schema.tables where table_name = 'user_journey_tasks_old' and table_schema = 'public') then
    alter table if exists user_journey_tasks rename to user_journey_tasks_old;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'user_journey_tasks_v2' and table_schema = 'public') then
    alter table if exists user_journey_tasks_v2 rename to user_journey_tasks;
  end if;

  -- 4i. vouchers rename chain
  if exists (select 1 from information_schema.tables where table_name = 'vouchers' and table_schema = 'public')
     and not exists (select 1 from information_schema.tables where table_name = 'vouchers_old' and table_schema = 'public') then
    alter table if exists vouchers rename to vouchers_old;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'vouchers_v2' and table_schema = 'public') then
    alter table if exists vouchers_v2 rename to vouchers;
  end if;

  -- 4j. user_vouchers rename chain
  if exists (select 1 from information_schema.tables where table_name = 'user_vouchers' and table_schema = 'public')
     and not exists (select 1 from information_schema.tables where table_name = 'user_vouchers_old' and table_schema = 'public') then
    alter table if exists user_vouchers rename to user_vouchers_old;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'user_vouchers_v2' and table_schema = 'public') then
    alter table if exists user_vouchers_v2 rename to user_vouchers;
  end if;

  -- 4k. posts rename chain
  if exists (select 1 from information_schema.tables where table_name = 'posts' and table_schema = 'public')
     and not exists (select 1 from information_schema.tables where table_name = 'posts_old' and table_schema = 'public') then
    alter table if exists posts rename to posts_old;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'posts_v2' and table_schema = 'public') then
    alter table if exists posts_v2 rename to posts;
  end if;

  -- 4l. post_comments rename chain
  if exists (select 1 from information_schema.tables where table_name = 'post_comments' and table_schema = 'public')
     and not exists (select 1 from information_schema.tables where table_name = 'post_comments_old' and table_schema = 'public') then
    alter table if exists post_comments rename to post_comments_old;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'post_comments_v2' and table_schema = 'public') then
    alter table if exists post_comments_v2 rename to post_comments;
  end if;

  -- 4m. post_likes rename chain
  if exists (select 1 from information_schema.tables where table_name = 'post_likes' and table_schema = 'public')
     and not exists (select 1 from information_schema.tables where table_name = 'post_likes_old' and table_schema = 'public') then
    alter table if exists post_likes rename to post_likes_old;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'post_likes_v2' and table_schema = 'public') then
    alter table if exists post_likes_v2 rename to post_likes;
  end if;

  -- 4n. tags rename chain
  if exists (select 1 from information_schema.tables where table_name = 'tags' and table_schema = 'public')
     and not exists (select 1 from information_schema.tables where table_name = 'tags_old' and table_schema = 'public') then
    alter table if exists tags rename to tags_old;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'tags_v2' and table_schema = 'public') then
    alter table if exists tags_v2 rename to tags;
  end if;

  -- 4o. post_tags rename chain
  if exists (select 1 from information_schema.tables where table_name = 'post_tags' and table_schema = 'public')
     and not exists (select 1 from information_schema.tables where table_name = 'post_tags_old' and table_schema = 'public') then
    alter table if exists post_tags rename to post_tags_old;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'post_tags_v2' and table_schema = 'public') then
    alter table if exists post_tags_v2 rename to post_tags;
  end if;

  -- 4p. chat_messages rename chain
  if exists (select 1 from information_schema.tables where table_name = 'chat_messages' and table_schema = 'public')
     and not exists (select 1 from information_schema.tables where table_name = 'chat_messages_old' and table_schema = 'public') then
    alter table if exists chat_messages rename to chat_messages_old;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'chat_messages_v2' and table_schema = 'public') then
    alter table if exists chat_messages_v2 rename to chat_messages;
  end if;
end $$;

-- ============================================================================
-- SECTION 5: Enable RLS on ALL tables
-- ============================================================================
alter table if exists profiles enable row level security;
alter table if exists vendors enable row level security;
alter table if exists services enable row level security;
alter table if exists service_images enable row level security;
alter table if exists user_favorite_services enable row level security;
alter table if exists reviews enable row level security;
alter table if exists journey_tasks enable row level security;
alter table if exists user_journey_tasks enable row level security;
alter table if exists vouchers enable row level security;
alter table if exists user_vouchers enable row level security;
alter table if exists posts enable row level security;
alter table if exists post_comments enable row level security;
alter table if exists post_likes enable row level security;
alter table if exists tags enable row level security;
alter table if exists post_tags enable row level security;
alter table if exists chat_threads enable row level security;
alter table if exists chat_messages enable row level security;
alter table if exists ai_design_projects enable row level security;
alter table if exists ai_design_generations enable row level security;
alter table if exists ai_design_assets enable row level security;
alter table if exists service_requests enable row level security;

-- ============================================================================
-- SECTION 6: Basic RLS policies
-- ============================================================================

-- Profiles: users can read/update own
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Services: public can read active
drop policy if exists "Public can view active services" on services;
create policy "Public can view active services" on services
  for select using (status = 'active');

-- Vendors: public can read active, owners can modify
drop policy if exists "Public can view active vendors" on vendors;
create policy "Public can view active vendors" on vendors
  for select using (status = 'active');

-- Posts: public can read published
drop policy if exists "Public can view published posts" on posts;
create policy "Public can view published posts" on posts
  for select using (status = 'published');

-- ============================================================================
-- SECTION 6b: Complete CRUD policies (Stage 4 — fix/supabase-auth-rls)
-- ============================================================================
-- Ownership model:
--   * profiles.id == auth.uid() (profiles PK is the auth user UUID).
--   * All user-owned tables carry a user_id uuid REFERENCES profiles(id),
--     so ownership is enforced with: auth.uid() = user_id.
--   * Vendor-scoped tables (services, service_images, vouchers) resolve the
--     owner through vendors.owner_id via an EXISTS sub-select.
-- Every statement is replay-safe: drop policy if exists ... ; create policy ...
-- RLS is (re)asserted below; Section 5 already enabled it, this is idempotent.
-- Least privilege: public SELECT only for public-facing content; all writes
-- are scoped to the owning auth.uid(). Reference/dictionary tables are public
-- read with no authenticated write path (managed via service_role/admin).
-- Existing Section 6 policies are preserved (permissive policies are OR'd).

-- Ensure RLS remains enabled on every table touched here (idempotent).
alter table if exists profiles enable row level security;
alter table if exists vendors enable row level security;
alter table if exists services enable row level security;
alter table if exists service_images enable row level security;
alter table if exists user_favorite_services enable row level security;
alter table if exists reviews enable row level security;
alter table if exists journey_tasks enable row level security;
alter table if exists user_journey_tasks enable row level security;
alter table if exists vouchers enable row level security;
alter table if exists user_vouchers enable row level security;
alter table if exists posts enable row level security;
alter table if exists post_comments enable row level security;
alter table if exists post_likes enable row level security;
alter table if exists tags enable row level security;
alter table if exists post_tags enable row level security;
alter table if exists chat_threads enable row level security;
alter table if exists chat_messages enable row level security;
alter table if exists ai_design_projects enable row level security;
alter table if exists ai_design_generations enable row level security;
alter table if exists ai_design_assets enable row level security;
alter table if exists service_requests enable row level security;

-- ----------------------------------------------------------------------------
-- profiles (owner column: id == auth.uid())
-- Section 6 already grants own SELECT + own UPDATE. Add own INSERT (needed by
-- the app's just-in-time profile provisioning) and own DELETE.
-- ----------------------------------------------------------------------------
drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);
drop policy if exists "Users can delete own profile" on profiles;
create policy "Users can delete own profile" on profiles
  for delete using (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- vendors (owner column: owner_id) — public read active (Section 6) + owner CRUD
-- ----------------------------------------------------------------------------
drop policy if exists "Owners can view own vendor" on vendors;
create policy "Owners can view own vendor" on vendors
  for select using (auth.uid() = owner_id);
drop policy if exists "Owners can insert own vendor" on vendors;
create policy "Owners can insert own vendor" on vendors
  for insert with check (auth.uid() = owner_id);
drop policy if exists "Owners can update own vendor" on vendors;
create policy "Owners can update own vendor" on vendors
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "Owners can delete own vendor" on vendors;
create policy "Owners can delete own vendor" on vendors
  for delete using (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- services (owner via vendors.owner_id) — public read active (Section 6) + owner CRUD
-- ----------------------------------------------------------------------------
drop policy if exists "Vendor owners can view own services" on services;
create policy "Vendor owners can view own services" on services
  for select using (
    exists (select 1 from vendors v where v.id = services.vendor_id and v.owner_id = auth.uid())
  );
drop policy if exists "Vendor owners can insert services" on services;
create policy "Vendor owners can insert services" on services
  for insert with check (
    exists (select 1 from vendors v where v.id = services.vendor_id and v.owner_id = auth.uid())
  );
drop policy if exists "Vendor owners can update services" on services;
create policy "Vendor owners can update services" on services
  for update using (
    exists (select 1 from vendors v where v.id = services.vendor_id and v.owner_id = auth.uid())
  ) with check (
    exists (select 1 from vendors v where v.id = services.vendor_id and v.owner_id = auth.uid())
  );
drop policy if exists "Vendor owners can delete services" on services;
create policy "Vendor owners can delete services" on services
  for delete using (
    exists (select 1 from vendors v where v.id = services.vendor_id and v.owner_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- service_images (owner via services -> vendors.owner_id)
-- Public can view images belonging to active services; vendor owners manage.
-- ----------------------------------------------------------------------------
drop policy if exists "Public can view active service images" on service_images;
create policy "Public can view active service images" on service_images
  for select using (
    exists (select 1 from services s where s.id = service_images.service_id and s.status = 'active')
  );
drop policy if exists "Vendor owners can view own service images" on service_images;
create policy "Vendor owners can view own service images" on service_images
  for select using (
    exists (
      select 1 from services s
      join vendors v on v.id = s.vendor_id
      where s.id = service_images.service_id and v.owner_id = auth.uid()
    )
  );
drop policy if exists "Vendor owners can insert service images" on service_images;
create policy "Vendor owners can insert service images" on service_images
  for insert with check (
    exists (
      select 1 from services s
      join vendors v on v.id = s.vendor_id
      where s.id = service_images.service_id and v.owner_id = auth.uid()
    )
  );
drop policy if exists "Vendor owners can update service images" on service_images;
create policy "Vendor owners can update service images" on service_images
  for update using (
    exists (
      select 1 from services s
      join vendors v on v.id = s.vendor_id
      where s.id = service_images.service_id and v.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from services s
      join vendors v on v.id = s.vendor_id
      where s.id = service_images.service_id and v.owner_id = auth.uid()
    )
  );
drop policy if exists "Vendor owners can delete service images" on service_images;
create policy "Vendor owners can delete service images" on service_images
  for delete using (
    exists (
      select 1 from services s
      join vendors v on v.id = s.vendor_id
      where s.id = service_images.service_id and v.owner_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- user_favorite_services (owner column: user_id) — private, owner CRUD
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view own favorites" on user_favorite_services;
create policy "Users can view own favorites" on user_favorite_services
  for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own favorites" on user_favorite_services;
create policy "Users can insert own favorites" on user_favorite_services
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own favorites" on user_favorite_services;
create policy "Users can update own favorites" on user_favorite_services
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own favorites" on user_favorite_services;
create policy "Users can delete own favorites" on user_favorite_services
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- reviews (owner column: user_id) — public read published + owner CRUD
-- ----------------------------------------------------------------------------
drop policy if exists "Public can view published reviews" on reviews;
create policy "Public can view published reviews" on reviews
  for select using (status = 'published');
drop policy if exists "Users can view own reviews" on reviews;
create policy "Users can view own reviews" on reviews
  for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own reviews" on reviews;
create policy "Users can insert own reviews" on reviews
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own reviews" on reviews;
create policy "Users can update own reviews" on reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own reviews" on reviews;
create policy "Users can delete own reviews" on reviews
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- journey_tasks (reference/dictionary) — public read; no authenticated writes
-- ----------------------------------------------------------------------------
drop policy if exists "Public can view journey tasks" on journey_tasks;
create policy "Public can view journey tasks" on journey_tasks
  for select using (true);

-- ----------------------------------------------------------------------------
-- user_journey_tasks (owner column: user_id) — private, owner CRUD
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view own journey progress" on user_journey_tasks;
create policy "Users can view own journey progress" on user_journey_tasks
  for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own journey progress" on user_journey_tasks;
create policy "Users can insert own journey progress" on user_journey_tasks
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own journey progress" on user_journey_tasks;
create policy "Users can update own journey progress" on user_journey_tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own journey progress" on user_journey_tasks;
create policy "Users can delete own journey progress" on user_journey_tasks
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- vouchers (owner via vendors.owner_id) — public read active + vendor-owner CRUD
-- (vouchers with null vendor_id are platform-managed via service_role/admin.)
-- ----------------------------------------------------------------------------
drop policy if exists "Public can view active vouchers" on vouchers;
create policy "Public can view active vouchers" on vouchers
  for select using (active = true);
drop policy if exists "Vendor owners can view own vouchers" on vouchers;
create policy "Vendor owners can view own vouchers" on vouchers
  for select using (
    exists (select 1 from vendors v where v.id = vouchers.vendor_id and v.owner_id = auth.uid())
  );
drop policy if exists "Vendor owners can insert vouchers" on vouchers;
create policy "Vendor owners can insert vouchers" on vouchers
  for insert with check (
    exists (select 1 from vendors v where v.id = vouchers.vendor_id and v.owner_id = auth.uid())
  );
drop policy if exists "Vendor owners can update vouchers" on vouchers;
create policy "Vendor owners can update vouchers" on vouchers
  for update using (
    exists (select 1 from vendors v where v.id = vouchers.vendor_id and v.owner_id = auth.uid())
  ) with check (
    exists (select 1 from vendors v where v.id = vouchers.vendor_id and v.owner_id = auth.uid())
  );
drop policy if exists "Vendor owners can delete vouchers" on vouchers;
create policy "Vendor owners can delete vouchers" on vouchers
  for delete using (
    exists (select 1 from vendors v where v.id = vouchers.vendor_id and v.owner_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- user_vouchers (owner column: user_id) — private, owner CRUD
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view own vouchers" on user_vouchers;
create policy "Users can view own vouchers" on user_vouchers
  for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own vouchers" on user_vouchers;
create policy "Users can insert own vouchers" on user_vouchers
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own vouchers" on user_vouchers;
create policy "Users can update own vouchers" on user_vouchers
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own vouchers" on user_vouchers;
create policy "Users can delete own vouchers" on user_vouchers
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- posts (owner column: user_id) — public read published (Section 6) + owner CRUD
-- Owner SELECT lets authors also see their own drafts/hidden posts.
-- ----------------------------------------------------------------------------
drop policy if exists "Authors can view own posts" on posts;
create policy "Authors can view own posts" on posts
  for select using (auth.uid() = user_id);
drop policy if exists "Authors can insert own posts" on posts;
create policy "Authors can insert own posts" on posts
  for insert with check (auth.uid() = user_id);
drop policy if exists "Authors can update own posts" on posts;
create policy "Authors can update own posts" on posts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Authors can delete own posts" on posts;
create policy "Authors can delete own posts" on posts
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- post_comments (owner column: user_id) — public read published + owner CRUD
-- ----------------------------------------------------------------------------
drop policy if exists "Public can view published comments" on post_comments;
create policy "Public can view published comments" on post_comments
  for select using (status = 'published');
drop policy if exists "Users can view own comments" on post_comments;
create policy "Users can view own comments" on post_comments
  for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own comments" on post_comments;
create policy "Users can insert own comments" on post_comments
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own comments" on post_comments;
create policy "Users can update own comments" on post_comments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own comments" on post_comments;
create policy "Users can delete own comments" on post_comments
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- post_likes (owner column: user_id) — public read (like counts) + owner write
-- ----------------------------------------------------------------------------
drop policy if exists "Public can view post likes" on post_likes;
create policy "Public can view post likes" on post_likes
  for select using (true);
drop policy if exists "Users can insert own likes" on post_likes;
create policy "Users can insert own likes" on post_likes
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can delete own likes" on post_likes;
create policy "Users can delete own likes" on post_likes
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- tags (reference/dictionary) — public read; no authenticated writes
-- ----------------------------------------------------------------------------
drop policy if exists "Public can view tags" on tags;
create policy "Public can view tags" on tags
  for select using (true);

-- ----------------------------------------------------------------------------
-- post_tags (junction) — readable with published posts; managed by post author
-- ----------------------------------------------------------------------------
drop policy if exists "Public can view tags of published posts" on post_tags;
create policy "Public can view tags of published posts" on post_tags
  for select using (
    exists (select 1 from posts p where p.id = post_tags.post_id and p.status = 'published')
  );
drop policy if exists "Authors can view own post tags" on post_tags;
create policy "Authors can view own post tags" on post_tags
  for select using (
    exists (select 1 from posts p where p.id = post_tags.post_id and p.user_id = auth.uid())
  );
drop policy if exists "Authors can insert own post tags" on post_tags;
create policy "Authors can insert own post tags" on post_tags
  for insert with check (
    exists (select 1 from posts p where p.id = post_tags.post_id and p.user_id = auth.uid())
  );
drop policy if exists "Authors can delete own post tags" on post_tags;
create policy "Authors can delete own post tags" on post_tags
  for delete using (
    exists (select 1 from posts p where p.id = post_tags.post_id and p.user_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- chat_threads (owner column: user_id) — private, owner CRUD
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view own chat threads" on chat_threads;
create policy "Users can view own chat threads" on chat_threads
  for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own chat threads" on chat_threads;
create policy "Users can insert own chat threads" on chat_threads
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own chat threads" on chat_threads;
create policy "Users can update own chat threads" on chat_threads
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own chat threads" on chat_threads;
create policy "Users can delete own chat threads" on chat_threads
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- chat_messages (owner column: user_id) — private, owner CRUD
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view own chat messages" on chat_messages;
create policy "Users can view own chat messages" on chat_messages
  for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own chat messages" on chat_messages;
create policy "Users can insert own chat messages" on chat_messages
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own chat messages" on chat_messages;
create policy "Users can update own chat messages" on chat_messages
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own chat messages" on chat_messages;
create policy "Users can delete own chat messages" on chat_messages
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- ai_design_projects (owner column: user_id) — private, owner CRUD
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view own design projects" on ai_design_projects;
create policy "Users can view own design projects" on ai_design_projects
  for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own design projects" on ai_design_projects;
create policy "Users can insert own design projects" on ai_design_projects
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own design projects" on ai_design_projects;
create policy "Users can update own design projects" on ai_design_projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own design projects" on ai_design_projects;
create policy "Users can delete own design projects" on ai_design_projects
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- ai_design_generations (owner column: user_id) — private, owner CRUD
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view own generations" on ai_design_generations;
create policy "Users can view own generations" on ai_design_generations
  for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own generations" on ai_design_generations;
create policy "Users can insert own generations" on ai_design_generations
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own generations" on ai_design_generations;
create policy "Users can update own generations" on ai_design_generations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own generations" on ai_design_generations;
create policy "Users can delete own generations" on ai_design_generations
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- ai_design_assets (owner column: user_id) — private, owner CRUD
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view own design assets" on ai_design_assets;
create policy "Users can view own design assets" on ai_design_assets
  for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own design assets" on ai_design_assets;
create policy "Users can insert own design assets" on ai_design_assets
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own design assets" on ai_design_assets;
create policy "Users can update own design assets" on ai_design_assets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own design assets" on ai_design_assets;
create policy "Users can delete own design assets" on ai_design_assets
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- service_requests (owner column: user_id) — requester CRUD + vendor-owner read
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view own service requests" on service_requests;
create policy "Users can view own service requests" on service_requests
  for select using (auth.uid() = user_id);
drop policy if exists "Vendor owners can view incoming requests" on service_requests;
create policy "Vendor owners can view incoming requests" on service_requests
  for select using (
    exists (select 1 from vendors v where v.id = service_requests.vendor_id and v.owner_id = auth.uid())
  );
drop policy if exists "Users can insert own service requests" on service_requests;
create policy "Users can insert own service requests" on service_requests
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own service requests" on service_requests;
create policy "Users can update own service requests" on service_requests
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own service requests" on service_requests;
create policy "Users can delete own service requests" on service_requests
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- SECTION 7: Verification queries (run separately to check)
-- ============================================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

SELECT 'profiles' AS tbl, count(*) FROM profiles
UNION ALL SELECT 'vendors', count(*) FROM vendors
UNION ALL SELECT 'services', count(*) FROM services
UNION ALL SELECT 'journey_tasks', count(*) FROM journey_tasks
UNION ALL SELECT 'posts', count(*) FROM posts;

-- ============================================================================
-- SECTION 8: UNCOMMENT to drop old tables (only after verifying migration)
-- ============================================================================
-- drop table if exists user_design_selections cascade;
-- drop table if exists user_designs cascade;
-- drop table if exists product_options cascade;
-- drop table if exists customization_values cascade;
-- drop table if exists customization_options cascade;
-- drop table if exists post_tags_old cascade;
-- drop table if exists post_likes_old cascade;
-- drop table if exists post_comments_old cascade;
-- drop table if exists posts_old cascade;
-- drop table if exists chat_messages_old cascade;
-- drop table if exists user_vouchers_old cascade;
-- drop table if exists vouchers_old cascade;
-- drop table if exists user_journey_tasks_old cascade;
-- drop table if exists task_dictionary_old cascade;
-- drop table if exists reviews_old cascade;
-- drop table if exists user_favorite_products_old cascade;
-- drop table if exists product_images_old cascade;
-- drop table if exists products_old cascade;
-- drop table if exists vendors_old cascade;
-- drop table if exists tags_old cascade;
-- drop table if exists users_old cascade;
-- To drop old tables, uncomment the statements above and run manually after verifying data migration.

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
