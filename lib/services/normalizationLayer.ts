import { supabase } from '../supabase';
import { calculateConfidence } from './confidenceEngine';
import { calculateTypicalOutingCost } from './pricingEngine';

export interface RawEvidenceInput {
  venue_id: string;
  menu_item_name: string;
  category: 'starter' | 'main' | 'dessert' | 'cocktail' | 'wine' | 'beer' | 'spirits' | 'soft_drink' | 'activity_fee' | 'other';
  price: number;
  source_type: 'receipt_upload' | 'owner_submission' | 'social_media' | 'official_website' | 'manual_verification' | 'web_scraping' | 'historical_estimate';
  submitted_by: string;
  evidence_url?: string;
}

export async function processRawEvidence(input: RawEvidenceInput): Promise<{
  success: boolean;
  evidenceId?: string;
  error?: string;
}> {
  // 1. Validation
  if (input.price <= 0) {
    return { success: false, error: 'Price must be greater than zero.' };
  }
  if (!input.venue_id || !input.menu_item_name) {
    return { success: false, error: 'Venue ID and menu item name are required.' };
  }

  try {
    // 2. Normalization
    // Clean strings (trim, reduce spaces, normalize Title Case)
    const normalizedName = input.menu_item_name
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .replace(/(^\w|\s\w)/g, m => m.toUpperCase());

    // Clean price (round to nearest NGN 100 for clean ledger records)
    const normalizedPrice = Math.round(input.price / 100) * 100;

    // Check if the menu item exists
    const { data: foundMenuItem, error: findErr } = await supabase
      .from('menu_items')
      .select('*')
      .eq('venue_id', input.venue_id)
      .eq('name', normalizedName)
      .maybeSingle();

    if (findErr) {
      return { success: false, error: `Database fetch error: ${findErr.message}` };
    }

    let menuItem = foundMenuItem;

    const previousPrice = menuItem ? menuItem.price : null;

    // Insert menu item if missing
    if (!menuItem) {
      const { data: newItem, error: insertItemErr } = await supabase
        .from('menu_items')
        .insert({
          venue_id: input.venue_id,
          name: normalizedName,
          category: input.category,
          price: normalizedPrice,
          is_available: true
        })
        .select()
        .single();

      if (insertItemErr) {
        return { success: false, error: `Failed to create new menu item: ${insertItemErr.message}` };
      }
      menuItem = newItem;
    }

    // Determine trust weights
    let trustWeight = 0.50;
    switch (input.source_type) {
      case 'owner_submission':
      case 'manual_verification':
        trustWeight = 1.00;
        break;
      case 'receipt_upload':
        trustWeight = 0.90;
        break;
      case 'official_website':
        trustWeight = 0.80;
        break;
      case 'social_media':
        trustWeight = 0.65;
        break;
      case 'web_scraping':
        trustWeight = 0.50;
        break;
      case 'historical_estimate':
        trustWeight = 0.30;
        break;
    }

    // 3. Auto-Approval Gate: Only trusted sources get approved immediately.
    // Public uploads (receipts, web scrapes) require admin verification before recalculating.
    const isAutoApproved = ['owner_submission', 'manual_verification', 'historical_estimate'].includes(input.source_type);
    const verificationStatus = isAutoApproved ? 'approved' : 'pending';

    const { data: evidence, error: evErr } = await supabase
      .from('price_evidence')
      .insert({
        menu_item_id: menuItem.id,
        venue_id: input.venue_id,
        source_type: input.source_type,
        submitted_by: input.submitted_by,
        recorded_price: normalizedPrice,
        evidence_url: input.evidence_url || null,
        verification_status: verificationStatus,
        confidence_weight: trustWeight
      })
      .select()
      .single();

    if (evErr) {
      return { success: false, error: `Failed to save evidence: ${evErr.message}` };
    }

    if (isAutoApproved) {
      // Update current menu item active price
      const { error: updateItemErr } = await supabase
        .from('menu_items')
        .update({ price: normalizedPrice, last_updated_at: new Date().toISOString() })
        .eq('id', menuItem.id);

      if (updateItemErr) {
        console.error(`Failed to update menu item price: ${updateItemErr.message}`);
      }

      // Write audit log
      await supabase.from('price_audit_logs').insert({
        menu_item_id: menuItem.id,
        changed_by: input.submitted_by,
        action_type: previousPrice === null ? 'create' : 'update',
        previous_price: previousPrice,
        new_price: normalizedPrice,
        evidence_id: evidence.id,
        reason: `Processed auto-approved ${input.source_type} price validation`
      });

      // 4. Aggregation: Recalculate and update materialized derived statistics
      const aggSuccess = await aggregateVenuePricing(input.venue_id);
      if (!aggSuccess) {
        return { success: false, error: 'Evidence recorded but aggregation failed.' };
      }
    }



    return { success: true, evidenceId: evidence.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown aggregation exception.';
    return { success: false, error: msg };
  }
}

export async function aggregateVenuePricing(venueId: string): Promise<boolean> {
  try {
    // Get all available items for the venue
    const { data: menuItems, error: itemsErr } = await supabase
      .from('menu_items')
      .select('*')
      .eq('venue_id', venueId)
      .eq('is_available', true);

    if (itemsErr || !menuItems) {
      console.error(`Error fetching menu items for ${venueId}:`, itemsErr);
      return false;
    }

    // Fetch tax settings and basic info
    const { data: venue, error: venueErr } = await supabase
      .from('venues')
      .select('*')
      .eq('id', venueId)
      .single();

    if (venueErr || !venue) {
      console.error(`Error fetching venue ${venueId}:`, venueErr);
      return false;
    }

    // Fetch all active/approved evidence records
    const { data: evidence, error: evErr } = await supabase
      .from('price_evidence')
      .select('*')
      .eq('venue_id', venueId)
      .eq('verification_status', 'approved');

    if (evErr || !evidence) {
      console.error(`Error fetching evidence for ${venueId}:`, evErr);
      return false;
    }

    // 1. Calculate derived outing cost
    const derivedCost = calculateTypicalOutingCost(menuItems, venue.category, {
      vat_pct: Number(venue.vat_pct),
      service_charge_pct: Number(venue.service_charge_pct),
      minimum_spend: Number(venue.minimum_spend)
    });

    // 2. Calculate dynamic price tier
    let priceTier = 2;
    if (derivedCost < 10000) priceTier = 1;
    else if (derivedCost < 25000) priceTier = 2;
    else if (derivedCost < 55000) priceTier = 3;
    else priceTier = 4;

    // Fetch price flags
    const { data: priceFlags } = await supabase
      .from('price_flags')
      .select('flag_type')
      .eq('spot_id', venueId);

    // 3. Compute dynamic confidence metrics
    const { score, reasons } = calculateConfidence(evidence, menuItems, venue.category, priceFlags || []);

    // 4. Compute operational status separate from confidence
    let operationalStatus: 'fresh' | 'stale' | 'needs_review' | 'verified' | 'community_verified' = 'verified';

    const timestamps = evidence.map(e => new Date(e.created_at).getTime());
    const maxTime = timestamps.length > 0 ? Math.max(...timestamps) : Date.now();
    const daysSinceLastUpdate = (Date.now() - maxTime) / (1000 * 60 * 60 * 24);

    const userReceipts = evidence.filter(e => e.source_type === 'receipt_upload');

    if (score < 40) {
      operationalStatus = 'needs_review';
    } else if (daysSinceLastUpdate > 90) {
      operationalStatus = 'stale';
    } else if (daysSinceLastUpdate <= 30 && score >= 85) {
      operationalStatus = 'fresh';
    } else if (userReceipts.length >= 3) {
      operationalStatus = 'community_verified';
    }

    // 5. Update venue record with materialized values
    const { error: updateErr } = await supabase
      .from('venues')
      .update({
        derived_typical_cost: derivedCost,
        derived_price_tier: priceTier,
        computed_confidence_score: score,
        confidence_reasons: reasons,
        operational_status: operationalStatus
      })
      .eq('id', venueId);

    if (updateErr) {
      console.error(`Error updating venue materialized statistics: ${updateErr.message}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception during venue aggregation:', err);
    return false;
  }
}
