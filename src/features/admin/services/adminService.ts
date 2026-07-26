import { supabase } from '../../../shared/api/supabaseClient';
import { Database } from '../../../shared/types/database';
import {
  parseJourneyTaskInsert,
  parseJourneyTaskUpdate,
  parseVoucherInsert,
  parseVoucherUpdate,
} from '../schemas';

// ============================================================================
// Admin data layer
// ============================================================================
// Every function here runs through the normal (anon/authenticated) Supabase
// client. Cross-user access is granted purely by the admin RLS override
// policies in supabase/legacy/admin_policies.sql (keyed on is_admin()). No service_role
// key is ever used client-side. Non-admin callers will simply get their own
// rows (or nothing) because the admin policies do not apply to them.
// ============================================================================

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type VendorRow = Database['public']['Tables']['vendors']['Row'];
type ServiceRow = Database['public']['Tables']['services']['Row'];
type ReviewRow = Database['public']['Tables']['reviews']['Row'];
type PostRow = Database['public']['Tables']['posts']['Row'];
type PostCommentRow = Database['public']['Tables']['post_comments']['Row'];
type JourneyTaskRow = Database['public']['Tables']['journey_tasks']['Row'];
type JourneyTaskInsert = Database['public']['Tables']['journey_tasks']['Insert'];
type JourneyTaskUpdate = Database['public']['Tables']['journey_tasks']['Update'];
type VoucherRow = Database['public']['Tables']['vouchers']['Row'];
type VoucherInsert = Database['public']['Tables']['vouchers']['Insert'];
type VoucherUpdate = Database['public']['Tables']['vouchers']['Update'];
type ServiceRequestRow = Database['public']['Tables']['service_requests']['Row'];
type GenerationRow = Database['public']['Tables']['ai_design_generations']['Row'];

export type AccountRole = 'customer' | 'vendor_admin' | 'admin';

// ----------------------------------------------------------------------------
// Overview / metrics
// ----------------------------------------------------------------------------

export interface PlatformMetrics {
  users: number;
  vendors: number;
  vendorsPending: number;
  services: number;
  posts: number;
  postsHidden: number;
  commentsFlagged: number;
  reviewsFlagged: number;
  leads: number;
  leadsNew: number;
  generations: number;
  generationsFailed: number;
}

/** Count rows matching an optional equality filter, using a head-only query. */
async function countRows(
  table: keyof Database['public']['Tables'],
  filter?: { column: string; value: string }
): Promise<number> {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  if (filter) {
    query = query.eq(filter.column, filter.value);
  }
  const { count, error } = await query;
  if (error) {
    console.warn(`countRows(${String(table)}) failed:`, error.message);
    return 0;
  }
  return count ?? 0;
}

/** Aggregate platform-wide KPIs for the overview panel. */
export async function fetchPlatformMetrics(): Promise<PlatformMetrics> {
  const [
    users,
    vendors,
    vendorsPending,
    services,
    posts,
    postsHidden,
    commentsFlagged,
    reviewsFlagged,
    leads,
    leadsNew,
    generations,
    generationsFailed,
  ] = await Promise.all([
    countRows('profiles'),
    countRows('vendors'),
    countRows('vendors', { column: 'status', value: 'draft' }),
    countRows('services'),
    countRows('posts'),
    countRows('posts', { column: 'status', value: 'hidden' }),
    countRows('post_comments', { column: 'status', value: 'flagged' }),
    countRows('reviews', { column: 'status', value: 'flagged' }),
    countRows('service_requests'),
    countRows('service_requests', { column: 'status', value: 'new' }),
    countRows('ai_design_generations'),
    countRows('ai_design_generations', { column: 'status', value: 'failed' }),
  ]);

  return {
    users,
    vendors,
    vendorsPending,
    services,
    posts,
    postsHidden,
    commentsFlagged,
    reviewsFlagged,
    leads,
    leadsNew,
    generations,
    generationsFailed,
  };
}

// ----------------------------------------------------------------------------
// Users
// ----------------------------------------------------------------------------

export async function fetchProfiles(search?: string): Promise<ProfileRow[]> {
  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(
      `full_name.ilike.${term},username.ilike.${term},email.ilike.${term}`
    );
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data as ProfileRow[]) ?? [];
}

