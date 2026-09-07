const DEVELOPMENT_BACKEND_URL = (
  import.meta.env.VITE_DEVELOPMENT_BACKEND_URL || ''
)
  .trim()
  .replace(/\/+$/, '');

const PRODUCTION_BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || ''
)
  .trim()
  .replace(/\/+$/, '');

// Last-resort base URL for production builds. Relative /api/... paths only
// resolve through the Vite dev proxy; in a static deploy they hit the static
// host itself and 404, which surfaces as silently empty data rather than an
// obvious failure. Defaulting to the real API keeps a deployment that was
// built without VITE_BACKEND_URL functional.
const PRODUCTION_FALLBACK_BACKEND_URL = 'https://lomar-backend.onrender.com';

function resolveBackendBaseUrl(): string {
  if (import.meta.env.PROD) {
    return PRODUCTION_BACKEND_URL || PRODUCTION_FALLBACK_BACKEND_URL;
  }
  return DEVELOPMENT_BACKEND_URL;
}

const BACKEND_BASE_URL = resolveBackendBaseUrl();

export function resolveBackendEndpoint(endpoint: `/${string}`): string {
  if (BACKEND_BASE_URL) return `${BACKEND_BASE_URL}${endpoint}`;
  return endpoint;
}

export function resolveDataEndpoint(endpoint: `/api/v1/${string}`): string {
  return resolveBackendEndpoint(endpoint);
}
