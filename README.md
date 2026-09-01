<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LOMAR

React + Vite frontend with a FastAPI virtual try-on backend powered by Google Vertex AI Nano Banana.

## Architecture

- **Frontend**: React + Vite + TypeScript organized as compact feature modules
- **Backend**: FastAPI + Python in the sibling `../LOMAR_backend` project
- **AI Provider**: Google Vertex AI Nano Banana / Gemini image model

Frontend routes are owned by their feature. A feature keeps its page, components,
hooks, data access, and types together. Cross-feature infrastructure lives in
`src/shared`.

```text
src/
  app/          # Application composition and router
  features/     # admin, auth, blog, consultant, dashboard, ...
  shared/       # API clients, route config, layout, generated database types
  assets/
  main.tsx
```

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the dependency rules and full tree.

## Run Locally

### Prerequisites

- Node.js 20+
- Python 3.10+
- Google Cloud SDK
- Google Cloud project with Vertex AI access

### 1. Install dependencies

```bash
cd LOMAR
npm install
```

### 2. Configure environment variables

Copy your own Supabase project URL and anon key from the Supabase dashboard
(**Project Settings → API**), then edit [`.env.local`](.env.local):

```env
GEMINI_API_KEY=""
APP_URL="http://localhost:3000"
VITE_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
VITE_VTON_BACKEND_URL="http://localhost:3003"
VITE_AGENT_SERVICE_URL="http://localhost:8090"
VITE_VTON_ENDPOINT="/test-try-on-upload"
```

### 3. Apply Supabase migrations

Active database changes live in
[`supabase/migrations`](supabase/migrations). Link the intended project and
apply pending migrations with:

```bash
npx supabase login --agent no --output pretty
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

The Auth migration links `profiles.id` to `auth.users.id`, backfills existing
Auth accounts, and installs the trigger that creates a profile for every new
signup.

Legacy profiles that do not match real Auth users are preserved. In that case
the foreign key is installed as `NOT VALID`: it is enforced for all new rows,
while legacy rows can be mapped or retired explicitly before validating the
constraint.

For the linked project, the legacy conversion is complete and
`20260726000400_validate_profiles_auth_fk.sql` validates the FK fully.

Historical pre-CLI bootstrap scripts are retained under
[`supabase/legacy`](supabase/legacy) and are not executed automatically by
`db push`. See [`supabase/README.md`](supabase/README.md) for the layout.

### 4. Run the backend

```bash
cd ../LOMAR_backend
conda activate vton_env
python test_api.py
```

Backend runs at `http://localhost:3003`.

### 5. Run the frontend

```bash
cd ../LOMAR
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Deploy Frontend to Render (recommended)

The frontend deploys as a Render **static site** via
[`render.yaml`](render.yaml). Hosting it alongside the API keeps both services
on one provider and avoids depending on GitHub Actions availability.

### 1. Create the static site

1. In the Render dashboard choose **New → Blueprint**
2. Connect this repository and select the branch (`main`)
3. Render reads [`render.yaml`](render.yaml) and creates the `lomar`
   static site
4. When prompted, enter the two `sync: false` values: `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`

Render then builds with `npm ci && npm run build` and publishes `./dist`.
Subsequent pushes to the branch redeploy automatically.

### 2. Note the assigned URL

Render assigns something like:

```text
https://lomar.onrender.com
```

Unlike GitHub Pages, the site is served from the **domain root**, so
`VITE_BASE_PATH` is `/` (set in [`render.yaml`](render.yaml)). There is no
`/<repo-name>/` subpath.

### 3. Allow the origin on the backend

CORS is an explicit allowlist and `*` is rejected, so the backend must be told
about the frontend's origin. Set `ALLOWED_ORIGINS` on the **backend** service
(origin only — scheme + host, no path, no trailing slash):

```env
ALLOWED_ORIGINS=https://lomar.onrender.com
```

Values in a `render.yaml` are applied when the blueprint is first synced.
Render does not overwrite them on an already-running service, so for the
existing backend change this in **Dashboard → lomar-backend → Environment**.
Saving triggers a redeploy; the new value is not live until that finishes.

Verify:

```bash
curl -i -X OPTIONS https://lomar-backend.onrender.com/api/v1/catalog/vendors \
  -H "Origin: https://lomar.onrender.com" \
  -H "Access-Control-Request-Method: GET"
```

The response must echo
`access-control-allow-origin: https://lomar.onrender.com`. If the
header is absent, the origin is not on the allowlist and the browser will block
every API call.

### Notes

- **Free-tier backend cold starts.** The API sleeps when idle and can take
  ~30–60s to answer the first request. The static frontend does not sleep, so
  the UI loads instantly while initial data appears slow.
- **Deep links.** [`render.yaml`](render.yaml) rewrites `/*` to `/index.html`
  so refreshing `/explore` or sharing `/vendor/:id` works. Existing files are
  matched first, so real assets are unaffected.
- **`.env.local` is not used.** It is gitignored and local-only; deployed
  values come from `render.yaml` and the dashboard.

## Deploy Frontend to GitHub Pages (alternative)

