## Table `profiles`

Replaces old `users` table. Linked to Supabase Auth (`auth.users`) as source of identity.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary (references `auth.users.id` on delete cascade) |
| `username` | `text` | Unique |
| `full_name` | `text` | Nullable |
| `email` | `text` | Nullable |
| `avatar_url` | `text` | Nullable |
| `role` | `text` | Not null default `'customer'` check (`role` in `('customer','vendor_admin','admin')`) |
| `onboarding_status` | `text` | Not null default `'new'` check (`onboarding_status` in `('new','active','completed')`) |
| `created_at` | `timestamptz` | Not null default `now()` |
| `updated_at` | `timestamptz` | Not null default `now()` |

---

## Table `vendors`

Strengthened v2 with owner FK, slug, contact info, rating stats, and status.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary default `gen_random_uuid()` |
| `owner_id` | `uuid` | Nullable (references `profiles(id)` on delete set null) |
| `name` | `text` | Not null |
| `slug` | `text` | Not null Unique |
| `category` | `text` | Not null |
| `description` | `text` | Nullable |
| `address` | `text` | Nullable |
| `city` | `text` | Nullable |
| `phone` | `text` | Nullable |
| `email` | `text` | Nullable |
| `website_url` | `text` | Nullable |
| `image_url` | `text` | Nullable |
| `rating_avg` | `numeric(3,2)` | Not null default `0` check (`rating_avg` between 0 and 5) |
| `rating_count` | `int` | Not null default `0` check (`rating_count` >= 0) |
| `status` | `text` | Not null default `'active'` check (`status` in `('draft','active','suspended')`) |
| `created_at` | `timestamptz` | Not null default `now()` |
| `updated_at` | `timestamptz` | Not null default `now()` |

---

## Table `services`

Renamed from old `products`. Represents services/packages sold by wedding vendors.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary default `gen_random_uuid()` |
| `vendor_id` | `uuid` | Not null (references `vendors(id)` on delete cascade) |
| `category` | `text` | Not null |
| `name` | `text` | Not null |
| `description` | `text` | Nullable |
| `base_price` | `numeric(12,2)` | Not null check (`base_price` >= 0) |
| `currency` | `text` | Not null default `'VND'` |
| `thumbnail_url` | `text` | Nullable |
| `status` | `text` | Not null default `'active'` check (`status` in `('draft','active','archived')`) |
| `created_at` | `timestamptz` | Not null default `now()` |
| `updated_at` | `timestamptz` | Not null default `now()` |

### Indexes

- `services_vendor_id_idx` on `services(vendor_id)`
- `services_category_idx` on `services(category)`

---

## Table `service_images`

Renamed from old `product_images`. Unique partial index enforces one main image per service.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary default `gen_random_uuid()` |
| `service_id` | `uuid` | Not null (references `services(id)` on delete cascade) |
| `image_url` | `text` | Not null |
| `alt_text` | `text` | Nullable |
| `is_main` | `boolean` | Not null default `false` |
| `display_order` | `int` | Not null default `0` |
| `created_at` | `timestamptz` | Not null default `now()` |

### Indexes

- Unique partial index `one_main_image_per_service` on `service_images(service_id)` where `is_main = true`

---

## Table `user_favorite_services`

Renamed from old `user_favorite_products`. Composite primary key.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary (references `profiles(id)` on delete cascade) |
| `service_id` | `uuid` | Primary (references `services(id)` on delete cascade) |
| `saved_at` | `timestamptz` | Not null default `now()` |

---

## Table `reviews`

Strengthened v2 with vendor/service target, status, and unique constraint per user/service.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary default `gen_random_uuid()` |
| `user_id` | `uuid` | Not null (references `profiles(id)` on delete cascade) |
| `vendor_id` | `uuid` | Nullable (references `vendors(id)` on delete cascade) |
| `service_id` | `uuid` | Nullable (references `services(id)` on delete cascade) |
| `rating` | `int` | Not null check (`rating` between 1 and 5) |
| `comment` | `text` | Nullable |
| `status` | `text` | Not null default `'published'` check (`status` in `('published','hidden','flagged')`) |
| `created_at` | `timestamptz` | Not null default `now()` |
| `updated_at` | `timestamptz` | Not null default `now()` |

