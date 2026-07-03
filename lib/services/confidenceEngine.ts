import { PriceEvidence, MenuItem } from '../types';

/**
 * Reusable and configurable confidence decay function.
 * @param daysSinceUpdate The number of days since the last verified pricing update.
 * @param decayRate The rate of decay (default 0.015).
 * @returns A freshness score between 0 and 100.
 */
export function computeConfidenceDecay(daysSinceUpdate: number, decayRate: number = 0.015): number {
  return Math.exp(-decayRate * daysSinceUpdate) * 100;
}

export function calculateConfidence(
  evidence: PriceEvidence[],
  menuItems: MenuItem[],
  category: string,
  priceFlags: { flag_type: string }[] = []
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  
  if (evidence.length === 0) {
    return { score: 10.00, reasons: ['No pricing evidence uploaded yet. Defaulting to low confidence.'] };
  }

  // 1. Freshness Factor (35% weight)
  const timestamps = evidence.map(e => new Date(e.created_at).getTime());
  const maxTimestamp = Math.max(...timestamps);
  const daysSinceUpdate = Math.max(0, (Date.now() - maxTimestamp) / (1000 * 60 * 60 * 24));
  
  // Exponential decay: e^(-0.015 * t)
  const freshnessScore = computeConfidenceDecay(daysSinceUpdate);
  if (daysSinceUpdate <= 7) {
    reasons.push('✓ Prices verified within the last 7 days');
  } else if (daysSinceUpdate <= 30) {
    reasons.push(`✓ Verified ${Math.floor(daysSinceUpdate)} days ago`);
  } else {
    reasons.push(`⚠ Pricing is aging (last verified ${Math.floor(daysSinceUpdate)} days ago)`);
  }

  // 2. Verification Source / Trust Weight (30% weight)
  const maxWeight = Math.max(...evidence.map(e => Number(e.confidence_weight || 0.50)));
  const sourceScore = maxWeight * 100;
  
  const hasAdmin = evidence.some(e => e.source_type === 'owner_submission' || e.source_type === 'manual_verification');
  const hasReceipts = evidence.some(e => e.source_type === 'receipt_upload');
  
  if (hasAdmin) {
    reasons.push('✓ Verified by venue owner or admin team');
  } else if (hasReceipts) {
    reasons.push('✓ Backed by customer receipt uploads');
  } else {
    reasons.push('⚠ Prices based on social media or scraping');
  }

  // 3. Confirmation Volume (20% weight)
  // Group evidence by distinct submitted_by (independent submitters)
  const uniqueSubmitters = new Set(evidence.map(e => e.submitted_by)).size;
  const confirmationScore = Math.min(uniqueSubmitters * 25, 100);
  if (uniqueSubmitters >= 3) {
    reasons.push(`✓ Confirmed by ${uniqueSubmitters} independent sources`);
  } else if (uniqueSubmitters > 1) {
    reasons.push(`✓ Cross-referenced with ${uniqueSubmitters} sources`);
  }

  // 4. Menu Completeness (15% weight)
  const categoriesPresent = new Set(menuItems.map(m => m.category));
  let expectedCategories = ['main'];
  if (category === 'restaurant') {
    expectedCategories = ['starter', 'main', 'soft_drink'];
  } else if (category === 'bar') {
    expectedCategories = ['cocktail', 'beer', 'starter'];
  } else if (category === 'cafe') {
    expectedCategories = ['main', 'soft_drink'];
  } else if (category === 'activity') {
    expectedCategories = ['activity_fee', 'soft_drink'];
  }

  const presentCount = expectedCategories.filter(cat => categoriesPresent.has(cat as MenuItem['category'])).length;
  const completenessScore = (presentCount / expectedCategories.length) * 100;
  
  if (completenessScore === 100) {
    reasons.push('✓ Full menu completeness across standard categories');
  } else {
    reasons.push(`⚠ Menu incomplete (missing ${expectedCategories.length - presentCount} key categories)`);
  }

  // 5. Conflict Penalty
  let conflictPenalty = 0;
  // If we have items with multiple approved prices, check variance
  const itemPrices: Record<string, number[]> = {};
  evidence.forEach(e => {
    if (e.menu_item_id) {
      if (!itemPrices[e.menu_item_id]) itemPrices[e.menu_item_id] = [];
      itemPrices[e.menu_item_id].push(e.recorded_price);
    }
  });

  let hasHighConflict = false;
  for (const prices of Object.values(itemPrices)) {
    if (prices.length > 1) {
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      const variances = prices.map(p => Math.abs(p - avg) / avg);
      const maxVariance = Math.max(...variances);
      if (maxVariance > 0.20) {
        hasHighConflict = true;
      }
    }
  }

  if (hasHighConflict) {
    conflictPenalty += 30;
    reasons.push('✖ Alert: Conflicting prices detected for the same items');
  } else {
    reasons.push('✓ Clean evidence history with no price conflicts');
  }

  // 6. User Up-Flag Penalty
  const upFlagsCount = priceFlags.filter(f => f.flag_type === 'up').length;
  if (upFlagsCount >= 3) {
    conflictPenalty += 20;
    reasons.push(`✖ Alert: ${upFlagsCount} users flagged prices as higher recently`);
  }

  // Final Weighted Score
  const rawScore = (freshnessScore * 0.35) + (sourceScore * 0.30) + (confirmationScore * 0.20) + (completenessScore * 0.15);
  const finalScore = Math.max(0.00, Math.min(100.00, rawScore - conflictPenalty));

  // Round to 2 decimal places
  const roundedScore = Math.round(finalScore * 100) / 100;

  return {
    score: roundedScore,
    reasons: reasons
  };
}
