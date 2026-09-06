# LOMAR data schema

This document describes the active `public` schema after
`20260905110138_simplify_schema.sql`. Historical bootstrap definitions remain
in the baseline and `supabase/legacy/`; they are not the current application
contract.

## Active tables

| Domain | Tables |
|---|---|
| Identity and catalog | `profiles`, `vendors`, `services`, `user_favorite_services` |
| Journey and vouchers | `journey_tasks`, `user_journey_tasks`, `vouchers`, `user_vouchers` |
| Community | `posts`, `post_comments`, `post_likes` |
| Chat and requests | `chat_threads`, `chat_messages`, `service_requests` |
| Analytics and BI | `analytics_page_views`, `bi_agent_definitions`, `bi_agent_runs`, `bi_activities`, `bi_recommendations`, `bi_reports` |
| Wedding planning | `wedding_plans`, `wedding_plan_items`, `user_plan_items` |

## Removed tables

The following deferred features were removed, together with their data:
`ai_design_assets`, `ai_design_generations`, `ai_design_projects`,
`post_tags`, `tags`, `service_images`, `reviews`, and `follows`.

`chat_threads.design_project_id` and
`service_requests.design_project_id` were also removed. Service presentation
uses `services.thumbnail_url`; vendor ratings remain summarized by
`vendors.rating_avg` and `vendors.rating_count`.

## Application invariants

- `profiles.id` is the authenticated user's `auth.users.id`.
- Application roles are `customer`, `vendor`, and `admin`.
- Public catalog reads expose active vendors and services only.
- User-owned rows are restricted by RLS using `auth.uid()`.
- `post_likes`, `user_journey_tasks`, `user_vouchers`, and wedding-plan link
  tables use composite identities to make repeated writes idempotent.
- The backend derives owner IDs from the verified access token; clients do not
  submit authoritative owner IDs.

## Change workflow

Create every subsequent change with `supabase migration new`, update generated
types in `src/shared/types/database.ts`, run backend contract tests and the
frontend build, then preview the linked deployment with
`npx supabase db push --dry-run`.
