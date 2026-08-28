import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics/analyticsService';
import { FeatureFlagEngine } from '@/lib/services/analytics/experiments';
import { EventName } from '@/lib/services/analytics/types';
import { createServerClient } from '@/lib/supabase-server';

/**
 * Phase 8: Product Validation Layer
 * Secure ingestion point for client-side analytics events.
 */
export async function POST(req: Request) {
  try {
    let body: Record<string, unknown>;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
      }
    }

    const event_name = body.event_name as string;
    const properties = body.properties as Record<string, unknown>;
    const session_id = body.session_id as string;
    const client_context = body.client_context as import('@/lib/services/analytics/types').ClientContext | undefined;

    if (!event_name || !properties || !session_id) {
      return NextResponse.json({ error: 'Missing required payload fields' }, { status: 400 });
    }

    // Attempt to resolve authenticated user from secure session
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Attach active experiments and feature flags at ingestion time
    const feature_flags = FeatureFlagEngine.getActiveFlags(session_id, userId);
    const experiments = FeatureFlagEngine.getActiveExperiments(session_id);

    // Dispatch to Analytics Service Pipeline (Non-blocking)
    AnalyticsService.track(
      event_name as EventName,
      {
        session_id,
        properties: properties as never,
        feature_flags,
        experiments,
        client_context
      },
      userId
    ).catch((err) => console.error('Analytics tracking error:', err));

    return NextResponse.json({ status: 'queued' });
  } catch (error: unknown) {
    console.error('Analytics Ingestion Error:', error);
    // Never crash the client on analytics failures
    return NextResponse.json({ status: 'error', message: 'Ingestion failed silently' }, { status: 200 });
  }
}
