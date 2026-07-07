import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

interface SelectedOptionDetail {
  optionGroupId: string;
  optionGroupName: string;
  valueId: string;
  valueName: string;
  price: number;
}

interface CustomizedService {
  category: string;
  productId: string;
  productName: string;
  basePrice: number;
  totalPrice: number;
  imageUrl: string;
  vendorName: string;
  selectedOptions: SelectedOptionDetail[];
}

// Wedding-facing role kept in auth user_metadata (distinct from the DB
// account-type role: 'customer' | 'vendor_admin' | 'admin').
export type WeddingRole = 'bride' | 'groom' | 'planner';

// DB account-type role, sourced from profiles.role. Governs platform-level
// authority (admin dashboard access), independent of the wedding-facing role.
export type AccountRole = 'customer' | 'vendor_admin' | 'admin';

export interface UserProfile {
  /** Real Supabase Auth user UUID (auth.uid()); also the profiles PK. */
  id: string;
  name: string;
  email: string;
  role: WeddingRole;
  /** DB account-type role from profiles.role (authority gating). */
  accountRole: AccountRole;
  avatarUrl?: string;
}

interface SignResult {
  error: string | null;
}

interface AppState {
  healthCheckCompleted: boolean;
  setHealthCheckCompleted: (val: boolean) => void;
  customizedServices: Record<string, CustomizedService>;
  saveCustomizedService: (category: string, service: CustomizedService) => void;
  /** Current authenticated user mapped from the Supabase session + profile row. */
  user: UserProfile | null;
  /** Raw Supabase session (null when signed out). */
  session: Session | null;
  /** True while the initial session bootstrap is in flight. */
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<SignResult>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: WeddingRole
  ) => Promise<SignResult>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

const DEFAULT_AVATARS: Record<WeddingRole, string> = {
  bride:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
  groom:
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120',
  planner:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
};

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
  onboarding_status: string;
  created_at: string;
  updated_at: string;
};

function normalizeWeddingRole(value: unknown): WeddingRole {
  return value === 'groom' || value === 'planner' || value === 'bride'
    ? value
    : 'bride';
}

function normalizeAccountRole(value: unknown): AccountRole {
  return value === 'admin' || value === 'vendor_admin' || value === 'customer'
    ? value
    : 'customer';
}

/**
 * Build the app-facing UserProfile from the authenticated session and the
 * (optional) profiles row. Identity always comes from the session UUID.
 */
function mapUser(session: Session, profile: ProfileRow | null): UserProfile {
  const metadata = session.user.user_metadata ?? {};
  const role = normalizeWeddingRole(metadata.wedding_role);
  const email = profile?.email ?? session.user.email ?? '';
  const name =
    profile?.full_name ||
    (typeof metadata.full_name === 'string' ? metadata.full_name : '') ||
    (email ? email.split('@')[0] : 'Người Dùng');

  return {
    id: session.user.id,
    name,
    email,
    role,
    // Authority gating comes from the DB account role (profiles.role); default
    // to 'customer' when there is no profile row yet (session-only identity).
    accountRole: normalizeAccountRole(profile?.role),
    avatarUrl:
      profile?.avatar_url ||
      (typeof metadata.avatar_url === 'string' ? metadata.avatar_url : '') ||
      DEFAULT_AVATARS[role],
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [healthCheckCompleted, setHealthCheckCompleted] = useState(false);
  const [customizedServices, setCustomizedServices] = useState<Record<string, CustomizedService>>(() => {
    try {
      const saved = localStorage.getItem('customizedServices');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  /**
   * Load the profile row keyed by the auth user UUID. If none exists yet
   * (e.g. right after sign-up before any trigger/backfill), attempt to
   * provision one. Missing/blocked profile rows are handled gracefully by
   * falling back to session-derived identity.
   */
  const resolveProfile = async (activeSession: Session): Promise<ProfileRow | null> => {
    const uid = activeSession.user.id;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();

    if (error) {
      console.warn('Could not load profile row; using session identity.', error.message);
      return null;
    }

    if (data) {
      return data as ProfileRow;
    }

    // No profile row yet — try to create one keyed by the auth UUID.
    const metadata = activeSession.user.user_metadata ?? {};
    // Item 13: typed insert payload (no `as any`). The explicit <Insert> generic
    // is required for this @supabase/supabase-js version (the generated Database
    // type now declares Relationships/Views/Functions so the schema conforms to
    // postgrest-js's GenericSchema).
    const insertPayload: Database['public']['Tables']['profiles']['Insert'] = {
      id: uid,
      email: activeSession.user.email ?? null,
      full_name:
        typeof metadata.full_name === 'string' ? metadata.full_name : null,
    };

    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert<Database['public']['Tables']['profiles']['Insert']>(insertPayload)
      .select('*')
      .maybeSingle();

    if (insertError) {
      console.warn(
        'No profile row for user and provisioning failed; using session identity.',
        insertError.message
      );
      return null;
    }

    return (created as ProfileRow) ?? null;
  };

  const syncFromSession = async (activeSession: Session | null) => {
    setSession(activeSession);
    if (!activeSession) {
      setUser(null);
      return;
    }
    const profile = await resolveProfile(activeSession);
    setUser(mapUser(activeSession, profile));
  };

  useEffect(() => {
    let active = true;

    // Bootstrap the session on load.
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!active) return;
        await syncFromSession(data.session);
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    // Keep context in sync with auth state changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, changedSession) => {
      if (!active) return;
      void syncFromSession(changedSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveCustomizedService = (category: string, service: CustomizedService) => {
    setCustomizedServices(prev => {
      const updated = { ...prev, [category]: service };
      localStorage.setItem('customizedServices', JSON.stringify(updated));
      return updated;
    });
  };

  const signIn = async (email: string, password: string): Promise<SignResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: WeddingRole
  ): Promise<SignResult> => {
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
    return { error: error ? error.message : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange will clear session/user, but clear eagerly too.
    setSession(null);
    setUser(null);
  };

  return (
    <AppContext.Provider value={{
      healthCheckCompleted,
      setHealthCheckCompleted,
      customizedServices,
      saveCustomizedService,
      user,
      session,
      authLoading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
