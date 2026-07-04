import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics/analyticsService';
import { FeatureFlagEngine } from '@/lib/services/analytics/experiments';
import { EventName } from '@/lib/services/analytics/types';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Phase 8: Product Validation Layer
 * Secure ingestion point for client-side analytics events.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event_name, properties, session_id, client_context } = body;

    if (!event_name || !properties || !session_id) {
      return NextResponse.json({ error: 'Missing required payload fields' }, { status: 400 });
    }

    // Attempt to resolve authenticated user from secure HTTP-only session
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; }
        }
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Attach active experiments and feature flags at ingestion time
    const feature_flags = FeatureFlagEngine.getActiveFlags(session_id, userId);
    const experiments = FeatureFlagEngine.getActiveExperiments(session_id);

    // Dispatch to Analytics Service Pipeline (Non-blocking)
    AnalyticsService.track(
      event_name as EventName,
      {
        session_id,
        properties,
        feature_flags,
        experiments,
        client_context
      },
      userId
    ).catch(console.error);

    return NextResponse.json({ status: 'queued' });
  } catch (error: any) {
    console.error('Analytics Ingestion Error:', error);
    // Never crash the client on analytics failures
    return NextResponse.json({ status: 'error', message: 'Ingestion failed silently' }, { status: 200 });
  }
}
