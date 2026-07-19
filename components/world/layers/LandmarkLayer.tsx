interface LandmarkLayerProps {
  timeOfDay: "morning" | "afternoon" | "golden-hour" | "night";
}

export default function LandmarkLayer({ timeOfDay }: LandmarkLayerProps) {
  const isNight = timeOfDay === "night";
  const bridgeColor = isNight ? "#283593" : "#CFD8DC";

  return (
    <g>
      {/* Third Mainland Bridge Silhouette */}
      <path 
        d="M 200 680 Q 900 850 1500 1020" 
        fill="none" 
        stroke={bridgeColor} 
        strokeWidth="10" 
        strokeLinecap="round" 
        className="transition-colors duration-1000"
      />
      {/* Bridge structural supports */}
      <g stroke={bridgeColor} strokeWidth="2" className="transition-colors duration-1000">
        <line x1="400" y1="720" x2="400" y2="900" />
        <line x1="600" y1="765" x2="600" y2="950" />
        <line x1="800" y1="810" x2="800" y2="1020" />
        <line x1="1000" y1="860" x2="1000" y2="1100" />
        <line x1="1200" y1="915" x2="1200" y2="1200" />
      </g>
      
      {/* Glow lights for night */}
      {isNight && (
        <path 
          d="M 200 680 Q 900 850 1500 1020" 
          fill="none" 
          stroke="#FFD54F" 
          strokeWidth="2" 
          strokeDasharray="10 30" 
          opacity="0.8" 
        />
      )}
    </g>
  );
}
