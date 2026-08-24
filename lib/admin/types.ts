export type AdminRole = 'owner' | 'admin';

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
}

export interface DashboardMetrics {
  totalVenues: number;
  publishedVenues: number;
  draftVenues: number;
  betaUsersCount: number;
  pendingBetaApprovalsCount: number;
  venuesMissingImagesCount: number;
  venuesMissingPricesCount: number;
  pendingSubmissionsCount: number;
}

export interface AdminVenue {
  id: string;
  name: string;
  slug: string;
  area_id?: string;
  area_name?: string;
  category: string;
  address?: string;
  description?: string;
  image_url?: string; // maps to cover_url
  cover_url?: string;
  logo_url?: string;
  price_level?: string;
  price_per_person?: number;
  price_tier?: number;
  active?: boolean;
  status: 'published' | 'draft';
  opening_hours?: Record<string, string>;
  vibe_tags?: string[];
  updated_at?: string;
}

export interface MediaItem {
  id: string;
  url: string;
  venue_id?: string;
  venue_name?: string;
  filename: string;
  created_at: string;
  is_hero?: boolean;
}

export interface ApprovedBetaUser {
  email: string;
  approved_at: string;
  approved_by: string;
  invited_at?: string | null;
  accepted_at?: string | null;
  notes?: string | null;
  status: 'Pending' | 'Accepted' | 'Not Registered';
}

export interface SpotSubmission {
  id: string;
  spot_name: string;
  area: string;
  category?: string;
  estimated_price?: string;
  notes?: string;
  submitted_by?: string;
  status: 'pending' | 'open' | 'approved' | 'rejected';
  created_at: string;
}

export interface SponsoredCampaign {
  id: string;
  venue_id: string;
  venue_name?: string;
  tier: 'basic' | 'featured' | 'premium';
  placement: 'homepage' | 'explore' | 'search' | 'category';
  start_date: string;
  end_date: string;
  status: 'active' | 'scheduled' | 'ended' | 'paused';
  created_at: string;
}

export type IssueScope = 'system' | 'venue';
export type QualityCategory = 'trust_risk' | 'experience_quality';

export interface DataQualityIssue {
  id: string;
  issue_type: 'UNVERIFIED_PRICE_SOURCE' | 'LOW_CONFIDENCE' | 'MISSING_HERO' | 'STALE_PRICING';
  category: QualityCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  scope: IssueScope;
  venue_id?: string;
  venue_name?: string;
  area_name?: string;
  price_source?: string;
  verified_by?: string;
  reason: string;
  detected_at: string;
}

export type QualityCheckItem = DataQualityIssue;

export interface TrustHealthMetrics {
  totalSpots: number;
  priceCoveragePct: number;
  priceProvenancePct: number;
  verifiedPct: number;
  transportCoveragePct: number;
}

export interface AdminActivityItem {
  id: string;
  actor_email: string;
  action: string;
  target_type: string;
  target_id?: string | null;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface AdminSettings {
  betaMode: boolean;
  maintenanceMode: boolean;
  inviteOnlyMode: boolean;
  publicLaunch: boolean;
}

export interface AccountUsageRow {
  user_id: string;
  email: string;
  display_name: string;
  profile_badge: string | null;
  created_at: string;
  plan_count: number;
  saved_plan_count?: number;
  last_plan_at: string | null;
}
