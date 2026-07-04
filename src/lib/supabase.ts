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
  supabaseAnonKey || 'placeholder_key'
);
