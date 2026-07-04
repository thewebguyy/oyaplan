'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { AnalyticsService } from '@/lib/services/analytics/analyticsService';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const trackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && trackedPath.current !== pathname) {
      trackedPath.current = pathname;
      AnalyticsService.track('page_viewed', { 
        session_id: 'browser',
        properties: {
          category: 'Engagement',
          path: pathname,
          version: '1.0'
        }
      });
    }
  }, [pathname]);

  return <>{children}</>;
}