### Constraints

- `review_target_check`: check (`vendor_id is not null or service_id is not null`)

### Indexes

- Unique index `one_review_per_user_service` on `reviews(user_id, service_id)` where `service_id is not null`

---

## Table `journey_tasks`

Renamed from old `task_dictionary`. Adds code, description, display_order, active flag.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary default `gen_random_uuid()` |
| `code` | `text` | Not null Unique |
| `name` | `text` | Not null |
| `description` | `text` | Nullable |
| `is_mandatory` | `boolean` | Not null default `false` |
| `display_order` | `int` | Not null default `0` |
| `active` | `boolean` | Not null default `true` |

---

## Table `user_journey_tasks`

Composite primary key v2 with status check and timestamps.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary (references `profiles(id)` on delete cascade) |
| `task_id` | `uuid` | Primary (references `journey_tasks(id)` on delete cascade) |
| `status` | `text` | Not null default `'pending'` check (`status` in `('pending','in_progress','completed','skipped')`) |
| `completed_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` | Not null default `now()` |
| `updated_at` | `timestamptz` | Not null default `now()` |

---

## Table `vouchers`

Strengthened v2 with discount types, min order value, date range, max redemptions, and active flag.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary default `gen_random_uuid()` |
| `vendor_id` | `uuid` | Nullable (references `vendors(id)` on delete cascade) |
| `code` | `text` | Not null Unique |
| `title` | `text` | Not null |
| `description` | `text` | Nullable |
| `discount_type` | `text` | Not null check (`discount_type` in `('percent','fixed')`) |
| `discount_value` | `numeric(12,2)` | Not null check (`discount_value` > 0) |
| `min_order_value` | `numeric(12,2)` | Nullable |
| `required_task_id` | `uuid` | Nullable (references `journey_tasks(id)` on delete set null) |
| `starts_at` | `timestamptz` | Nullable |
| `expires_at` | `timestamptz` | Nullable |
| `max_redemptions` | `int` | Nullable |
| `active` | `boolean` | Not null default `true` |
| `created_at` | `timestamptz` | Not null default `now()` |

---

## Table `user_vouchers`

Composite primary key v2 with richer status options (locked/unlocked/redeemed/expired).

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary (references `profiles(id)` on delete cascade) |
| `voucher_id` | `uuid` | Primary (references `vouchers(id)` on delete cascade) |
| `status` | `text` | Not null default `'locked'` check (`status` in `('locked','unlocked','redeemed','expired')`) |
| `unlocked_at` | `timestamptz` | Nullable |
| `redeemed_at` | `timestamptz` | Nullable |

---

## Table `posts`

Strengthened v2 with title, cover_image_url, view count check, and status.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary default `gen_random_uuid()` |
| `user_id` | `uuid` | Not null (references `profiles(id)` on delete cascade) |
| `title` | `text` | Nullable |
| `content` | `text` | Not null |
| `cover_image_url` | `text` | Nullable |
| `views_count` | `int` | Not null default `0` check (`views_count` >= 0) |
| `status` | `text` | Not null default `'published'` check (`status` in `('draft','published','hidden')`) |
| `created_at` | `timestamptz` | Not null default `now()` |
| `updated_at` | `timestamptz` | Not null default `now()` |

---

## Table `post_comments`

Strengthened v2 with parent_comment_id (nested replies) and status.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary default `gen_random_uuid()` |
| `post_id` | `uuid` | Not null (references `posts(id)` on delete cascade) |
| `user_id` | `uuid` | Not null (references `profiles(id)` on delete cascade) |
| `parent_comment_id` | `uuid` | Nullable (references `post_comments(id)` on delete cascade) |
| `content` | `text` | Not null |
| `status` | `text` | Not null default `'published'` check (`status` in `('published','hidden','flagged')`) |
| `created_at` | `timestamptz` | Not null default `now()` |
| `updated_at` | `timestamptz` | Not null default `now()` |

---

## Table `post_likes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `post_id` | `uuid` | Primary (references `posts(id)` on delete cascade) |
| `user_id` | `uuid` | Primary (references `profiles(id)` on delete cascade) |
| `created_at` | `timestamptz` | Not null default `now()` |

