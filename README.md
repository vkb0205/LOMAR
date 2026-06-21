<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LOMAR

React + Vite frontend with a FastAPI virtual try-on backend powered by Google Vertex AI Nano Banana.

## Architecture

- **Frontend**: React + Vite + TypeScript, deployable to GitHub Pages
- **Backend**: FastAPI + Python, containerized with Docker and deployable to Google Cloud Run
- **AI Provider**: Google Vertex AI Nano Banana / Gemini image model

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

Edit [`.env.local`](.env.local):

```env
GEMINI_API_KEY=""
APP_URL="http://localhost:3000"
VITE_SUPABASE_URL="https://kenjmgrmgysqvefkepel.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_zwyQ4s1ClP7EhTKC74jUEA_ilqtu7cy"
VITE_VTON_BACKEND_URL="http://localhost:3003"
VITE_VTON_ENDPOINT="/test-try-on-upload"
```

### 3. Run the backend

```bash
cd ../vton_test_ui
conda activate vton_env
python test_api.py
```

Backend runs at `http://localhost:3003`.

### 4. Run the frontend

```bash
cd ../LOMAR
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Deploy Frontend to GitHub Pages

### 1. Enable GitHub Pages

In your GitHub repository:

1. Go to **Settings → Pages**
2. Set **Source** to **GitHub Actions**
3. Save

### 2. Push to `main`

The workflow [`.github/workflows/deploy-ui.yml`](.github/workflows/deploy-ui.yml) will automatically build and deploy the frontend.

Your site will be available at:

```text
https://<your-github-username>.github.io/LOMAR/
```

### 3. Update backend URL

After deploying the backend, update `.env.local`:

```env
VITE_VTON_BACKEND_URL="https://lomar-vton-backend-xxxxx.a.run.app"
```

Then push again to redeploy the UI.

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

### Option B: Manual deployment script

```bash
chmod +x cloud-run-deploy.sh
./cloud-run-deploy.sh lomar-500117 global
```

This will:
- Enable required APIs
- Create Artifact Registry
- Build and push Docker image
- Deploy to Cloud Run
- Output the service URL

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
