# LOMAR Project Specification

## 1. Executive Summary

LOMAR is a wedding-service ecosystem web application for **Phố Hạnh Phúc Hồ Văn Huê**. It combines a React/Vite frontend, Supabase-backed data features, local demo authentication, AI-assisted wedding consultation, wedding-service discovery, user journey tracking, voucher unlocking, and a Python FastAPI virtual try-on backend powered by Google Vertex AI / Google GenAI image models.

The product is designed around the Vietnamese wedding-planning journey: users discover vendors, customize wedding products and services, generate AI mannequin previews, track preparation milestones, unlock vouchers, read community content, and interact with the Bé Song Hỷ assistant.

## 2. Goals and Product Vision

### 2.1 Primary Goals

- Provide a polished, mobile-responsive wedding ecosystem portal for Hồ Văn Huê.
- Let couples explore vendors and services by category.
- Let couples customize wedding-related products such as wedding dresses and suits.
- Generate realistic virtual try-on previews from mannequin and product images.
- Persist user progress, saved designs, chat messages, posts, vendors, vouchers, and related marketplace data through Supabase.
- Support static frontend deployment through GitHub Pages.
- Support containerized backend deployment through Docker and Google Cloud Run.

### 2.2 Non-Goals / Current Limitations

- Authentication is currently demo/local-state based, not Supabase Auth or OAuth.
- AI Consultant responses are currently rule-based/mock suggestions using Supabase product lookups, not a live LLM conversation service.
- Payment, booking finalization, inventory management, and vendor admin workflows are not implemented.
- Venue customization is shown as a coming-soon state.
- Several Supabase tables used by UI code are not represented in the generated `Database` TypeScript interface and are accessed through loose `any` casts.

## 3. User Personas

### 3.1 Bride / Groom

A couple member preparing for marriage who wants to browse vendors, save design preferences, estimate costs, track tasks, unlock offers, and receive guidance.

### 3.2 Wedding Planner

A planning-oriented user role supported in the application context type. The current UI mostly focuses on bride/groom demo flows, but the role exists for future journey personalization.

### 3.3 Guest / Anonymous User

A visitor can browse public-facing areas such as home, services, guide, blog, and use some chat interfaces. Dashboard features require demo login.

### 3.4 Vendor / Service Provider

Represented by vendor records in Supabase. Vendor-facing administration is not currently implemented, but vendor data powers service discovery and product customization.

## 4. High-Level Architecture

```text
Browser / GitHub Pages
  └─ React 19 + Vite + TypeScript SPA
       ├─ React Router routes under /LOMAR
       ├─ Tailwind CSS v4 theme utilities
       ├─ Supabase JS client for database reads/writes
       ├─ LocalStorage for demo auth and customization state
       └─ VTON API calls
             ├─ Development: Vite proxy /api/vton -> FastAPI backend
             └─ Production: direct Cloud Run URL via VITE_VTON_BACKEND_URL

FastAPI Backend / Cloud Run
  ├─ /health
  ├─ /proxy-image
  ├─ /test-try-on
  └─ /test-try-on-upload
       └─ Google GenAI SDK
            ├─ Vertex AI mode
            └─ API-key mode fallback

Supabase
  ├─ vendors, products, product_images
  ├─ customization_options, customization_values, product_options
  ├─ user_designs, user_design_selections, v_dashboard_saved_designs
  ├─ chat_messages
  ├─ posts, tags, post_tags, post_likes, post_comments
  ├─ task_dictionary, user_journey_tasks
  ├─ vouchers, user_vouchers
  └─ users, reviews, favorites
```

## 5. Repository Layout

```text
repo/
  .github/workflows/deploy-ui.yml
  backend/
    Dockerfile
    docker-compose.yml
    index.html
    list_models.py
    README.md
    requirements.txt
    streamlit_ui.py
    test_api.py
  scratch/
    extract_colors.py
    find-eye.cjs
    replace_colors.py
    test-supabase.cjs
    test-supabase.js
  src/
    App.tsx
    index.css
    main.tsx
    components/
      chat/
      layout/
    context/
    data/
    img/
    lib/
    pages/
    types/
  index.html
  metadata.json
  package.json
  package-lock.json
  README.md
  tsconfig.json
  vite.config.ts
```

## 6. Frontend Stack

### 6.1 Core Technologies

