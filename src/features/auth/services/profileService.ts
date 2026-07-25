import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../../shared/api/supabaseClient';
import type { Database } from '../../../shared/types/database';
import type { AccountRole, UserProfile, WeddingRole } from '../types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

const DEFAULT_AVATARS: Record<WeddingRole, string> = {
  bride:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
  groom:
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120',
  planner:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
};

function normalizeWeddingRole(value: unknown): WeddingRole {
  return value === 'bride' || value === 'groom' || value === 'planner'
    ? value
    : 'bride';
}

function normalizeAccountRole(value: unknown): AccountRole {
  return value === 'customer' || value === 'vendor_admin' || value === 'admin'
    ? value
    : 'customer';
}

export function mapSessionUser(
  session: Session,
  profile: ProfileRow | null
): UserProfile {
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
    accountRole: normalizeAccountRole(profile?.role),
    avatarUrl:
      profile?.avatar_url ||
      (typeof metadata.avatar_url === 'string' ? metadata.avatar_url : '') ||
      DEFAULT_AVATARS[role],
  };
}

/**
 * Resolve the profile row keyed by auth.uid(). A missing row is provisioned
 * when permitted; failures fall back to session-derived identity.
 */
export async function resolveProfile(
  activeSession: Session
): Promise<ProfileRow | null> {
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

  const metadata = activeSession.user.user_metadata ?? {};
  const insertPayload: ProfileInsert = {
    id: uid,
    email: activeSession.user.email ?? null,
    full_name:
      typeof metadata.full_name === 'string' ? metadata.full_name : null,
  };

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert<ProfileInsert>(insertPayload)
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
}
