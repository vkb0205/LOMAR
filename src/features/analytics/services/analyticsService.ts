import { supabase } from '../../../shared/api/supabaseClient';

const VISITOR_KEY = 'lomar.analytics.visitor';
const SESSION_KEY = 'lomar.analytics.session';

export interface PageViewIdentity {
  viewId: string;
  visitorId: string;
  sessionId: string;
}

export interface AnalyticsSummary {
  views: number;
  uniqueVisitors: number;
  sessions: number;
  avgDurationSeconds: number;
  bounceRate: number;
}

export interface PageAnalytics {
  page_path: string;
  page_title: string | null;
  views: number;
  unique_visitors: number;
  avg_duration_seconds: number;
  avg_scroll_percent: number;
}

export type BehaviourKey =
  | 'high_intent'
  | 'engaged'
  | 'quick_exit'
  | 'casual';

export interface BehaviourAnalytics {
  behaviour: BehaviourKey;
  sessions: number;
}

export interface DailyAnalytics {
  day: string;
  views: number;
  unique_visitors: number;
}

export interface WebsiteAnalytics {
  summary: AnalyticsSummary;
  pages: PageAnalytics[];
  behaviours: BehaviourAnalytics[];
  daily: DailyAnalytics[];
}

function storedUuid(storage: Storage, key: string): string {
  const current = storage.getItem(key);
  if (current) return current;
  const value = crypto.randomUUID();
  storage.setItem(key, value);
  return value;
}

export function createPageViewIdentity(viewId: string): PageViewIdentity | null {
  try {
    return {
      viewId,
      visitorId: storedUuid(localStorage, VISITOR_KEY),
      sessionId: storedUuid(sessionStorage, SESSION_KEY),
    };
  } catch {
    return null;
  }
}

function referrerHost(): string | undefined {
  if (!document.referrer) return undefined;
  try {
    const host = new URL(document.referrer).hostname;
    return host === window.location.hostname ? undefined : host;
  } catch {
    return undefined;
  }
}

export async function recordPageView(
  identity: PageViewIdentity,
  pagePath: string,
  pageTitle: string
): Promise<void> {
  const { error } = await supabase.rpc('record_page_view', {
    p_id: identity.viewId,
    p_session_id: identity.sessionId,
    p_visitor_id: identity.visitorId,
    p_page_path: pagePath,
    p_page_title: pageTitle,
    p_referrer_host: referrerHost(),
  });
  if (error) throw error;
}

export async function recordPageEngagement(
  identity: PageViewIdentity,
  durationSeconds: number,
  maxScrollPercent: number
): Promise<void> {
  const { error } = await supabase.rpc('record_page_engagement', {
    p_id: identity.viewId,
    p_session_id: identity.sessionId,
    p_visitor_id: identity.visitorId,
    p_duration_seconds: durationSeconds,
    p_max_scroll_percent: maxScrollPercent,
  });
  if (error) throw error;
}

function numberValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export async function fetchWebsiteAnalytics(
  days: number
): Promise<WebsiteAnalytics> {
  const { data, error } = await supabase.rpc('get_admin_website_analytics', {
    p_days: days,
  });
  if (error) throw error;

  const payload = (data ?? {}) as Partial<WebsiteAnalytics>;
  const summary = payload.summary ?? ({} as AnalyticsSummary);
  return {
    summary: {
      views: numberValue(summary.views),
      uniqueVisitors: numberValue(summary.uniqueVisitors),
      sessions: numberValue(summary.sessions),
      avgDurationSeconds: numberValue(summary.avgDurationSeconds),
      bounceRate: numberValue(summary.bounceRate),
    },
    pages: Array.isArray(payload.pages) ? payload.pages : [],
    behaviours: Array.isArray(payload.behaviours) ? payload.behaviours : [],
    daily: Array.isArray(payload.daily) ? payload.daily : [],
  };
}
