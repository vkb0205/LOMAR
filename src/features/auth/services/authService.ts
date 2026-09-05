import { supabase } from '../../../shared/api/supabaseClient';
import type { OAuthProvider, SignResult, WeddingRole } from '../types';

export async function signInWithPassword(
  email: string,
  password: string
): Promise<SignResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signUpWithPassword(
  email: string,
  password: string,
  fullName: string,
  role: WeddingRole
): Promise<SignResult> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        wedding_role: role,
      },
    },
  });

  return { error: error?.message ?? null };
}

export async function signOutSession(): Promise<void> {
  await supabase.auth.signOut();
}

export async function signInWithOAuth(
  provider: OAuthProvider,
  redirectTo?: string
): Promise<SignResult> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: redirectTo ? { redirectTo } : undefined,
  });
  return { error: error?.message ?? null };
}
