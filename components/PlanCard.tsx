import { useState } from "react";
import { MapPin, Utensils, Car, ThumbsUp, ThumbsDown, Activity, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Plan, ForgeInput } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import WhatsAppCopyButton from "./WhatsAppCopyButton";
import { useMobile } from "./hooks/useMobile";

interface PlanCardProps {
  plan: Plan;
  index: number;
  input: ForgeInput;
  isTopPick?: boolean;
  originalBudget?: number;
}

export default function PlanCard({ plan, index, input, isTopPick, originalBudget }: PlanCardProps) {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useMobile();

  const handleFeedback = async (type: 'up' | 'down') => {
    setFeedbackGiven(true);
    try {
      await supabase.from('price_flags').insert({
        spot_id: plan.spot.id,
        flag_type: type
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
      Brunch: "cocktails or a smoothie bowl",
    };
    return suggestions[vibe] || "something extra for the squad";
  };

  return (
    <div className={`overflow-hidden rounded-[24px] border-2 transition-all duration-300 bg-white ${
      isTopPick 
        ? "border-brand-green shadow-[0px_32px_64px_rgba(0,0,0,0.18)] card-lift relative z-10" 
        : "border-border-default shadow-[0px_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.10)]"
    }`}>
      {/* Top Zone: Identity */}
      <div className={`p-8 ${isTopPick ? "bg-brand-green text-white" : "bg-surface-grey text-text-primary border-b border-border-default"}`}>
        <div className="flex justify-between items-start mb-6">
          <div className={`px-2 py-1 rounded-[6px] type-label ${isTopPick ? "bg-white text-brand-green" : "bg-border-default text-text-muted"}`}>
            {isTopPick ? "Best Match" : "Alternative"}
          </div>
          <div className="text-right flex flex-col">
            <p className={`${isTopPick ? "text-[52px]" : "type-heading text-brand-green"} font-[900] leading-none`}>
              ₦{plan.totalCost.toLocaleString()}
            </p>
            {isTopPick && (
              <p className="type-caption text-white/60 mt-1">
                for {input.squadSize} {Number(input.squadSize) === 1 ? 'person' : 'people'}
              </p>
            )}
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

            {/* Footer: Verification & Feedback */}
            <div className="pt-6 border-t border-border-default flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="type-caption">
                {plan.spot.price_updated_at ? (() => {
                  const updatedDate = new Date(plan.spot.price_updated_at);
                  const daysSince = Math.floor((new Date().getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
                  const isStale = daysSince > 90;
                  const dateStr = updatedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  
                  return (
                    <span style={isStale ? { color: '#B45309' } : {}} className={isStale ? "" : "text-text-muted"}>
                      {isStale 
                        ? `Prices last verified ${dateStr} — confirm before you go` 
                        : `Verified ${dateStr} via ${plan.spot.price_source || 'manual'}`
                      }
                    </span>
                  );
                })() : (
                  <span className="text-text-muted">Estimated prices</span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {feedbackGiven ? (
                  <span className="type-label text-brand-green">Thanks!</span>
                ) : (
                  <>
                    <span className="type-label text-text-muted">Price right?</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleFeedback('up')} className="p-1.5 hover:bg-brand-green-5 rounded-md text-text-muted hover:text-brand-green transition-colors tap-feedback min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleFeedback('down')} className="p-1.5 hover:bg-red-50 rounded-md text-text-muted hover:text-error transition-colors tap-feedback min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
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

