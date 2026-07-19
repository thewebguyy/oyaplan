export default function TransportLayer() {
  return (
    <g>
      <defs>
        <style>
          {`
            @keyframes transportLoop {
              0% { transform: translate(-100px, 950px); }
              100% { transform: translate(2500px, 950px); }
            }
            .danfo-bus { animation: transportLoop 20s linear infinite; }

            @keyframes ferryLoop {
              0% { transform: translate(2500px, 1200px) scaleX(-1); }
              100% { transform: translate(-100px, 1200px) scaleX(-1); }
            }
            .ferry-boat { animation: ferryLoop 35s linear infinite; }
          `}
        </style>
      </defs>
      <g className="danfo-bus">
        <rect width="25" height="12" rx="2" fill="#FFD54F" />
        <rect x="2" y="2" width="6" height="4" fill="#000" />
        <rect x="10" y="2" width="6" height="4" fill="#000" />
        <circle cx="6" cy="12" r="2" fill="#000" />
        <circle cx="19" cy="12" r="2" fill="#000" />
      </g>
      <g className="ferry-boat">
        <path d="M 0 5 L 40 5 L 30 -5 L 5 -5 Z" fill="#ECEFF1" stroke="#90A4AE" strokeWidth="1" />
        <rect x="8" y="-12" width="14" height="7" fill="#CFD8DC" />
        <line x1="12" y1="-12" x2="12" y2="-5" stroke="#000" />
      </g>
    </g>
  );
}
