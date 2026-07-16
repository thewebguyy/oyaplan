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
        <div className="w-full max-w-2xl aspect-[16/9] mb-8 rounded-[16px] overflow-hidden relative shadow-sm">
          <Image 
            src={plan.spot.image_url} 
            alt={plan.spot.name} 
            fill 
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-full max-w-2xl aspect-[21/9] mb-8 rounded-[16px] bg-[#EAE3D1]/30 flex items-center justify-center">
          <span className="type-caption text-text-muted">No image available</span>
        </div>
      )}

      <h2 className="type-display-product text-text-primary uppercase tracking-tight text-xl sm:text-2xl font-black mb-2">
        {getHeadline()}
      </h2>
      <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
        <p className="type-tagline text-text-muted text-lg font-medium">
          at {plan.spot.name}
        </p>
        
        {plan.spot.computed_confidence_score !== undefined && plan.spot.computed_confidence_score > 70 && (
          <div className="flex items-center gap-1 bg-brand-green-15 text-brand-green px-2 py-0.5 rounded-full mt-2 sm:mt-0">
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
