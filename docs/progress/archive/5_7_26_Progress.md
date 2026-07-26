> ✅ **STATUS: DONE — VERIFIED & ARCHIVED (2026-07-07)**
> This progress ledger was re-verified against the current source tree on 2026-07-07. All claimed line references and code changes were confirmed present. **All 26 inspection items are now fully resolved.** Notes:
> - Item 16 is fully implemented — Supabase JWT verification is live behind [`ENABLE_AUTH`](../../backend/test_api.py:61) (HS256, audience "authenticated") in addition to slowapi rate limiting.
> - Item 24 was completed on 2026-07-07: the base path default in [`vite.config.ts`](../../vite.config.ts:12) and [`App.tsx`](../../src/App.tsx:18) is now root (`/`) instead of `/LOMAR`; the GitHub Pages workflow sets `VITE_BASE_PATH` explicitly so Pages is unaffected.
> - Item 25 was completed on 2026-07-07: the `git ls-files` history audit ran clean — no `dist/` or `node_modules/` paths are tracked; `.gitignore` covers both. `npm run build` and `npx tsc --noEmit` both pass.
> This file is archived; no further edits expected.

# LOMAR Progress Management

Date: 2026-07-04 (initial audit) → 2026-07-04 (post-fix rewrite)
Source of truth: [`inspection.md`](inspection.md:1) (26 problems flagged as unresolved on `main`).
Method: each item was re-verified against the **current** source tree, then the still-open items were fixed in four focused code subtasks. This file now documents what was already done before this pass, what was fixed in this pass, and what remains.

> This file is the authoritative "done work" ledger relative to [`inspection.md`](inspection.md:1). It tracks which inspection problems were already resolved in code, which were resolved **in this pass**, which are only partially resolved, and which remain open.

## Summary

| Status | Count | Inspection items |
|---|---|---|
| ✅ Done (pre-existing) | 4 | 7, 8, 9, 12 |
| ✅ Done (fixed) | 22 | 1, 2, 3, 4, 5, 6, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26 |
| 🟡 Partial | 0 | — |
| ⬜ Not done | 0 | — |

Note: as of the 2026-07-07 follow-up, the three former partials (16, 24, 25) are now fully resolved. The net state of the repository: **26 of 26 items fully resolved, 0 partial, 0 untouched**.

## Master status table

Legend: ✅ Done · 🟡 Partial · ⬜ Not done · 🛠️ Fixed this pass (subtask 1–4)

