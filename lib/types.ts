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

export type Plan = {
  spot: Spot;
  foodCost: number;
  transportCost: number;
  totalCost: number;
  whyItFits: string;
};
