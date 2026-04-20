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
  vibe_tags: string[];
  price_per_person: number;
  price_updated_at: string;
  price_source: string;
  transport_matrix: Record<string, number>;
  is_featured: boolean;
  active: boolean;
};

export type ForgeInput = {
  startArea: string;
  squadSize: number;
  budget: number;
  vibe: string;
};

export type Plan = {
  spot: Spot;
  foodCost: number;
  transportCost: number;
  totalCost: number;
  whyItFits: string;
};