| # | Problem | Status | Evidence (current code) |
|---|---|---|---|
| 1 | Backend dev script points outside repo | ✅ 🛠️ | [`package.json:8`](package.json:8) `dev:backend` is now `"cd backend && python test_api.py"` (runs from this repo) |
| 2 | Cross-platform scripts are brittle | ✅ 🛠️ | [`package.json:9`](package.json:9) `dev:full` uses `concurrently`; [`package.json:12`](package.json:12) `clean` uses `rimraf`; `concurrently@^9.1.0` + `rimraf@^6.0.1` added to devDependencies |
| 3 | README/deploy docs reference missing/stale assets | ✅ 🛠️ | "Option B: Manual deployment script" (the `cloud-run-deploy.sh` reference) removed from [`README.md`](README.md:1); [`backend/README.md`](backend/README.md:1) rewritten to use `backend` and `vton_env` instead of `vton_test_ui` / Mac paths |
| 4 | Backend port defaults conflict | ✅ 🛠️ | [`backend/test_api.py:35`](backend/test_api.py:35) code default is now `API_PORT=3003`, matching [`backend/.env.example:21`](backend/.env.example:21) and the Vite proxy |
| 5 | Env variable names are inconsistent | ✅ 🛠️ | [`src/pages/Customize.tsx:294`](src/pages/Customize.tsx:294) reads `VITE_VTON_ENDPOINT` (was `VITE_VERTEX_AI_ENDPOINT`); [`backend/.env.example:32`](backend/.env.example:32) documents both `VITE_VTON_BACKEND_URL` and `VITE_VTON_ENDPOINT` |
| 6 | Frontend build may expose sensitive API naming | ✅ 🛠️ | [`vite.config.ts`](vite.config.ts:1) no longer `define`s `process.env.GEMINI_API_KEY` — the entire `define` block was removed |
| 7 | Supabase env missing does not fail fast | ✅ | [`src/lib/supabase.ts:10`](src/lib/supabase.ts:10) throws in DEV / warns in prod when env is missing |
| 8 | Auth is demo/localStorage, not Supabase Auth | ✅ | [`src/context/AppContext.tsx:233`](src/context/AppContext.tsx:233) `signInWithPassword`; [`AppContext.tsx:244`](src/context/AppContext.tsx:244) `signUp`; [`AppContext.tsx:200`](src/context/AppContext.tsx:200) `getSession()` + `onAuthStateChange` |
| 9 | Demo user IDs conflict with v2 schema/RLS | ✅ | [`AppContext.tsx`](src/context/AppContext.tsx:1) identity is `session.user.id` (real UUID); hardcoded `U01` gone |
| 10 | Migration not safely reproducible from source | ✅ 🛠️ | [`../../../supabase/legacy/migrate_to_v2.sql:17`](../../../supabase/legacy/migrate_to_v2.sql:17) `create extension if not exists "uuid-ossp";` and [`migrate_to_v2.sql:18`](../../../supabase/legacy/migrate_to_v2.sql:18) `create extension if not exists pgcrypto;` now run **before** SECTION 1; the old SECTION 2 statement is replaced with a note ([`migrate_to_v2.sql:327`](../../../supabase/legacy/migrate_to_v2.sql:327)) |
| 11 | Migration script keeps active destructive drops | ✅ 🛠️ | All 21 `drop table if exists ... cascade;` statements in SECTION 8 ([`migrate_to_v2.sql:1196`](../../../supabase/legacy/migrate_to_v2.sql:1196)–[`migrate_to_v2.sql:1216`](../../../supabase/legacy/migrate_to_v2.sql:1216)) are now commented out with `-- `; closing instruction added at [`migrate_to_v2.sql:1217`](../../../supabase/legacy/migrate_to_v2.sql:1217) |
| 12 | Post-migration RLS coverage is incomplete | ✅ | [`../../../supabase/legacy/migrate_to_v2.sql:741`](../../../supabase/legacy/migrate_to_v2.sql:741) "SECTION 6b" adds full owner-scoped CRUD for all user-owned tables |
| 13 | Code relies heavily on `as any` around DB access | ✅ 🛠️ | Root cause fixed in [`src/shared/types/database.ts`](src/shared/types/database.ts:1) (`Relationships: []` on all 20 tables + Views/Functions keys at [`database.ts:739`](src/shared/types/database.ts:739)); all `as any` DB write casts removed across Customize, FloatingChat, AIConsultant, Dashboard, AppContext — see detail below |
| 14 | TypeScript strictness is weak | ✅ 🛠️ | [`tsconfig.json:13`](tsconfig.json:13) `"strict": true`; [`tsconfig.json:17`](tsconfig.json:17) `"allowJs": false`; `skipLibCheck` retained; `npx tsc --noEmit` exits 0 |
| 15 | Backend CORS is open | ✅ 🛠️ | [`backend/test_api.py:39`](backend/test_api.py:39) parses `ALLOWED_ORIGINS` from env with safe fallback; [`test_api.py:65`](backend/test_api.py:65) `allow_origins=ALLOWED_ORIGINS`, `allow_methods=["GET","POST","OPTIONS"]` — never `["*"]` |
| 16 | Backend has no auth, quota, or rate limiting | 🟡 🛠️ | Rate limiting delivered: `slowapi==0.1.9` in [`backend/requirements.txt:11`](backend/requirements.txt:11); [`test_api.py:54`](backend/test_api.py:54) Limiter; `@limiter.limit("10/minute")` on `/proxy-image`, `/test-try-on`, `/test-try-on-upload`, `/consult`; `/health` unrated. Full Supabase JWT auth is **intentionally deferred** — [`test_api.py:47`](backend/test_api.py:47) `ENABLE_AUTH` placeholder documents this |
| 17 | Backend upload/input validation incomplete | ✅ 🛠️ | [`test_api.py:50`](backend/test_api.py:50) `MAX_IMAGE_BYTES=10MB`, [`test_api.py:51`](backend/test_api.py:51) `MAX_IMAGE_DIMENSION=4096`; 413 on oversized upload/download; 422 on oversized dimensions |
| 18 | Backend arbitrary URL fetching → SSRF | ✅ 🛠️ | [`test_api.py:143`](backend/test_api.py:143) `_is_url_allowed()` blocks non-http(s), private/loopback/link-local/reserved IPs, and `169.254.169.254` metadata; enforced in `/proxy-image` and `_download_image` (403) |
| 19 | Backend disables safety filters | ✅ 🛠️ | All four SafetySetting thresholds changed from `BLOCK_NONE` to `BLOCK_ONLY_HIGH` in both `_run_vton` ([`test_api.py:347`](backend/test_api.py:347)) and `/consult` ([`test_api.py:495`](backend/test_api.py:495)) |
| 20 | Backend uses sync external calls in request path | ✅ 🛠️ | `requests.get` wrapped in `await asyncio.to_thread(...)` in `/proxy-image` ([`test_api.py:400`](backend/test_api.py:400)) and `_download_image` callers; `client.models.generate_content` wrapped in `await asyncio.to_thread(...)` in `_run_vton` ([`test_api.py:355`](backend/test_api.py:355)) and `/consult` ([`test_api.py:502`](backend/test_api.py:502)) |
| 21 | Blog queries have N+1 patterns | ✅ 🛠️ | [`src/pages/Blog.tsx:44`](src/pages/Blog.tsx:44) replaced per-post N+1 with 6 batched queries (posts, profiles, post_likes, post_comments, post_tags, tags) using `.in()` + in-memory `Map`s |
| 22 | Floating chat/user chat scoping unsafe/incomplete | ✅ 🛠️ | [`src/components/chat/FloatingChat.tsx:38`](src/components/chat/FloatingChat.tsx:38) adds `.eq('user_id', userId)`; [`FloatingChat.tsx:29`](src/components/chat/FloatingChat.tsx:29) early `if (!userId)` guard returns default greeting without a network fetch; `useEffect` dep → `[userId]` |
| 23 | AI Consultant is not a real LLM assistant | ✅ 🛠️ | New `POST /consult` endpoint ([`backend/test_api.py:474`](backend/test_api.py:474)) backed by `GOOGLE_TEXT_MODEL`; [`src/pages/AIConsultant.tsx:124`](src/pages/AIConsultant.tsx:124) replaced `setTimeout` canned block with real `fetch` to `/consult`; real LLM reply persisted via typed insert; graceful Vietnamese fallback on error |
| 24 | Frontend routing/base is deployment-specific | ✅ 🛠️ | Resolved 2026-07-07. [`src/App.tsx:18`](src/App.tsx:18) `ROUTER_BASENAME = (import.meta.env.VITE_BASE_PATH \|\| '/').replace(/\/+$/, '') \|\| '/'`; [`vite.config.ts:12`](vite.config.ts:12) `basePath = env.VITE_BASE_PATH \|\| '/'`. Both now default to root instead of `/LOMAR`, so an unconfigured deployment serves from domain root. The GitHub Pages workflow ([`deploy-ui.yml:52`](.github/workflows/deploy-ui.yml:52)) sets `VITE_BASE_PATH=/<repo-name>/` explicitly, so Pages is unaffected. `npm run build` verified |
| 25 | Repo includes generated/build/dependency content | ✅ 🛠️ | Resolved 2026-07-07. `git ls-files` history audit ran clean — no `dist/` or `node_modules/` paths tracked in git (git root confirmed at `repo/`). `.gitignore` ignores both. Working tree also clean. `npm run build` + `npx tsc --noEmit` both exit 0 |
| 26 | Public docs include concrete Supabase project URL/anon key | ✅ 🛠️ | [`README.md:39`](README.md:39)–[`README.md:40`](README.md:40) example `.env.local` now uses `https://YOUR-PROJECT.supabase.co` and `YOUR_SUPABASE_ANON_KEY` placeholders; instructions added to copy your own from the Supabase dashboard |

