export const ROUTES = {
  home: '/',
  explore: '/explore',
  blog: '/blog',
  guide: '/guide',
  aiConsultant: '/ai-consultant',
  dashboard: '/dashboard',
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

export type StaticRoutePath = Exclude<(typeof ROUTES)[keyof typeof ROUTES], (value: string) => string>;
