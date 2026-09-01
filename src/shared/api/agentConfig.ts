// Agent Service base URL. Vite inlines VITE_AGENT_SERVICE_URL at build time.
// In development, leave it unset and use the /api/agent proxy below so the
// browser does not need CORS access to localhost:8090.
const CONFIGURED_AGENT_SERVICE_URL = (import.meta.env.VITE_AGENT_SERVICE_URL || '')
  .trim()
  .replace(/\/+$/, '');

const PRODUCTION_FALLBACK_AGENT_SERVICE_URL = '';

function resolveAgentBaseUrl(): string {
  if (CONFIGURED_AGENT_SERVICE_URL) return CONFIGURED_AGENT_SERVICE_URL;

  if (import.meta.env.PROD) {
    if (!PRODUCTION_FALLBACK_AGENT_SERVICE_URL) {
      console.warn(
        'VITE_AGENT_SERVICE_URL was not set at build time. AI Consultant requests will fail in production. ' +
          'Set VITE_AGENT_SERVICE_URL to the public Agent Service URL and rebuild.'
      );
      return '';
    }
    return PRODUCTION_FALLBACK_AGENT_SERVICE_URL;
  }

  return '';
}

const AGENT_SERVICE_BASE_URL = resolveAgentBaseUrl();

export function resolveAgentEndpoint(endpoint: `/${string}`): string {
  if (AGENT_SERVICE_BASE_URL) return `${AGENT_SERVICE_BASE_URL}${endpoint}`;

  // Vite dev proxy maps /api/agent/* to the Agent Service and strips the
  // /api/agent prefix before forwarding.
  return `/api/agent${endpoint}`;
}
