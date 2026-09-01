import { ROUTES, type StaticRoutePath } from './routes';
import type { AccountRole } from '../../features/auth/types';

export type NavAudience = 'public' | 'couple' | 'business' | 'admin';

export type AppNavItem = {
  id: string;
  label: string;
  path: StaticRoutePath;
  /** Match nested routes (e.g. /vendor/:id under explore). */
  matchPrefix?: string;
  audiences: NavAudience[];
  /** Highlight as primary action in dense toolbars. */
  emphasis?: 'primary' | 'default';
};

export type AccountMenuItem = {
  id: string;
  label: string;
  path: StaticRoutePath;
  audiences: NavAudience[];
  description?: string;
};

/**
 * Center discovery links. Home is included so landing stays one click away
 * without relying only on the logo (mobile drawer also lists it).
 * Workspace tools live in NAV_ACTIONS / account menu.
 */
export const PRIMARY_NAV: AppNavItem[] = [
  {
    id: 'home',
    label: 'TRANG CHỦ',
    path: ROUTES.home,
    audiences: ['public', 'couple', 'business', 'admin'],
  },
  {
    id: 'explore',
    label: 'DỊCH VỤ',
    path: ROUTES.explore,
    matchPrefix: '/vendor',
    audiences: ['public', 'couple', 'business', 'admin'],
  },
  {
    id: 'map',
    label: 'BẢN ĐỒ HẠNH PHÚC',
    path: ROUTES.explore,
    matchPrefix: '/vendor',
    audiences: ['public', 'couple', 'business', 'admin'],
  },
  {
    id: 'blog',
    label: 'BLOG',
    path: ROUTES.blog,
    audiences: ['public', 'couple', 'business', 'admin'],
  },
  {
    id: 'guide',
    label: 'WEDDING GUIDE',
    path: ROUTES.guide,
    audiences: ['public', 'couple', 'business', 'admin'],
  },
];

/** Single high-intent CTA(s) on the right of the bar, before account. */
export const NAV_ACTIONS: AppNavItem[] = [
  {
    id: 'bi',
    label: 'Kinh doanh',
    path: ROUTES.businessIntelligence,
    audiences: ['business', 'admin'],
    emphasis: 'primary',
  },
];

/** Account dropdown — destinations not already a primary bar CTA. */
export const ACCOUNT_MENU: AccountMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Hành trình cưới',
    path: ROUTES.dashboard,
    audiences: ['couple', 'admin'],
    description: 'Tiến trình & ưu đãi của bạn',
  },
  {
    id: 'bi',
    label: 'Business Intelligence',
    path: ROUTES.businessIntelligence,
    audiences: ['business', 'admin'],
    description: 'Phân tích & vận hành',
  },
  {
    id: 'admin',
    label: 'Quản trị hệ thống',
    path: ROUTES.admin,
    audiences: ['admin'],
    description: 'Người dùng, duyệt, giám sát',
  },
];

/** Full-bleed workspace pages: no marketing footer / floating mascot. */
export const WORKSPACE_PATHS: StaticRoutePath[] = [
  ROUTES.dashboard,
  ROUTES.businessIntelligence,
  ROUTES.login,
];

export function audiencesForRole(accountRole: AccountRole | null | undefined): NavAudience[] {
  if (!accountRole) return ['public'];
  if (accountRole === 'admin') return ['public', 'couple', 'business', 'admin'];
  if (accountRole === 'vendor_admin') return ['public', 'business'];
  return ['public', 'couple'];
}

export function filterByAudience<T extends { audiences: NavAudience[] }>(
  items: T[],
  audiences: NavAudience[],
): T[] {
  return items.filter((item) => item.audiences.some((a) => audiences.includes(a)));
}

/**
 * Prefer one primary CTA in the chrome when a route action exists.
 * Couple/public AI is contextual (floating) — not a nav destination.
 * Vendor/admin see BI.
 */
export function primaryActionForAudiences(audiences: NavAudience[]): AppNavItem | null {
  const actions = filterByAudience(NAV_ACTIONS, audiences);
  if (actions.length === 0) return null;
  return actions.find((a) => a.id === 'bi') ?? actions[0];
}

export function isNavItemActive(pathname: string, item: Pick<AppNavItem, 'path' | 'matchPrefix'>): boolean {
  if (item.path === ROUTES.home) return pathname === ROUTES.home || pathname === '';
  if (pathname === item.path || pathname.startsWith(`${item.path}/`)) return true;
  if (item.matchPrefix && (pathname === item.matchPrefix || pathname.startsWith(`${item.matchPrefix}/`))) {
    return true;
  }
  return false;
}

export function isWorkspacePath(pathname: string): boolean {
  return WORKSPACE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function defaultPostLoginPath(accountRole: AccountRole | null | undefined): StaticRoutePath {
  if (accountRole === 'vendor_admin') return ROUTES.businessIntelligence;
  if (accountRole === 'admin') return ROUTES.admin;
  return ROUTES.dashboard;
}

/** Safe in-app path for ?redirect= (blocks protocol-relative //). */
export function safeRedirectPath(candidate: string | null | undefined, fallback: string = ROUTES.home): string {
  if (!candidate) return fallback;
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return fallback;
  if (candidate === ROUTES.login || candidate.startsWith(`${ROUTES.login}?`)) return fallback;
  return candidate;
}

export const FOOTER_EXPLORE_LINKS: Array<{ label: string; path: StaticRoutePath }> = [
  { label: 'Dịch vụ cưới', path: ROUTES.explore },
  { label: 'Hành trình của tôi', path: ROUTES.dashboard },
  { label: 'Cẩm nang cưới', path: ROUTES.guide },
  { label: 'Tin tức & cộng đồng', path: ROUTES.blog },
  { label: 'Dành cho doanh nghiệp', path: ROUTES.businessIntelligence },
];
