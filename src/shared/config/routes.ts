export const ROUTES = {
  home: '/',
  explore: '/explore',
  map: '/map',
  blog: '/blog',
  guide: '/guide',
  privacy: '/privacy',
  terms: '/terms',
  dashboard: '/dashboard',
  businessIntelligence: '/business-intelligence',
  login: '/login',
  admin: '/admin',
  adminUsers: '/admin/users',
  adminVendors: '/admin/vendors',
  adminModeration: '/admin/moderation',
  adminJourney: '/admin/journey',
  adminLeads: '/admin/leads',
  adminAnalytics: '/admin/analytics',
  vendorDetail: (vendorId: string) => `/vendor/${vendorId}`,
} as const;

/** Legacy path only — redirects to the interactive map page. */
export const LEGACY_AI_CONSULTANT_PATH = '/ai-consultant' as const;

export type StaticRoutePath = Exclude<(typeof ROUTES)[keyof typeof ROUTES], (value: string) => string>;
