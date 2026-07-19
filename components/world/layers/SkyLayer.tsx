interface SkyLayerProps {
  timeOfDay: "morning" | "afternoon" | "golden-hour" | "night";
}

export default function SkyLayer({ timeOfDay }: SkyLayerProps) {
  const gradients = {
    morning: { start: "#E3F2FD", end: "#FFF9C4" },
    afternoon: { start: "#E8F5E9", end: "#FFFDE7" },
    "golden-hour": { start: "#FFF3E0", end: "#FFCC80" },
    night: { start: "#1A237E", end: "#0D47A1" }
  };

  const active = gradients[timeOfDay] || gradients.afternoon;

  return (
    <g>
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={active.start} className="transition-colors duration-1000" />
          <stop offset="100%" stopColor={active.end} className="transition-colors duration-1000" />
        </linearGradient>
      </defs>
      <rect width="2400" height="1600" fill="url(#skyGrad)" />
    </g>
  );
}