export async function updateProfileRole(
  id: string,
  role: AccountRole
): Promise<void> {
  const payload: Database['public']['Tables']['profiles']['Update'] = {
    role,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from('profiles')
    .update<Database['public']['Tables']['profiles']['Update']>(payload)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteProfile(id: string): Promise<void> {
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw error;
}

// ----------------------------------------------------------------------------
// Vendors & services
// ----------------------------------------------------------------------------

export async function fetchVendors(): Promise<VendorRow[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as VendorRow[]) ?? [];
}

export async function updateVendorStatus(
  id: string,
  status: 'draft' | 'active' | 'suspended'
): Promise<void> {
  const payload: Database['public']['Tables']['vendors']['Update'] = {
    status,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from('vendors')
    .update<Database['public']['Tables']['vendors']['Update']>(payload)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteVendor(id: string): Promise<void> {
  const { error } = await supabase.from('vendors').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchServices(): Promise<ServiceRow[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ServiceRow[]) ?? [];
}

export async function updateServiceStatus(
  id: string,
  status: 'draft' | 'active' | 'archived'
): Promise<void> {
  const payload: Database['public']['Tables']['services']['Update'] = {
    status,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from('services')
    .update<Database['public']['Tables']['services']['Update']>(payload)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
}

// ----------------------------------------------------------------------------
// Content moderation: posts, comments, reviews
// ----------------------------------------------------------------------------

export async function fetchPosts(): Promise<PostRow[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as PostRow[]) ?? [];
}

export async function updatePostStatus(
  id: string,
  status: 'draft' | 'published' | 'hidden'
): Promise<void> {
  const payload: Database['public']['Tables']['posts']['Update'] = {
    status,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from('posts')
    .update<Database['public']['Tables']['posts']['Update']>(payload)
    .eq('id', id);
  if (error) throw error;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchComments(): Promise<PostCommentRow[]> {
  const { data, error } = await supabase
    .from('post_comments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as PostCommentRow[]) ?? [];
}

export async function updateCommentStatus(
  id: string,
  status: 'published' | 'hidden' | 'flagged'
): Promise<void> {
  const payload: Database['public']['Tables']['post_comments']['Update'] = {
    status,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from('post_comments')
    .update<Database['public']['Tables']['post_comments']['Update']>(payload)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from('post_comments').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchReviews(): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ReviewRow[]) ?? [];
}

export async function updateReviewStatus(
  id: string,
  status: 'published' | 'hidden' | 'flagged'
): Promise<void> {
  const payload: Database['public']['Tables']['reviews']['Update'] = {
    status,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from('reviews')
    .update<Database['public']['Tables']['reviews']['Update']>(payload)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}

// ----------------------------------------------------------------------------
// Journey tasks (dictionary)
// ----------------------------------------------------------------------------

export async function fetchJourneyTasks(): Promise<JourneyTaskRow[]> {
  const { data, error } = await supabase
    .from('journey_tasks')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return (data as JourneyTaskRow[]) ?? [];
}

export async function createJourneyTask(
  payload: JourneyTaskInsert
): Promise<void> {
  const validatedPayload = parseJourneyTaskInsert(payload);
  const { error } = await supabase
    .from('journey_tasks')
    .insert<JourneyTaskInsert>(validatedPayload);
  if (error) throw error;
}

export async function updateJourneyTask(
  id: string,
  payload: JourneyTaskUpdate
): Promise<void> {
  const validatedPayload = parseJourneyTaskUpdate(payload);
  const { error } = await supabase
    .from('journey_tasks')
    .update<JourneyTaskUpdate>(validatedPayload)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteJourneyTask(id: string): Promise<void> {
  const { error } = await supabase.from('journey_tasks').delete().eq('id', id);
  if (error) throw error;
}

// ----------------------------------------------------------------------------
// Vouchers
// ----------------------------------------------------------------------------

export async function fetchVouchers(): Promise<VoucherRow[]> {
  const { data, error } = await supabase
    .from('vouchers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as VoucherRow[]) ?? [];
}

export async function createVoucher(payload: VoucherInsert): Promise<void> {
  const validatedPayload = parseVoucherInsert(payload);
  const { error } = await supabase
    .from('vouchers')
    .insert<VoucherInsert>(validatedPayload);
  if (error) throw error;
}

export async function updateVoucher(
  id: string,
  payload: VoucherUpdate
): Promise<void> {
  const validatedPayload = parseVoucherUpdate(payload);
  const { error } = await supabase
    .from('vouchers')
    .update<VoucherUpdate>(validatedPayload)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteVoucher(id: string): Promise<void> {
  const { error } = await supabase.from('vouchers').delete().eq('id', id);
  if (error) throw error;
}

// ----------------------------------------------------------------------------
// Leads (service_requests)
// ----------------------------------------------------------------------------

export async function fetchServiceRequests(): Promise<ServiceRequestRow[]> {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ServiceRequestRow[]) ?? [];
}

export async function updateServiceRequestStatus(
  id: string,
  status: 'new' | 'contacted' | 'quoted' | 'booked' | 'cancelled' | 'closed'
): Promise<void> {
  const payload: Database['public']['Tables']['service_requests']['Update'] = {
    status,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from('service_requests')
    .update<Database['public']['Tables']['service_requests']['Update']>(payload)
    .eq('id', id);
  if (error) throw error;
}

// ----------------------------------------------------------------------------
// AI oversight (ai_design_generations)
// ----------------------------------------------------------------------------

export async function fetchGenerations(): Promise<GenerationRow[]> {
  const { data, error } = await supabase
    .from('ai_design_generations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data as GenerationRow[]) ?? [];
}

// ----------------------------------------------------------------------------
// Shared: resolve display names for a set of user ids (for joining author info)
// ----------------------------------------------------------------------------

export async function fetchProfileNames(
  userIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  if (unique.length === 0) return map;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, email')
    .in('id', unique);
  if (error) {
    console.warn('fetchProfileNames failed:', error.message);
    return map;
  }
  for (const p of (data as ProfileRow[]) ?? []) {
    map.set(p.id, p.full_name || p.username || p.email || p.id.slice(0, 8));
  }
  return map;
}
