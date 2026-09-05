# Supabase database sources

- `migrations/` contains the schema baseline and migration files retained by
  the linked remote project. Apply pending remote changes with
  `npx supabase db push`.
- `legacy/` contains historical bootstrap scripts used before this repository
  adopted Supabase CLI migration history. They are retained for audit and
  fresh-project bootstrapping, but `db push` does not execute them.
- `fixtures/` contains local migration outputs. Credential files are ignored
  and must be transferred through a secure channel instead of committed.
- `config.toml` contains the local Supabase CLI project configuration.

The linked project's fetched `20260902000000` through `20260902000003`
migrations are retained verbatim, including the chatbot/BI test-data migration.
The unused local-only migrations `20260820000100`, `20260901000100`, and
`20260901000200` were removed because they were never applied remotely. The
`20260726000000` baseline is already marked as applied in remote migration
history because the corresponding schema predates CLI migration tracking.

The fetched `20260902000001` migration contains environment-specific test data
and expects catalog/profile rows that already exist on the linked project. It
is retained to match remote history, but it cannot be replayed successfully on
an empty local database without equivalent fixture data.

`20260905110138_simplify_schema.sql` removes deferred social, review,
service-image, and AI-design tables. It also removes the two surviving
`design_project_id` columns. This is a destructive migration; back up any data
in those tables before deploying it to an environment where that data matters.

Canonical schema documentation lives in [`docs/DATA_Schema.md`](../docs/DATA_Schema.md).

## Business Intelligence

The retained remote migration
`20260902000001_seed_chatbot_and_bi_test_data.sql` contains the BI tables and
data currently tracked for this project. Backend BI routes require `vendor`
or `admin`. Couple chat uses the public `vendors` and `services` catalog.

## Backend secrets for live agents

In `LOMAR_backend/.env` (never the frontend):

- `OPENAI_API_KEY` + `AI_TEXT_MODEL` (and optional `OPENAI_BASE_URL`) so
  `POST /api/v1/chat/consult` can call the tool-using consultant
- `SUPABASE_SERVICE_ROLE_KEY` only for admin website analytics RPC paths
  (not required for couple catalog tools or vendor BI under RLS)