- React 19 for UI composition.
- TypeScript for application typing.
- Vite 6 for dev server, build, preview, proxy, and GitHub Pages base path support.
- React Router DOM 7 for SPA routing.
- Tailwind CSS 4 through `@tailwindcss/vite`.
- Lucide React for icons.
- Motion for page and component animations.
- Supabase JS 2 for database communication.
- Canvas Confetti for dashboard celebration effects.

### 6.2 Build Scripts

- `npm run dev`: starts Vite on port `3000` and host `0.0.0.0`.
- `npm run build`: builds production assets into `dist`.
- `npm run preview`: previews the Vite production build.
- `npm run lint`: runs `tsc --noEmit`.
- `npm run dev:backend`: points to an older sibling path and may need correction for this repository.
- `npm run dev:full`: attempts to run backend and frontend concurrently using shell backgrounding.

### 6.3 Styling System

The application uses utility-first styling via Tailwind CSS. Theme overrides define:

- `--font-sans`: Inter/system sans stack.
- `--font-serif`: Playfair Display/serif stack.
- Rose color aliases mapped to `#ffe9c9`.
- `.no-scrollbar` utility for hidden scrollbar behavior across browsers.

### 6.4 Asset Usage

Local image assets include logos, mascot images, mannequin images, color palette references, and background imagery. Unsplash remote images are used extensively for placeholder vendor, blog, guide, and homepage visuals.

## 7. Routing and Navigation

The SPA uses `BrowserRouter` with basename `/LOMAR`, matching GitHub Pages deployment under a repository subpath.

Routes:

| Path | Page | Purpose |
| --- | --- | --- |
| `/` | Home | Landing page for Phố Hạnh Phúc story and journey categories. |
| `/explore` | Services | Vendor/service discovery with category and search filters. |
| `/customize` | Customize | Product customization, pricing, chat, and VTON preview generation. |
| `/blog` | Blog | Community/social feed sourced from Supabase posts and related tables. |
| `/guide` | Guide | Wedding preparation checklist and educational content. |
| `/ai-consultant` | AIConsultant | Chat-like consultant with product suggestions. |
| `/dashboard` | Dashboard | User journey tracking, vouchers, and saved designs. |
| `/vendor/:vendorId` | VendorDetail | Vendor detail view. |
| `/login` | Login | Demo login and registration UI. |

The `Layout` component wraps routed pages with navbar, footer, and floating assistant chat.

## 8. Global State and Persistence

### 8.1 Focused Contexts

`AuthProvider` exposes:

- `user`: the application profile mapped from the Supabase session and `profiles` row.
- `session`: the current Supabase session.
- `authLoading`: initial session bootstrap state.
- `signIn`, `signUp`, and `signOut`: Supabase authentication operations.

`CustomizationProvider` exposes:

- `customizedServices`: map keyed by category containing selected product, selected options, price, vendor, and image data.
- `saveCustomizedService`: persists customized services into localStorage.

Consumers use `useAuth` or `useCustomization` directly. There is no combined application-context adapter.

### 8.2 LocalStorage Keys

- `customizedServices`: current category customization selections and totals.
- `lomar_customize_temp_preview`: generated VTON preview image cache keyed by category/product/mannequin.

## 9. Supabase Integration

### 9.1 Client Setup

The frontend creates a typed Supabase client from:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

If missing, it logs a warning and creates a placeholder client. Production deployments must provide valid values.

### 9.2 Typed Database Tables

The TypeScript `Database` interface currently defines:

- `chat_messages`
- `post_comments`
- `post_likes`
- `post_tags`
- `posts`
- `products`
- `reviews`
- `tags`
- `task_dictionary`
- `user_favorite_products`
- `user_journey_tasks`
- `user_vouchers`
- `users`
- `vendors`
- `vouchers`

### 9.3 Additional Runtime Tables / Views Used by UI

The UI also queries or writes the following structures through loose casts or untyped calls:

- `product_images`
- `product_options`
- `customization_options`
- `customization_values`
- `user_designs`
- `user_design_selections`
- `v_dashboard_saved_designs`

These should be added to the generated TypeScript database type for stronger safety.

### 9.4 Expected Data Relationships

- `vendors.id` -> `products.vendor_id`
- `products.id` -> `product_images.product_id`
- `products.id` -> `product_options.product_id`
- `customization_options.id` -> `product_options.option_id`
- `customization_options.id` -> `customization_values.option_id` or nested Supabase relation equivalent
- `user_designs.id` -> `user_design_selections.design_id`
- `customization_values.id` -> `user_design_selections.value_id`
- `posts.user_id` -> `users.id`
- `posts.id` -> `post_likes.post_id`, `post_comments.post_id`, `post_tags.post_id`
- `tags.id` -> `post_tags.tag_id`
- `task_dictionary.id` -> `user_journey_tasks.task_id`
- `vouchers.id` -> `user_vouchers.voucher_id`
- `task_dictionary.id` -> `vouchers.required_task_id`