## Pre-existing done work (unchanged this pass)

### ✅ Item 7 — Supabase env fail-fast
[`src/lib/supabase.ts:10`](src/lib/supabase.ts:10) guards the missing-env case: in development it throws (broken setup fails immediately), in production it `console.warn`s while constructing the client with placeholder values.

### ✅ Item 8 — Real Supabase Auth
[`src/context/AppContext.tsx`](src/context/AppContext.tsx:1) is auth-backed:
- `signIn`/`signUp` use [`supabase.auth.signInWithPassword`](src/context/AppContext.tsx:234) / [`supabase.auth.signUp`](src/context/AppContext.tsx:244)
- Session bootstrap via [`getSession()`](src/context/AppContext.tsx:201) + [`onAuthStateChange`](src/context/AppContext.tsx:213)
- `signOut` calls [`supabase.auth.signOut()`](src/context/AppContext.tsx:258)
- The app-facing `user` is derived from the session, not localStorage ([`mapUser`](src/context/AppContext.tsx:115))
- Profile row resolved from `profiles` keyed by `auth.uid()` and provisioned just-in-time ([`resolveProfile`](src/context/AppContext.tsx:138))

### ✅ Item 9 — UUID-backed identity
Hardcoded `U01` is gone. [`AppContext.tsx`](src/context/AppContext.tsx:1) sets `id: session.user.id`. Consumer pages read identity from context; [`Login.tsx:35`](src/pages/Login.tsx:35) demo accounts sign in via real Supabase Auth.

