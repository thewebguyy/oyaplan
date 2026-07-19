export interface SoundscapeConfig {
  traffic: number;
  birds: number;
  water: number;
  train: number;
  market: number;
  nightlife: number;
}

export interface DistrictSceneConfig {
  slug: string;
  name: string;
  x: number;
  y: number;
  scale: number;
  identity: string;
  skyline: string[];
  landmark: string;
  streets: string[];
  vegetation: string;
  movement: string;
  atmosphere: string[];
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  soundscape: SoundscapeConfig;
  minSpend: number;
  maxSpend: number;
}

export interface SceneDescription {
  id: string;
  name: string;
  skyGradients: {
    morning: string;
    afternoon: string;
    "golden-hour": string;
    night: string;
  };
  waterColors: {
    morning: string;
    afternoon: string;
    "golden-hour": string;
    night: string;
  };
  districts: DistrictSceneConfig[];
}

export const lagosScene: SceneDescription = {
  id: "lagos",
  name: "Lagos",
  skyGradients: {
    morning: "linear-gradient(to bottom, #E3F2FD, #FFFFFF)",
    afternoon: "linear-gradient(to bottom, #E8F5E9, #FFFDE7)",
    "golden-hour": "linear-gradient(to bottom, #FFF3E0, #FFE0B2)",
    night: "linear-gradient(to bottom, #1A237E, #0D47A1)"
  },
  waterColors: {
    morning: "#B3E5FC",
    afternoon: "#C8E6C9",
    "golden-hour": "#FFE0B2",
    night: "#0288D1"
  },
  districts: [
    {
      slug: "yaba",
      name: "Yaba",
      x: 1000,
      y: 600,
      scale: 2.2,
      identity: "Builders. Students. Creative energy.",
      skyline: ["Mid-rise buildings", "Mixed commercial blocks", "Rooftop water tanks"],
      landmark: "Tejuosho roof, railway, YABATECH silhouette",
      streets: ["Yellow Kekes", "Danfo", "Laptops", "Books", "Cafés", "Street signs"],
      vegetation: "Sparse roadside trees",
      movement: "Train, walking students, Keke traffic",
      atmosphere: ["Busy", "Optimistic", "Fast"],
      palette: {
        primary: "#E57373",
        secondary: "#FFCDD2",
        accent: "#3949AB"
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
      scale: 2.0,
      identity: "Weekend Lagos.",
      skyline: ["White modern villas", "Apartments"],
      landmark: "Lekki Link Bridge, Toll Gate",
      streets: ["Palm trees", "Cocktail tables", "Outdoor dining", "Surfboards", "Beach umbrellas"],
      vegetation: "Tall palms",
      movement: "Ocean breeze, cars, cyclists",
      atmosphere: ["Relaxed", "Premium", "Young"],
      palette: {
        primary: "#00897B",
        secondary: "#E0F2F1",
        accent: "#FF8F00"
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
      scale: 2.4,
      identity: "Business meets nightlife.",
      skyline: ["Glass towers", "Corporate blocks"],
      landmark: "Civic Centre, Eko Hotel silhouette",
      streets: ["Luxury cars", "Street lights", "Outdoor restaurants", "Rooftop bars"],
      vegetation: "Minimal",
      movement: "Traffic, lights",
      atmosphere: ["Busy", "Sophisticated"],
      palette: {
        primary: "#0288D1",
        secondary: "#B3E5FC",
        accent: "#FFD54F"
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
      scale: 2.2,
      identity: "Quiet confidence.",
      skyline: ["Luxury residential towers", "Embassies"],
      landmark: "Golf Club, high-rise apartments",
      streets: ["Joggers", "Tennis courts", "Luxury SUVs"],
      vegetation: "Huge trees",
      movement: "Leaves moving, joggers",
      atmosphere: ["Calm", "Exclusive"],
      palette: {
        primary: "#2E7D32",
        secondary: "#C8E6C9",
        accent: "#8D6E63"
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
      scale: 2.0,
      identity: "Business. Technology. Travel.",
      skyline: ["Commercial centers", "Low-rise offices"],
      landmark: "MM2, Computer Village",
      streets: ["Electronics", "BRT", "Suitcases"],
      vegetation: "Moderate tree-lined paths",
      movement: "Aircraft",
      atmosphere: ["Bustling", "Commercial"],
      palette: {
        primary: "#FFB300",
        secondary: "#FFE082",
        accent: "#E53935"
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
      scale: 2.2,
      identity: "Culture. Sports. Entertainment.",
      skyline: ["Traditional mid-rise terraces"],
      landmark: "National Stadium",
      streets: ["Music", "Street food", "Football"],
      vegetation: "Local roadside shrubs",
      movement: "Crowds",
      atmosphere: ["Vibrant", "Community"],
      palette: {
        primary: "#F44336",
        secondary: "#FFCDD2",
        accent: "#FF8F00"
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