## 10. Feature Specifications

### 10.1 Home Page

The Home page is a marketing and story-driven landing experience.

Capabilities:

- Hero section with Hồ Văn Huê / Phố Hạnh Phúc messaging.
- Journey category rail linking into `/explore` with category query parameters.
- Story section describing values: Nghĩa Tình, Văn Minh, Hiện Đại, Hạnh Phúc.
- Development milestone timeline.
- CTA banner linking to service discovery.
- Motion animations and responsive image treatments.

### 10.2 Services / Explore

The Services page lists vendors from Supabase.

Capabilities:

- Fetch all vendors from `vendors`.
- Build categories dynamically from vendor categories.
- Use URL query `category` to preselect a category.
- Alias categories such as `Trang điểm -> Make Up`, `Chụp ảnh -> Studio`, `Y tế -> Sức Khỏe`.
- Search by vendor name, category, or address.
- Navigate to vendor detail by clicking a vendor card.
- Show empty state when filters match nothing.

### 10.3 Vendor Detail

The route exists as `/vendor/:vendorId`. It is expected to show detailed vendor/service information for the selected vendor. The implementation should be reviewed and kept aligned with the vendor and product schema.

### 10.4 Customize

The Customize page is one of the core application modules.

Capabilities:

- Fetch products, product images, vendors, customization options, customization values, and product-option mappings from Supabase.
- Restrict visible customization categories to `Váy Cưới`, `Vest`, and `Venue`.
- Show `Venue` as a coming-soon state.
- Let users select a base product by category.
- Show allowed customization option groups for the active product.
- Translate selected English option values into Vietnamese labels for known options.
- Compute current price as product base price plus selected option extra prices.
- Persist active customized service summary to context and localStorage.
- Let users select male/female mannequin images.
- Build a generation prompt from product, vendor, selected options, and custom user prompt.
- Call backend VTON upload endpoint using `FormData`.
- Display generated image preview and persist preview in localStorage.
- Write user and assistant chat events to `chat_messages`.
- Save a design into `user_designs` and `user_design_selections`.

### 10.5 Virtual Try-On Preview Flow

Frontend flow:

1. User selects category, product, options, mannequin, and optional prompt.
2. Frontend resolves mannequin and garment image into blobs.
3. External product images are fetched through backend `/proxy-image` to avoid CORS where needed.
4. Frontend creates `FormData`:
   - `body_image`
   - `garment_image`
   - `category`
   - `prompt`
5. Frontend sends POST request to:
   - development: `/api/vton/test-try-on-upload`
   - production: `${VITE_VTON_BACKEND_URL}/test-try-on-upload`
6. Backend returns a data URL or image URL field.
7. Frontend displays the generated preview and caches it.

### 10.6 AI Consultant

The AI Consultant page provides a chat interface and product recommendation panel.

Current behavior:

- Loads chat history from `chat_messages` scoped to derived `userId`.
- Provides a default greeting when no messages exist.
- Saves user messages to Supabase.
- Simulates assistant typing delay.
- Uses keyword matching to infer product category:
  - `váy`, `cưới` -> `Váy Cưới`
  - `vest` -> `Vest`
  - `venue`, `nhà hàng` -> `Venue`
  - `trang trí` -> `Trang Trí`
- Fetches one matching product and stores it as the suggested product.
- Renders suggested product card with image, category, price, and Hồ Văn Huê context.

Future enhancement: replace the mock response logic with a real LLM-backed assistant and structured recommendation engine.

### 10.7 Dashboard

The Dashboard is the personalized journey management area.

Capabilities:

- Requires demo login; otherwise shows a login prompt and quick demo account buttons.
- Loads task dictionary and user task progress.
- Loads vouchers and user voucher states.
- Loads saved designs from `v_dashboard_saved_designs`.
- Supports four station tabs:
  - `T01`: Sức Khỏe
  - `T02`: Tình Yêu / Studio
  - `T03`: Sắc Đẹp / Váy Cưới / Vest
  - `T04`: Hạnh Phúc / Venue