---

## Table `tags`

v2 adds `slug` field.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary default `gen_random_uuid()` |
| `name` | `text` | Not null Unique |
| `slug` | `text` | Not null Unique |

---

## Table `post_tags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `post_id` | `uuid` | Primary (references `posts(id)` on delete cascade) |
| `tag_id` | `uuid` | Primary (references `tags(id)` on delete cascade) |

---

## Table `chat_threads`

New table. Groups messages into conversations with context (design project, service, vendor).

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary default `gen_random_uuid()` |
| `user_id` | `uuid` | Not null (references `profiles(id)` on delete cascade) |
| `title` | `text` | Nullable |
| `context_type` | `text` | Not null default `'general'` check (`context_type` in `('general','design','service','vendor')`) |
| `design_project_id` | `uuid` | Nullable (references `ai_design_projects(id)` on delete set null) |
| `service_id` | `uuid` | Nullable (references `services(id)` on delete set null) |
| `vendor_id` | `uuid` | Nullable (references `vendors(id)` on delete set null) |
| `created_at` | `timestamptz` | Not null default `now()` |
| `updated_at` | `timestamptz` | Not null default `now()` |

---

## Table `chat_messages`

Restructured v2 — linked to `chat_threads` instead of orphaned. Includes `suggested_service_id` and `metadata` JSONB.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary default `gen_random_uuid()` |
| `thread_id` | `uuid` | Not null (references `chat_threads(id)` on delete cascade) |
| `user_id` | `uuid` | Not null (references `profiles(id)` on delete cascade) |
| `role` | `text` | Not null check (`role` in `('user','assistant','system')`) |
| `content` | `text` | Not null |
| `suggested_service_id` | `uuid` | Nullable (references `services(id)` on delete set null) |
| `metadata` | `jsonb` | Not null default `'{}'::jsonb` |
| `created_at` | `timestamptz` | Not null default `now()` |

### Indexes

- `chat_messages_thread_id_created_at_idx` on `chat_messages(thread_id, created_at)`

---

## Table `ai_design_projects`

Replaces old `user_designs`. Stores one saved customization workspace per user intent, linked to AI generation.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary default `gen_random_uuid()` |
| `user_id` | `uuid` | Not null (references `profiles(id)` on delete cascade) |
| `service_id` | `uuid` | Nullable (references `services(id)` on delete set null) |
| `title` | `text` | Not null default `'Untitled design'` |
| `category` | `text` | Not null |
| `bride_image_url` | `text` | Nullable |
| `groom_image_url` | `text` | Nullable |
| `reference_image_url` | `text` | Nullable |
| `selected_generation_id` | `uuid` | Nullable (references `ai_design_generations(id)` on delete set null; FK added via ALTER TABLE) |
| `status` | `text` | Not null default `'draft'` check (`status` in `('draft','generating','completed','archived')`) |
| `created_at` | `timestamptz` | Not null default `now()` |
| `updated_at` | `timestamptz` | Not null default `now()` |

### Indexes

- `ai_design_projects_user_id_idx` on `ai_design_projects(user_id)`

---

## Table `ai_design_generations`

Every AI output attempt — tracks prompt, model, input/output payloads, cost, and status.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary default `gen_random_uuid()` |
| `project_id` | `uuid` | Not null (references `ai_design_projects(id)` on delete cascade) |
| `user_id` | `uuid` | Not null (references `profiles(id)` on delete cascade) |
| `prompt` | `text` | Not null |
| `negative_prompt` | `text` | Nullable |
| `model_name` | `text` | Not null |
| `input_payload` | `jsonb` | Not null default `'{}'::jsonb` |
| `output_image_url` | `text` | Nullable |
| `output_metadata` | `jsonb` | Not null default `'{}'::jsonb` |
| `status` | `text` | Not null default `'queued'` check (`status` in `('queued','running','succeeded','failed','cancelled')`) |
| `error_message` | `text` | Nullable |
| `cost_estimate` | `numeric(12,4)` | Nullable |
| `created_at` | `timestamptz` | Not null default `now()` |
| `completed_at` | `timestamptz` | Nullable |

