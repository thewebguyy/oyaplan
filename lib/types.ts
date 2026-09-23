

import { Experience } from "./constants/experiences";

export type Area = {
  id: string;
  name: string;
  slug: string;
};

export type TransportEstimate = {
  status?: "available" | "unavailable";
  reason?: "NO_ROUTE_DATA" | string;
  low: number;
  high: number;
  midpointCost?: number;
  mode: string;
  origin: string;
  destination: string;
  departure_assumption?: string;
  calculation_version?: string;
  partySize?: number;
  vehicleCapacity?: number;
  vehiclesRequired?: number;
  departureAssumption?: string;
  isCrossWater?: boolean;
  calculationVersion?: string;
};

export type Spot = {
  id: string;
  name: string;
  address: string;
  area_id: string;
  areas?: Area;
  vibe_tags: string[];
  price_per_person: number;
  price_updated_at?: string;
  price_source?: string;
  transport_matrix: Record<string, number>;
  is_featured: boolean;
  image_url?: string;
  cover_url?: string;
  gallery_urls?: string[];
  logo_url?: string;
  active: boolean;
  category?: 'restaurant' | 'bar' | 'activity' | 'nature' | 'entertainment' | 'beach' | 'cafe' | 'experience';
  has_food?: boolean;
  typical_duration_hours?: number;
  address_slug?: string;
  subcategory?: string;
  price_tier?: number;
  crowd_type?: string;
  best_daypart?: string;
  days_open?: string[];
  instagram_handle?: string;
  trending_score?: number;
  verified_by?: string;
  zone?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  computed_confidence_score?: number;
  confidence_reasons?: string[];
  best_for?: (Experience | string)[];
  not_recommended_for?: (Experience | string)[];
  planning_notes?: string[];
  personality?: string;
  things_to_know?: string[];
  secondary_experience?: string;
  food_type?: string;
};
     
export type ForgeInput = {
  startArea?: string;
  squadSize: number;
  budget: number;
  vibe: string;
  pinnedSpotId?: string;
  categoryGroup?: string;
  daypart?: 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Any time';
  transportMode?: 'ride-hailing' | 'public-transit' | 'driving';
  departureAt?: string; // ISO 8601 string, parsed to Date in planning layer
  routeOverrides?: Record<string, { low: number; high: number; source: string; confidence: number }>;
  originDistrictId?: string;
  userId?: string;
  sessionId?: string;
  groupId?: string;
};

// OyaSquad Domain Types
export interface PlanningGroup {
  id: string;
  owner_id: string;
  name: string;
  emoji: string;
  created_at: string;
  updated_at: string;
}

export interface PlanningGroupMember {
  id: string;
  group_id: string;
  user_id: string | null;
  display_name: string;
  created_at: string;
}

export interface OyaSquadSummary extends PlanningGroup {
  member_count: number;
  members: Array<{ id: string; display_name: string }>;
  plans_count: number;
  last_outing?: {
    venue_name: string;
    total_cost: number;
    cost_per_person: number;
    date: string;
    shared_plan_id: string;
  } | null;
}

export interface PlanExplanation {
  budget_fit: string;
  freshness: string;
  confidence: string;
  tax_transparency: string;
  // Phase 3A additions — populated by matching engine, consumed by PlanCard explainability accordion
  source_label?: string;       // Human-readable pricing source (e.g. "Owner submitted", "Community receipts")
  confidence_score?: number;   // Numeric score 0-100 for rendering the badge
  status?: string;             // Operational status string (fresh | stale | needs_review | verified | community_verified)
  has_car?: boolean;
  reason?: string;
  travel_info?: string;
  ordered_reasons?: string[];  // Strictly ordered Why-It-Fits bullet points (1. Budget, 2. Vibe, 3. Transport, 4. Recency, 5. Group)
  things_to_know?: string[];   // Deterministic trade-off callouts (parking, noise, reservations)
  evaluated_count?: number;    // Total candidate spots evaluated during matching
}

export type TrustSignal = string;

export type ChangeEvaluation = {
  gained: string[];
  lost: string[];
  unchanged: string[];
};

export type ExclusionEvaluation = {
  spotName: string;
  reason: string;
};

export type PlanAdjustment = {
  budget?: number;
  squadSize?: number;
  startArea?: string;
  vibe?: string;
};

export type ConfidenceEvidence =
  | "price_verified"
  | "menu_recent"
  | "transport_predictable"
  | "tax_buffer_applied";

export interface DecisionConfidence {
  level: "Very High" | "High" | "Medium" | "Low";
  evidenceList: ConfidenceEvidence[];
}

export interface RecoverySuggestion {
  type: "IncreaseBudget" | "SwitchArea" | "ChangeVibe";
  deltaBudget?: number;
  suggestedArea?: string;
  suggestedVibe?: string;
  unlockedVenueCount: number;
}

