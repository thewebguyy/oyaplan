"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from "framer-motion";
import { Spot } from "@/lib/types";
import { VenueCard } from "./VenueCard";
import { useSavedSpots } from "@/hooks/useSavedSpots";

interface VenueCardStackProps {
  spots: Spot[];
  slug: string;
  budget?: number;
  vibe?: string;
  squadCount?: number;
}

export function VenueCardStack({ spots, slug, budget, vibe, squadCount = 2 }: VenueCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isSaved, saveSpot, removeSpot } = useSavedSpots();
  
  // Motion values for the top card
  const x = useMotionValue(0);
  const controls = useAnimation();
  
  // Transform x into rotation and opacity for the swiping card
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  // Transform x into a background color overlay (Red for Pass, Green for Save)
  const passOpacity = useTransform(x, [-150, -50], [1, 0]);
  const saveOpacity = useTransform(x, [50, 150], [0, 1]);

  const activeSpots = spots.slice(currentIndex);

  const handleDragEnd = async (e: any, info: PanInfo) => {
    const threshold = 100;
    const swipeVelocity = 500;
    
    // Swipe Right (Save)
    if (info.offset.x > threshold || info.velocity.x > swipeVelocity) {
      await controls.start({ x: window.innerWidth, opacity: 0, transition: { duration: 0.3 } });
      handleSwipeRight(activeSpots[0]);
    }
    // Swipe Left (Pass)
    else if (info.offset.x < -threshold || info.velocity.x < -swipeVelocity) {
      await controls.start({ x: -window.innerWidth, opacity: 0, transition: { duration: 0.3 } });
      handleSwipeLeft();
    }
    // Snap back
    else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  const handleSwipeRight = (spot: Spot) => {
    if (!isSaved(spot.id)) saveSpot(spot);
    nextCard();
  };

  const handleSwipeLeft = () => {
    nextCard();
  };

  const nextCard = () => {
    setCurrentIndex((prev) => prev + 1);
    x.set(0); // reset motion value for the new top card
  };

  const handleSaveToggle = (spot: Spot) => {
    if (isSaved(spot.id)) removeSpot(spot.id);
    else saveSpot(spot);
  };

  if (activeSpots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <div className="w-16 h-16 bg-[#F0EDE8] rounded-full flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h3 className="text-xl font-black text-text-primary mb-2">You've seen them all!</h3>
        <p className="text-text-muted text-sm mb-6 max-w-[280px]">
          There are no more venues matching your filters in this area. Try a different vibe or budget.
        </p>
        <button 
          onClick={() => setCurrentIndex(0)}
          className="text-brand-green font-bold text-sm uppercase tracking-wider border-2 border-brand-green px-6 py-3 rounded-full hover:bg-brand-green/10 transition-colors"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[420px] mx-auto h-[600px] max-h-[75vh] flex items-center justify-center">
      {activeSpots.map((spot, index) => {
        const isTop = index === 0;
        
        // Only render the top 3 cards for performance
        if (index > 2) return null;

        return (
          <motion.div
            key={spot.id}
            className="absolute inset-0 origin-bottom will-change-transform"
            style={{
              zIndex: spots.length - index,
              // Only apply drag transforms to the top card
              x: isTop ? x : 0,
              rotate: isTop ? rotate : 0,
              opacity: isTop ? opacity : 1 - (index * 0.15),
              scale: isTop ? 1 : 1 - (index * 0.04),
              y: isTop ? 0 : index * 12, // Stack effect offset
            }}
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragEnd={isTop ? handleDragEnd : undefined}
            animate={isTop ? controls : undefined}
            whileDrag={{ cursor: "grabbing" }}
            whileTap={{ cursor: "grabbing" }}
          >
            {/* Visual Feedback Overlays */}
            {isTop && (
              <>
                <motion.div 
                  className="absolute inset-0 z-50 bg-brand-green/20 rounded-3xl pointer-events-none flex items-center justify-center"
                  style={{ opacity: saveOpacity }}
                >
                  <div className="bg-brand-green text-white px-6 py-2 rounded-full font-black uppercase tracking-widest text-xl rotate-[-15deg] border-4 border-white shadow-xl">
                    SAVE
                  </div>
                </motion.div>
                <motion.div 
                  className="absolute inset-0 z-50 bg-error/20 rounded-3xl pointer-events-none flex items-center justify-center"
                  style={{ opacity: passOpacity }}
                >
                  <div className="bg-error text-white px-6 py-2 rounded-full font-black uppercase tracking-widest text-xl rotate-[15deg] border-4 border-white shadow-xl">
                    PASS
                  </div>
                </motion.div>
              </>
            )}

            <div className="w-full h-full pointer-events-none [&_button]:pointer-events-auto [&_a]:pointer-events-auto">
              <VenueCard 
                spot={spot} 
                slug={slug}
                isSaved={isSaved(spot.id)}
                onSaveToggle={handleSaveToggle}
                budget={budget}
                vibe={vibe}
                squadCount={squadCount}
              />
            </div>
          </motion.div>
        );
      }).reverse()} {/* Reverse so index 0 is mapped last (top in DOM if zIndex fails, but zIndex handles it) */}
    </div>
  );
}
