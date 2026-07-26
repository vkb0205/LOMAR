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
