import { getAccessToken, withAuthHeaders } from './supabaseClient';

interface JsonRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: Record<string, string>;
}

/** Stable error shape mirroring the backend's single error envelope. */
export interface BackendErrorBody {
  error: {
    code: string;
    message?: string;
    fields?: Record<string, string>;
    correlation_id?: string;
  };
}

/**
 * Thrown by every `*Json` helper on a non-OK response. `code` is the
 * backend's stable `error.code` (e.g. `unauthenticated`, `not_found`,
 * `validation_error`, `database_unavailable`) so callers can branch on it
 * without re-parsing the body. `code === 'database_unavailable'` is the
 * signal the UI renders as the "unavailable" state (SC-005).
 */
export class BackendError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;
  readonly correlationId?: string;

  constructor(status: number, body: Partial<BackendErrorBody['error']> | null) {
    super(body?.message || `Backend request failed (${status})`);
    this.name = 'BackendError';
    this.status = status;
    this.code = body?.code || 'unknown_error';
    this.fields = body?.fields;
    this.correlationId = body?.correlation_id;
  }

  get isUnauthenticated(): boolean {
    return this.status === 401 || this.code === 'unauthenticated';
  }

  get isUnavailable(): boolean {
    return this.status === 503 || this.code === 'database_unavailable';
  }
}

/**
 * Called whenever any `*Json` helper receives a `401`. Defaults to a no-op;
 * `AuthProvider` (or an app bootstrap module) should call
 * `setUnauthenticatedHandler` once to route this into the existing
 * re-auth/session-expired UX (T018).
 */
let unauthenticatedHandler: (() => void) | null = null;

export function setUnauthenticatedHandler(handler: (() => void) | null): void {
  unauthenticatedHandler = handler;
}

async function parseErrorBody(response: Response): Promise<Partial<BackendErrorBody['error']> | null> {
  try {
    const body = (await response.json()) as Partial<BackendErrorBody>;
    return body?.error ?? null;
  } catch {
    return null;
  }
}

async function request<TResponse>(
  url: string,
  method: string,
  options: JsonRequestOptions = {}
): Promise<TResponse> {
  const { body, headers = {}, ...requestOptions } = options;
  const response = await fetch(url, {
    ...requestOptions,
    method,
    headers: await withAuthHeaders({
      'Content-Type': 'application/json',
      ...headers,
    }),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.ok) {
    if (response.status === 204) return undefined as TResponse;
    return (await response.json()) as TResponse;
  }

  const errorBody = await parseErrorBody(response);
  const error = new BackendError(response.status, errorBody);
  if (error.isUnauthenticated) {
    unauthenticatedHandler?.();
  }
  throw error;
}

export async function getJson<TResponse>(
  url: string,
  options: Omit<JsonRequestOptions, 'body'> = {}
): Promise<TResponse> {
  return request<TResponse>(url, 'GET', options);
}

export async function postJsonTyped<TResponse>(
  url: string,
  options: JsonRequestOptions = {}
): Promise<TResponse> {
  return request<TResponse>(url, 'POST', options);
}

export async function putJson<TResponse>(
  url: string,
  options: JsonRequestOptions = {}
): Promise<TResponse> {
  return request<TResponse>(url, 'PUT', options);
}

export async function patchJson<TResponse>(
  url: string,
  options: JsonRequestOptions = {}
): Promise<TResponse> {
  return request<TResponse>(url, 'PATCH', options);
}

export async function deleteJson<TResponse>(
  url: string,
  options: Omit<JsonRequestOptions, 'body'> = {}
): Promise<TResponse> {
  return request<TResponse>(url, 'DELETE', options);
}

/**
 * @deprecated Legacy VTON contract helper (unversioned `/api/vton/*`
 * endpoints, FR-012). Kept unchanged so `customizePreviewService.ts` and
 * `aiConsultantService.ts` keep working; new `/api/v1/*` code should use
 * `getJson`/`postJsonTyped`/`putJson`/`patchJson`/`deleteJson` above.
 */
export async function postJson<TResponse>(
  url: string,
  options: JsonRequestOptions = {}
): Promise<Response & { parsedBody?: TResponse }> {
  const { body, headers = {}, ...requestOptions } = options;
  const response = await fetch(url, {
    ...requestOptions,
    method: requestOptions.method ?? 'POST',
    headers: await withAuthHeaders({
      'Content-Type': 'application/json',
      ...headers,
    }),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.ok) {
    const parsedBody = (await response.json()) as TResponse;
    return Object.assign(response, { parsedBody });
  }

  return response;
}

// Re-exported so call sites that only need the token don't reach into
// supabaseClient directly.
export { getAccessToken };
