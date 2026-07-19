import { lagosCityData } from "../data/lagos.city";
import { lagosThemeData } from "../data/lagos.theme";
import { cityTokens } from "../tokens/cityTokens";

import Market from "../assets/Market";
import Palm from "../assets/Palm";
import Train from "../assets/Train";
import Tower from "../assets/Tower";

interface DistrictLayerProps {
  activeSlug: string | null;
  timeOfDay: "morning" | "afternoon" | "golden-hour" | "night";
  budget: number | null;
  onDistrictClick: (slug: string, isActive: boolean) => void;
}

export default function DistrictLayer({ activeSlug, timeOfDay, budget, onDistrictClick }: DistrictLayerProps) {
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

            @keyframes budgetHalo {
              0%, 100% { stroke-opacity: 0.2; r: 85; }
              50% { stroke-opacity: 0.8; r: 92; }
            }
            .budget-halo {
              animation: budgetHalo 3s ease-in-out infinite;
              fill: none;
              stroke: #4CAF50;
              stroke-width: 1.5;
            }
          `}
        </style>
      </defs>

      {lagosCityData.districts.map((district) => {
        const isActive = activeSlug === district.slug;
        const isCompatible = budget !== null && budget >= district.minSpend;
        const isDimmed = activeSlug !== null && !isActive;

        // Resolve theme configurations from lagos.theme.ts
        const theme = lagosThemeData.districtThemes.find((t) => t.slug === district.slug);
        const palette = theme?.colorPalette || { primary: "concrete", secondary: "mutedCream", accent: "concrete" };

        const resolveColor = (tokenName: string) => {
          return (cityTokens.colors as any)[tokenName] || "#CFD8DC";
        };

        const primaryColor = resolveColor(palette.primary);
        const secondaryColor = resolveColor(palette.secondary);

        return (
          <g
            key={district.slug}
            transform={`translate(${district.x}, ${district.y})`}
            onClick={() => onDistrictClick(district.slug, true)}
            className={`cursor-pointer select-none transition-all duration-700 ${
              isDimmed ? "opacity-30 scale-95" : "opacity-100 scale-100 hover:scale-105"
            }`}
          >
            {isCompatible && (
              <circle cx="0" cy="0" r="90" className="budget-halo" strokeDasharray="6 4" />
            )}

            {/* Composed visual layout based on declarative lists of CXL assets */}

            {/* YABA Scene */}
            {district.slug === "yaba" && (
              <g>
                <Market color={primaryColor} />
                <line x1="-50" y1="25" x2="50" y2="25" stroke="#78909C" strokeWidth="3" />
                <g className="yaba-train">
                  <Train />
                </g>
              </g>
            )}

            {/* LEKKI Scene */}
            {district.slug === "lekki-phase-1" && (
              <g>
                <rect x="-40" y="-35" width="80" height="8" rx="2" fill={primaryColor} />
                <line x1="-30" y1="-27" x2="-30" y2="25" stroke="#90A4AE" strokeWidth="3" />
                <line x1="30" y1="-27" x2="30" y2="25" stroke="#90A4AE" strokeWidth="3" />
                <g transform="translate(0, 20)">
                  <Palm color={primaryColor} swayClass="lekki-palm" />
                </g>
              </g>
            )}

            {/* VICTORIA ISLAND Scene */}
            {district.slug === "vi" && (
              <g>
                <Tower primaryColor={primaryColor} secondaryColor={secondaryColor} isNight={isNight} />
              </g>
            )}

            {/* IKOYI Scene */}
            {district.slug === "ikoyi" && (
              <g>
                <rect x="-15" y="-90" width="30" height="90" fill={isNight ? "#37474F" : "#ECEFF1"} />
                <g className="ikoyi-canopy">
                  <circle cx="-35" cy="-40" r="30" fill={primaryColor} />
                  <circle cx="35" cy="-35" r="28" fill={secondaryColor} />
                </g>
              </g>
            )}

            {/* IKEJA Scene */}
            {district.slug === "ikeja" && (
              <g>
                <rect x="-40" y="-40" width="85" height="40" fill={secondaryColor} rx="4" />
                <line x1="0" y1="-40" x2="0" y2="25" stroke="#757575" strokeWidth="2" />
                <g className="ikeja-plane">
                  <path d="M 0 -80 L 15 -75 L 0 -70 L -5 -75 Z" fill="#000" />
                </g>
              </g>
            )}

            {/* SURULERE Scene */}
            {district.slug === "surulere" && (
              <g>
                <path d="M -45 25 A 45 45 0 0 1 45 25" fill="none" stroke={primaryColor} strokeWidth="6" />
                <ellipse cx="0" cy="25" rx="40" ry="10" fill={secondaryColor} />
                <circle cx="0" cy="0" r="6" className="surulere-pulse" fill="#FFD54F" />
              </g>
            )}

            {/* Labels overlay */}
            <g transform="translate(0, 55)">
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
                {district.editorial.dek}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
}