### Indexes

- `ai_design_generations_project_id_idx` on `ai_design_generations(project_id)`
- `ai_design_generations_user_id_idx` on `ai_design_generations(user_id)`

---

## Table `ai_design_assets`

Stores reusable input/output assets (bride/groom photos, references, generated outputs, masks).

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary default `gen_random_uuid()` |
| `project_id` | `uuid` | Not null (references `ai_design_projects(id)` on delete cascade) |
| `generation_id` | `uuid` | Nullable (references `ai_design_generations(id)` on delete cascade) |
| `user_id` | `uuid` | Not null (references `profiles(id)` on delete cascade) |
| `asset_type` | `text` | Not null check (`asset_type` in `('bride_input','groom_input','reference','generated_output','mask','other')`) |
| `file_url` | `text` | Not null |
| `mime_type` | `text` | Nullable |
| `width` | `int` | Nullable |
| `height` | `int` | Nullable |
| `size_bytes` | `bigint` | Nullable |
| `created_at` | `timestamptz` | Not null default `now()` |

---

## Table `service_requests`

Optional but recommended for marketplace lead generation. Converts app from demo → business.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary default `gen_random_uuid()` |
| `user_id` | `uuid` | Not null (references `profiles(id)` on delete cascade) |
| `vendor_id` | `uuid` | Not null (references `vendors(id)` on delete cascade) |
| `service_id` | `uuid` | Nullable (references `services(id)` on delete set null) |
| `design_project_id` | `uuid` | Nullable (references `ai_design_projects(id)` on delete set null) |
| `event_date` | `date` | Nullable |
| `budget_min` | `numeric(12,2)` | Nullable |
| `budget_max` | `numeric(12,2)` | Nullable |
| `message` | `text` | Nullable |
| `status` | `text` | Not null default `'new'` check (`status` in `('new','contacted','quoted','booked','cancelled','closed')`) |
| `created_at` | `timestamptz` | Not null default `now()` |
| `updated_at` | `timestamptz` | Not null default `now()` |

---

## Table `follows`

Social graph. A follow edge points from the authenticated follower to either
another user (profile) or a vendor. Added by `database/add_follows.sql` (a
standalone add-on migration run after `migrate_to_v2.sql`).

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary default `gen_random_uuid()` |
| `follower_id` | `uuid` | Not null (references `profiles(id)` on delete cascade) |
| `followee_type` | `text` | Not null check (`followee_type` in `('user','vendor')`) |
| `followee_user_id` | `uuid` | Nullable (references `profiles(id)` on delete cascade) |
| `followee_vendor_id` | `uuid` | Nullable (references `vendors(id)` on delete cascade) |
| `created_at` | `timestamptz` | Not null default `now()` |

### Constraints

- `follows_single_target_chk`: exactly one target populated, consistent with `followee_type`.
- `follows_no_self_follow_chk`: a user cannot follow themselves.

### Indexes

- Unique partial `follows_user_unique_idx` on `follows(follower_id, followee_user_id)` where `followee_user_id is not null`
- Unique partial `follows_vendor_unique_idx` on `follows(follower_id, followee_vendor_id)` where `followee_vendor_id is not null`
- `follows_followee_user_idx` on `follows(followee_user_id)`
- `follows_followee_vendor_idx` on `follows(followee_vendor_id)`
- `follows_follower_idx` on `follows(follower_id)`

---

# Old → New Mapping Reference

| Old Table | Action | New Table |
|-----------|--------|-----------|
| `users` | Replace | `profiles` linked to `auth.users` |
| `vendors` | Keep, strengthen | `vendors` v2 |
| `products` | Rename/rework | `services` |
| `product_images` | Rename/rework | `service_images` |
| `user_favorite_products` | Rename | `user_favorite_services` |
| `reviews` | Keep, strengthen | `reviews` v2 |
| `task_dictionary` | Rename | `journey_tasks` |
| `user_journey_tasks` | Keep, composite PK | `user_journey_tasks` v2 |
| `vouchers` | Keep, strengthen | `vouchers` v2 |
| `user_vouchers` | Keep, composite PK | `user_vouchers` v2 |
| `posts` | Keep, strengthen | `posts` v2 |
| `post_comments` | Keep, strengthen | `post_comments` v2 |
| `post_likes` | Keep | `post_likes` v2 |
| `tags` | Keep, add slug | `tags` v2 |
| `post_tags` | Keep | `post_tags` v2 |
| `chat_messages` | Split | `chat_threads` + `chat_messages` |
| `customization_options` | Drop | not needed |
| `customization_values` | Drop | not needed |
| `product_options` | Drop | not needed |
| `user_designs` | Replace | `ai_design_projects` |
| `user_design_selections` | Drop | replaced by AI generation records |

