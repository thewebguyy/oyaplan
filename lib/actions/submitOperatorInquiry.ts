'use server';

import { supabase } from '../supabase';
import { captureServerException } from '../sentry';

function parseBudget(label: string): number | null {
  if (label === 'Under ₦50k') return 25000;
  if (label === '₦50k–₦150k') return 100000;
  if (label === '₦150k–₦500k') return 300000;
  if (label === 'Over ₦500k') return 750000;
  return null;
}

export async function submitOperatorInquiry(input: {
  businessName: string;
  ownerName: string;
  whatsappNumber: string;
  areaSlug: string;
  spotCategory: string;
  priceRange: string;
  listingTier: string;
  monthlyBudget: string;
  howHeard: string;
  notes: string;
}): Promise<{ success: boolean }> {
  const {
    businessName, ownerName, whatsappNumber, areaSlug, spotCategory,
    priceRange, listingTier, monthlyBudget, howHeard, notes,
  } = input;

  if (typeof businessName !== 'string' || businessName.trim().length === 0) return { success: false };
  if (businessName.trim().length > 200) return { success: false };
  if (typeof ownerName !== 'string' || ownerName.trim().length === 0) return { success: false };
  if (ownerName.trim().length > 200) return { success: false };
  if (typeof whatsappNumber !== 'string' || whatsappNumber.trim().length === 0) return { success: false };
  if (whatsappNumber.trim().length > 30) return { success: false };
  if (typeof areaSlug !== 'string' || areaSlug.trim().length === 0) return { success: false };
  if (typeof spotCategory !== 'string' || spotCategory.trim().length === 0) return { success: false };
  if (typeof priceRange !== 'string' || priceRange.trim().length === 0) return { success: false };
  if (typeof listingTier !== 'string' || !['Basic', 'Featured', 'Premium'].includes(listingTier)) return { success: false };

  try {
    const { error } = await supabase.from('operator_inquiries').insert({
      business_name: businessName.trim(),
      owner_name: ownerName.trim(),
      whatsapp_number: whatsappNumber.trim(),
      area_slug: areaSlug.trim(),
      spot_category: spotCategory.trim(),
      price_per_person_range: priceRange.trim(),
      listing_tier: listingTier,
      monthly_budget_ngn: parseBudget(monthlyBudget),
      how_they_heard: howHeard?.trim() || null,
      additional_notes: notes?.trim() || null,
    });

    if (error) {
      captureServerException(new Error(`submitOperatorInquiry error: ${error.message}`));
      return { success: false };
    }

    return { success: true };
  } catch (e) {
    captureServerException(e);
    return { success: false };
  }
}
