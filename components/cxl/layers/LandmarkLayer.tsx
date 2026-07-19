import Bridge from "../assets/Bridge";
import { cityTokens } from "../tokens/cityTokens";

interface LandmarkLayerProps {
  timeOfDay: "morning" | "afternoon" | "golden-hour" | "night";
}

export default function LandmarkLayer({ timeOfDay }: LandmarkLayerProps) {
  const isNight = timeOfDay === "night";
  const bridgeColor = isNight ? cityTokens.colors.navy : cityTokens.colors.concrete;

  return (
    <g>
      {/* Exaggerated structural Lekki-Ikoyi Link Bridge rendering */}
      <g transform="translate(1400, 800)">
        <Bridge color={bridgeColor} isNight={isNight} />
      </g>
    </g>
  );
}
