interface AtmosphereLayerProps {
  timeOfDay: "morning" | "afternoon" | "golden-hour" | "night";
}

export default function AtmosphereLayer({ timeOfDay }: AtmosphereLayerProps) {
  const isNight = timeOfDay === "night";
  const isGolden = timeOfDay === "golden-hour";

  return (
    <g pointerEvents="none">
      {isGolden && (
        <rect width="2400" height="1600" fill="#FFAB91" opacity="0.15" />
      )}
      {isNight && (
        <rect width="2400" height="1600" fill="#1A237E" opacity="0.25" />
      )}
    </g>
  );
}
