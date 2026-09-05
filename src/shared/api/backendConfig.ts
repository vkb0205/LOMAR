const DEVELOPMENT_BACKEND_URL = (
  import.meta.env.VITE_DEVELOPMENT_BACKEND_URL || ''
)
  .trim()
  .replace(/\/+$/, '');

const PRODUCTION_BACKEND_URL = (
  import.meta.env.VITE_PRODUCTION_BACKEND_URL || ''
)
  .trim()
  .replace(/\/+$/, '');

function resolveBackendBaseUrl(): string {
  if (import.meta.env.PROD) {
    return PRODUCTION_BACKEND_URL;
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
