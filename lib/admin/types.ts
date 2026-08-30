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

export type BetaLifecycleStatus = 'Active' | 'Accepted' | 'Registered' | 'Invited' | 'Pending' | 'Not Registered' | 'Revoked';

export interface ApprovedBetaUser {
  email: string;
  approved_at: string;
  approved_by: string;
  invited_at?: string | null;
  accepted_at?: string | null;
  registered_at?: string | null;
  notes?: string | null;
  status: BetaLifecycleStatus;
  has_badge: boolean;
  user_id?: string | null;
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
export type QualityCategory = 'trust_risk' | 'transport_risk' | 'spend_discrepancy' | 'experience_quality';
export type QualityIssueType = 
  | 'NO_PRICE_EVIDENCE' 
  | 'UNVERIFIED_PRICE_SOURCE' 
  | 'LOW_CONFIDENCE' 
  | 'TRANSPORT_GAP' 
  | 'ACTUAL_SPEND_MISMATCH' 
  | 'MISSING_HERO' 
  | 'STALE_PRICING' 
  | 'OUT_OF_BOUNDS_AREA';

export interface DataQualityIssue {
  id: string;
  issue_type: QualityIssueType;
  category: QualityCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  scope: IssueScope;
  venue_id?: string;
  venue_name?: string;
  venue_slug?: string;
  area_name?: string;
  price_per_person?: number;
  price_source?: string;
  verified_by?: string;
  evidence_count?: number;
  impact_score?: number;        // Customer exposure × trust risk
  customer_exposure?: number;   // Planning request / view count hook
  reason: string;
  impact_description: string;   // Explains the exact customer trust impact
  action_label: string;         // 'Add Evidence' | 'Set Image' | 'Fix Transport' | 'Investigate'
  detected_at: string;
  metadata?: Record<string, unknown>;
}

export type QualityCheckItem = DataQualityIssue;

export interface TrustHealthMetrics {
  totalSpots: number;
  priceCoveragePct: number;
  priceProvenancePct: number;
  evidenceCoveragePct: number;
  verifiedPct: number;
  transportCoveragePct: number;
  criticalIssuesCount: number;
  highIssuesCount: number;
  mediumIssuesCount: number;
  lowIssuesCount: number;
  scannedAt: string;
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