> Superseded by the Render static site above. Kept for reference — the two can
> coexist as long as both origins are in the backend's `ALLOWED_ORIGINS`.

### 1. Enable GitHub Pages

In your GitHub repository:

1. Go to **Settings → Pages**
2. Set **Source** to **GitHub Actions**
3. Save

### 2. Push to `main`

The workflow [`.github/workflows/deploy-ui.yml`](.github/workflows/deploy-ui.yml) builds and deploys the frontend automatically.

The live site is:

```text
https://vkb0205.github.io/LOMAR/
```

The workflow sets `VITE_BASE_PATH` to `/<repo-name>/`, which drives both the Vite
asset base and the React Router basename. It also copies `index.html` to
`404.html` so deep links like `/LOMAR/explore` survive a hard refresh — Pages has
no server-side rewrite.

### 3. Backend URL

The deployed API is `https://lomar-backend.onrender.com`, baked in at build time
as `VITE_BACKEND_URL` by the workflow.

Note that `.env.local` is gitignored and used for local development only; it has
no effect on CI builds. To change the deployed backend without editing the
workflow, add a repository variable (**Settings → Secrets and variables →
Actions → Variables**):

| Variable      | Value                                  |
| ------------- | -------------------------------------- |
| `BACKEND_URL` | `https://your-backend.onrender.com`     |

This value must be a full absolute URL. If it is empty the app falls back to
relative `/api/...` paths, which only work behind the Vite dev proxy and will
404 against the static Pages host in production.

### 4. Supabase credentials

Auth and direct database reads need these repository *secrets* (**Settings →
Secrets and variables → Actions → Secrets**):

| Secret                    | Value                        |
| ------------------------- | ---------------------------- |
| `VITE_SUPABASE_URL`       | Your Supabase project URL    |
| `VITE_SUPABASE_ANON_KEY`  | Your Supabase anon key       |

These are compiled into a public JavaScript bundle, so only ever use the
anon/publishable key — never the service-role key. The build still succeeds
without them, but auth-dependent features will silently fail at runtime.

### 5. Backend CORS

The backend allowlists origins explicitly and never uses `*`. The Pages origin
must be present in the backend's `ALLOWED_ORIGINS` environment variable on
Render (origin only, no path):

```env
ALLOWED_ORIGINS=http://localhost:3000,https://vkb0205.github.io
```

Verify it is applied:

```bash
curl -i -X OPTIONS https://lomar-backend.onrender.com/api/v1/catalog/vendors \
  -H "Origin: https://vkb0205.github.io" \
  -H "Access-Control-Request-Method: GET"
```

The response should include
`access-control-allow-origin: https://vkb0205.github.io`.

### Troubleshooting: a push did not deploy

The workflow uses a `pages` concurrency group. If a run stalls, it holds that
lock and GitHub may create **no run at all** for later pushes, so `main` appears
to stop deploying. Check <https://www.githubstatus.com> first — an Actions or
Pages outage produces exactly this symptom. Then cancel any stuck run under the
**Actions** tab and re-run the latest one via **Run workflow**.

## Deploy Backend to Google Cloud Run

### Option A: Automated GitHub Actions

1. Create a Google Cloud service account with:
   - Cloud Run Admin
   - Artifact Registry Writer
   - Vertex AI User

2. Add the service account key JSON as a GitHub secret:
   - Secret name: `GCP_CREDENTIALS`

3. Push to `main`

The workflow [`.github/workflows/deploy-backend.yml`](.github/workflows/deploy-backend.yml) will:
- Build the Docker image
- Push to Artifact Registry
- Deploy to Cloud Run

### Required environment variables

The backend expects:

```env
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=lomar-500117
GOOGLE_CLOUD_LOCATION=global
NANO_BANANA_MODEL=gemini-3.1-flash-image
API_HOST=0.0.0.0
API_PORT=8080
```

### Test health endpoint

```bash
curl https://lomar-vton-backend-xxxxx.a.run.app/health
```

Expected response:

```json
{
  "ok": true,
  "service": "LOMAR Vertex AI Nano Banana VTON API",
  "model": "gemini-3.1-flash-image",
  "provider": "vertex-ai",
  "project": "lomar-500117",
  "location": "global",
  "vertex_configured": true
}
```

## Development Notes

### Frontend

- Vite base path is configurable via `VITE_BASE_PATH`
- Backend proxy is configured in [`vite.config.ts`](vite.config.ts)
- API URL is configured via `VITE_VTON_BACKEND_URL`

### Backend

- Dockerfile is optimized for Cloud Run
- `.dockerignore` excludes unnecessary files
- `docker-compose.yml` is available for local testing

## Troubleshooting

### CORS errors

If you see CORS errors in the browser console, update the backend's `ALLOWED_ORIGINS` to include your GitHub Pages domain.

### Backend authentication errors

Ensure your Cloud Run service account has Vertex AI permissions:
- Vertex AI User
- Service Account User

### Frontend cannot reach backend

Verify:
1. `VITE_VTON_BACKEND_URL` points to your Cloud Run URL
2. Cloud Run service allows unauthenticated invocations
3. Network connectivity from browser to Cloud Run URL
