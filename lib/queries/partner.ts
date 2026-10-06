import { supabase } from '@/lib/supabase';
import { createServerClient } from '@/lib/supabase-server';
import { 
  Venue, 
  MenuItem, 
  ProfileHealth, 
  ProfileHealthItem, 
  VenueDemandActivity, 
  VenuePlanningInsights, 
  VenuePhoto, 
  VenueClaim 
} from '@/lib/types';

/**
 * getPublicVenueById
 * Fetches public-facing venue record for /venue/[id] with fallback to spots table
 */
export async function getPublicVenueById(
  idOrSlug: string
): Promise<{ data: Venue | null; error: string | null }> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    // 1. First attempt: Look up in venues table
    let query = supabase
      .from('venues')
      .select('*, districts(name, slug)');

    if (isUuid) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data, error } = await query.maybeSingle();

    if (data) {
      return { data: (data as unknown as Venue), error: null };
    }

    // 2. Second attempt: Check venues by name if not UUID
    if (!isUuid) {
      const { data: venueByName } = await supabase
        .from('venues')
        .select('*, districts(name, slug)')
        .ilike('name', idOrSlug.replace(/-/g, ' '))
        .maybeSingle();

      if (venueByName) {
        return { data: (venueByName as unknown as Venue), error: null };
      }
    }

    // 3. Fallback: Look up in legacy spots table
    const { data: spot } = await supabase
      .from('spots')
      .select('*, areas(*)')
      .or(`id.eq.${idOrSlug},name.ilike.%${idOrSlug.replace(/-/g, ' ')}%`)
      .maybeSingle();

    if (spot) {
      const normalizedVenue: Venue = {
        id: spot.id,
        district_id: spot.area_id || '',
        name: spot.name,
        address: spot.address || 'Lagos, Nigeria',
        description: spot.description || undefined,
        vibe_tags: spot.vibe_tags || [],
        category: (spot.category as any) || 'restaurant',
        subcategory: spot.subcategory || null,
        typical_duration_hours: spot.typical_duration_hours || 2,
        instagram_handle: spot.instagram_handle || null,
        is_featured: spot.is_featured || false,
        active: spot.active !== false,
        cover_url: spot.cover_url || spot.image_url || undefined,
        gallery_urls: spot.gallery_urls || [],
        districts: spot.areas ? { name: spot.areas.name, slug: spot.areas.slug } : { name: 'Lagos', slug: 'lagos' },
        vat_pct: 7.5,
        service_charge_pct: 10,
        minimum_spend: 0,
        partner_state: 'unclaimed',
        operational_status: 'community_verified',
        derived_typical_cost: spot.price_per_person || 0,
        derived_price_tier: spot.price_tier || 2,
        computed_confidence_score: 80,
        confidence_reasons: ['Community Indexed Spot'],
      };

      return { data: normalizedVenue, error: null };
    }

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: null, error: null };
  } catch (err: unknown) {
    return { data: null, error: err instanceof Error ? err.message : 'Unexpected error fetching venue' };
  }
}

/**
 * getPartnerVenuesForUser
 * Retrieves all venues where user is an authorized owner or manager
 */
