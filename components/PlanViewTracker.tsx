'use client';

import { useEffect, useRef } from 'react';
import { AnalyticsService } from '@/lib/services/analytics/analyticsService';

export default function PlanViewTracker({ planId }: { planId: string }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    AnalyticsService.track('plan_viewed', {
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      properties: {
        category: 'Engagement',
        plan_id: planId,
        version: '1.0'
      }
    });
  }, [planId]);

  return null;
}