# Design Principles

## UUIDs
All app-level IDs use `uuid default gen_random_uuid()`. Exception: `profiles.id` equals `auth.users.id`.

## Timestamps
Every business table includes:
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

## Row-Level Security (RLS)
Minimum policies:
- Users can read/update own `profiles`
- Users can CRUD own `ai_design_projects`, `ai_design_generations`, `ai_design_assets`
- Users can CRUD own `chat_threads` / `chat_messages`
- Users can manage own favorites, journey tasks, vouchers
- Public can read active vendors/services/posts
- Only owners/admins can modify vendors/services

### RLS coverage status (Stage 4 — complete)
Full CRUD policy coverage is implemented in `migrate_to_v2.sql` (Section 6 for
the baseline public reads / own-profile, and **Section 6b** for the complete
authenticated CRUD set). All policies use `auth.uid()` and are replay-safe
(`drop policy if exists ...; create policy ...`). Ownership model:
`profiles.id == auth.uid()`; every user-owned table carries a `user_id`
referencing `profiles(id)`.

| Table | Owner column | Access model |
|-------|--------------|--------------|
| `profiles` | `id` (= `auth.uid()`) | Own SELECT/INSERT/UPDATE/DELETE |
| `vendors` | `owner_id` | Public SELECT active; owner CRUD |
| `services` | via `vendors.owner_id` | Public SELECT active; vendor-owner CRUD |
| `service_images` | via `services`→`vendors.owner_id` | Public SELECT (active service); vendor-owner CRUD |
| `user_favorite_services` | `user_id` | Owner CRUD (private) |
| `reviews` | `user_id` | Public SELECT published; owner CRUD |
| `journey_tasks` | — (dictionary) | Public SELECT; writes via service_role/admin |
| `user_journey_tasks` | `user_id` | Owner CRUD (private) |
| `vouchers` | via `vendors.owner_id` | Public SELECT active; vendor-owner CRUD |
| `user_vouchers` | `user_id` | Owner CRUD (private) |
| `posts` | `user_id` | Public SELECT published; author CRUD |
| `post_comments` | `user_id` | Public SELECT published; owner CRUD |
| `post_likes` | `user_id` | Public SELECT; owner INSERT/DELETE |
| `tags` | — (dictionary) | Public SELECT; writes via service_role/admin |
| `post_tags` | via `posts.user_id` | Public SELECT (published post); author INSERT/DELETE |
| `chat_threads` | `user_id` | Owner CRUD (private) |
| `chat_messages` | `user_id` | Owner CRUD (private) |
| `ai_design_projects` | `user_id` | Owner CRUD (private) |
| `ai_design_generations` | `user_id` | Owner CRUD (private) |
| `ai_design_assets` | `user_id` | Owner CRUD (private) |
| `service_requests` | `user_id` | Requester CRUD; vendor-owner SELECT of incoming |
| `follows` | `follower_id` | Public SELECT (counts); follower INSERT/DELETE |

Reference/dictionary tables (`journey_tasks`, `tags`) expose public SELECT only;
mutations are expected via the `service_role` key (admin tooling), not the
anon/authenticated app client, so no permissive authenticated write policy is
granted (least privilege). Platform-level vouchers (`vendor_id is null`) are
likewise managed via `service_role`.

## Storage Buckets
Recommended Supabase Storage buckets:
- `avatars`
- `vendor-images`
- `service-images`
- `design-inputs`
- `design-outputs`
- `post-images`

Store only URLs/paths in DB; actual files in Storage.