- Allows task completion toggling.
- Inserts missing user task rows when toggling previously untracked tasks.
- Updates voucher unlock state based on dependent task completion.
- Triggers confetti on task completion.
- Shows saved custom designs grouped by relevant station.
- Displays overall progress percentage and task count.

### 10.8 Login

Login uses Supabase Auth and also offers pre-seeded demo accounts.

Capabilities:

- Login/register tabs.
- Email/password fields.
- Full name and bride/groom role selection for registration.
- Quick demo login accounts:
  - Cô dâu Quỳnh Anh
  - Chú rể Gia Bảo
- Loading and success states driven by the authentication request.
- Session bootstrap and refresh through `AuthProvider`.
- Redirects to requested `redirect` query path or `/dashboard`.

Identity is the real Supabase Auth UUID. Wedding role metadata remains separate from the platform authority stored in `profiles.role`.

### 10.9 Blog

The Blog page displays a social/community feed.

Capabilities:

- Loads posts from Supabase ordered by newest.
- For each post, resolves author information from `users`.
- Counts likes from `post_likes`.
- Counts comments from `post_comments`.
- Resolves tags through `post_tags` and `tags`.
- Formats relative time in hours/days.
- Displays static composer UI, sorting menu, highlight card, trending posts, and topics.

Current limitations:

- Composer does not create posts.
- Like/comment/share interactions are display-only.
- Trend data is static.

### 10.10 Guide

The Guide page is a static educational and checklist area.

Capabilities:

- Hero section for Wedding Guide.
- Phase selector with four planning time windows:
  - 9-12 months before
  - 6-8 months before
  - 3-5 months before
  - 1-2 months before
- Checklist tasks per phase.
- Static featured article and mini-course video card.

### 10.11 Floating Chat / Bé Song Hỷ

A floating assistant widget is available globally inside the layout.

Capabilities:

- Uses an interactive mascot launcher.
- Opens a chat window.
- Loads global chat history from `chat_messages`.
- Shows a default greeting when no history exists.
- Saves user messages and canned assistant responses to Supabase.
- Uses Motion animations for opening, closing, tooltip, and message transitions.

Current limitation: assistant responses are canned and not driven by a real AI service.

## 11. Backend Specification

### 11.1 Stack

- Python 3.10+
- FastAPI
- Uvicorn
- Pydantic
- Requests
- Pillow
- Google GenAI SDK
- Google Cloud AI Platform dependencies
- python-multipart for uploads
- python-dotenv for local environment loading
- Streamlit optional UI

### 11.2 Backend Application

The backend FastAPI application is titled `LOMAR Vertex AI Nano Banana VTON API` and has version `3.0.0`.

CORS is currently configured broadly:

- `allow_origins=["*"]`
- `allow_credentials=False`
- all methods and headers allowed

This is convenient for demos but should be restricted for production.

### 11.3 Environment Variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `GOOGLE_GENAI_USE_VERTEXAI` | No | `true` | Enables Vertex AI mode when truthy. |
| `GOOGLE_CLOUD_PROJECT` | Yes for Vertex AI | empty | Google Cloud project ID. |
| `GOOGLE_CLOUD_LOCATION` | No | `us-central1` in code, `global` in docs examples | Vertex AI location. |
| `NANO_BANANA_MODEL` | No | `gemini-2.5-flash-image-preview` | Image model name. |
| `GOOGLE_IMAGE_MODEL` | No | fallback source | Alternate model env variable. |
| `GOOGLE_API_KEY` | Yes when Vertex disabled | empty | API-key mode credential. |
| `GEMINI_API_KEY` | Alternative when Vertex disabled | empty | API-key mode fallback credential. |
| `API_HOST` | No | `0.0.0.0` | Uvicorn host. |
| `API_PORT` | No | `3000` in code, commonly `3003` local or `8080` Cloud Run | Uvicorn port. |

### 11.4 API Endpoints

#### `GET /health`

Returns backend status and active model/provider configuration.

Response shape:

```json
{
  "ok": true,
  "service": "LOMAR Vertex AI Nano Banana VTON API",
  "model": "gemini-2.5-flash-image-preview",
  "provider": "vertex-ai",
  "project": "project-id",
  "location": "global",
  "vertex_configured": true
}
```

#### `GET /proxy-image?url=...`

Downloads an image from a remote URL and returns it with its original content type.

Purpose:

- Avoid browser-side CORS issues when frontend needs to convert external product image URLs into upload blobs.

Failure behavior:

