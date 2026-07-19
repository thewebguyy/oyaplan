interface MarketProps {
  color?: string;
}

export default function Market({ color = "#E57373" }: MarketProps) {
  return (
    <g>
      {/* Triangular pitched roof */}
      <path d="M -40 0 L 0 -30 L 40 0 Z" fill={color} />
      <rect x="-30" y="0" width="60" height="25" fill="#FAFAFA" />
      <line x1="-40" y1="25" x2="40" y2="25" stroke="#78909C" strokeWidth="2" />
    </g>
  );
}
