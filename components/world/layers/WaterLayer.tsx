interface WaterLayerProps {
  color: string;
}

export default function WaterLayer({ color }: WaterLayerProps) {
  return (
    <g>
      <defs>
        <style>
          {`
            @keyframes waterShimmer {
              0% { opacity: 0.7; transform: translateY(0px) scaleY(1); }
              50% { opacity: 0.9; transform: translateY(3px) scaleY(1.02); }
              100% { opacity: 0.7; transform: translateY(0px) scaleY(1); }
            }
            .water-body { 
              animation: waterShimmer 6s ease-in-out infinite;
              transform-origin: center bottom;
            }
          `}
        </style>
      </defs>

      {/* Styled vector lagoon representation */}
      <path 
        d="M 0 950 Q 600 780 1200 880 T 2400 680 L 2400 1600 L 0 1600 Z" 
        fill={color} 
        className="water-body transition-colors duration-1000"
      />
    </g>
  );
}