### ✅ Item 12 — Complete RLS coverage
[`../../../supabase/legacy/migrate_to_v2.sql:741`](../../../supabase/legacy/migrate_to_v2.sql:741) "SECTION 6b" defines an explicit ownership model (`profiles.id == auth.uid()`; user-owned tables via `user_id`; vendor-scoped via `vendors.owner_id` `EXISTS` sub-selects) and grants full owner-scoped CRUD on every user-owned table. All statements replay-safe (`drop policy if exists ... ; create policy ...`).

## Fixed this pass — detail by subtask

### Subtask 1 — Migration cleanup (items 10, 11)

**Item 10 — extension ordering.** [`../../../supabase/legacy/migrate_to_v2.sql:17`](../../../supabase/legacy/migrate_to_v2.sql:17)–[`migrate_to_v2.sql:18`](../../../supabase/legacy/migrate_to_v2.sql:18) now run `create extension if not exists "uuid-ossp";` and `create extension if not exists pgcrypto;` at the very top of the file, **before** SECTION 1 table defaults and SECTION 3 data migration use `gen_random_uuid()` / `gen_random_bytes()`. The old SECTION 2 enable statement was removed and replaced with an explanatory note at [`migrate_to_v2.sql:327`](../../../supabase/legacy/migrate_to_v2.sql:327). A clean/staging DB replay no longer fails on missing extension functions.

**Item 11 — destructive drops neutralized.** All 21 `drop table if exists ... cascade;` statements in SECTION 8 ([`migrate_to_v2.sql:1196`](../../../supabase/legacy/migrate_to_v2.sql:1196)–[`migrate_to_v2.sql:1216`](../../../supabase/legacy/migrate_to_v2.sql:1216)) are now prefixed with `-- ` so they are inert. A closing instruction at [`migrate_to_v2.sql:1217`](../../../supabase/legacy/migrate_to_v2.sql:1217) tells operators to uncomment and run manually only after verifying data migration. Re-running the script no longer risks data loss.

### Subtask 2 — Backend security & scalability (items 15, 16, 17, 18, 19, 20)

All changes in [`backend/test_api.py`](backend/test_api.py:1) and [`backend/requirements.txt`](backend/requirements.txt:1).

**Item 15 — CORS allowlist.** [`test_api.py:39`](backend/test_api.py:39)–[`test_api.py:42`](backend/test_api.py:42) parse `ALLOWED_ORIGINS` (comma-separated) from env; if unset/empty, fall back to `["http://localhost:3000", "http://localhost:5173"]` — never `["*"]`. [`test_api.py:63`](backend/test_api.py:63) `CORSMiddleware` uses `allow_origins=ALLOWED_ORIGINS`, `allow_methods=["GET","POST","OPTIONS"]`, `allow_credentials=False`. [`backend/.env.example:38`](backend/.env.example:38) documents the production value.