- Returns HTTP 400 with a text detail when download/proxy fails.

#### `POST /test-try-on`

URL-based VTON endpoint.

Request body:

```json
{
  "body_url": "https://example.com/mannequin.png",
  "garment_url": "https://example.com/dress.png",
  "category": "dress",
  "prompt": "make the dress more elegant but preserve the original fabric pattern"
}
```

Validation:

- `body_url`: valid HTTP URL.
- `garment_url`: valid HTTP URL.
- `category`: one of `tops`, `bottoms`, `onepieces`, `dress`, `clothes`.
- `prompt`: optional string.

#### `POST /test-try-on-upload`

Multipart upload VTON endpoint.

Form fields:

- `body_image`: mannequin/base image file.
- `garment_image`: garment/clothing image file.
- `category`: `tops`, `bottoms`, `onepieces`, `dress`, or `clothes`.
- `prompt`: optional user styling/edit prompt.

Response shape:

```json
{
  "ok": true,
  "image_url": "data:image/png;base64,...",
  "latency_ms": 8123,
  "latency_seconds": 8.12,
  "model": "gemini-2.5-flash-image-preview",
  "provider": "vertex-ai",
  "project": "project-id",
  "location": "global",
  "category": "dress",
  "prompt": "...",
  "raw": null
}
```

### 11.5 Image Processing

Backend image normalization:

- Validates content type starts with `image/`.
- Opens image through Pillow.
- Applies EXIF transpose.
- Converts image to RGB.
- Serializes as PNG bytes.
- Encodes data URL for downstream response use.

This ensures Vertex AI-compatible PNG input regardless of original uploaded image format.

### 11.6 Prompt Construction

The backend constructs a strict virtual try-on prompt instructing the model to:

- Preserve mannequin identity, proportions, pose, camera angle, lighting, and background.
- Preserve clothing design, color, fabric, pattern, silhouette, logos, embroidery, buttons, and construction details.
- Fit clothing naturally with realistic drape, wrinkles, folds, shadows, occlusion, and perspective.
- Replace only the relevant clothing area for the selected category.
- Apply user refinements while keeping mannequin and clothing recognizable.
- Avoid text, watermarks, borders, extra people, extra mannequins, and unrelated accessories.
- Return only the final edited image.

### 11.7 Safety Settings

The backend currently sets Gemini safety thresholds to `BLOCK_NONE` for:

- Hate speech
- Dangerous content
- Sexually explicit
- Harassment

Reason stated in code: mannequin/clothing edits may otherwise be blocked for the fashion use case.

Production note: this should be reviewed against applicable platform policies and business safety requirements.

### 11.8 Error Handling

Expected error cases:

- Missing Google project in Vertex mode -> HTTP 500.
- Missing API key in API-key mode -> HTTP 500.
- Remote input image download failure -> HTTP 400.
- Invalid uploaded file or non-image input -> HTTP 400.
- Vertex/GenAI request failure -> HTTP 502 with latency.
- No generated image returned -> HTTP 502 with text parts, finish reason, and safety ratings where available.

## 12. Deployment Specification

### 12.1 Frontend Deployment: GitHub Pages

Workflow: `.github/workflows/deploy-ui.yml`

Trigger conditions:

- Push to `main` affecting:
  - `src/**`
  - `backend/**`
  - `package.json`
  - `package-lock.json`
  - `vite.config.ts`
  - workflow file itself
- Manual `workflow_dispatch`

Build job:

- Runs on `ubuntu-latest`.
- Checks out repository.
- Uses Node `22`.
- Caches npm dependencies.
- Runs `npm ci`.
- Runs `npm run build`.
- Uploads `./dist` as Pages artifact.

Deployment job:

- Deploys artifact with `actions/deploy-pages@v4`.

Environment variables supplied at build:

- `VITE_BASE_PATH=/${{ github.event.repository.name }}/`
- `VITE_VTON_BACKEND_URL=${{ vars.VTON_BACKEND_URL || '' }}`
- `VITE_SUPABASE_URL=${{ secrets.VITE_SUPABASE_URL }}`
- `VITE_SUPABASE_ANON_KEY=${{ secrets.VITE_SUPABASE_ANON_KEY }}`
- `GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY || '' }}`

### 12.2 Backend Deployment: Docker / Cloud Run

Backend is containerized with Docker and can be run through Docker Compose.

Docker Compose:

