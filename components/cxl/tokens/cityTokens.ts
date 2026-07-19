export const cityTokens = {
  colors: {
    // Environmental Sky Gradients
    sky: {
      morning: "linear-gradient(to bottom, #E3F2FD, #FFFFFF)",
      afternoon: "linear-gradient(to bottom, #E8F5E9, #FFFDE7)",
      "golden-hour": "linear-gradient(to bottom, #FFF3E0, #FFE0B2)",
      night: "linear-gradient(to bottom, #1A237E, #0D47A1)"
    },
    // Environmental Water Colors
    water: {
      morning: "#B3E5FC",
      afternoon: "#C8E6C9",
      "golden-hour": "#FFE0B2",
      night: "#0288D1"
    },
    // Stylized Architectural Materials
    brick: "#E57373",
    concrete: "#CFD8DC",
    techGreen: "#388E3C",
    mutedCream: "#FAFAFA",
    oceanBlue: "#00897B",
    glassBlue: "#0288D1",
    navy: "#1A237E",
    gold: "#FFB300",
    forestGreen: "#2E7D32",
    sand: "#FFE082",
    deepRed: "#F44336"
  },
  
  // Motion Presets (Translating visual speeds into duration milliseconds)
  motion: {
    gentle: "6000ms",
    slow: "12000ms",
    floating: "8000ms",
    busy: "20000ms",
    energetic: "15000ms"
  },

  // Easing presets
  easing: {
    camera: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    ambient: "ease-in-out"
  }
};