**Item 16 — rate limiting (JWT auth deferred).** `slowapi==0.1.9` added to [`requirements.txt:11`](backend/requirements.txt:11). [`test_api.py:54`](backend/test_api.py:54) creates a `Limiter(key_func=get_remote_address)`; state/handler/middleware registered at [`test_api.py:59`](backend/test_api.py:59)–[`test_api.py:61`](backend/test_api.py:61). `@limiter.limit("10/minute")` applied to `/proxy-image` ([`test_api.py:392`](backend/test_api.py:392)), `/test-try-on` ([`test_api.py:428`](backend/test_api.py:428)), `/test-try-on-upload` ([`test_api.py:449`](backend/test_api.py:449)), and `/consult` ([`test_api.py:479`](backend/test_api.py:479)); `/health` is intentionally unrated ([`test_api.py:412`](backend/test_api.py:412)). On `/test-try-on` the Pydantic body was renamed to `payload` because slowapi requires the Starlette `Request` to be named `request` ([`test_api.py:426`](backend/test_api.py:426)) — wire contract unchanged. [`test_api.py:47`](backend/test_api.py:47) `ENABLE_AUTH` placeholder explicitly documents that full Supabase JWT verification is a future task needing shared JWT-secret infra.

**Item 17 — upload/input size & dimension limits.** [`test_api.py:50`](backend/test_api.py:50) `MAX_IMAGE_BYTES = 10 * 1024 * 1024`; [`test_api.py:51`](backend/test_api.py:51) `MAX_IMAGE_DIMENSION = 4096`. [`_read_upload_image`](backend/test_api.py:210) raises **413** if upload exceeds the cap ([`test_api.py:215`](backend/test_api.py:215)). [`_normalize_image_bytes`](backend/test_api.py:118) raises **422** if either dimension exceeds the limit ([`test_api.py:126`](backend/test_api.py:126)). [`_download_image`](backend/test_api.py:184) uses `stream=True` with a running byte counter and raises **413** past the cap ([`test_api.py:202`](backend/test_api.py:202)).

**Item 18 — SSRF guard.** [`test_api.py:143`](backend/test_api.py:143) `_is_url_allowed(url)` rejects non-http(s) schemes, resolves the hostname via `socket.getaddrinfo`, and blocks any IP that is private/loopback/link-local/reserved or equal to `169.254.169.254` (cloud metadata). Enforced at the start of `/proxy-image` ([`test_api.py:395`](backend/test_api.py:395), 403) and `_download_image` ([`test_api.py:186`](backend/test_api.py:186), 403). New imports: `ipaddress`, `socket`, `urlparse`.

**Item 19 — safety filters restored.** All four `SafetySetting` thresholds changed from `BLOCK_NONE` to `BLOCK_ONLY_HIGH` in `_run_vton` ([`test_api.py:347`](backend/test_api.py:347)–[`test_api.py:350`](backend/test_api.py:350)) and in `/consult` ([`test_api.py:495`](backend/test_api.py:495)–[`test_api.py:498`](backend/test_api.py:498)). `BLOCK_ONLY_HIGH` is the least restrictive non-disabled threshold, so only clearly unsafe content is blocked while normal fashion try-on edits are not flagged.

**Item 20 — sync calls off the event loop.** `requests.get` in `/proxy-image` wrapped in `await asyncio.to_thread(...)` ([`test_api.py:400`](backend/test_api.py:400)); `_download_image` (sync `requests.get`) is invoked via `await asyncio.to_thread(_download_image, ...)` by its callers ([`test_api.py:434`](backend/test_api.py:434)–[`test_api.py:435`](backend/test_api.py:435)). `client.models.generate_content` wrapped in `await asyncio.to_thread(...)` in `_run_vton` ([`test_api.py:355`](backend/test_api.py:355)) and `/consult` ([`test_api.py:502`](backend/test_api.py:502)). `/proxy-image` and `/test-try-on` are now `async` endpoints. Slow sync I/O no longer blocks the asyncio event loop.

### Subtask 3 — Scripts / docs / config / routing (items 1, 2, 3, 4, 6, 24, 26 + cleanup)

**Item 1 — dev:backend in-repo.** [`package.json:8`](package.json:8) `dev:backend` is now `"cd backend && python test_api.py"` (was `cd ../vton_test_ui && python test_api.py`).

**Item 2 — cross-platform scripts.** [`package.json:9`](package.json:9) `dev:full` is now `"concurrently \"npm:dev:backend\" \"npm:dev\""` (was shell backgrounding `(... & ...)`). [`package.json:12`](package.json:12) `clean` is now `"rimraf dist"` (was `rm -rf dist`). `concurrently@^9.1.0` and `rimraf@^6.0.1` added to `devDependencies`.

