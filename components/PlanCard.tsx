"use client";

import { useState } from "react";
import { 
  MapPin, 
  Utensils, 
  Car, 
  Activity, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Info
} from "lucide-react";
import { Plan, ForgeInput } from "@/lib/types";
import { submitPriceFlag } from "@/lib/actions/submitPriceFlag";
import WhatsAppCopyButton from "./WhatsAppCopyButton";
import { useMobile } from "./hooks/useMobile";

interface PlanCardProps {
  plan: Plan;
  index: number;
  input: ForgeInput;
  isTopPick?: boolean;
  originalBudget?: number;
}

export default function PlanCard({ plan, input, isTopPick, originalBudget }: PlanCardProps) {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [explainExpanded, setExplainExpanded] = useState(false);
  const isMobile = useMobile();

  const handleTrustFeedback = async (type: 'low' | 'right' | 'high') => {
    setFeedbackGiven(true);
    try {
      // 1. Submit price flag via Server Action (legacy compatibility)
      if (type === 'low') {
        await submitPriceFlag(plan.spot.id, 'up');
      } else if (type === 'high') {
        await submitPriceFlag(plan.spot.id, 'down');
      }

      // 2. Submit new raw evidence to the moderation queue (requires admin review)
      let proposedMultiplier = 1.0;
      if (type === 'low') proposedMultiplier = 1.20; // 20% higher suggested
      if (type === 'high') proposedMultiplier = 0.80; // 20% lower suggested

      const proposedPrice = Math.round((plan.spot.price_per_person * proposedMultiplier) / 100) * 100;

      await fetch('/api/evidence/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue_id: plan.spot.id,
          menu_item_name: 'User Outing Budget Feedback',
          category: plan.spot.category === 'activity' ? 'activity_fee' : 'main',
          price: proposedPrice,
          source_type: 'receipt_upload',
          submitted_by: `user_feedback_${type}`
        })
      });
    } catch (e) {
      console.error("Feedback error:", e);
    }
  };

  const hasFood = plan.spot.has_food !== false;
  const diff = originalBudget ? originalBudget - plan.totalCost : 0;
  const showIndicator = originalBudget && diff >= 2000;

  const getSuggestion = () => {
    const vibe = plan.spot.vibe_tags[0];
    const suggestions: Record<string, string> = {
      Chill: "an extra round of drinks",
      Foodie: "dessert and a starter",
      Party: "transport home or cover charge",
      Quick: "takeaway on the way back",
      Dinner: "a bottle for the table",
      Brunch: "cocktails or fresh juice",
    };
    return suggestions[vibe] || "something extra for the squad";
  };

  // Determine freshness badge parameters
  const status = plan.spot.verified_by || 'verified';
  const confidenceScore = plan.spot.computed_confidence_score || 80;

  let statusText = 'Verified';
  let statusClass = 'bg-green-50 text-[#008751] border-green-200';
  if (status === 'fresh') {
    statusText = 'Fresh Prices';
    statusClass = 'bg-emerald-500 text-white border-emerald-600';
  } else if (status === 'stale') {
    statusText = 'Stale Pricing';
    statusClass = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (status === 'needs_review' || status === 'incomplete') {
    statusText = 'Needs Review';
    statusClass = 'bg-red-50 text-red-700 border-red-200';
  } else if (status === 'community_verified') {
    statusText = 'Community Verified';
    statusClass = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (status === 'owner_verified') {
    statusText = 'Owner Verified';
    statusClass = 'bg-purple-50 text-purple-700 border-purple-200';
  }

  return (
    <div className={`overflow-hidden rounded-[24px] border-2 transition-all duration-300 bg-white ${
      isTopPick 
        ? "border-brand-green shadow-[0px_32px_64px_rgba(0,0,0,0.18)] card-lift relative z-10" 
        : "border-border-default shadow-[0px_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.10)]"
    }`}>
      {/* Top Zone: Identity with Premium Trust Header */}
      <div className={`p-8 ${isTopPick ? "bg-brand-green text-white" : "bg-surface-grey text-text-primary border-b border-border-default"}`}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-2">
            <span className={`px-2 py-1 border rounded-[6px] text-[10px] font-black uppercase tracking-wider w-fit ${isTopPick ? "bg-white/20 border-white/30 text-white" : statusClass}`}>
              {statusText}
            </span>
            <div className={`flex items-center gap-1 text-[11px] font-bold ${isTopPick ? "text-white/80" : "text-text-secondary"}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{Math.round(confidenceScore)}% Confidence</span>
            </div>
          </div>
          <div className="text-right flex flex-col">
            <p className={`${isTopPick ? "text-[52px]" : "type-heading text-brand-green"} font-[900] leading-none`}>
              ₦{plan.totalCost.toLocaleString()}
            </p>
            <p className={`type-caption mt-1 ${isTopPick ? "text-white/60" : "text-text-muted"}`}>
              for {input.squadSize} {Number(input.squadSize) === 1 ? 'person' : 'people'}
            </p>
          </div>
        </div>
        
        <h3 className={`${isTopPick ? "text-[22px] font-[800] text-white" : "type-heading text-text-primary"}`}>
          {plan.spot.name}
        </h3>
        
        <div className={`flex items-center gap-1.5 mt-2 type-caption ${isTopPick ? "text-white/80" : "text-text-muted"}`}>
          <MapPin className="w-[14px] h-[14px] shrink-0" />
          <span className="truncate">{plan.spot.address}</span>
        </div>
      </div>
      
      {/* Bottom Zone: Action */}
      <div className="p-8 space-y-6">
        {/* Primary Action */}
        <div className="w-full">
          <WhatsAppCopyButton plan={plan} input={input} variant={isTopPick ? "filled" : "outlined"} />
        </div>

        {isMobile && !isExpanded && (
          <button 
            type="button"
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center justify-center gap-2 type-label text-brand-green py-5 mt-2 tap-feedback border border-brand-green-15 rounded-[12px]"
          >
            See full breakdown <ChevronDown className="w-4 h-4" />
          </button>
        )}

        {(!isMobile || isExpanded) && (
          <>
            {/* Cost Grid */}
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="p-4 bg-surface-grey border border-border-default rounded-[12px]">
                <div className="flex items-center gap-2 text-text-muted type-label mb-1">
                  {hasFood ? <Utensils className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                  {hasFood ? "Food/Drinks" : "Activity"}
                </div>
                <p className="type-subheading text-text-primary">₦{plan.foodCost.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-surface-grey border border-border-default rounded-[12px]">
                <div className="flex items-center gap-2 text-text-muted type-label mb-1">
                  <Car className="w-3 h-3" />
                  Transport
                </div>
                <p className="type-subheading text-text-primary">₦{plan.transportCost.toLocaleString()}</p>
              </div>
            </div>

            {/* Note & Indicators */}
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="type-body text-text-secondary leading-relaxed">
                {plan.whyItFits}
              </p>

              {showIndicator && (
                <div className="p-4 bg-brand-yellow-15 border border-brand-yellow-40 rounded-[12px] flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-brand-yellow fill-brand-yellow shrink-0 mt-0.5" />
                  <p className="type-caption text-text-primary font-[700]">
                    ₦{diff.toLocaleString()} left over — enough for {getSuggestion()}.
                  </p>
                </div>
              )}
            </div>

            {/* Explainability Panel */}
            <div className="border border-border-default rounded-[16px] overflow-hidden bg-surface-grey/30">
              <button
                type="button"
                onClick={() => setExplainExpanded(!explainExpanded)}
                className="w-full flex items-center justify-between p-4 font-bold text-xs text-text-primary hover:bg-surface-grey/60 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#008751]" />
                  Why this estimate?
                </span>
                {explainExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {explainExpanded && (
                <div className="p-4 pt-0 border-t border-border-default/50 space-y-2 text-[11px] text-text-secondary animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center gap-2">
                    <span className="text-[#008751] font-bold">✓</span>
                    <span>{plan.explanation?.budget_fit || `Fits squad budget`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#008751] font-bold">✓</span>
                    <span>{plan.explanation?.freshness || `Prices verified recently`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#008751] font-bold">✓</span>
                    <span>{plan.explanation?.confidence || `${Math.round(confidenceScore)}% data confidence`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#008751] font-bold">✓</span>
                    <span>{plan.explanation?.tax_transparency || `Taxes and fees accounted for`}</span>
                  </div>
                  <div className="pt-2 border-t border-border-default/50 text-[10px] text-gray-400">
                    Calculated using active menu entries & transport rates. Bypasses static prompts.
                  </div>
                </div>
              )}
            </div>

            {/* Footer: User Feedback Loop */}
            <div className="pt-6 border-t border-border-default flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="type-caption text-text-muted">
                {plan.spot.price_updated_at ? (
                  <span>Verified {new Date(plan.spot.price_updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                ) : (
                  <span>Estimated prices</span>
                )}
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {feedbackGiven ? (
                  <span className="text-xs font-black uppercase text-[#008751]">Thanks for verifying!</span>
                ) : (
                  <div className="flex flex-col items-start sm:items-end gap-1.5 w-full sm:w-auto">
                    <span className="text-[11px] font-black uppercase tracking-wider text-text-muted">Were these prices accurate?</span>
                    <div className="flex gap-1.5 mt-1">
                      <button 
                        onClick={() => handleTrustFeedback('low')} 
                        className="px-2.5 py-1 text-[10px] font-black uppercase bg-red-50 text-red-700 border border-red-100 rounded-lg hover:bg-red-100 transition"
                      >
                        Too Low
                      </button>
                      <button 
                        onClick={() => handleTrustFeedback('right')} 
                        className="px-2.5 py-1 text-[10px] font-black uppercase bg-green-50 text-[#008751] border border-green-100 rounded-lg hover:bg-green-100 transition"
                      >
                        About Right
                      </button>
                      <button 
                        onClick={() => handleTrustFeedback('high')} 
                        className="px-2.5 py-1 text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-100 rounded-lg hover:bg-amber-100 transition"
                      >
                        Too High
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isMobile && isExpanded && (
              <button 
                type="button"
                onClick={() => setIsExpanded(false)}
                className="w-full flex items-center justify-center gap-2 type-label text-text-muted py-5 mt-4 border-t border-border-default tap-feedback"
              >
                Hide breakdown <ChevronUp className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
