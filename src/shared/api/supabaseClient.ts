import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Auth (sign-in/up/out, session persistence) cannot work against a placeholder
// endpoint. Fail fast in development so misconfiguration surfaces immediately
// instead of silently producing a non-functional auth client.
if (!supabaseUrl || !supabaseAnonKey) {
  const message =
    'Missing Supabase environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). ' +
    'Please set them in your .env.local file.';
  if (import.meta.env.DEV) {
    throw new Error(message);
  }
  console.warn(message);
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Resolve the current Supabase access token for use as a Bearer credential
 * against backend endpoints that run with ENABLE_AUTH=true (Item 16). Returns
 * null when there is no session or auth is disabled — callers should only
 * attach an `Authorization` header when a non-empty token is present, so the
 * open/gated-beta path (no active session) keeps working against an
 * unauthenticated backend.
 *
 * Reads the in-memory session synchronously; AuthProvider already keeps the
 * session fresh via onAuthStateChange, so a logged-in user will have a token.
 */
export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * Build a Headers object with the optional `Authorization: Bearer <jwt>` header
 * merged on top of the caller's headers. Use this for any fetch() to the API
 * versioned API so the call works whether the backend is configured for auth.
 * backend is running open or with ENABLE_AUTH=true.
 */
export async function withAuthHeaders(
  base: Record<string, string> = {}
): Promise<Record<string, string>> {
  const token = await getAccessToken();
  if (!token) return base;
  return { ...base, Authorization: `Bearer ${token}` };
}