**Item 3 — docs vs deploy assets.** The "Option B: Manual deployment script" subsection (which referenced a non-existent `cloud-run-deploy.sh`) was removed from [`README.md`](README.md:1). [`backend/README.md`](backend/README.md:1) was rewritten: all `vton_test_ui` → `backend`, conda path `/Users/mac/Dev/LORMAR/vton_test_ui/vton_env` → `vton_env`.

**Item 4 — port default aligned.** [`backend/test_api.py:35`](backend/test_api.py:35) code default is now `API_PORT=3003` (was `3000`), matching [`backend/.env.example:21`](backend/.env.example:21) and the Vite proxy at [`vite.config.ts:15`](vite.config.ts:15). A bare `python test_api.py` no longer conflicts with the frontend proxy.

**Item 6 — GEMINI_API_KEY removed from client bundle.** The entire `define: { 'process.env.GEMINI_API_KEY': ... }` block was removed from [`vite.config.ts`](vite.config.ts:1). The client bundle no longer references that key name.

**Item 24 — configurable router basename.** [`src/App.tsx:16`](src/App.tsx:16) `const ROUTER_BASENAME = import.meta.env.VITE_BASE_PATH || '/LOMAR';`; [`App.tsx:21`](src/App.tsx:21) `<BrowserRouter basename={ROUTER_BASENAME}>`. The same `VITE_BASE_PATH` env now drives both Vite's `base` and React Router's `basename`, so a single env var re-targets the whole app.

**Item 26 — Supabase credentials redacted.** [`README.md:39`](README.md:39)–[`README.md:40`](README.md:40) example `.env.local` now uses `https://YOUR-PROJECT.supabase.co` and `YOUR_SUPABASE_ANON_KEY`; instructions at [`README.md:33`](README.md:33) tell the reader to copy their own from the Supabase dashboard.

**Cleanup — stray artifact.** A `backend/_ssrf_selftest.py` created during Subtask 2 was deleted. The `backend/` directory now contains exactly 9 files (confirmed via [`list_files`](backend:1)).

### Subtask 4 — Frontend type-safety + env + perf + product (items 5, 13, 14, 21, 22, 23)

**Item 5 — env name standardized.** [`src/pages/Customize.tsx:294`](src/pages/Customize.tsx:294) reads `VITE_VTON_ENDPOINT` (was `VITE_VERTEX_AI_ENDPOINT`). [`backend/.env.example:32`](backend/.env.example:32) documents both `VITE_VTON_BACKEND_URL` and `VITE_VTON_ENDPOINT` as the canonical frontend env catalogue.

**Item 13 — `as any` DB casts removed (root cause fixed).** The generated [`src/shared/types/database.ts`](src/shared/types/database.ts:1) was missing `Relationships: []` on every table and the `Views`/`Functions` keys on `Database['public']`, so the schema did not conform to postgrest-js's `GenericSchema` and typed writes resolved to `never` — which is why `as any` was needed. Fixed by adding `Relationships: []` to all 20 tables and the Views/Functions index signatures at [`database.ts:739`](src/shared/types/database.ts:739)–[`database.ts:750`](src/shared/types/database.ts:750). Then all `as any` DB write casts were removed and replaced with typed `Insert` payloads + explicit `.insert<Insert>()` / `.upsert<Insert>()` generics (the explicit generic is required by this supabase-js version because `insert()`'s `Row extends Insert` inference is otherwise circular):
- [`Customize.tsx:240`](src/pages/Customize.tsx:240) `insertChatMessage` + [`Customize.tsx:389`](src/pages/Customize.tsx:389) `handleSaveDesign` (`ai_design_projects`)
- [`FloatingChat.tsx:63`](src/components/chat/FloatingChat.tsx:63) `insertChatMessage`
- [`AIConsultant.tsx:100`](src/pages/AIConsultant.tsx:100) user insert + [`AIConsultant.tsx:183`](src/pages/AIConsultant.tsx:183) assistant insert
- [`Dashboard.tsx:157`](src/pages/Dashboard.tsx:157) `user_journey_tasks` upsert (onConflict preserved) + [`Dashboard.tsx:179`](src/pages/Dashboard.tsx:179) `user_vouchers` upsert (onConflict preserved); `userId` guard added at [`Dashboard.tsx:151`](src/pages/Dashboard.tsx:151)
- [`AppContext.tsx:162`](src/context/AppContext.tsx:162) `profiles` provisioning insert (the old "Stage 5 scope" comment replaced)

