export interface DistrictVisualConfig {
  slug: string;
  name: string;
  subTitle: string;
  x: number;
  y: number;
  scale: number;
  color: string;
  heroLandmark: string;
  supportingObjects: string[];
  signatureAnimation: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
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
  districts: DistrictVisualConfig[];
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
      subTitle: "The Builders",
      x: 1000,
      y: 600,
      scale: 2.2,
      color: "#E57373",
      heroLandmark: "Tejuosho Market roof & railway",
      supportingObjects: ["Open laptops", "Yellow Kekes", "Shared workspaces"],
      signatureAnimation: "Train glides across the railway",
      palette: {
        primary: "#E57373",
        secondary: "#FFCDD2",
        accent: "#3949AB"
      }
    },
    {
      slug: "lekki-phase-1",
      name: "Lekki",
      subTitle: "Weekend Lagos",
      x: 1700,
      y: 1000,
      scale: 2.0,
      color: "#00897B",
      heroLandmark: "Lekki-Ikoyi Link Bridge",
      supportingObjects: ["Palm trees", "Beach umbrellas", "Cocktails"],
      signatureAnimation: "Palm trees sway with sea breeze",
      palette: {
        primary: "#00897B",
        secondary: "#E0F2F1",
        accent: "#FF8F00"
      }
    },
    {
      slug: "vi",
      name: "Victoria Island",
      subTitle: "Ambition",
      x: 1200,
      y: 1100,
      scale: 2.4,
      color: "#0288D1",
      heroLandmark: "Civic Centre",
      supportingObjects: ["Skyline silhouette", "Rooftop bars", "Glass towers"],
      signatureAnimation: "Building lights gradually illuminate at dusk",
      palette: {
        primary: "#0288D1",
        secondary: "#B3E5FC",
        accent: "#FFD54F"
      }
    },
    {
      slug: "ikoyi",
      name: "Ikoyi",
      subTitle: "Quiet Luxury",
      x: 1400,
      y: 800,
      scale: 2.2,
      color: "#2E7D32",
      heroLandmark: "Ikoyi Golf Club & residential towers",
      supportingObjects: ["Giant tree canopies", "Joggers", "Garden walls"],
      signatureAnimation: "Tree canopy gently ripples",
      palette: {
        primary: "#2E7D32",
        secondary: "#C8E6C9",
        accent: "#8D6E63"
      }
    },
    {
      slug: "ikeja",
      name: "Ikeja",
      subTitle: "The Capital",
      x: 900,
      y: 300,
      scale: 2.0,
      color: "#FFB300",
      heroLandmark: "Computer Village & MM2 control tower",
      supportingObjects: ["Suitcases", "BRT buses", "Office workers"],
      signatureAnimation: "Plane slowly crosses the sky",
      palette: {
        primary: "#FFB300",
        secondary: "#FFE082",
        accent: "#E53935"
      }
    },
    {
      slug: "surulere",
      name: "Surulere",
      subTitle: "Culture",
      x: 800,
      y: 700,
      scale: 2.2,
      color: "#F44336",
      heroLandmark: "National Stadium",
      supportingObjects: ["Vinyl records", "Street food stands", "Balconies"],
      signatureAnimation: "Stadium lights pulse on event nights",
      palette: {
        primary: "#F44336",
        secondary: "#FFCDD2",
        accent: "#FF8F00"
      }
    }
  ]
};
