interface TowerProps {
  primaryColor?: string;
  secondaryColor?: string;
  isNight?: boolean;
}

export default function Tower({ primaryColor = "#0288D1", secondaryColor = "#B3E5FC", isNight = false }: TowerProps) {
  return (
    <g>
      <rect x="-20" y="-80" width="40" height="80" fill={isNight ? "#1565C0" : primaryColor} />
      <rect x="0" y="-110" width="30" height="110" fill={isNight ? "#0D47A1" : secondaryColor} />
      {/* Light highlights for night scenes */}
      {isNight && (
        <g fill="#FFF59D">
          <rect x="-12" y="-70" width="6" height="10" />
          <rect x="8" y="-100" width="6" height="10" />
        </g>
      )}
    </g>
  );
}