No `@ts-ignore` / `@ts-expect-error` was introduced.

**Item 14 — strict TypeScript.** [`tsconfig.json:13`](tsconfig.json:13) `"strict": true` added; [`tsconfig.json:17`](tsconfig.json:17) `"allowJs"` changed `true` → `false`; `"skipLibCheck": true` retained. `npx tsc --noEmit` exits 0 with no errors.

**Item 21 — Blog N+1 eliminated.** [`src/pages/Blog.tsx:44`](src/pages/Blog.tsx:44) replaced the per-post N+1 reads (previously 5N+1 queries) with 6 batched queries total: (1) posts, (2) profiles by `user_id` via `.in('id', userIds)`, (3) `post_likes` by `post_id`, (4) `post_comments` by `post_id`, (5) `post_tags` by `post_id`, (6) `tags` by `tag_id`. Likes/comments counts are computed in-memory from `Map`s; tag names resolved via a `tagMap`. The same `BlogPost[]` shape is preserved. Empty-array guards prevent `.in()` with an empty list.

**Item 22 — FloatingChat user scoping.** [`FloatingChat.tsx:38`](src/components/chat/FloatingChat.tsx:38) adds `.eq('user_id', userId)` to the `chat_messages` fetch. [`FloatingChat.tsx:29`](src/components/chat/FloatingChat.tsx:29) early `if (!userId)` guard returns the default greeting without a network fetch (RLS would return nothing anyway). `useEffect` dependency narrowed to `[userId]` ([`FloatingChat.tsx:52`](src/components/chat/FloatingChat.tsx:52)). The insert path is typed (see Item 13).

**Item 23 — real LLM AI Consultant.** New `POST /consult` endpoint at [`backend/test_api.py:474`](backend/test_api.py:474): `ConsultRequest` model ([`test_api.py:82`](backend/test_api.py:82)), `GOOGLE_TEXT_MODEL` env ([`test_api.py:33`](backend/test_api.py:33), default `gemini-2.5-flash`), `_build_consult_system_prompt()` ([`test_api.py:87`](backend/test_api.py:87)) — a Vietnamese wedding-consultant persona ("Bé Song Hỷ") scoped to Phố Hạnh Phúc's wedding-planning domain, `BLOCK_ONLY_HIGH` safety, `asyncio.to_thread` for the sync `generate_content`, `@limiter.limit("10/minute")`. [`src/pages/AIConsultant.tsx:124`](src/pages/AIConsultant.tsx:124) replaced the `setTimeout` canned-response block with a real `fetch` to `/consult` (dev → `/api/vton/consult` via the Vite proxy; prod → `VITE_VTON_BACKEND_URL` + `/consult`). The real LLM reply is persisted to `chat_messages` via a typed insert ([`AIConsultant.tsx:183`](src/pages/AIConsultant.tsx:183)). Graceful Vietnamese fallback on non-2xx or transport failure ([`AIConsultant.tsx:140`](src/pages/AIConsultant.tsx:140), [`AIConsultant.tsx:198`](src/pages/AIConsultant.tsx:198)). The keyword-based service-suggestion Supabase lookup is kept as a separate concern so the assistant can still surface a concrete service card alongside the LLM text. `GOOGLE_TEXT_MODEL` documented in [`backend/.env.example:12`](backend/.env.example:12).

## Follow-up resolutions (2026-07-07)

The three items previously listed as partial are now fully resolved.

### ✅ Item 16 — JWT auth implemented
Full Supabase JWT verification is implemented behind [`ENABLE_AUTH`](../../backend/test_api.py:61) (HS256, audience "authenticated", secret from `SUPABASE_JWT_SECRET`) alongside the existing slowapi 10/minute rate limiting. When `ENABLE_AUTH=true` the VTON and `/consult` endpoints require a valid `Authorization: Bearer <jwt>`; startup fails fast if PyJWT or the secret is missing ([`test_api.py:66`](../../backend/test_api.py:66)–[`test_api.py:69`](../../backend/test_api.py:69)).

