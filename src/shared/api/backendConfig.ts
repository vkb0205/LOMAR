// Compile-time backend base URL. Vite inlines import.meta.env at build time,
// so these values are fixed when the bundle is produced — changing them later
// requires a rebuild, not just a restart.
const CONFIGURED_BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_VTON_BACKEND_URL || ''
)
  .trim()
  .replace(/\/+$/, '');

// Last-resort base URL for production builds. Relative /api/... paths only
// resolve through the Vite dev proxy; in a static deploy they hit the static
// host itself and 404, which surfaces as silently empty data rather than an
// obvious failure. Defaulting to the real API keeps a deployment that was
// built without VITE_BACKEND_URL functional.
const PRODUCTION_FALLBACK_BACKEND_URL = 'https://lomar-backend.onrender.com';

function isLocalUrl(url: string): boolean {
  return url.includes('localhost') || url.includes('127.0.0.1');
}

/**
 * Resolve the base URL every backend request is prefixed with.
 *
 * Development returns an empty string so requests stay relative and flow
 * through the Vite proxy configured in vite.config.ts. Production always
 * returns an absolute origin: the configured value when present, otherwise
 * the fallback above.
 */
function resolveBackendBaseUrl(): string {
  if (CONFIGURED_BACKEND_URL && !isLocalUrl(CONFIGURED_BACKEND_URL)) {
    return CONFIGURED_BACKEND_URL;
  }

  // A localhost URL in a production bundle is a misconfiguration: the browser
  // would resolve it against the visitor's own machine.
  if (import.meta.env.PROD) {
    if (CONFIGURED_BACKEND_URL) {
      console.warn(
        `VITE_BACKEND_URL points at "${CONFIGURED_BACKEND_URL}", which is not reachable ` +
        `from a deployed site. Falling back to ${PRODUCTION_FALLBACK_BACKEND_URL}.`
      );
    } else {
      console.warn(
        'VITE_BACKEND_URL was not set at build time. Falling back to ' +
        `${PRODUCTION_FALLBACK_BACKEND_URL}. Set it in the hosting ` +
        'environment and rebuild to target a different backend.'
      );
    }
    return PRODUCTION_FALLBACK_BACKEND_URL;
  }

  return '';
}

const BACKEND_BASE_URL = resolveBackendBaseUrl();

export function resolveBackendEndpoint(endpoint: `/${string}`): string {
  // Absolute base (production, or an explicitly configured remote backend in
  // development): append the endpoint unchanged.
  if (BACKEND_BASE_URL) return `${BACKEND_BASE_URL}${endpoint}`;

  // Development against the local backend: keep paths relative so the Vite
  // proxy handles them. Legacy VTON routes live under the /api/vton prefix.
  return endpoint.startsWith('/api/v1/') ? endpoint : `/api/vton${endpoint}`;
}

export function resolveDataEndpoint(endpoint: `/api/v1/${string}`): string {
  return resolveBackendEndpoint(endpoint);
}