export type Plan = {
  spot: Spot;
  foodCost: number;
  transportCost: number;
  transportMinCost?: number;
  transportMaxCost?: number;
  transportMode?: "ride-hailing" | "public-transit" | "driving";
  transportConfidenceScore?: number;
  transportConfidenceLabel?: string;
  transportConfidenceBadgeColor?: "green" | "yellow" | "orange";
  transportAssumptions?: string;
  totalCost: number;
  whyItFits: string;
  explanation?: PlanExplanation;
  id?: string;
  saved_at?: string;
  title?: string;
  subtitle?: string;
  decisionConfidence?: DecisionConfidence;
  decisionSummary?: string;
  isAdjacentZoneSuggestion?: boolean;
  travelInfo?: string;
  transportEstimate?: TransportEstimate;
};

export interface PlanEvaluation {
  plan: Plan;
  trustSignals: TrustSignal[];
  changes?: ChangeEvaluation;
  exclusions?: ExclusionEvaluation[];
}

export type SharedPlanRow = {
  id: string;
  spot?: Spot;
  total_cost: number;
  food_cost: number;
  transport_cost: number;
  squad_size: number;
  budget: number;
  vibe?: string;
  start_area?: string;
  explanation?: PlanExplanation;
  saved_at?: string;
  transport_estimate?: TransportEstimate;
  group_id?: string | null;
  group?: { id: string; name: string; emoji?: string } | Array<{ id: string; name: string; emoji?: string }> | null;
};

// Phase 2 Normalized Architecture Types
export interface Country {
  id: string;
  name: string;
  iso_code: string;
  currency_code: string;
  currency_symbol: string;
  created_at?: string;
}

export interface City {
  id: string;
  country_id: string;
  name: string;
  slug: string;
  created_at?: string;
}

export interface District {
  id: string;
  city_id: string;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  created_at?: string;
}

export type VenueCategory = 
  | 'restaurant' 
  | 'bar' 
  | 'activity' 
  | 'nature' 
  | 'entertainment' 
  | 'beach' 
  | 'cafe' 
  | 'experience'
  | 'rooftop'
  | 'arts_culture'
  | 'club'
  | 'cinema'
  | 'spa';

export type SpotCategory = VenueCategory;

export interface Venue {
  id: string;
  district_id: string;
  name: string;
  address: string;
  description?: string;
  vibe_tags: string[];
  category: VenueCategory;
  subcategory: string | null;
  typical_duration_hours: number;
  instagram_handle: string | null;
  is_featured: boolean;
  active: boolean;
  cover_url?: string;
  logo_url?: string;
  gallery_urls: string[];
  contact_number?: string;
  contact_email?: string;
  opening_hours?: Record<string, string>;
  
  // Tax & Fee details
  vat_pct: number;
  service_charge_pct: number;
  minimum_spend: number;
  corkage_fee?: number;
  entrance_fee?: number;
  reservation_fee?: number;
  weekend_pricing_notes?: string;

  // Partner Relationship State
  partner_state: PartnerState;
  claimed_by?: string | null;
  claimed_at?: string | null;

  // Operational Availability & Temporary Closure
  is_temporarily_closed?: boolean;
  temporary_closure_start?: string | null;
  temporary_closure_end?: string | null;
  temporary_closure_reason?: string | null;
  
  // Operational Status & Confidence
  operational_status: 'fresh' | 'stale' | 'needs_review' | 'verified' | 'community_verified';
  
  // Materialized Derived Statistics
  derived_typical_cost: number;
  derived_price_tier: number;
  computed_confidence_score: number;
  confidence_reasons: string[];
  
  last_price_updated_at?: string;
  last_price_source?: string;
  
  // Intelligence classifications
  audience_tags?: string[];
  activity_tags?: string[];
  indoor_outdoor?: 'indoor' | 'outdoor' | 'mixed';
  dress_code?: 'casual' | 'smart_casual' | 'formal' | 'nightlife';
  date_suitability?: boolean;
  group_suitability_min?: number | null;
  group_suitability_max?: number | null;
  has_parking?: boolean;

  created_at?: string;
  updated_at?: string;
}

export interface MenuItem {
  id: string;
  venue_id: string;
  name: string;
  category: 'starter' | 'main' | 'dessert' | 'cocktail' | 'wine' | 'beer' | 'spirits' | 'soft_drink' | 'activity_fee' | 'other';
  price: number;
  is_available: boolean;
  last_updated_at?: string;
  created_at?: string;
}

export interface PriceEvidence {
  id: string;
  menu_item_id: string | null;
  venue_id: string;
  source_type: 'receipt_upload' | 'owner_submission' | 'social_media' | 'official_website' | 'manual_verification' | 'web_scraping' | 'historical_estimate';
  submitted_by: string;
  recorded_price: number;
  evidence_url?: string | null;
  verification_status: 'pending' | 'approved' | 'rejected';
  confidence_weight: number;
  created_at: string;
}

