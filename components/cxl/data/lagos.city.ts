export interface EditorialStory {
  title: string;
  dek: string;
  identity: string[];
  planningMoment: string;
  signatureExperience: string;
}

export interface ConnectionConfig {
  to: string;
  bridge?: string;
  travelTime: number; // minutes
  mode: "car" | "rail" | "ferry";
}

export interface SoundscapeConfig {
  traffic: number;
  birds: number;
  water: number;
  train: number;
  market: number;
  nightlife: number;
}

export interface CityDistrictConfig {
  slug: string;
  name: string;
  x: number;
  y: number;
  heroAsset: string;
  foregroundAssets: string[];
  midgroundAssets: string[];
  backgroundAssets: string[];
  connections: ConnectionConfig[];
  editorial: EditorialStory;
  soundscape: SoundscapeConfig;
  minSpend: number;
  maxSpend: number;
}

export interface CityDataDescription {
  id: string;
  name: string;
  districts: CityDistrictConfig[];
}

export const lagosCityData: CityDataDescription = {
  id: "lagos",
  name: "Lagos",
  districts: [
    {
      slug: "yaba",
      name: "Yaba",
      x: 1000,
      y: 600,
      heroAsset: "market",
      foregroundAssets: ["keke", "laptop"],
      midgroundAssets: ["railway", "cafes"],
      backgroundAssets: ["skyline-midrise"],
      connections: [
        { to: "lekki-phase-1", bridge: "third-mainland", travelTime: 45, mode: "car" },
        { to: "vi", travelTime: 35, mode: "car" },
        { to: "ikeja", travelTime: 20, mode: "rail" }
      ],
      editorial: {
        title: "Yaba",
        dek: "Where Lagos builds tomorrow.",
        identity: ["Creative", "Young", "Restless"],
        planningMoment: "Perfect for affordable evenings with friends.",
        signatureExperience: "Late-night tech cafes and shared student workspaces."
      },
      soundscape: {
        traffic: 0.4,
        birds: 0.1,
        water: 0.0,
        train: 0.7,
        market: 0.6,
        nightlife: 0.2
      },
      minSpend: 12000,
      maxSpend: 25000
    },
    {
      slug: "lekki-phase-1",
      name: "Lekki",
      x: 1700,
      y: 1000,
      heroAsset: "bridge",
      foregroundAssets: ["cocktails", "beach-umbrellas"],
      midgroundAssets: ["waterfront", "apartments"],
      backgroundAssets: ["palms"],
      connections: [
        { to: "yaba", bridge: "third-mainland", travelTime: 45, mode: "car" },
        { to: "ikoyi", travelTime: 15, mode: "car" }
      ],
      editorial: {
        title: "Lekki",
        dek: "The capital of coastal weekends.",
        identity: ["Modern", "Social", "Waterfront"],
        planningMoment: "Best for scenic weekend brunches and seaside activities.",
        signatureExperience: "Sunset lounge bars and beachside cabanas."
      },
      soundscape: {
        traffic: 0.3,
        birds: 0.4,
        water: 0.8,
        train: 0.0,
        market: 0.2,
        nightlife: 0.6
      },
      minSpend: 35000,
      maxSpend: 75000
    },
    {
      slug: "vi",
      name: "Victoria Island",
      x: 1200,
      y: 1100,
      heroAsset: "tower",
      foregroundAssets: ["suvs", "streetlights"],
      midgroundAssets: ["corporate-blocks", "rooftop-bars"],
      backgroundAssets: ["glass-skyline"],
      connections: [
        { to: "yaba", travelTime: 35, mode: "car" },
        { to: "ikoyi", travelTime: 10, mode: "car" }
      ],
      editorial: {
        title: "Victoria Island",
        dek: "Where business meets nightlife.",
        identity: ["Ambitious", "Polished", "Energetic"],
        planningMoment: "Suited for corporate dinners and high-energy nights out.",
        signatureExperience: "Rooftop lounge cocktails and premium street dining."
      },
      soundscape: {
        traffic: 0.6,
        birds: 0.1,
        water: 0.3,
        train: 0.0,
        market: 0.1,
        nightlife: 0.8
      },
      minSpend: 30000,
      maxSpend: 80000
    },
    {
      slug: "ikoyi",
      name: "Ikoyi",
      x: 1400,
      y: 800,
      heroAsset: "canopy",
      foregroundAssets: ["joggers", "tennis-courts"],
      midgroundAssets: ["golf-club", "luxury-apartments"],
      backgroundAssets: ["dense-trees"],
      connections: [
        { to: "lekki-phase-1", travelTime: 15, mode: "car" },
        { to: "vi", travelTime: 10, mode: "car" }
      ],
      editorial: {
        title: "Ikoyi",
        dek: "Quiet luxury and tree-lined security.",
        identity: ["Calm", "Exclusive", "Refined"],
        planningMoment: "Perfect for quiet, private dinners and morning strolls.",
        signatureExperience: "Exclusive country clubs and lush courtyard dining."
      },
      soundscape: {
        traffic: 0.2,
        birds: 0.8,
        water: 0.1,
        train: 0.0,
        market: 0.0,
        nightlife: 0.1
      },
      minSpend: 40000,
      maxSpend: 90000
    },
    {
      slug: "ikeja",
      name: "Ikeja",
      x: 900,
      y: 300,
      heroAsset: "airport-tower",
      foregroundAssets: ["suitcases", "BRT"],
      midgroundAssets: ["computer-village", "offices"],
      backgroundAssets: ["capital-skyline"],
      connections: [
        { to: "yaba", travelTime: 20, mode: "rail" },
        { to: "surulere", travelTime: 25, mode: "car" }
      ],
      editorial: {
        title: "Ikeja",
        dek: "The commercial heartbeat of the mainland.",
        identity: ["Bustling", "Commercial", "Tech-centric"],
        planningMoment: "Ideal for mid-week shopping sprees and tech hunting.",
        signatureExperience: "Exploring open-air tech markets and retail hubs."
      },
      soundscape: {
        traffic: 0.7,
        birds: 0.2,
        water: 0.0,
        train: 0.1,
        market: 0.5,
        nightlife: 0.3
      },
      minSpend: 15000,
      maxSpend: 30000
    },
    {
      slug: "surulere",
      name: "Surulere",
      x: 800,
      y: 700,
      heroAsset: "stadium",
      foregroundAssets: ["vinyls", "street-food"],
      midgroundAssets: ["stadium-arch", "balconies"],
      backgroundAssets: ["terrace-skyline"],
      connections: [
        { to: "ikeja", travelTime: 25, mode: "car" }
      ],
      editorial: {
        title: "Surulere",
        dek: "Lagos heritage, music, and local football.",
        identity: ["Cultural", "Historical", "Vibrant"],
        planningMoment: "Best for street food crawls and local football nights.",
        signatureExperience: "Catching live music sets and stadium outings."
      },
      soundscape: {
        traffic: 0.5,
        birds: 0.3,
        water: 0.0,
        train: 0.0,
        market: 0.4,
        nightlife: 0.5
      },
      minSpend: 10000,
      maxSpend: 30000
    }
  ]
};
