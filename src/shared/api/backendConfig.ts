export function resolveBackendEndpoint(endpoint: `/${string}`): string {
  const configuredBackendUrl = (
    import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_VTON_BACKEND_URL || ''
  ).replace(/\/+$/, '');
  const isProductionBackend =
    configuredBackendUrl &&
    !configuredBackendUrl.includes('localhost') &&
    !configuredBackendUrl.includes('127.0.0.1');

  // Development Vite proxies both legacy VTON and versioned application data
  // paths to one backend process. Production keeps the configured Cloud Run
  // base URL and appends the endpoint unchanged.
  if (isProductionBackend) return `${configuredBackendUrl}${endpoint}`;
  return endpoint.startsWith('/api/v1/') ? endpoint : `/api/vton${endpoint}`;
}

export function resolveDataEndpoint(endpoint: `/api/v1/${string}`): string {
  return resolveBackendEndpoint(endpoint);
}
