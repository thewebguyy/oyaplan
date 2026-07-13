"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spot } from "@/lib/types";

interface DanfoTickerProps {
  spots: Spot[];
}

export default function DanfoTicker({ spots }: DanfoTickerProps) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoPaused, setIsAutoPaused] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const cycleAnimation = () => {
      // It just finished a pause (or started), now run for 2.5s
      setIsAutoPaused(false);
      timeoutId = setTimeout(() => {
        // Run finished, pause for 1.5s
        setIsAutoPaused(true);
        timeoutId = setTimeout(cycleAnimation, 1500);
      }, 2500);
    };

    cycleAnimation();

    return () => clearTimeout(timeoutId);
  }, []);

  if (!spots || spots.length === 0) return null;

  // Duplicate items to ensure a seamless looping marquee
  const tickerItems = [...spots, ...spots, ...spots];

  const handleItemTouch = (spotId: string, event: React.TouchEvent) => {
    if (activeId === spotId) {
      router.push(`/?pinnedSpotId=${spotId}`);
      return;
    }

    event.preventDefault();
    setActiveId(spotId);
    setIsPaused(true);
  };

  const handleItemClick = (spotId: string) => {
    router.push(`/?pinnedSpotId=${spotId}`);
  };

  const handleMouseLeave = () => {
    setActiveId(null);
    setIsPaused(false);
  };

  return (
    <div 
      className="w-full bg-[#0A0A0A] overflow-hidden py-3 relative select-none"
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="flex items-center gap-12 whitespace-nowrap"
        style={{
          animation: "danfo-marquee 40s linear infinite",
          animationPlayState: isPaused || isAutoPaused ? "paused" : "running",
          width: "max-content"
        }}
      >
        {tickerItems.map((spot, index) => {
          const uniqueKey = `${spot.id}-${index}`;
          const isHighlighted = activeId === spot.id;

          return (
            <div key={uniqueKey} className="flex items-center gap-12">
              <div
                onClick={() => handleItemClick(spot.id)}
                onTouchStart={(e) => handleItemTouch(spot.id, e)}
                onMouseEnter={() => {
                  setActiveId(spot.id);
                  setIsPaused(true);
                }}
                className={`type-ui-label text-xs uppercase font-extrabold tracking-widest px-3 py-1.5 rounded-[4px] cursor-pointer ${
                  isHighlighted 
                    ? "bg-[#F6C642] text-black" 
                    : "text-white"
                }`}
                style={{
                  transition: "none" // Hard snapping transition
                }}
              >
                {spot.name} &middot; ₦{spot.price_per_person.toLocaleString('en-NG')}
              </div>
              <span className="text-white/30 font-bold tracking-widest text-xs select-none">//</span>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes danfo-marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.33%, 0, 0); }
        }
      `}</style>
    </div>
  );
}
