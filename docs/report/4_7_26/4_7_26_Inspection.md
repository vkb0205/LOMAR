# LOMAR Repository Inspection

Date: 2026-07-04
Branch inspected: `main`
Remote branch available: `origin/main`
Worktrees available: none (`.git/worktrees` does not exist)

## Branch/worktree summary

Only the current branch and its remote tracking branch were found:

- Local branches: `main`
- Remote refs: `origin/HEAD`, `origin/main`
- Linked worktrees: none

Result: no existing branch or worktree currently alleviates any problem below. Every item remains unresolved on `main` / `origin/main` unless noted otherwise.

## Problems and branch/worktree coverage

| # | Problem | Evidence | Impact | Branch/worktree that alleviates it |
|---|---|---|---|---|
| 1 | Backend dev script points outside repo | `package.json`: `dev:backend` runs `cd ../vton_test_ui && python test_api.py` | New dev setup fails unless sibling folder exists | None found |
| 2 | Cross-platform scripts are brittle | `dev:full` uses shell backgrounding; `clean` uses `rm -rf` | Windows/CMD users fail; CI portability risk | None found |
| 3 | README/deploy docs reference missing or stale deployment assets | README references workflow/deploy files not present in repo tree; backend README still uses `vton_test_ui` and local Mac paths | Deployment instructions unreliable | None found |
| 4 | Backend port defaults conflict | backend `API_PORT` default is `3000`; frontend proxy/docs expect `3003`; Docker/Cloud Run often use `8080` | Local/prod routing confusion | None found |
| 5 | Env variable names are inconsistent | README uses `VITE_VTON_ENDPOINT`; `Customize.tsx` reads `VITE_VERTEX_AI_ENDPOINT`; Vite proxy uses `VITE_VTON_BACKEND_URL` | VTON config easy to misconfigure | None found |
| 6 | Frontend build may expose sensitive API naming | `vite.config.ts` defines `process.env.GEMINI_API_KEY` into client bundle | Secret leakage risk if real key supplied | None found |
| 7 | Supabase env missing does not fail fast | `src/lib/supabase.ts` falls back to placeholder URL/key | Runtime errors hidden until data access | None found |
| 8 | Auth is demo/localStorage, not Supabase Auth | `AppContext.tsx` stores `authUser` in `localStorage`, hardcodes `id: 'U01'` | Insecure auth; no real sessions; incompatible with RLS UUID policies | None found |
| 9 | Demo user IDs conflict with v2 schema/RLS | v2 schema uses UUID/profile IDs; app can use `U01` string | Inserts/selects can fail or bypass intended ownership model | None found |
| 10 | Completed migration is not safely reproducible from source | `migrate_to_v2.sql` uses `gen_random_uuid()` / `gen_random_bytes()` before enabling required extension | Current DB may be migrated, but a clean/staging DB replay can fail | None found |
| 11 | Migration script keeps active destructive drops | `drop table if exists ... cascade` statements are active despite comment saying “UNCOMMENT” | Re-running or adapting script can cause accidental data loss | None found |
| 12 | Post-migration RLS coverage is incomplete | Policies cover selected reads/own profile; many user-owned tables lack full CRUD policies | Authenticated app flows may fail or be over/under-permissive | None found |
| 13 | Code relies heavily on `as any` around DB access | `Customize.tsx`, `Dashboard.tsx`, `AIConsultant.tsx`, `FloatingChat.tsx` | Type safety from `src/shared/types/database.ts` is mostly bypassed | None found |
| 14 | TypeScript strictness is weak | `tsconfig.json`: `allowJs: true`, no `strict: true`, `skipLibCheck: true` | Bugs survive compile; schema drift easier | None found |
| 15 | Backend CORS is open | `backend/test_api.py`: `allow_origins=["*"]`, all methods/headers | Any site can call VTON API | None found |
| 16 | Backend has no auth, quota, or rate limiting | VTON endpoints accept public requests | Abuse/cost exhaustion risk | None found |
| 17 | Backend upload/input validation is incomplete | No clear max file size/dimension enforcement before processing | Memory/CPU exhaustion risk | None found |
| 18 | Backend arbitrary URL fetching creates SSRF risk | `/proxy-image?url=...` and image URL download path fetch user-provided URLs | Internal network/cloud metadata probing risk | None found |
| 19 | Backend disables safety filters | `test_api.py` sets harm thresholds to `BLOCK_NONE` | Unsafe generation/content risk | None found |
| 20 | Backend uses sync external calls in request path | Vertex/HTTP/image processing done inline | Slow requests block workers; poor scalability | None found |
| 21 | Blog queries have N+1 patterns | Per-post fetches for profiles, likes, comments, tags | Slow list pages as data grows | None found |
| 22 | Floating chat/user chat scoping is unsafe/incomplete | Existing spec notes chat reads all messages without user scoping; component inserts via loose casts | Privacy/data leakage risk | None found |
| 23 | AI Consultant is not a real LLM assistant | Rule/mock/canned responses with timeout; DB inserts cast through `any` | Product expectation mismatch | None found |
| 24 | Frontend routing/base is deployment-specific | `vite.config.ts` defaults `base` to `/LOMAR/`; React Router also uses `/LOMAR` basename | Non-GitHub-Pages deployments can break unless configured | None found |
| 25 | Repo includes generated/build/dependency content in searchable tree | `dist`/`node_modules` appeared during inspection searches | Noise, larger repo, harder review if committed | None found |
| 26 | Public docs include concrete Supabase project URL/anon key | README includes deployment/env values | Public anon key is usually acceptable but still should be intentional/rotated if abused | None found |

## Highest-priority fixes

1. Replace demo auth with Supabase Auth and UUID-backed profile flow.
2. Lock down backend: CORS allowlist, auth, rate limits, upload limits, URL allowlist/block private IPs, restore safety filters.
3. Fix backend scripts/docs/env names so local dev starts from this repo only.
4. Treat migration as completed, then archive/harden the migration script for reproducible clean/staging DB setup; complete RLS policies.
5. Remove `as any` DB calls and enable stricter TypeScript.
6. Fix deployment docs/workflows or remove stale references.
7. Optimize N+1 Supabase queries with joins/views/RPCs where needed.

## Branch/worktree mapping

No remedial branch/worktree exists in this checkout.

| Problem group | Alleviating branch/worktree |
|---|---|
| Scripts/docs/deployment drift | None |
| Env/config drift | None |
| Auth/RLS/schema mismatch | None |
| Backend security and scalability | None |
| Post-migration reproducibility/RLS safety | None |
| Type safety | None |
| Query performance | None |
| Product completeness gaps | None |

## Suggested branch plan

Because no existing branch/worktree alleviates the issues, create focused branches:

- `fix/dev-scripts-and-docs`
- `fix/supabase-auth-rls`
- `fix/backend-security`
- `chore/archive-verify-migration-v2`
- `fix/typescript-db-safety`
- `perf/blog-chat-queries`
- `feature/real-ai-consultant`

## Conclusion

The repository is functional as a prototype, and the data migration is treated as already completed. Production readiness is still blocked by auth/RLS mismatch, backend security gaps, stale dev/deploy docs, post-migration reproducibility/RLS gaps, weak type safety, and performance issues. Current git metadata shows only `main` / `origin/main` and no linked worktrees, so there is no existing branch/worktree in this checkout that mitigates the listed problems.
