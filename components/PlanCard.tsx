"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  MapPin, 
  Utensils, 
  Car, 
  Activity, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Info,
  Bookmark,
  Loader2
} from "lucide-react";
import { Plan, ForgeInput } from "@/lib/types";
import { submitPriceFlag } from "@/lib/actions/submitPriceFlag";
import WhatsAppCopyButton from "./WhatsAppCopyButton";
import { useAuth } from "./providers/AuthProvider";
import { savePlan } from "@/lib/actions/savePlan";
import { AnalyticsService } from "@/lib/services/analytics/analyticsService";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface PlanCardProps {
  plan: Plan;
  input: ForgeInput;
  planId?: string;
  isTopPick?: boolean;
  originalBudget?: number;
}

export default function PlanCard({ plan, input, planId: initialPlanId, isTopPick = false, originalBudget }: PlanCardProps) {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [explainExpanded, setExplainExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [planId, setPlanId] = useState<string | undefined>(initialPlanId);
  const { session, openModal } = useAuth();

  const handleTrustFeedback = async (type: 'low' | 'right' | 'high') => {
    if (!session) {
      openModal("Sign in to earn Scout reputation", window.location.pathname);
      return;
    }
    
    setFeedbackGiven(true);
    try {
      // 1. Submit price flag via Server Action (legacy compatibility)
      if (type === 'low') {
        const res = await submitPriceFlag(plan.spot.id, 'up');
        if (!res.success && res.error === 'unauthorized') {
          // Scout role has no grant path yet — re-prompting sign-in here would loop
          // an already-authenticated user forever. Surface it as a coming-soon state instead.
          toast.info("Scout reputation program coming soon — this feature isn't open yet.");
          return;
        }
      } else if (type === 'high') {
        await submitPriceFlag(plan.spot.id, 'down');
      }

      // 2. Submit new raw evidence to the moderation queue (requires admin review)
      let proposedMultiplier = 1.0;
      if (type === 'low') proposedMultiplier = 1.20; // 20% higher suggested
      if (type === 'high') proposedMultiplier = 0.80; // 20% lower suggested

      const proposedPrice = Math.round((plan.spot.price_per_person * proposedMultiplier) / 100) * 100;

      const evidenceRes = await fetch('/api/evidence/submit', {
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
      if (!evidenceRes.ok) {
        const detail = await evidenceRes.text().catch(() => evidenceRes.status.toString());
        console.error('Evidence submission failed:', detail);
      }
    } catch (e) {
      console.error("Feedback error:", e);
      toast.error("Couldn't submit your feedback. Please try again.");
    }
  };

  const handleSavePlan = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSaving || isSaved) return;
    
    setIsSaving(true);
    try {
      let currentPlanId = planId;
      
      // If we don't have an ID yet, create the shareable plan first
      if (!currentPlanId) {
        const { createShareablePlan } = await import('@/lib/actions/sharePlan');
        const shareRes = await createShareablePlan(plan, input);
        if (shareRes.success && shareRes.id) {
          currentPlanId = shareRes.id;
          setPlanId(currentPlanId);
        } else {
          toast.error("Couldn't save this plan. Please try again.");
          setIsSaving(false);
          return;
        }
      }

      const res = await savePlan(currentPlanId);
      if (res.success) {
        setIsSaved(true);
        toast.success("Plan saved to your dashboard!");
        AnalyticsService.track('plan_saved', {
          session_id: 'browser',
          properties: {
            category: 'Engagement',
            shared_plan_id: currentPlanId,
            spot_id: plan.spot.id,
            total_cost: plan.totalCost,
            version: '1.0'
          }
        });
      } else if (res.error === 'unauthorized') {
        openModal("Sign in to save plans", `/plan/${currentPlanId || 'new'}`);
      } else {
        toast.error("Couldn't save this plan. Please try again.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save this plan. Please try again.");
    } finally {
      setIsSaving(false);
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
  let statusClass = 'bg-brand-green-15 text-brand-green border-brand-green-15';
  if (status === 'fresh') {
    statusText = 'Fresh Prices';
    statusClass = 'bg-brand-green text-white border-brand-green';
  } else if (status === 'stale') {
    statusText = 'Stale Pricing';
    statusClass = 'bg-brand-yellow-15 text-text-primary border-brand-yellow-40';
  } else if (status === 'needs_review' || status === 'incomplete') {
    statusText = 'Needs Review';
    statusClass = 'bg-error/10 text-error border-error/30';
  } else if (status === 'community_verified') {
    statusText = 'Community Verified';
    statusClass = 'bg-brand-green-5 text-brand-green border-brand-green-15';
  } else if (status === 'owner_verified') {
    statusText = 'Owner Verified';
    statusClass = 'bg-brand-green-15 text-brand-green border-brand-green-40';
  }

  return (
    <div className={`overflow-hidden rounded-[24px] border-2 transition-all duration-300 bg-white ${
      isTopPick 
        ? "border-brand-green shadow-[0px_32px_64px_rgba(0,0,0,0.18)] card-lift relative z-10" 
        : "border-border-default shadow-[0px_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.10)]"
    }`}>
      {/* Top Zone: Identity with Premium Trust Header */}
      <div 
        className={`p-8 relative overflow-hidden ${isTopPick ? "bg-brand-green text-white" : "bg-surface-grey text-text-primary border-b border-border-default"}`}
      >
        {/* Next.js Image for LCP optimisation — replaces CSS background-image */}
        {plan.spot.image_url && (
          <>
            <Image
              src={plan.spot.image_url}
              alt={plan.spot.name}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 480px"
              priority={isTopPick}
            />
            <div className="absolute inset-0 bg-black/60 z-[1]" />
          </>
        )}
        
        <div className="relative z-10 flex justify-between items-start mb-6">
          <div className="flex flex-col gap-2">
            <span className={`px-2 py-1 border rounded-[6px] text-[10px] font-black uppercase tracking-wider w-fit ${isTopPick ? "bg-white/20 border-white/30 text-white" : statusClass}`}>
              {statusText}
            </span>
            <div className={`flex flex-col gap-0.5`}>
              <div className={`flex items-center gap-1 text-[11px] font-bold ${isTopPick || plan.spot.image_url ? "text-white/80" : "text-text-secondary"}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{Math.round(confidenceScore)}% Confidence</span>
              </div>
              <span className={`text-[9px] ${isTopPick || plan.spot.image_url ? "text-white/60" : "text-text-muted"}`}>
                Verified from: community receipts, scout submissions
              </span>
            </div>
          </div>
          <div className="text-right flex flex-col relative z-10">
            <p className={`${isTopPick || plan.spot.image_url ? "text-[52px] text-white" : "type-heading text-brand-green"} font-[900] leading-none`}>
              ₦{plan.totalCost.toLocaleString()}
            </p>
            <p className={`type-caption mt-1 ${isTopPick || plan.spot.image_url ? "text-white/60" : "text-text-muted"}`}>
              for {input.squadSize} {Number(input.squadSize) === 1 ? 'person' : 'people'}
            </p>
          </div>
        </div>
        
        <h3 className={`relative z-10 ${isTopPick || plan.spot.image_url ? "text-[22px] font-[800] text-white" : "type-heading text-text-primary"}`}>
          {plan.spot.name}
        </h3>
        
        <div className={`relative z-10 flex items-center gap-1.5 mt-2 type-caption ${isTopPick || plan.spot.image_url ? "text-white/80" : "text-text-muted"}`}>
          <MapPin className="w-[14px] h-[14px] shrink-0" />
          <span className="truncate">{plan.spot.address}</span>
        </div>
      </div>
      
      {/* Bottom Zone: Action */}
      <div className="p-8 space-y-6">
        {/* Primary Action */}
        <div className="w-full flex gap-3">
          <div className="flex-1">
            <WhatsAppCopyButton plan={plan} input={input} variant={isTopPick ? "filled" : "outlined"} />
          </div>
          <Button
            onClick={handleSavePlan}
            disabled={isSaving || isSaved}
            variant={isTopPick ? "default" : "outline"}
            aria-label={isSaved ? "Plan saved" : isSaving ? "Saving plan" : "Save plan"}
            className={`h-[56px] w-[56px] rounded-[16px] flex-shrink-0 flex items-center justify-center transition-colors ${
              isTopPick 
                ? (isSaved ? 'bg-white text-brand-green' : 'bg-white/10 text-white hover:bg-white/20 border-none') 
                : (isSaved ? 'bg-brand-green/10 border-transparent text-brand-green' : 'border-border-default hover:bg-surface-grey text-text-primary')
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isSaved ? (
              <Bookmark className="w-5 h-5 fill-current" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </Button>
        </div>

        {!isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="w-full md:hidden flex items-center justify-center gap-2 type-label text-brand-green py-5 mt-2 tap-feedback border border-brand-green-15 rounded-[12px]"
          >
            See full breakdown <ChevronDown className="w-4 h-4" />
          </button>
        )}

        <>
            {/* Cost Grid */}
            <div className={`${isExpanded ? "grid" : "hidden md:grid"} grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300`}>
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
            <div className={`${isExpanded ? "block" : "hidden md:block"} space-y-4 animate-in fade-in slide-in-from-top-2 duration-300`}>
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
            <div className={`${isExpanded ? "block" : "hidden md:block"} border border-border-default rounded-[16px] overflow-hidden bg-surface-grey/30`}>
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
                <div className="p-4 pt-0 border-t border-border-default/50 space-y-2 text-[11px] text-text-secondary animate-in fade-in slide-in-from-top-1 duration-300">
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
                    <span>{plan.explanation?.tax_transparency || `Taxes and fees included`}</span>
                  </div>
                  {/* Phase 3A: Transport assumption */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#008751] font-bold">✓</span>
                    <span>
                      Transport: ₦{plan.transportCost.toLocaleString()} round trip from your area
                    </span>
                  </div>
                  {/* Phase 3A: Data source label */}
                  {plan.explanation?.source_label && (
                    <div className="flex items-center gap-2">
                      <span className="text-[#008751] font-bold">✓</span>
                      <span>Pricing source: {plan.explanation.source_label}</span>
                    </div>
                  )}



                  <div className="pt-2 border-t border-border-default/50 text-[10px] text-gray-400">
                    Calculated using active menu entries &amp; transport rates. Bypasses static prompts.
                  </div>
                </div>
              )}
            </div>

            {/* Footer: User Feedback Loop */}
            <div className={`pt-6 border-t border-border-default ${isExpanded ? "flex" : "hidden md:flex"} flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300`}>
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

            {isExpanded && (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="w-full md:hidden flex items-center justify-center gap-2 type-label text-text-muted py-5 mt-4 border-t border-border-default tap-feedback"
              >
                Hide breakdown <ChevronUp className="w-4 h-4" />
              </button>
            )}
          </>
      </div>
    </div>
  );
}
