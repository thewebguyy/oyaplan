import { useLivingMotion } from "../animation/useLivingMotion";

export default function CloudLayer() {
  const parallax = useLivingMotion();
  const tx = parallax.x * 40;
  const ty = parallax.y * 10;

  return (
    <g 
      style={{ transform: `translate(${tx}px, ${ty}px)` }} 
      className="transition-transform duration-300 ease-out"
    >
      <defs>
        <style>
          {`
            @keyframes floatCloud {
              0% { transform: translateX(-400px); }
              100% { transform: translateX(2800px); }
            }
            .cloud-slow { animation: floatCloud 120s linear infinite; }
            .cloud-fast { animation: floatCloud 80s linear infinite; }
          `}
        </style>
      </defs>
      <g className="cloud-slow" fill="#FFFFFF" opacity="0.85">
        <path d="M 100 200 Q 130 160 180 160 Q 210 120 260 130 Q 300 110 330 150 Q 370 150 360 200 Z" />
      </g>
      <g className="cloud-fast" fill="#FFFFFF" opacity="0.6">
        <path d="M 800 120 Q 820 90 850 95 Q 870 70 900 80 Q 930 60 950 90 Q 980 90 970 120 Z" />
      </g>
      <g className="cloud-slow" fill="#FFFFFF" opacity="0.75" style={{ animationDelay: "-40s" }}>
        <path d="M 1600 250 Q 1630 210 1680 210 Q 1710 170 1760 180 Q 1800 160 1830 200 Q 1870 200 1860 250 Z" />
      </g>
    </g>
  );
}
