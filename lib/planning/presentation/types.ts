export interface TrustIndicator {
  level: "high" | "medium" | "low";
  label: string;
  description: string;
}

export interface DecisionCardViewModel {
  title: string;
  heroImage?: string;
  venueCost: number;
  transportCost: number;
  transportMinCost?: number;
  transportMaxCost?: number;
  transportMode?: string;
  transportConfidenceScore?: number;
  transportConfidenceLabel?: string;
  transportConfidenceBadgeColor?: "green" | "yellow" | "orange";
  transportAssumptions?: string;
  totalCost: number;
  budgetFit: string;
  verification: string;
  confidence: number;
  whyItFits: string;
  planningSummary: string;
  
  // Expose fields needed for card CTAs/badges:
  spotId: string;
  spotName: string;
  category: string;
  address: string;
  pricePerPerson: number;
  addressSlug?: string;
  areaSlug?: string;
  travelInfo?: string;
  isAdjacent?: boolean;

  // Sprint 3A fields:
  budgetRemaining: number;
  trustIndicator: TrustIndicator;
}