export async function getPartnerVenuesForUser(
  userId: string
): Promise<Array<{ venue: Venue; role: string }>> {
  try {
    // 1. Direct role memberships
    const { data: roles, error: rolesError } = await supabase
      .from('venue_roles')
      .select('venue_id, role, venues(*)')
      .eq('user_id', userId);

    if (rolesError) {
      console.error('Error fetching partner venues:', rolesError);
      return [];
    }

    if (roles && roles.length > 0) {
      return roles.map((r: any) => ({
        venue: r.venues as Venue,
        role: r.role || 'manager'
      }));
    }

    // 2. Direct claimed_by fallback
    const { data: directVenues } = await supabase
      .from('venues')
      .select('*')
      .eq('claimed_by', userId);

    if (directVenues && directVenues.length > 0) {
      return directVenues.map((v: any) => ({
        venue: v as Venue,
        role: 'owner'
      }));
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * checkVenueAuthorization
 * Server-side check that current user is authorized to manage the venue
 */
export async function checkVenueAuthorization(
  venueId: string,
  userId: string
): Promise<{ authorized: boolean; role?: string; isAdmin?: boolean }> {
  try {
    const serverClient = await createServerClient();
    
    // Check admin
    const { data: { user } } = await serverClient.auth.getUser();
    if (user?.email) {
      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('id')
        .ilike('email', user.email)
        .maybeSingle();

      if (adminRow) {
        return { authorized: true, role: 'admin', isAdmin: true };
      }
    }

    // Check venue_roles
    const { data: roleRow } = await supabase
      .from('venue_roles')
      .select('role')
      .eq('venue_id', venueId)
      .eq('user_id', userId)
      .maybeSingle();

    if (roleRow) {
      return { authorized: true, role: roleRow.role };
    }

    // Check claimed_by on venue
    const { data: venueRow } = await supabase
      .from('venues')
      .select('claimed_by')
      .eq('id', venueId)
      .maybeSingle();

    if (venueRow && venueRow.claimed_by === userId) {
      return { authorized: true, role: 'owner' };
    }

    return { authorized: false };
  } catch {
    return { authorized: false };
  }
}

/**
 * getPartnerVenue
 * Fetches venue ensuring server-side access control
 */
export async function getPartnerVenue(
  venueId: string,
  userId: string
): Promise<{ data: Venue | null; error: string | null; role?: string }> {
  const auth = await checkVenueAuthorization(venueId, userId);
  if (!auth.authorized) {
    return { data: null, error: 'Unauthorized to manage this venue' };
  }

  const { data, error } = await supabase
    .from('venues')
    .select('*, districts(name, slug)')
    .eq('id', venueId)
    .single();

  if (error || !data) {
    return { data: null, error: error?.message || 'Venue not found' };
  }

  return { data: data as unknown as Venue, error: null, role: auth.role };
}

/**
 * getVenueMenuItems
 * Retrieves all menu items for the venue
 */
export async function getVenueMenuItems(
  venueId: string
): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('venue_id', venueId)
    .order('category', { ascending: true })
    .order('price', { ascending: true });

  if (error || !data) return [];
  return data as MenuItem[];
}

/**
 * getVenuePhotos
 * Retrieves photos submitted/approved for venue
 */
export async function getVenuePhotos(
  venueId: string
): Promise<VenuePhoto[]> {
  const { data, error } = await supabase
    .from('venue_photos')
    .select('*')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as VenuePhoto[];
}

/**
 * getNearbyVenues
 * Retrieves nearby/similar venues for discovery recommendations
 */
export async function getNearbyVenues(
  venueId: string,
  districtId?: string | null,
  category?: string | null,
  limit: number = 3
): Promise<Venue[]> {
  try {
    let query = supabase
      .from('venues')
      .select('*, districts(name, slug)')
      .neq('id', venueId);

    if (districtId) {
      query = query.eq('district_id', districtId);
    } else if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.limit(limit);
    if (!error && data && data.length > 0) {
      return data as unknown as Venue[];
    }

    // Fallback: fetch any available venues
    const { data: fallbackData } = await supabase
      .from('venues')
      .select('*, districts(name, slug)')
      .neq('id', venueId)
      .limit(limit);

    return (fallbackData as unknown as Venue[]) || [];
  } catch {
    return [];
  }
}

/**
 * calculateProfileHealth
 * Evaluates real, actionable profile health percentage and missing tasks
 */
export function calculateProfileHealth(
  venue: Venue,
  menuItems: MenuItem[],
  approvedPhotosCount: number,
  baseRoute: 'partner' | 'business' = 'partner'
): ProfileHealth {
  const completedItems: ProfileHealthItem[] = [];
  const missingItems: ProfileHealthItem[] = [];

  let score = 0;
  const venueEditorPath = baseRoute === 'business' ? `/business/${venue.id}/venue` : `/partner/${venue.id}/onboarding`;
  const pricingPath = `/${baseRoute}/${venue.id}/pricing`;

  // 1. Business Info (25%)
  const hasDesc = Boolean(venue.description && venue.description.length >= 20);
  const hasAddress = Boolean(venue.address && venue.address.length >= 5);
  const hasContact = Boolean(venue.contact_number || venue.contact_email || venue.instagram_handle);

  if (hasDesc && hasAddress && hasContact) {
    score += 25;
    completedItems.push({ id: 'business_info', label: 'Business information', completed: true });
  } else {
    missingItems.push({
      id: 'business_info',
      label: 'Complete business description & contact info',
      completed: false,
      actionLabel: 'Edit info',
      actionHref: `${venueEditorPath}?step=1`
    });
  }

  // 2. Opening Hours (15%)
  const hours = venue.opening_hours && Object.keys(venue.opening_hours).length > 0;
  if (hours) {
    score += 15;
    completedItems.push({ id: 'opening_hours', label: 'Opening hours', completed: true });
  } else {
    missingItems.push({
      id: 'opening_hours',
      label: 'Confirm opening hours',
      completed: false,
      actionLabel: 'Add hours',
      actionHref: `${venueEditorPath}?step=1`
    });
  }

  // 3. Pricing & Charges (25%)
  const hasMenu = menuItems.length >= 3;
  const isPriceRecent = venue.last_price_updated_at ? (
    (Date.now() - new Date(venue.last_price_updated_at).getTime()) <= 30 * 86400 * 1000
  ) : false;

  if (hasMenu && isPriceRecent) {
    score += 25;
    completedItems.push({ id: 'pricing', label: 'Pricing & charges verified', completed: true });
  } else if (hasMenu) {
    score += 15;
    completedItems.push({ id: 'pricing_partial', label: 'Menu items listed', completed: true });
    missingItems.push({
      id: 'pricing_stale',
      label: 'Review prices (pricing needs freshness confirmation)',
      completed: false,
      actionLabel: 'Review prices',
      actionHref: pricingPath
    });
  } else {
    missingItems.push({
      id: 'pricing_empty',
      label: 'Add at least 3 menu items with prices',
      completed: false,
      actionLabel: 'Add menu',
      actionHref: pricingPath
    });
  }

  // 4. Experience Details (15%)
  const hasExperience = (venue.vibe_tags && venue.vibe_tags.length > 0) || 
    (venue.audience_tags && venue.audience_tags.length > 0) || 
    (venue.activity_tags && venue.activity_tags.length > 0);

  if (hasExperience) {
    score += 15;
    completedItems.push({ id: 'experience', label: 'Experience & vibe classification', completed: true });
  } else {
    missingItems.push({
      id: 'experience',
      label: 'Tag suitable experiences (date night, brunch, squad size)',
      completed: false,
      actionLabel: 'Classify vibe',
      actionHref: `${venueEditorPath}?step=3`
    });
  }

  // 5. Photos (20%)
  const hasCover = Boolean(venue.cover_url);
  const totalPhotos = approvedPhotosCount + (venue.gallery_urls?.length || 0) + (hasCover ? 1 : 0);

  if (hasCover && totalPhotos >= 3) {
    score += 20;
    completedItems.push({ id: 'photos', label: 'Cover & venue photos', completed: true });
  } else if (hasCover) {
    score += 10;
    completedItems.push({ id: 'photos_cover', label: 'Cover photo added', completed: true });
    missingItems.push({
      id: 'photos_more',
      label: `Add ${Math.max(1, 3 - totalPhotos)} more photos of interior or food`,
      completed: false,
      actionLabel: 'Add photos',
      actionHref: `${venueEditorPath}?step=4`
    });
  } else {
    missingItems.push({
      id: 'photos_cover_missing',
      label: 'Add a cover photo and at least 2 interior/food photos',
      completed: false,
      actionLabel: 'Upload photos',
      actionHref: `${venueEditorPath}?step=4`
    });
  }

  const percentage = Math.min(100, Math.max(0, score));

  let label: ProfileHealth['label'] = 'Needs attention';
  if (percentage >= 90) label = 'Excellent';
  else if (percentage >= 70) label = 'Good';
  else if (percentage >= 50) label = 'Getting there';

  return {
    percentage,
    label,
    completedItems,
    missingItems
  };
}

/**
 * getVenueDemandActivity
 * Aggregates actual plans featuring this venue, shares, and reported outings
 */
export async function getVenueDemandActivity(
  venueId: string
): Promise<VenueDemandActivity> {
  try {
    // 1. Count shared plans featuring this spot
    const { count: sharedCount } = await supabase
      .from('shared_plans')
      .select('id', { count: 'exact', head: true })
      .eq('spot_id', venueId);

    // 2. Count reported outings
    const { count: reportedOutingsCount } = await supabase
      .from('actual_spend_reports')
      .select('id', { count: 'exact', head: true })
      .eq('spot_id', venueId);

    const plansShared = sharedCount || 0;
    const reportedOutings = reportedOutingsCount || 0;
    const plansFeaturing = plansShared;

    const totalSignals = plansFeaturing + plansShared + reportedOutings;
    const hasEnoughData = totalSignals >= 3;

    return {
      plansFeaturingCount: plansFeaturing,
      plansSharedCount: plansShared,
      reportedOutingsCount: reportedOutings,
      hasEnoughData
    };
  } catch {
    return {
      plansFeaturingCount: 0,
      plansSharedCount: 0,
      reportedOutingsCount: 0,
      hasEnoughData: false
    };
  }
}

/**
 * getVenuePlanningInsights
 * Examines shared plans featuring venue and derives genuine planning patterns.
 * Gated by a minimum sample size of 5 plans to prevent manufactured intelligence.
 */
export async function getVenuePlanningInsights(
  venueId: string
): Promise<VenuePlanningInsights> {
  try {
    const { data: plans, error } = await supabase
      .from('shared_plans')
      .select('squad_size, budget, vibe')
      .eq('spot_id', venueId)
      .limit(100);

    if (error || !plans || plans.length < 5) {
      return {
        hasEnoughData: false,
        totalPlansAnalyzed: plans?.length || 0
      };
    }

    // 1. Group size aggregation
    const groupSizes = plans.map(p => p.squad_size);
    const avgSize = Math.round(groupSizes.reduce((a, b) => a + b, 0) / groupSizes.length);
    let commonGroupSize = `${avgSize} people`;
    if (avgSize >= 3 && avgSize <= 5) commonGroupSize = '3–5 people';
    else if (avgSize <= 2) commonGroupSize = 'Couples / 2 people';
    else if (avgSize >= 6) commonGroupSize = '6+ people (Large Squad)';

    // 2. Occasion / Vibe mode
    const vibeCounts: Record<string, number> = {};
    for (const p of plans) {
      const v = (p.vibe || 'dinner').toLowerCase();
      vibeCounts[v] = (vibeCounts[v] || 0) + 1;
    }
    const topVibeEntry = Object.entries(vibeCounts).sort((a, b) => b[1] - a[1])[0];
    const topVibe = topVibeEntry ? (
      topVibeEntry[0].charAt(0).toUpperCase() + topVibeEntry[0].slice(1)
    ) : 'Dinner';

    // 3. Typical Budget Range
    const budgets = plans.map(p => p.budget).filter(b => b > 0).sort((a, b) => a - b);
    const lowBudget = budgets[Math.floor(budgets.length * 0.25)] || 30000;
    const highBudget = budgets[Math.floor(budgets.length * 0.75)] || 50000;
    const formattedBudget = `₦${Math.round(lowBudget / 1000)}k–₦${Math.round(highBudget / 1000)}k`;

    return {
      mostCommonOccasion: topVibe,
      mostCommonGroupSize: commonGroupSize,
      typicalBudgetRange: formattedBudget,
      hasEnoughData: true,
      totalPlansAnalyzed: plans.length
    };
  } catch {
    return {
      hasEnoughData: false,
      totalPlansAnalyzed: 0
    };
  }
}

/**
 * getVenueClaimsByUser
 * Check claim status for a user & venue
 */
export async function getVenueClaimByUser(
  venueId: string,
  userId: string
): Promise<VenueClaim | null> {
  const { data, error } = await supabase
    .from('venue_claims')
    .select('*')
    .eq('venue_id', venueId)
    .eq('user_id', userId)
    .order('claimed_at', { ascending: false })
    .maybeSingle();

  if (error || !data) return null;
  return data as VenueClaim;
}

/**
 * getAdminVenueClaims
 * Fetches all venue claims with associated venue details for admin review
 */
export async function getAdminVenueClaims(
  statusFilter?: string
): Promise<Array<VenueClaim & { venue_name?: string; venue_category?: string; venue_address?: string; venue_partner_state?: string }>> {
  try {
    const supabase = await createServerClient();
    let query = supabase
      .from('venue_claims')
      .select('*, venues(id, name, category, address, partner_state)')
      .order('claimed_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((item: any) => ({
      ...item,
      venue_name: item.venues?.name || 'Unknown Venue',
      venue_category: item.venues?.category || 'restaurant',
      venue_address: item.venues?.address || 'Lagos',
      venue_partner_state: item.venues?.partner_state || 'unclaimed',
    }));
  } catch (err) {
    console.error('Error fetching admin claims:', err);
    return [];
  }
}

