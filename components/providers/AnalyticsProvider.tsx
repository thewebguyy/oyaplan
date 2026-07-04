'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnalyticsService } from '@/lib/services/analytics/analyticsService';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
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