- Builds from `backend/Dockerfile`.
- Maps host `8080` to container `8080`.
- Loads `.env`.
- Sets `API_HOST=0.0.0.0` and `API_PORT=8080`.
- Health-checks `http://localhost:8080/health`.
- Restarts unless stopped.

Cloud Run expectations:

- Backend listens on `0.0.0.0:8080`.
- Required Google Cloud IAM roles include Cloud Run Admin, Artifact Registry Writer, and Vertex AI User for deployment automation.
- Runtime service account must be able to call Vertex AI.
- Cloud Run service must be reachable by the browser if frontend is public.

### 12.3 Vite Proxy

Development proxy:

- Frontend calls `/api/vton/...`.
- Vite proxies `/api/vton` to `VITE_VTON_BACKEND_URL` or `http://localhost:3003`.
- Proxy rewrites `/api/vton` prefix away before forwarding.

Production:

- Browser calls `VITE_VTON_BACKEND_URL` directly.
- CORS must allow the GitHub Pages origin.

## 13. Environment Configuration

### 13.1 Frontend `.env.local`

Recommended local values:

```env
GEMINI_API_KEY=""
APP_URL="http://localhost:3000"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_VTON_BACKEND_URL="http://localhost:3003"
VITE_VTON_ENDPOINT="/test-try-on-upload"
VITE_BASE_PATH="/LOMAR/"
```

Note: frontend code currently checks `VITE_VERTEX_AI_ENDPOINT`, while README examples mention `VITE_VTON_ENDPOINT`. Standardize the variable name to avoid deployment confusion.

### 13.2 Backend `.env`

Recommended local values:

```env
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=your-google-cloud-project-id
GOOGLE_CLOUD_LOCATION=global
NANO_BANANA_MODEL=gemini-2.5-flash-image-preview
API_HOST=0.0.0.0
API_PORT=3003
```

API-key mode alternative:

```env
GOOGLE_GENAI_USE_VERTEXAI=false
GOOGLE_API_KEY=your-google-api-key
API_HOST=0.0.0.0
API_PORT=3003
```

## 14. Data Model Specification

### 14.1 Marketplace Tables

#### `vendors`

Fields currently typed:

- `id`: string
- `name`: string/null
- `category`: string/null
- `address`: string/null
- `rating`: number/null
- `image_url`: string/null

Purpose:

- Vendor directory and product vendor lookup.

#### `products`

Fields currently typed:

- `id`: string
- `vendor_id`: string/null
- `category`: string/null
- `name`: string/null
- `price`: number/null
- `image_url`: string/null

Purpose:

- Base catalog items for customization, recommendations, saved designs, and product cards.

#### `product_images`

Fields inferred from usage:

- `product_id`
- `image_url`
- `is_main`

Purpose:

- Multiple product images sorted with main image first.

### 14.2 Customization Tables

#### `customization_options`

Fields inferred from usage:

- `id`
- `category`
- `name`
- `display_order`
- nested `customization_values`

#### `customization_values`

Fields inferred from usage:

- `id`
- `value_name`
- `extra_price`

#### `product_options`

Fields inferred from usage:

- `product_id`
- `option_id`

#### `user_designs`

Fields inferred from writes:

- `id`
- `user_id`
- `category`
- `total_price`

#### `user_design_selections`

Fields inferred from writes:

- `design_id`
- `value_id`

#### `v_dashboard_saved_designs`

Fields inferred from reads:

- `user_id`
- `design_id`
- `category`
- `created_at`
- `total_price`
- `selections` array with `option_name` and `value_name`

### 14.3 Journey and Voucher Tables

#### `task_dictionary`

- `id`
- `name`
- `is_mandatory`

#### `user_journey_tasks`

- `id`
- `user_id`
- `task_id`
- `status`
- `completed_at`

#### `vouchers`

- `id`
- `vendor_id`
- `required_task_id`
- `title`
- `discount_value`

#### `user_vouchers`

- `id`
- `user_id`
- `voucher_id`
- `status`
- `unlocked_at`

### 14.4 Social Tables

#### `posts`

- `id`
- `user_id`
- `content`
- `views_count`
- `created_at`

#### `users`

- `id`
- `username`
- `email`
- `avatar_url`
- `is_new`

#### `post_likes`

- `post_id`
- `user_id`
- `created_at`

#### `post_comments`

- `id`
- `post_id`
- `user_id`
- `content`
- `created_at`

#### `tags`

- `id`
- `name`

#### `post_tags`

- `post_id`
- `tag_id`

### 14.5 Chat Table

