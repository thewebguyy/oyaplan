import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(`api_venues_${ip}`);
    if (rateLimitResult.limited) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    // Filters
    const districtId = searchParams.get('district_id');
    const category = searchParams.get('category');
    const verifiedOnly = searchParams.get('verified') === 'true';

    let query = supabase
      .from('venues')
      .select('id, name, address, category, vibe_tags, verified_venue, computed_confidence_score', { count: 'exact' })
      .eq('active', true);

    if (districtId) query = query.eq('district_id', districtId);
    if (category) query = query.eq('category', category);
    if (verifiedOnly) query = query.eq('verified_venue', true);

    query = query.range(offset, offset + limit - 1).order('computed_confidence_score', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      data,
      meta: {
        page,
        limit,
        total: count || 0,
        total_pages: count ? Math.ceil(count / limit) : 0
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
