export interface MapArea {
  name: string;
  slug: string;
  path: string;
  textX: number;
  textY: number;
  neonColor: string;
  isActive: boolean;
}

export const AREAS: MapArea[] = [
  // --- INACTIVE / CONTEXT ZONES ---
  {
    name: "Alimosho",
    slug: "alimosho",
    path: "M 100,250 C 150,180 200,100 280,120 C 350,150 400,250 380,350 C 350,450 200,480 120,400 C 80,350 50,300 100,250 Z",
    textX: 230,
    textY: 280,
    neonColor: "#B0BEC5",
    isActive: false
  },
  {
    name: "Ojo",
    slug: "ojo",
    path: "M 50,420 C 120,380 200,430 250,480 C 280,550 200,600 100,620 C 50,600 20,500 50,420 Z",
    textX: 140,
    textY: 520,
    neonColor: "#B0BEC5",
    isActive: false
  },
  {
    name: "Ikorodu",
    slug: "ikorodu",
    path: "M 550,50 C 700,40 850,80 900,200 C 850,300 700,350 650,250 C 600,180 500,150 550,50 Z",
    textX: 720,
    textY: 180,
    neonColor: "#B0BEC5",
    isActive: false
  },
  {
    name: "Epe",
    slug: "epe",
    path: "M 950,400 C 1050,350 1150,400 1180,500 C 1150,600 1000,650 900,550 C 850,480 900,420 950,400 Z",
    textX: 1050,
    textY: 480,
    neonColor: "#B0BEC5",
    isActive: false
  },

  // --- ACTIVE ZONES ---
  {
    name: "Ikeja",
    slug: "ikeja",
    path: "M 380,150 C 450,120 520,130 550,200 C 580,280 480,320 420,300 C 380,280 350,220 380,150 Z",
    textX: 460,
    textY: 220,
    neonColor: "#FFCA28", // Vibrant Yellow/Orange
    isActive: true
  },
  {
    name: "Surulere",
    slug: "surulere",
    path: "M 350,320 C 420,290 480,340 450,420 C 400,460 320,440 300,380 C 280,340 320,310 350,320 Z",
    textX: 380,
    textY: 380,
    neonColor: "#FF8F00", // Mustard Orange
    isActive: true
  },
  {
    name: "Yaba",
    slug: "yaba",
    path: "M 460,300 C 520,270 580,310 560,380 C 520,420 460,400 440,360 C 420,320 440,290 460,300 Z",
    textX: 500,
    textY: 340,
    neonColor: "#E91E63", // Pink
    isActive: true
  },
  {
    name: "Lagos Island",
    slug: "lagos-island",
    path: "M 530,420 C 580,400 620,430 600,480 C 560,500 500,480 510,450 C 500,430 510,420 530,420 Z",
    textX: 560,
    textY: 450,
    neonColor: "#D81B60", // Deep Pink
    isActive: true
  },
  {
    name: "Ikoyi",
    slug: "ikoyi",
    path: "M 610,380 C 680,360 740,400 720,460 C 670,500 600,480 590,440 C 580,410 590,390 610,380 Z",
    textX: 650,
    textY: 420,
    neonColor: "#AB47BC", // Purple
    isActive: true
  },
  {
    name: "Victoria Island",
    slug: "vi",
    path: "M 550,510 C 620,480 680,520 660,580 C 610,620 520,600 530,550 C 520,530 530,520 550,510 Z",
    textX: 590,
    textY: 550,
    neonColor: "#29B6F6", // Light Blue
    isActive: true
  },
  {
    name: "Lekki",
    slug: "lekki-phase-1",
    path: "M 680,450 C 780,400 880,420 920,500 C 880,580 750,600 670,550 C 650,500 660,460 680,450 Z",
    textX: 790,
    textY: 500,
    neonColor: "#00BCD4", // Cyan
    isActive: true
  }
];
