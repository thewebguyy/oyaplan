export interface CameraProfile {
  focusX: number;
  focusY: number;
  zoom: number;
  rotation: number;
  parallaxStrength: number;
}

export interface DistrictThemeConfig {
  slug: string;
  camera: CameraProfile;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  motionRate: "slow" | "gentle" | "floating" | "energetic";
}

export interface CityThemeDescription {
  id: string;
  districtThemes: DistrictThemeConfig[];
}

export const lagosThemeData: CityThemeDescription = {
  id: "lagos",
  districtThemes: [
    {
      slug: "yaba",
      camera: { focusX: 1000, focusY: 600, zoom: 2.2, rotation: 0, parallaxStrength: 1.0 },
      colorPalette: { primary: "brick", secondary: "mutedCream", accent: "techGreen" },
      motionRate: "gentle"
    },
    {
      slug: "lekki-phase-1",
      camera: { focusX: 1700, focusY: 1000, zoom: 2.0, rotation: 0, parallaxStrength: 0.8 },
      colorPalette: { primary: "oceanBlue", secondary: "sand", accent: "white" },
      motionRate: "floating"
    },
    {
      slug: "vi",
      camera: { focusX: 1200, focusY: 1100, zoom: 2.4, rotation: 0, parallaxStrength: 0.7 },
      colorPalette: { primary: "glassBlue", secondary: "navy", accent: "gold" },
      motionRate: "energetic"
    },
    {
      slug: "ikoyi",
      camera: { focusX: 1400, focusY: 800, zoom: 2.2, rotation: 0, parallaxStrength: 0.6 },
      colorPalette: { primary: "forestGreen", secondary: "concrete", accent: "mutedCream" },
      motionRate: "slow"
    },
    {
      slug: "ikeja",
      camera: { focusX: 900, focusY: 300, zoom: 2.0, rotation: 0, parallaxStrength: 0.9 },
      colorPalette: { primary: "gold", secondary: "concrete", accent: "deepRed" },
      motionRate: "energetic"
    },
    {
      slug: "surulere",
      camera: { focusX: 800, focusY: 700, zoom: 2.2, rotation: 0, parallaxStrength: 0.8 },
      colorPalette: { primary: "deepRed", secondary: "gold", accent: "mutedCream" },
      motionRate: "gentle"
    }
  ]
};