/**
 * getAdminVenuePipelineStats
 * Aggregates counts across the venue supply pipeline
 */
export async function getAdminVenuePipelineStats(): Promise<{
  pendingClaims: number;
  approvedClaims: number;
  verifiedPartners: number;
  verificationPendingVenues: number;
  onboardingVenues: number;
  unclaimedVenues: number;
  pendingChangeRequests: number;
  activeInvitations: number;
}> {
  try {
    const supabase = await createServerClient();

    const [
      { count: pendingClaims },
      { count: approvedClaims },
      { count: verifiedPartners },
      { count: verificationPendingVenues },
      { count: onboardingVenues },
      { count: unclaimedVenues },
      { count: pendingChangeRequests },
      { count: activeInvitations },
    ] = await Promise.all([
      supabase.from('venue_claims').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('venue_claims').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('venues').select('*', { count: 'exact', head: true }).eq('partner_state', 'verified_partner'),
      supabase.from('venues').select('*', { count: 'exact', head: true }).eq('partner_state', 'verification_pending'),
      supabase.from('venues').select('*', { count: 'exact', head: true }).eq('partner_state', 'onboarding'),
      supabase.from('venues').select('*', { count: 'exact', head: true }).eq('partner_state', 'unclaimed'),
      supabase.from('venue_change_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('venue_claims').select('*', { count: 'exact', head: true }).in('status', ['invited', 'opened']),
    ]);

    return {
      pendingClaims: pendingClaims || 0,
      approvedClaims: approvedClaims || 0,
      verifiedPartners: verifiedPartners || 0,
      verificationPendingVenues: verificationPendingVenues || 0,
      onboardingVenues: onboardingVenues || 0,
      unclaimedVenues: unclaimedVenues || 0,
      pendingChangeRequests: pendingChangeRequests || 0,
      activeInvitations: activeInvitations || 0,
    };
  } catch (err) {
    console.error('Error fetching pipeline stats:', err);
    return {
      pendingClaims: 0,
      approvedClaims: 0,
      verifiedPartners: 0,
      verificationPendingVenues: 0,
      onboardingVenues: 0,
      unclaimedVenues: 0,
      pendingChangeRequests: 0,
      activeInvitations: 0,
    };
  }
}

/**
 * getVenuesForInvitation
 * Fetches list of venues eligible for invitations
 */
export async function getVenuesForInvitation(): Promise<Array<{
  id: string;
  name: string;
  category?: string;
  address?: string;
  partner_state?: string;
}>> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('venues')
      .select('id, name, category, address, partner_state')
      .order('name', { ascending: true });

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.error('Error fetching venues for invitation:', err);
    return [];
  }
}

