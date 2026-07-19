interface AtmosphereLayerProps {
  timeOfDay: "morning" | "afternoon" | "golden-hour" | "night";
}

export default function AtmosphereLayer({ timeOfDay }: AtmosphereLayerProps) {
  // Atmosphere reactivities:
  const isNight = timeOfDay === "night";
  const isGolden = timeOfDay === "golden-hour";

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
    </g>
  );
}