export interface PriceAuditLog {
  id: string;
  menu_item_id: string;
  changed_by: string;
  action_type: 'create' | 'update' | 'delete';
  previous_price: number | null;
  new_price: number | null;
  evidence_id: string | null;
  reason: string | null;
  created_at: string;
}

export interface CityTransportRate {
  id: string;
  city_id: string;
  provider_name: string;
  mode_name: string;
  slug: string;
  base_fare: number;
  per_km_rate: number;
  per_minute_rate: number;
  created_at?: string;
}

export interface TransportRouteOverride {
  id: string;
  origin_district_id: string;
  destination_district_id: string;
  mode_slug: string;
  fixed_cost_low: number;
  fixed_cost_high: number;
  created_at?: string;
}

// Actual Spend Foundation (Phase 3A — backend model ready, UI wired later)
export interface ActualSpendReport {
  id: string;
  shared_plan_id: string | null;
  spot_id: string | null;
  estimated_total: number;
  actual_total: number;
  notes: string | null;
  submitted_at: string;
  created_at: string;
}

// Admin analytics type — variance summary for actual spend monitoring
export interface ActualSpendSummary {
  count: number;
  median_variance_pct: number; // (actual - estimated) / estimated * 100
  over_estimate_count: number; // actual > estimated
  under_estimate_count: number; // actual < estimated
}

export interface PendingEvidenceDbRow {
  id: string;
  source_type: string;
  recorded_price: number;
  evidence_url: string | null;
  created_at: string;
  submitted_by: string;
  venues: { name: string } | Array<{ name: string }> | null;
  menu_items: { name: string } | Array<{ name: string }> | null;
}

// ============================================================
// OyaPlan Venue Partner Domain Types (Supply-Side Relationship Layer)
// ============================================================

export type PartnerState = 
  | 'unclaimed'
  | 'claim_pending'
  | 'claimed'
  | 'onboarding'
  | 'verification_pending'
  | 'verified_partner'
  | 'strategic_partner';

export type ClaimantRole = 'owner' | 'manager' | 'marketing' | 'operations' | 'other';

export interface VenueClaim {
  id: string;
  venue_id: string;
  user_id: string;
  verification_method: 'business_document' | 'email_domain' | 'phone' | 'manual';
  document_url?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'needs_more_information';
  claimant_name?: string | null;
  claimant_role?: ClaimantRole | null;
  claimant_phone?: string | null;
  claimant_email?: string | null;
  relationship_notes?: string | null;
  admin_notes?: string | null;
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  claimed_at: string;
  approved_at?: string | null;
  venues?: {
    id: string;
    name: string;
    address: string;
    category?: string;
  };
}

export type ChangeRequestCategory = 
  | 'wrong_price'
  | 'wrong_hours'
  | 'wrong_location'
  | 'wrong_photo'
  | 'wrong_category'
  | 'wrong_description'
  | 'closed_temporarily'
  | 'permanently_closed'
  | 'other';

export interface VenueChangeRequest {
  id: string;
  venue_id: string;
  submitter_id?: string | null;
  submitter_name?: string | null;
  submitter_email?: string | null;
  submitter_phone?: string | null;
  category: ChangeRequestCategory;
  details: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  admin_notes?: string | null;
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_at: string;
  venues?: {
    name: string;
  };
}

export type PhotoType = 'cover' | 'interior' | 'food' | 'experience' | 'exterior';
export type PhotoStatus = 'uploaded' | 'under_review' | 'approved' | 'rejected';

export interface VenuePhoto {
  id: string;
  venue_id: string;
  url: string;
  photo_type: PhotoType;
  caption?: string | null;
  status: PhotoStatus;
  is_primary?: boolean;
  rejection_reason?: string | null;
  submitted_by?: string | null;
  approved_by?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ProfileHealthItem {
  id: string;
  label: string;
  completed: boolean;
  actionLabel?: string;
  actionHref?: string;
}

export interface ProfileHealth {
  percentage: number;
  label: 'Needs attention' | 'Getting there' | 'Good' | 'Excellent';
  completedItems: ProfileHealthItem[];
  missingItems: ProfileHealthItem[];
}

export interface VenueDemandActivity {
  plansFeaturingCount: number;
  plansSharedCount: number;
  reportedOutingsCount: number;
  hasEnoughData: boolean;
}

export interface VenuePlanningInsights {
  mostCommonOccasion?: string | null;
  mostCommonGroupSize?: string | null;
  typicalBudgetRange?: string | null;
  hasEnoughData: boolean;
  totalPlansAnalyzed: number;
}

