import { lagosScene } from "../data/lagos.scene";

interface DistrictLayerProps {
  activeSlug: string | null;
  timeOfDay: "morning" | "afternoon" | "golden-hour" | "night";
  onDistrictClick: (slug: string, isActive: boolean) => void;
}

export default function DistrictLayer({ activeSlug, timeOfDay, onDistrictClick }: DistrictLayerProps) {
  const isNight = timeOfDay === "night";

  return (
    <g>
      <defs>
        <style>
          {`
            @keyframes trainMove {
              0% { transform: translate(-80px, 0); }
              100% { transform: translate(120px, 0); }
            }
            .yaba-train { animation: trainMove 12s linear infinite; }

            @keyframes palmSway {
              0% { transform: rotate(0deg); }
              50% { transform: rotate(4deg); }
              100% { transform: rotate(0deg); }
            }
            .lekki-palm { 
              animation: palmSway 5s ease-in-out infinite; 
              transform-origin: bottom center;
            }

            @keyframes viWindowGlow {
              0%, 100% { opacity: 0.3; fill: #555; }
              50% { opacity: 1; fill: #FFF59D; }
            }
            .vi-window { animation: viWindowGlow 4s ease-in-out infinite; }

            @keyframes canopyRipple {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.03); }
            }
            .ikoyi-canopy { 
              animation: canopyRipple 6s ease-in-out infinite; 
              transform-origin: center center;
            }

            @keyframes planeGlide {
              0% { transform: translate(-100px, -50px) scale(0.8); opacity: 0; }
              10% { opacity: 0.8; }
              90% { opacity: 0.8; }
              100% { transform: translate(150px, -20px) scale(0.8); opacity: 0; }
            }
            .ikeja-plane { animation: planeGlide 20s linear infinite; }

            @keyframes stadiumPulse {
              0%, 100% { opacity: 0.2; filter: drop-shadow(0 0 0px #FF8F00); }
              50% { opacity: 1; filter: drop-shadow(0 0 8px #FFCA28); }
            }
            .surulere-pulse { animation: stadiumPulse 3s ease-in-out infinite; }
          `}
        </style>
      </defs>

      {lagosScene.districts.map((district) => {
        const isActive = activeSlug === district.slug;
        const isDimmed = activeSlug !== null && !isActive;

        return (
          <g
            key={district.slug}
            transform={`translate(${district.x}, ${district.y})`}
            onClick={() => onDistrictClick(district.slug, true)}
            className={`cursor-pointer select-none transition-all duration-700 ${
              isDimmed ? "opacity-30 scale-95" : "opacity-100 scale-100 hover:scale-105"
            }`}
          >
            {/* Visual Silhouettes and landmarks (Lagos World Bible compliant) */}

            {/* YABA: The Builders */}
            {district.slug === "yaba" && (
              <g>
                {/* Tejuosho Market roof & workspace buildings */}
                <path d="M -45 -30 L 0 -60 L 45 -30 Z" fill={isNight ? "#283593" : district.palette.primary} />
                <rect x="-35" y="-30" width="70" height="30" fill={isNight ? "#1A237E" : district.palette.secondary} />
                <line x1="-50" y1="0" x2="50" y2="0" stroke="#78909C" strokeWidth="3" />
                {/* Micro animation: Train glide */}
                <g className="yaba-train">
                  <rect x="-25" y="-5" width="20" height="5" fill="#E53935" rx="1" />
                  <rect x="-4" y="-5" width="8" height="5" fill="#E53935" rx="1" />
                </g>
              </g>
            )}

            {/* LEKKI: Weekend Lagos */}
            {district.slug === "lekki-phase-1" && (
              <g>
                {/* Toll gate canopy & palm tree */}
                <rect x="-40" y="-35" width="80" height="8" rx="2" fill="#CFD8DC" />
                <line x1="-30" y1="-27" x2="-30" y2="0" stroke="#90A4AE" strokeWidth="3" />
                <line x1="30" y1="-27" x2="30" y2="0" stroke="#90A4AE" strokeWidth="3" />
                {/* Palm tree sways */}
                <g transform="translate(0, -5)" className="lekki-palm">
                  <path d="M 0 0 Q -5 -25 -15 -40" fill="none" stroke="#8D6E63" strokeWidth="3" />
                  <circle cx="-15" cy="-40" r="10" fill={district.palette.primary} />
                  <circle cx="-8" cy="-35" r="8" fill={district.palette.primary} />
                </g>
              </g>
            )}

            {/* VICTORIA ISLAND: Ambition */}
            {district.slug === "vi" && (
              <g>
                {/* Civic Centre complex / towers */}
                <rect x="-40" y="-80" width="30" height="80" fill={isNight ? "#1565C0" : district.palette.primary} />
                <rect x="0" y="-110" width="40" height="110" fill={isNight ? "#0D47A1" : district.palette.secondary} />
                {/* Windows that glow at night */}
                <rect x="-30" y="-70" width="8" height="12" className="vi-window" fill="#555" />
                <rect x="10" y="-100" width="8" height="12" className="vi-window" fill="#555" style={{ animationDelay: "1s" }} />
                <rect x="22" y="-100" width="8" height="12" className="vi-window" fill="#555" style={{ animationDelay: "2s" }} />
              </g>
            )}

            {/* IKOYI: Quiet Luxury */}
            {district.slug === "ikoyi" && (
              <g>
                {/* Residential towers and dense foliage */}
                <rect x="-15" y="-90" width="30" height="90" fill={isNight ? "#37474F" : "#ECEFF1"} />
                <g className="ikoyi-canopy">
                  <circle cx="-35" cy="-40" r="30" fill={district.palette.primary} />
                  <circle cx="35" cy="-35" r="28" fill={district.palette.secondary} />
                </g>
              </g>
            )}

            {/* IKEJA: The Capital */}
            {district.slug === "ikeja" && (
              <g>
                {/* Airport hangar, towers */}
                <rect x="-40" y="-40" width="85" height="40" fill={district.palette.secondary} rx="4" />
                <line x1="0" y1="-40" x2="0" y2="0" stroke="#757575" strokeWidth="2" />
                {/* Plane flies overhead */}
                <g className="ikeja-plane">
                  <path d="M 0 -80 L 15 -75 L 0 -70 L -5 -75 Z" fill="#000" />
                </g>
              </g>
            )}

            {/* SURULERE: Culture */}
            {district.slug === "surulere" && (
              <g>
                {/* National Stadium dome arch */}
                <path d="M -45 0 A 45 45 0 0 1 45 0" fill="none" stroke={district.palette.primary} strokeWidth="6" />
                <ellipse cx="0" cy="0" rx="40" ry="10" fill={district.palette.secondary} />
                {/* Pulsing Stadium Light */}
                <circle cx="0" cy="-25" r="6" className="surulere-pulse" fill="#FFD54F" />
              </g>
            )}

            {/* Labels overlay */}
            <g transform="translate(0, 25)">
              <text
                textAnchor="middle"
                className="font-serif italic text-xl"
                fill={isNight ? "#E8EAF6" : "#212121"}
              >
                {district.name}
              </text>
              <text
                y="15"
                textAnchor="middle"
                className="font-mono uppercase text-[9px] tracking-widest"
                fill={isNight ? "#9FA8DA" : "#757575"}
              >
                {district.subTitle}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
}
