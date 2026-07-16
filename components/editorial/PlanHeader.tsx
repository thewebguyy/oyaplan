"use client";

import { ForgeInput, Plan } from "@/lib/types";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

export function PlanHeader({ input, plan, isTopPick = false }: { input: ForgeInput; plan: Plan; isTopPick?: boolean }) {
  const getHeadline = () => {
    const v = input.vibe?.toLowerCase() || '';
    const dp = input.daypart?.toLowerCase() || '';
    
    if (v.includes('dinner') || dp.includes('night') || dp.includes('evening')) {
      if (v.includes('dinner')) return 'DATE NIGHT';
      if (v.includes('party')) return 'NIGHT OUT';
    }
    
    if (v === 'brunch') return 'WEEKEND BRUNCH';
    if (v === 'quick') return 'QUICK STOP';
    if (v === 'foodie') return 'SERIOUS CHOP';
    
    return 'CHILL HANGOUT';
  };

  return (
    <div className={`p-6 sm:p-10 pb-8 flex flex-col items-center text-center ${isTopPick ? 'bg-surface-grey/50' : 'bg-white'}`}>
      {plan.spot.image_url ? (
        <div className="w-full max-w-2xl aspect-[16/9] mb-8 rounded-[20px] img-zoom-container shadow-lagoon">
          <Image 
            src={plan.spot.image_url} 
            alt={plan.spot.name} 
            fill 
            className="object-cover img-zoom"
          />
        </div>
      ) : (
        <div className="w-full max-w-2xl aspect-[21/9] mb-8 rounded-[20px] bg-[#EAE3D1]/20 flex items-center justify-center overflow-hidden">
          {/* Abstract Lagos skyline silhouette — stroke only, no fill */}
          <svg width="320" height="80" viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-30">
            <rect x="20" y="40" width="18" height="40" rx="1" stroke="#010528" strokeWidth="1.5"/>
            <rect x="18" y="28" width="22" height="14" rx="1" stroke="#010528" strokeWidth="1.5"/>
            <rect x="50" y="30" width="30" height="50" rx="1" stroke="#010528" strokeWidth="1.5"/>
            <rect x="56" y="20" width="18" height="12" rx="1" stroke="#010528" strokeWidth="1.5"/>
            <rect x="90" y="45" width="14" height="35" rx="1" stroke="#010528" strokeWidth="1.5"/>
            <rect x="115" y="20" width="40" height="60" rx="1" stroke="#010528" strokeWidth="1.5"/>
            <rect x="125" y="10" width="20" height="12" rx="1" stroke="#010528" strokeWidth="1.5"/>
            <rect x="130" y="4" width="2" height="8" stroke="#010528" strokeWidth="1"/>
            <rect x="165" y="35" width="25" height="45" rx="1" stroke="#010528" strokeWidth="1.5"/>
            <rect x="200" y="50" width="18" height="30" rx="1" stroke="#010528" strokeWidth="1.5"/>
            <rect x="228" y="30" width="35" height="50" rx="1" stroke="#010528" strokeWidth="1.5"/>
            <rect x="235" y="18" width="22" height="14" rx="1" stroke="#010528" strokeWidth="1.5"/>
            <rect x="273" y="42" width="20" height="38" rx="1" stroke="#010528" strokeWidth="1.5"/>
            <line x1="0" y1="80" x2="320" y2="80" stroke="#010528" strokeWidth="1.5" opacity="0.3"/>
          </svg>
        </div>
      )}

      <h2 className="type-display-product text-midnight-lagoon uppercase tracking-tight text-xl sm:text-2xl font-black mb-2">
        {getHeadline()}
      </h2>
      <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
        <p className="type-tagline text-text-muted text-lg font-medium">
          at {plan.spot.name}
        </p>
        
        {plan.spot.computed_confidence_score !== undefined && plan.spot.computed_confidence_score > 70 && (
          <div className="flex items-center gap-1 bg-palm-green/10 text-palm-green px-2.5 py-0.5 rounded-full mt-2 sm:mt-0 shadow-xs">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {plan.spot.computed_confidence_score}% Verified
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
