import { withAuthHeaders } from './supabaseClient';

interface JsonRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: Record<string, string>;
}

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
