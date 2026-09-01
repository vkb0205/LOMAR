export const ROUTES = {
  home: '/',
  explore: '/explore',
  blog: '/blog',
  guide: '/guide',
  dashboard: '/dashboard',
  businessIntelligence: '/business-intelligence',
  login: '/login',
  admin: '/admin',
  adminUsers: '/admin/users',
  adminVendors: '/admin/vendors',
  adminModeration: '/admin/moderation',
  adminJourney: '/admin/journey',
  adminLeads: '/admin/leads',
  adminAi: '/admin/ai',
  adminAnalytics: '/admin/analytics',
  vendorDetail: (vendorId: string) => `/vendor/${vendorId}`,
} as const;

/** Legacy path only — redirects home; assistant is contextual, not a page. */
export const LEGACY_AI_CONSULTANT_PATH = '/ai-consultant' as const;

export type StaticRoutePath = Exclude<(typeof ROUTES)[keyof typeof ROUTES], (value: string) => string>;
