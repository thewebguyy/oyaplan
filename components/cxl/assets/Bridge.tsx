interface AssetProps {
  color?: string;
  isNight?: boolean;
}

export default function Bridge({ color = "#CFD8DC", isNight = false }: AssetProps) {
  return (
    <g>
      {/* Structural Span */}
      <path 
        d="M -150 0 Q 0 80 150 160" 
        fill="none" 
        stroke={color} 
        strokeWidth="10" 
        strokeLinecap="round" 
      />
      {/* Lights along the bridge path for night views */}
      {isNight && (
        <path 
          d="M -150 0 Q 0 80 150 160" 
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
