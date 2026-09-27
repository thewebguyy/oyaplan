import { normalizeAreaSlug } from './utils';
import { TransportMode } from './transportProfiles';

export type CanonicalPlannerVibe = 
  | 'date-night'
  | 'chill'
  | 'foodie'
  | 'party'
  | 'quick-link'
  | 'brunch';

const VIBE_NORMALIZATION_MAP: Record<string, CanonicalPlannerVibe> = {
  // Date Night / Dinner
  'date-night': 'date-night',
  'date_night': 'date-night',
  'datenight': 'date-night',
  'date night': 'date-night',
  'dinner': 'date-night',
  'romantic': 'date-night',
  'chop eye': 'date-night',
  'first date': 'date-night',
  'first_date': 'date-night',
  'anniversary': 'date-night',

  // Chill / Squad Linkup
  'chill': 'chill',
  'squad-linkup': 'chill',
  'squad_linkup': 'chill',
  'squad linkup': 'chill',
  'squad': 'chill',
  'casual': 'chill',
  'hangout': 'chill',
  'after work': 'chill',
  'after_work': 'chill',
  'after-work': 'chill',
  'outing': 'chill',
  'friends': 'chill',

  // Foodie / Serious Chop
  'foodie': 'foodie',
  'serious chop': 'foodie',
  'serious_chop': 'foodie',
  'serious-chop': 'foodie',
  'food': 'foodie',
  'dining': 'foodie',
  'restaurant': 'foodie',
  'lunch': 'foodie',

  // Party / Birthday Turn Up
  'party': 'party',
  'birthday': 'party',
  'birthday turn up': 'party',
  'birthday_turnup': 'party',
  'turn up': 'party',
  'turnup': 'party',
  'nightlife': 'party',
  'club': 'party',
  'bar': 'party',
  'drinks': 'party',
  'cocktails': 'party',
  'late night': 'party',
  'late_night': 'party',

  // Quick / Quick Linkup / Bites
  'quick': 'quick-link',
  'quick-link': 'quick-link',
  'quick_link': 'quick-link',
  'quick link': 'quick-link',
  'quick bites': 'quick-link',
  'quick_bites': 'quick-link',
  'quick-bites': 'quick-link',
  'coffee': 'quick-link',
  'cafe': 'quick-link',
  'fast': 'quick-link',

  // Brunch / Sunday Brunch
  'brunch': 'brunch',
  'sunday brunch': 'brunch',
  'sunday_brunch': 'brunch',
  'sunday-brunch': 'brunch',
  'breakfast': 'brunch',
};

/**
 * Normalizes any display label, raw vibe tag, or URL slug to a canonical Forge vibe enum.
 */
export function normalizeVibeToCanonicalSlug(rawVibe?: string | null): CanonicalPlannerVibe {
  if (!rawVibe) return 'chill';
  const cleaned = rawVibe.toLowerCase().trim();
  return VIBE_NORMALIZATION_MAP[cleaned] || 'chill';
}

/**
 * Maps a canonical URL vibe slug (e.g. 'date-night') to internal spot vibe tags (e.g. 'Dinner').
 */
export const CANONICAL_VIBE_TO_SPOT_TAG: Record<CanonicalPlannerVibe, string> = {
  'date-night': 'Dinner',
  'chill': 'Chill',
  'foodie': 'Foodie',
  'party': 'Party',
  'quick-link': 'Quick',
  'brunch': 'Brunch',
};

export interface BuildVenuePlanUrlOptions {
  venueId?: string;
  pinned?: string;
  area?: string;
  squad?: number | string;
  budget?: number | string;
  vibe?: string;
  mode?: TransportMode | string;
  departureAt?: Date | string;
  group?: string;
  source?: string;
  fresh?: boolean;
}

/**
 * Single canonical builder for Forge planning URLs.
 * Sanitizes and normalizes all parameters according to the Forge schema.
 */
export function buildVenuePlanUrl(options: BuildVenuePlanUrlOptions): string {
  const params = new URLSearchParams();

  // 1. Pinned Venue ID
  const pinnedId = options.venueId || options.pinned;
  if (pinnedId && pinnedId.trim()) {
    params.set('pinned', pinnedId.trim());
  }

  // 2. Area
  const rawArea = options.area?.trim();
  if (rawArea) {
    const normalizedArea = normalizeAreaSlug(rawArea);
    params.set('area', normalizedArea);
  }

  // 3. Squad Size (Integer 1-50, default 2)
  const rawSquad = options.squad !== undefined ? Number(options.squad) : 2;
  const validSquad = isNaN(rawSquad) || rawSquad < 1 ? 2 : Math.min(50, Math.floor(rawSquad));
  params.set('squad', validSquad.toString());

  // 4. Budget (Integer 5,000 - 2,000,000, default 50,000)
  const rawBudget = options.budget !== undefined ? Number(options.budget) : 50000;
  const validBudget = isNaN(rawBudget) || rawBudget < 5000 
    ? 50000 
    : Math.min(2000000, Math.round(rawBudget / 500) * 500);
  params.set('budget', validBudget.toString());

  // 5. Vibe (Normalized to canonical enum)
  const canonicalVibe = normalizeVibeToCanonicalSlug(options.vibe);
  params.set('vibe', canonicalVibe);

  // 6. Transport Mode (Optional)
  if (options.mode) {
    const validModes: TransportMode[] = ['ride-hailing', 'public-transit', 'driving'];
    if (validModes.includes(options.mode as TransportMode)) {
      params.set('mode', options.mode);
    }
  }

  // 7. Departure At (Optional)
  if (options.departureAt) {
    const departureStr = options.departureAt instanceof Date 
      ? options.departureAt.toISOString() 
      : options.departureAt;
    params.set('departureAt', departureStr);
  }

  // 8. Group (Optional UUID)
  if (options.group && options.group.trim()) {
    params.set('group', options.group.trim());
  }

  // 9. Source context (Optional)
  if (options.source && options.source.trim()) {
    params.set('source', options.source.trim());
  }

  // 10. Fresh indicator
  if (options.fresh !== false) {
    params.set('fresh', 'true');
  }

  return `/forge?${params.toString()}`;
}
