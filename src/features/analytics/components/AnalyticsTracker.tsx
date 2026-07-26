import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  createPageViewIdentity,
  recordPageEngagement,
  recordPageView,
} from '../services/analyticsService';

function currentScrollPercent(): number {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((window.scrollY / scrollable) * 100)));
}

export default function AnalyticsTracker() {
  const location = useLocation();
  const currentView = useRef<{
    locationKey: string;
    pathname: string;
    viewId: string;
  } | null>(null);

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      currentView.current = null;
      return;
    }

    if (
      currentView.current?.locationKey !== location.key ||
      currentView.current.pathname !== location.pathname
    ) {
      currentView.current = {
        locationKey: location.key,
        pathname: location.pathname,
        viewId: crypto.randomUUID(),
      };
    }
    const identity = createPageViewIdentity(currentView.current.viewId);
    if (!identity) return;

    let activeSeconds = 0;
    let maxScrollPercent = currentScrollPercent();
    let lastTick = performance.now();
    let wasVisible = document.visibilityState === 'visible';

    const updateActiveTime = () => {
      const now = performance.now();
      if (wasVisible) {
        activeSeconds += Math.max(0, Math.floor((now - lastTick) / 1000));
      }
      lastTick = now;
      wasVisible = document.visibilityState === 'visible';
    };

    const flush = () => {
      updateActiveTime();
      void recordPageEngagement(
        identity,
        activeSeconds,
        maxScrollPercent
      ).catch(() => {
        // Analytics is best-effort and must never interrupt the visitor.
      });
    };

    const onScroll = () => {
      maxScrollPercent = Math.max(maxScrollPercent, currentScrollPercent());
    };

    void recordPageView(identity, location.pathname, document.title).catch(() => {
      // A missing/unapplied analytics migration must not break the website.
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', flush);
    window.addEventListener('pagehide', flush);
    const interval = window.setInterval(flush, 15_000);

    return () => {
      flush();
      window.clearInterval(interval);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', flush);
      window.removeEventListener('pagehide', flush);
    };
  }, [location.key, location.pathname]);

  return null;
}
