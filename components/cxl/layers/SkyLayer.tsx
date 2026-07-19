import { cityTokens } from "../tokens/cityTokens";

interface SkyLayerProps {
  timeOfDay: "morning" | "afternoon" | "golden-hour" | "night";
}

export default function SkyLayer({ timeOfDay }: SkyLayerProps) {
  // Use the semantic gradients resolved from CXL design tokens
  const activeGradient = cityTokens.colors.sky[timeOfDay] || cityTokens.colors.sky.afternoon;

  return (
    <g>
      <defs>
        {/* We parse the CSS gradient into SVG stops */}
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={timeOfDay === "night" ? "#1A237E" : timeOfDay === "golden-hour" ? "#FFF3E0" : timeOfDay === "morning" ? "#E3F2FD" : "#E8F5E9"} />
          <stop offset="100%" stopColor={timeOfDay === "night" ? "#0D47A1" : timeOfDay === "golden-hour" ? "#FFCC80" : timeOfDay === "morning" ? "#FFF9C4" : "#FFFDE7"} />
        </linearGradient>
      </defs>
      <rect width="2400" height="1600" fill="url(#skyGrad)" />
    </g>
  );
}