#### `chat_messages`

- `id`
- `user_id`
- `role`
- `content`
- `suggested_product_id`
- `created_at`

Used by:

- Floating chat.
- AI Consultant.
- Customize assistant/chat.

Note: multiple chat surfaces share one table and sometimes use different user ID strategies. For production, chat sessions should be scoped by explicit surface/session/user identifiers.

## 15. Security and Privacy Considerations

### 15.1 Authentication

Current demo auth is localStorage-based and not secure. Production should implement:

- Supabase Auth or another secure identity provider.
- Server-side authorization policies.
- Row-level security for user-specific tables.
- Token/session expiration and refresh.

### 15.2 Supabase RLS

Recommended RLS policies:

- Public read for published vendors/products/posts if intended.
- User-only read/write for `chat_messages`, `user_designs`, `user_design_selections`, `user_journey_tasks`, and `user_vouchers`.
- Restrict direct client writes to protected marketplace/admin tables.
- Validate user ID ownership server-side or through authenticated Supabase policies.

### 15.3 Secrets

Never expose server-only secrets in frontend builds. Frontend may use Supabase anon key only if RLS is correctly configured.

Google service account keys and privileged API keys must stay in GitHub Secrets, Cloud Run env vars, or workload identity systems.

### 15.4 CORS

Backend currently allows all origins. Production should restrict CORS to:

- GitHub Pages domain.
- Local development origins as needed.
- Any official custom domains.

### 15.5 User-Provided Images

VTON upload endpoints process arbitrary images. Production hardening should include:

- File size limits.
- MIME validation.
- Image dimension limits.
- Timeout controls.
- Abuse/rate limiting.
- Logging without storing sensitive image contents unless explicitly required.

## 16. Performance Considerations

### 16.1 Frontend

- Avoid loading large remote images without optimized sizes.
- Consider route-level code splitting for large pages.
- Cache vendor/product data where appropriate.
- Avoid N+1 Supabase calls on Blog by using joins/views/RPCs.
- Reduce repeated chat table reads across separate chat surfaces.

### 16.2 Backend

- Image normalization and Vertex AI calls are latency-sensitive.
- Current VTON calls are synchronous request/response; long model latency may block browser UX.
- Consider async job queue for production generation workloads.
- Add request payload size limits.
- Add structured latency logs.

### 16.3 Database

Recommended indexes:

- `vendors(category)`
- `products(category)`
- `products(vendor_id)`
- `product_images(product_id)`
- `product_options(product_id)`
- `chat_messages(user_id, created_at)`
- `posts(created_at)`
- `post_likes(post_id)`
- `post_comments(post_id)`
- `user_journey_tasks(user_id, task_id)`
- `user_vouchers(user_id, voucher_id)`
- `user_designs(user_id, category)`

## 17. Testing and Verification

### 17.1 Frontend Verification

Run:

```bash
npm install
npm run lint
npm run build
npm run dev
```

Manual checks:

- Home loads under `/LOMAR` base path.
- Explore fetches vendors and filters by category/search.
- Login demo accounts persist into dashboard.
- Dashboard toggles tasks and unlocks vouchers.
- Customize loads product categories and options.
- Customize saves design rows.
- VTON preview generation works when backend is configured.
- Blog displays posts and metadata.
- Floating chat opens and stores messages.

### 17.2 Backend Verification

Run locally:

```bash
cd backend
pip install -r requirements.txt
python test_api.py
```

Health check:

```bash
curl http://localhost:3003/health
```

Upload VTON check:

```bash
curl -s -X POST http://localhost:3003/test-try-on-upload \
  -F "body_image=@test_images/mannequin.png" \
  -F "garment_image=@test_images/dress.png" \
  -F "category=dress" \
  -F "prompt=Fit this dress naturally on the mannequin and preserve the fabric pattern."
```

### 17.3 Deployment Verification

Frontend:

- GitHub Pages source is GitHub Actions.
- Workflow completes successfully.
- Built site opens at `https://<owner>.github.io/LOMAR/` or equivalent repository name path.
- Supabase env secrets are present.
- Backend URL repository variable is configured.

Backend:

- Cloud Run service responds to `/health`.
- Cloud Run service allows browser access if public frontend is used.
- Runtime service account can call Vertex AI.
- CORS allows frontend origin.
- VTON upload endpoint returns an image data URL.

## 18. Known Issues and Technical Debt

