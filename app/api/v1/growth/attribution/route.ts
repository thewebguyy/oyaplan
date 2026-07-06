import { NextResponse } from 'next/server';
import { GrowthEngine, AttributionPayload } from '@/lib/services/growthEngine';
import { createServerClient } from '@/lib/supabase-server';

/**
 * Phase 9: Growth Platform
 * Platform-agnostic attribution ingestion (Web, iOS, Android).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      session_id, referrer_code, landing_path, 
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      device_fingerprint 
    } = body;

    if (!session_id || !landing_path) {
      return NextResponse.json({ error: 'Missing session_id or landing_path' }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // We do not trust client IPs, we resolve it server-side.
    const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || undefined;

    const payload: AttributionPayload = {
      session_id,
      referrer_code,
      landing_path,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      device_fingerprint,
      ip_address
    };

    // Dispatch to Growth Engine non-blockingly
    GrowthEngine.claimAttribution(payload, userId).catch(console.error);

    return NextResponse.json({ status: 'queued' });
  } catch (error: unknown) {
    console.error('Attribution Ingestion Error:', error);
    return NextResponse.json({ status: 'error', message: 'Ingestion failed silently' }, { status: 200 });
  }
}
