interface AtmosphereLayerProps {
  timeOfDay: "morning" | "afternoon" | "golden-hour" | "night";
  budget: number | null;
  vibe: string | null;
}

export default function AtmosphereLayer({ timeOfDay, budget, vibe }: AtmosphereLayerProps) {
  // Atmosphere reactivities:
  const isNight = timeOfDay === "night";
  const isGolden = timeOfDay === "golden-hour";
  const isPremium = budget && budget > 50000;
  const isDateNight = vibe === "date-night";

  return (
    <g pointerEvents="none">
      {/* Golden Hour / Sunset Ambient filter */}
      {isGolden && (
        <rect width="2400" height="1600" fill="#FFAB91" opacity="0.15" />
      )}

      {/* Night Ambient Filter */}
      {isNight && (
        <rect width="2400" height="1600" fill="#1A237E" opacity="0.25" />
      )}

      {/* Premium / Date Night Highlight Glow */}
      {(isPremium || isDateNight) && (
        <g>
          {/* Subtle spotlights or glowing nodes representing VIP zones */}
          <circle cx="1200" cy="1100" r="150" fill="#FFE082" opacity="0.08" filter="blur(20px)" />
          <circle cx="1700" cy="1000" r="120" fill="#FFE082" opacity="0.08" filter="blur(20px)" />
        </g>
      )}
    </g>
  );
}
