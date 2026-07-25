import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../shared/api/supabaseClient';
import { AuthContext } from './AuthContext';
import {
  signInWithPassword,
  signOutSession,
  signUpWithPassword,
} from './services/authService';
import { mapSessionUser, resolveProfile } from './services/profileService';
import type { AuthState, UserProfile } from './types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let syncVersion = 0;

    const syncFromSession = async (nextSession: Session | null) => {
      const currentVersion = ++syncVersion;
      if (!active) return;
      setSession(nextSession);

      if (!nextSession) {
        setUser(null);
        return;
      }

      const profile = await resolveProfile(nextSession);
      // Ignore a stale profile response when a newer auth event (notably
      // sign-out) arrived while the profile query was in flight.
      if (active && currentVersion === syncVersion) {
        setUser(mapSessionUser(nextSession, profile));
      }
    };

    supabase.auth
      .getSession()
      .then(({ data }) => syncFromSession(data.session))
      .catch((error: unknown) => {
        console.warn('Could not bootstrap the auth session.', error);
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncFromSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await signOutSession();
    // The auth subscription also clears these values; update eagerly so the
    // UI does not retain the previous identity during the notification gap.
    setSession(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      session,
      authLoading,
      signIn: signInWithPassword,
      signUp: signUpWithPassword,
      signOut,
    }),
    [authLoading, session, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
