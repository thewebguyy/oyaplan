import { Spot } from "../../types";

export interface DecisionCardViewModel {
  title: string;
  heroImage?: string;
  venueCost: number;
  transportCost: number;
  totalCost: number;
  budgetFit: string;
  verification: string;
  confidence: number;
  whyItFits: string;
  planningSummary: string;
  
  // Expose fields needed for card CTAs/badges:
  spot: Spot;
  spotId: string;
  spotName: string;
  category: string;
  address: string;
  pricePerPerson: number;
  addressSlug?: string;
  areaSlug?: string;
  travelInfo?: string;
  isAdjacent?: boolean;
}