1. `package.json` backend scripts reference `../vton_test_ui`, which does not match the in-repository `backend` folder.
2. Frontend environment variable naming is inconsistent: README mentions `VITE_VTON_ENDPOINT`, while Customize reads `VITE_VERTEX_AI_ENDPOINT`.
3. TypeScript database definitions omit tables/views used by Customize and Dashboard.
4. Demo authentication is local-only and insecure for production.
5. FloatingChat reads all chat messages without user scoping.
6. AI Consultant is not a real LLM despite its UI naming.
7. CORS is open on backend.
8. Some README backend deployment references a workflow file that is not present in the listed repository tree.
9. `clean` script uses Unix `rm -rf`, which is not portable to default Windows PowerShell.
10. Product/blog queries may cause N+1 database access patterns.
11. Backend `API_PORT` default in code is `3000`, while docs/local frontend assume `3003` and Docker assumes `8080`.
12. Safety filter disabling should be reviewed before production.

## 19. Recommended Roadmap

### 19.1 Stabilization

- Align npm backend scripts with `repo/backend`.
- Standardize VTON endpoint environment variable.
- Regenerate Supabase TypeScript types to include all runtime tables/views.
- Add `.env.example` for frontend.
- Add backend CI build/test workflow.
- Fix Windows-incompatible scripts.

### 19.2 Production Readiness

- Replace demo auth with Supabase Auth.
- Add RLS policies and verify with anon key.
- Restrict backend CORS.
- Add rate limiting and upload size constraints.
- Add structured logs and monitoring for VTON latency/errors.
- Add Cloud Run deployment workflow if intended.

### 19.3 Product Enhancements

- Implement real AI Consultant backend/LLM integration.
- Implement blog composer, likes, comments, and saves.
- Implement booking and appointment workflows.
- Implement vendor profile management.
- Finish Venue customization.
- Add payment/deposit flow if marketplace transactions are required.
- Add favorites and cart-like planning board.

### 19.4 UX Enhancements

- Add loading skeletons for data-heavy pages.
- Add toast notifications instead of alerts.
- Add optimistic rollback on failed dashboard updates.
- Add image upload for user-owned mannequin/body reference.
- Add accessible labels and keyboard focus states across controls.

## 20. Operational Runbook

### 20.1 Local Full-Stack Startup

Terminal 1:

```bash
cd backend
python test_api.py
```

Terminal 2:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/LOMAR/
```

### 20.2 Docker Backend Startup

```bash
cd backend
docker compose up --build
```

Open health endpoint:

```text
http://localhost:8080/health
```

### 20.3 Common Troubleshooting

#### Frontend cannot reach VTON backend

- Verify `VITE_VTON_BACKEND_URL`.
- Verify backend `/health`.
- Verify Vite proxy path in development.
- Verify Cloud Run CORS in production.

#### Supabase data is empty

- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Verify RLS policies allow intended reads.
- Verify required tables are populated.

#### VTON returns no image

- Inspect backend HTTP 502 details.
- Check model name and region.
- Check Vertex AI permissions.
- Verify uploaded images are valid and not too large.
- Inspect safety finish reasons.

#### GitHub Pages route 404 on refresh

The app uses `BrowserRouter`; GitHub Pages can have refresh issues on nested routes. Consider switching to `HashRouter`, adding a Pages fallback, or configuring static hosting rewrite behavior if this becomes a production problem.

## 21. Acceptance Criteria for This Specification

This specification is complete when it documents:

- Project purpose and audience.
- Frontend stack, routes, pages, state, styling, and data usage.
- Supabase schema expectations and inferred relationships.
- Backend endpoints, image processing, AI provider integration, and environment variables.
- Deployment architecture for GitHub Pages and Cloud Run/Docker.
- Security, performance, testing, known issues, and roadmap.

## 22. Glossary

- **LOMAR**: The repository/application name for the wedding ecosystem platform.
- **Phố Hạnh Phúc Hồ Văn Huê**: Brand/context for the wedding street ecosystem.
- **Bé Song Hỷ**: Mascot and assistant persona used in chat UIs.
- **VTON**: Virtual try-on, generating a product try-on preview on a mannequin/body image.
- **Vertex AI**: Google Cloud AI platform used for image generation through Google GenAI SDK.
- **Nano Banana**: Project naming for the selected Gemini image generation model flow.
- **Supabase**: Backend-as-a-service database used by the frontend.
- **GitHub Pages**: Static frontend hosting target.
- **Cloud Run**: Container hosting target for the FastAPI backend.
