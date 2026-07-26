# LOMAR frontend architecture

LOMAR uses a compact feature-based structure. Route pages live inside the
feature that owns them; there is no separate `pages/` layer.

## Structure

```text
src/
  app/
    App.tsx
    router.tsx
    providers/
      AppProviders.tsx

  features/
    admin/
    ai-consultant/
    auth/
    blog/
    chat/
    customize/
    dashboard/
    guide/
    home/
    social/
    vendors/

  shared/
    api/
      backendClient.ts
      backendConfig.ts
      supabaseClient.ts
    config/
      routes.ts
    layout/
      Footer.tsx
      Layout.tsx
      Navbar.tsx
    types/
      database.ts

  assets/
  main.tsx
  index.css

scripts/
docs/
supabase/
```

## Ownership rules

- `app/` only composes providers, routing, and application startup.
- A route component is named `*Page.tsx` and belongs at its feature root.
- Feature-specific components, hooks, services, utilities, schemas, and types
  stay inside that feature.
- `shared/` is only for code used by multiple features.
- A module moves to `shared/` only after it has at least two real consumers.
- Generated Supabase types stay isolated in `shared/types/database.ts`.
- Development and maintenance scripts belong in `scripts/`, never in `src/`.
- Do not create empty placeholder folders. Add a folder only when its first
  implementation file is added.

## Dependency direction

```text
app -> features -> shared
```

Features may consume `shared` and selected public modules from another feature.
`shared` must not import feature code. Cross-feature imports should be kept
small; if they grow, extract a genuine shared capability rather than adding
another architectural layer.

## Backend

The FastAPI backend is the sibling project `../LOMAR_backend`. It is kept
separate from the Vite source tree and is run from its own directory.
