# Supabase database sources

- `migrations/` contains active, ordered Supabase CLI migrations. Apply them
  with `npx supabase db push`.
- `legacy/` contains historical bootstrap scripts used before this repository
  adopted Supabase CLI migration history. They are retained for audit and
  fresh-project bootstrapping, but `db push` does not execute them.
- `fixtures/` contains local migration outputs. Credential files are ignored
  and must be transferred through a secure channel instead of committed.
- `config.toml` contains the local Supabase CLI project configuration.

Canonical schema documentation lives in [`docs/DATA_Schema.md`](../docs/DATA_Schema.md).

## Business Intelligence migration

`migrations/20260820000100_business_intelligence.sql` adds BI tables, RLS,
seeded agents, and `get_vendor_bi_metrics` (demand/pipeline proxies from
`service_requests` — not GMV).

Apply on the linked project:

```bash
npx supabase db push
```

Or paste the file into the Supabase SQL Editor if the CLI is not linked.
Backend BI routes require `vendor_admin` or `admin`. Couple chat does **not**
need this migration (it uses public `vendors` / `services`).

## Backend secrets for live agents

In `LOMAR_backend/.env` (never the frontend):

- `OPENAI_API_KEY` + `AI_TEXT_MODEL` (and optional `OPENAI_BASE_URL`) so
  `POST /api/v1/chat/consult` can call the tool-using consultant
- `SUPABASE_SERVICE_ROLE_KEY` only for admin website analytics RPC paths
  (not required for couple catalog tools or vendor BI under RLS)
