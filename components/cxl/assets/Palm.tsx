interface PalmProps {
  color?: string;
  swayClass?: string;
}

export default function Palm({ color = "#00897B", swayClass = "" }: PalmProps) {
  return (
    <g className={swayClass}>
      {/* Curved Trunk */}
      <path d="M 0 0 Q -5 -25 -15 -40" fill="none" stroke="#8D6E63" strokeWidth="3" />
      {/* Foliage crown */}
      <circle cx="-15" cy="-40" r="10" fill={color} />
      <circle cx="-8" cy="-35" r="8" fill={color} />
      <circle cx="-22" cy="-35" r="8" fill={color} />
    </g>
  );
}
