'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics/trackClient';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const trackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && trackedPath.current !== pathname) {
      trackedPath.current = pathname;
      
      trackEvent('page_viewed', { 
        category: 'Engagement',
        path: pathname,
        version: '1.0'
      });

      if (pathname === '/') {
        trackEvent('landing_page_view', {
          category: 'Acquisition',
          path: '/',
          version: '1.0'
        });
      }
    }
  }, [pathname]);

  return <>{children}</>;
}