/**
 * getVenuesForClaimSearch
 * Fetches venues and spots with district info for the public /business/claim search portal
 */
export async function getVenuesForClaimSearch(): Promise<Array<{
  id: string;
  slug?: string;
  name: string;
  category?: string;
  address?: string;
  partner_state?: string;
  district_name?: string;
}>> {
  try {
    const supabase = await createServerClient();
    
    // Fetch venues with photos and visual assets
    const { data: venuesData } = await supabase
      .from('venues')
      .select('id, slug, name, category, address, partner_state, cover_url, logo_url, gallery_urls, districts(name, slug)')
      .order('name', { ascending: true })
      .limit(300);

    // Fetch spots with visual assets
    const { data: spotsData } = await supabase
      .from('spots')
      .select('id, name, category, address, active, image_url, cover_url, areas(name, slug)')
      .eq('active', true)
      .order('name', { ascending: true })
      .limit(300);

    const seenNames = new Set<string>();
    const results: Array<{
      id: string;
      slug?: string;
      name: string;
      category?: string;
      address?: string;
      partner_state?: string;
      district_name?: string;
      cover_url?: string;
      logo_url?: string;
      gallery_urls?: string[];
    }> = [];

    // Prioritize venues table entries
    if (venuesData) {
      for (const v of venuesData) {
        seenNames.add(v.name.toLowerCase().trim());
        results.push({
          id: v.id,
          slug: v.slug,
          name: v.name,
          category: v.category,
          address: v.address,
          partner_state: v.partner_state || 'unclaimed',
          district_name: (v as any).districts?.name || undefined,
          cover_url: v.cover_url || undefined,
          logo_url: v.logo_url || undefined,
          gallery_urls: v.gallery_urls || undefined,
        });
      }
    }

    // Merge spots that aren't already in venues
    if (spotsData) {
      for (const s of spotsData) {
        const normName = s.name.toLowerCase().trim();
        if (!seenNames.has(normName)) {
          seenNames.add(normName);
          results.push({
            id: s.id,
            slug: s.id,
            name: s.name,
            category: s.category,
            address: s.address,
            partner_state: 'unclaimed',
            district_name: (s as any).areas?.name || 'Lagos',
            cover_url: s.cover_url || s.image_url || undefined,
          });
        }
      }
    }

    return results;
  } catch (err) {
    console.error('Error fetching venues for claim search:', err);
    return [];
  }
}
