"use client";

import { ForgeInput, Plan } from "@/lib/types";
import { EditorialBlock } from "../ui/EditorialBlock";

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
    <div className={`px-6 sm:px-10 pt-10 pb-8 ${isTopPick ? 'bg-surface-grey/50' : 'bg-white'}`}>
      <EditorialBlock>
        <h2 className="type-display-product text-text-primary uppercase tracking-tight">
          {getHeadline()}
        </h2>
        <p className="type-tagline text-text-muted">
          at {plan.spot.name}
        </p>
      </EditorialBlock>
    </div>
  );
}
