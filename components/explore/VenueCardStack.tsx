"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from "framer-motion";
import { X, BookmarkCheck, RotateCcw } from "lucide-react";
import { Spot } from "@/lib/types";
import { DecisionCardViewModel } from "@/lib/planning/presentation/types";
import { VenueCard } from "./VenueCard";
import { useSavedSpots } from "@/hooks/useSavedSpots";
import { AnalyticsService } from "@/lib/services/analytics/analyticsService";
import { toast } from "sonner";

interface VenueCardStackProps {
  spots: DecisionCardViewModel[];
  rawSpots: Spot[];
  slug: string;
  budget?: number;
  vibe?: string;
  squadCount?: number;
}

export function VenueCardStack({ spots, rawSpots, slug, budget, vibe, squadCount = 2 }: VenueCardStackProps) {
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

  const handleDragEnd = async (e: unknown, info: PanInfo) => {
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
      handleSwipeLeft(activeSpots[0]);
    }
    // Snap back
    else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  const resolveSpot = (card: DecisionCardViewModel): Spot => {
    const rawSpot = rawSpots.find(s => s.id === card.spotId);
    if (rawSpot) return rawSpot;

    return {
      id: card.spotId,
      name: card.spotName,
      address: card.address,
      address_slug: card.addressSlug || card.areaSlug || slug || 'lagos',
      area_id: card.areaSlug || slug || 'lagos',
      vibe_tags: card.whyItFits ? card.whyItFits.split(' • ') : ['Chill'],
      price_per_person: card.pricePerPerson || Math.round(card.venueCost / (squadCount || 2)),
      price_updated_at: new Date().toISOString(),
      price_source: 'manual',
      transport_matrix: {},
      active: true,
      category: card.category || 'restaurant',
      has_food: true,
      typical_duration_hours: 2,
      subcategory: 'mid-range',
      price_tier: 2,
      crowd_type: 'mixed',
      best_daypart: 'afternoon',
      image_url: card.heroImage,
    };
  };

  const handleSwipeRight = (card?: DecisionCardViewModel) => {
    if (card) {
      if (!isSaved(card.spotId)) {
        saveSpot(resolveSpot(card));
        toast.success(`Saved "${card.spotName}" to your Saved Spots!`);
      }
      AnalyticsService.track('spot_saved', {
        session_id: '00000000-0000-0000-0000-000000000000',
        properties: {
          category: 'Engagement',
          spot_id: card.spotId,
          position_in_stack: currentIndex,
          area: slug,
          vibe: vibe || 'any',
          version: '1.0'
        }
      });
    }
    nextCard();
  };

  const handleSwipeLeft = (card?: DecisionCardViewModel) => {
    if (card) {
      AnalyticsService.track('spot_passed', {
        session_id: '00000000-0000-0000-0000-000000000000',
        properties: {
          category: 'Engagement',
          spot_id: card.spotId,
          position_in_stack: currentIndex,
          area: slug,
          vibe: vibe || 'any',
          version: '1.0'
        }
      });
    }
    nextCard();
  };

  const handleSwipeLeftClick = async () => {
    if (activeSpots.length === 0) return;
    await controls.start({ x: -window.innerWidth, opacity: 0, transition: { duration: 0.3 } });
    handleSwipeLeft(activeSpots[0]);
  };

  const handleSwipeRightClick = async (card: DecisionCardViewModel) => {
    if (!card) return;
    await controls.start({ x: window.innerWidth, opacity: 0, transition: { duration: 0.3 } });
    handleSwipeRight(card);
  };

  const nextCard = () => {
    setCurrentIndex((prev) => prev + 1);
    x.set(0); // reset motion value for the new top card
  };

  const handleSaveToggle = (card: DecisionCardViewModel) => {
    if (isSaved(card.spotId)) {
      removeSpot(card.spotId);
      toast.info(`Removed "${card.spotName}" from Saved Spots.`);
    } else {
      saveSpot(resolveSpot(card));
      toast.success(`Saved "${card.spotName}" to your Saved Spots!`);
    }
  };

  const handleStartOver = () => {
    x.set(0);
    controls.set({ x: 0, opacity: 1 });
    setCurrentIndex(0);
  };

  if (activeSpots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <div className="w-16 h-16 bg-[#F0EDE8] rounded-full flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h3 className="text-xl font-black text-text-primary mb-2">You&apos;ve seen them all!</h3>
        <p className="text-text-muted text-sm mb-6 max-w-[280px]">
          There are no more venues matching your filters in this area. Try a different vibe or budget.
        </p>
        <button 
          onClick={handleStartOver}
          className="flex items-center gap-2 text-brand-green font-bold text-sm uppercase tracking-wider border-2 border-brand-green px-6 py-3 rounded-full hover:bg-brand-green/10 transition-colors"
        >
          <RotateCcw size={16} strokeWidth={2.5} /> Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col items-center justify-center px-4 pb-20">
      {/* Card Stack Container */}
      <div className="relative w-full h-[500px] max-h-[60vh] flex items-center justify-center">
        {activeSpots.map((card, index) => {
          const isTop = index === 0;
          
          // Only render the top 3 cards for performance
          if (index > 2) return null;

          return (
            <motion.div
              key={card.spotId}
              className="absolute inset-0 origin-bottom will-change-transform touch-pan-y"
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
                    className="absolute inset-0 z-50 bg-brand-green/10 rounded-3xl pointer-events-none flex items-center justify-center backdrop-blur-[2px]"
                    style={{ opacity: saveOpacity }}
                  >
                    <div className="bg-brand-green text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-3xl rotate-[-15deg] border-[6px] border-white shadow-2xl flex items-center gap-2">
                      <BookmarkCheck size={36} strokeWidth={4} /> SAVE
                    </div>
                  </motion.div>
                  <motion.div 
                    className="absolute inset-0 z-50 bg-error/10 rounded-3xl pointer-events-none flex items-center justify-center backdrop-blur-[2px]"
                    style={{ opacity: passOpacity }}
                  >
                    <div className="bg-error text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-3xl rotate-[15deg] border-[6px] border-white shadow-2xl flex items-center gap-2">
                      <X size={36} strokeWidth={4} /> PASS
                    </div>
                  </motion.div>
                </>
              )}

              <div className="w-full h-full pointer-events-none [&_button]:pointer-events-auto [&_a]:pointer-events-auto">
                <VenueCard 
                  card={card} 
                  slug={slug}
                  isSaved={isSaved(card.spotId)}
                  onSaveToggle={() => handleSaveToggle(card)}
                  budget={budget}
                  vibe={vibe}
                  squadCount={squadCount}
                />
              </div>
            </motion.div>
          );
        }).reverse()} {/* Reverse so index 0 is mapped last (top in DOM if zIndex fails, but zIndex handles it) */}
      </div>

      {/* Swipe Action Buttons Bar (Always visible below card stack) */}
      {activeSpots.length > 0 && (
        <div className="flex justify-center items-center gap-8 mt-5 z-20">
          <button 
            onClick={handleSwipeLeftClick}
            className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center text-error border-[3px] border-error/20 hover:bg-error/10 hover:border-error transition-all tap-feedback active:scale-95"
            aria-label="Pass"
          >
            <X className="w-7 h-7" strokeWidth={3} />
          </button>
          
          <button 
            onClick={() => handleSwipeRightClick(activeSpots[0])}
            className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center text-[#008751] border-[3px] border-[#008751]/20 hover:bg-[#008751]/10 hover:border-[#008751] transition-all tap-feedback active:scale-95"
            aria-label="Save"
          >
            <BookmarkCheck className="w-7 h-7" strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
}
