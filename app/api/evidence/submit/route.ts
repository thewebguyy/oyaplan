import { NextRequest, NextResponse } from 'next/server';
import { processRawEvidence } from '@/lib/services/normalizationLayer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate parameter presence and types (TypeScript strict validation)
    const venue_id = typeof body.venue_id === 'string' ? body.venue_id.trim() : '';
    const menu_item_name = typeof body.menu_item_name === 'string' ? body.menu_item_name.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const price = typeof body.price === 'number' ? body.price : 0;
    const source_type = typeof body.source_type === 'string' ? body.source_type.trim() : '';
    const submitted_by = typeof body.submitted_by === 'string' ? body.submitted_by.trim() : 'anonymous';
    const evidence_url = typeof body.evidence_url === 'string' ? body.evidence_url.trim() : undefined;

    if (!venue_id) {
      return NextResponse.json({ success: false, error: 'Missing venue_id' }, { status: 400 });
    }
    if (!menu_item_name) {
      return NextResponse.json({ success: false, error: 'Missing menu_item_name' }, { status: 400 });
    }
    if (price <= 0) {
      return NextResponse.json({ success: false, error: 'Price must be greater than zero' }, { status: 400 });
    }

    const validCategories = [
      'starter', 'main', 'dessert', 'cocktail', 'wine', 'beer', 'spirits', 'soft_drink', 'activity_fee', 'other'
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    const validSources = [
      'receipt_upload', 'owner_submission', 'social_media', 'official_website', 'manual_verification', 'web_scraping', 'historical_estimate'
    ];
    if (!validSources.includes(source_type)) {
      return NextResponse.json(
        { success: false, error: `Invalid source_type. Must be one of: ${validSources.join(', ')}` },
        { status: 400 }
      );
    }

    // Delegate to Normalization & Aggregation Layer
    const result = await processRawEvidence({
      venue_id,
      menu_item_name,
      category: category as any,
      price,
      source_type: source_type as any,
      submitted_by,
      evidence_url
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Evidence successfully processed and aggregated.',
      evidenceId: result.evidenceId
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
