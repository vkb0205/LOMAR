export function resolveBackendEndpoint(endpoint: `/${string}`): string {
  const vtonBackendUrl = (import.meta.env.VITE_VTON_BACKEND_URL || '').replace(/\/+$/, '');
  const isProductionBackend =
    vtonBackendUrl &&
    !vtonBackendUrl.includes('localhost') &&
    !vtonBackendUrl.includes('127.0.0.1');

  return isProductionBackend ? `${vtonBackendUrl}${endpoint}` : `/api/vton${endpoint}`;
}
