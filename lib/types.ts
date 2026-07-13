

export type Area = {
  id: string;
  name: string;
  slug: string;
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
  computed_confidence_score?: number;
  confidence_reasons?: string[];
};
     
export type ForgeInput = {
  startArea: string;
  squadSize: number;
  budget: number;
  vibe: string;
  pinnedSpotId?: string;
  categoryGroup?: string;
  daypart?: 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Any time';
};

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

export type Plan = {
  spot: Spot;
  foodCost: number;
  transportCost: number;
  totalCost: number;
  whyItFits: string;
  explanation?: PlanExplanation;
  id?: string;
  saved_at?: string;
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

export interface Venue {
  id: string;
  district_id: string;
  name: string;
  address: string;
  vibe_tags: string[];
  category: 'restaurant' | 'bar' | 'activity' | 'nature' | 'entertainment' | 'beach' | 'cafe' | 'experience';
  subcategory: string | null;
  typical_duration_hours: number;
  instagram_handle: string | null;
  is_featured: boolean;
  active: boolean;
  
  // Tax details
  vat_pct: number;
  service_charge_pct: number;
  minimum_spend: number;
  
  // Operational Status
  operational_status: 'fresh' | 'stale' | 'needs_review' | 'verified' | 'community_verified';
  
  // Materialized Derived Statistics
  derived_typical_cost: number;
  derived_price_tier: number;
  computed_confidence_score: number;
  confidence_reasons: string[];
  
  created_at?: string;
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