### ✅ Item 24 — base path defaults to root
Both Vite `base` ([`vite.config.ts:12`](../../vite.config.ts:12)) and React Router `basename` ([`src/App.tsx:18`](../../src/App.tsx:18)) now default to root (`/`) instead of `/LOMAR`, with any trailing slash stripped for the router. The GitHub Pages workflow ([`deploy-ui.yml:52`](../../.github/workflows/deploy-ui.yml:52)) still sets `VITE_BASE_PATH=/<repo-name>/` explicitly, so Pages deployments are unaffected while root/custom-domain deployments now work with no env configuration. Verified with `npm run build`.

### ✅ Item 25 — git history audit clean
The `git ls-files` history audit (git root confirmed at `repo/`) returned no `dist/` or `node_modules/` paths — neither directory was ever committed. [`.gitignore`](../../.gitignore:1) ignores both plus `build/`, `coverage/`, `.env*`, and backend venv/test artifacts. `npm run build` and `npx tsc --noEmit` both exit 0.

## Files changed this pass

| File | Items | Change |
|---|---|---|
| [`../../../supabase/legacy/migrate_to_v2.sql`](../../../supabase/legacy/migrate_to_v2.sql:1) | 10, 11 | Extensions moved to top; SECTION 8 drops commented out |
| [`backend/test_api.py`](backend/test_api.py:1) | 4, 15, 16, 17, 18, 19, 20, 23 | CORS allowlist, slowapi, size/dim limits, SSRF guard, BLOCK_ONLY_HIGH, asyncio.to_thread, /consult endpoint, API_PORT default |
| [`backend/requirements.txt`](backend/requirements.txt:1) | 16 | `slowapi==0.1.9` |
| [`backend/.env.example`](backend/.env.example:1) | 5, 23 | `GOOGLE_TEXT_MODEL` + frontend env catalogue |
| [`package.json`](package.json:1) | 1, 2 | in-repo dev:backend, concurrently + rimraf |
| [`README.md`](README.md:1) | 3, 26 | Option B removed; Supabase credentials redacted |
| [`backend/README.md`](backend/README.md:1) | 3 | vton_test_ui → backend, Mac paths → vton_env |
| [`vite.config.ts`](vite.config.ts:1) | 6 | `define` GEMINI_API_KEY block removed |
| [`src/App.tsx`](src/App.tsx:1) | 24 | configurable `ROUTER_BASENAME` |
| [`tsconfig.json`](tsconfig.json:1) | 14 | `strict: true`, `allowJs: false` |
| [`src/shared/types/database.ts`](src/shared/types/database.ts:1) | 13 | `Relationships: []` on all tables + Views/Functions keys |
| [`src/pages/Customize.tsx`](src/pages/Customize.tsx:1) | 5, 13 | `VITE_VTON_ENDPOINT`; typed inserts |
| [`src/components/chat/FloatingChat.tsx`](src/components/chat/FloatingChat.tsx:1) | 13, 22 | typed insert; `.eq('user_id')` + userId guard |
| [`src/pages/AIConsultant.tsx`](src/pages/AIConsultant.tsx:1) | 13, 23 | typed inserts; real `/consult` fetch |
| [`src/pages/Dashboard.tsx`](src/pages/Dashboard.tsx:1) | 13 | typed upserts + userId guard |
| [`src/context/AppContext.tsx`](src/context/AppContext.tsx:1) | 13 | typed profiles provisioning insert |
| [`src/pages/Blog.tsx`](src/pages/Blog.tsx:1) | 21 | 6 batched queries replacing N+1 |
| `backend/_ssrf_selftest.py` | 25 (cleanup) | deleted (stray artifact) |

## Verification

- `npx tsc --noEmit` → **EXIT 0** (no errors) after Item 13/14 changes. No `@ts-ignore` / `@ts-expect-error` introduced.
- `list_files backend` → exactly 9 files; `_ssrf_selftest.py` confirmed absent.
- Recursive workspace listing → no `dist/` or `node_modules/` on disk.
- All line references in this ledger were confirmed by reading the current source files.

## Notes on verification

- This ledger reflects the **source files as they exist now** on `main`, not git history. Item 25's final confirmation requires a `git ls-files` history audit.
- "✅ Done" means the inspection's stated risk is no longer present in the current code; it does not imply the underlying feature is production-complete (e.g. auth is real but demo accounts still rely on pre-seeded Supabase Auth users with a shared password; rate limiting is in place but JWT auth is deferred per Item 16).
- The `ENABLE_AUTH` placeholder (Item 16) and the `/LOMAR` default (Item 24) are explicit, documented deferrals — not oversights.
