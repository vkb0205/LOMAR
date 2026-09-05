import type { Session } from '@supabase/supabase-js';

// Wedding-facing role stored in auth user_metadata. It is intentionally
// separate from the platform authority role stored in profiles.role.
export type WeddingRole = 'bride' | 'groom' | 'planner';

export type AccountRole = 'customer' | 'vendor' | 'admin';

export interface UserProfile {
  /** Supabase Auth UUID (auth.uid()); also the profiles primary key. */
  id: string;
  name: string;
  email: string;
  role: WeddingRole;
  /** Platform authority from the canonical profiles.role column. */
  accountRole: AccountRole;
  avatarUrl?: string;
}

export interface SignResult {
  error: string | null;
}

export type OAuthProvider = 'google' | 'facebook';

export interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<SignResult>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: WeddingRole
  ) => Promise<SignResult>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: OAuthProvider, redirectTo?: string) => Promise<SignResult>;
}

export type AuthMode = 'login' | 'signup';

export type DemoAccount = {
  name: string;
  roleText: string;
  email: string;
  role: Extract<WeddingRole, 'bride' | 'groom'>;
  avatar: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
};

export type LoginFormValues = {
  email: string;
  password: string;
  fullName: string;
  role: Extract<WeddingRole, 'bride' | 'groom'>;
};
