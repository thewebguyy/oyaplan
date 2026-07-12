"use client";

import { useState } from "react";
import Image from "next/image";
import { Plan, ForgeInput } from "@/lib/types";
import { submitPriceFlag } from "@/lib/actions/submitPriceFlag";
import WhatsAppCopyButton from "./WhatsAppCopyButton";
import { useAuth } from "./providers/AuthProvider";
import { savePlan } from "@/lib/actions/savePlan";
import { AnalyticsService } from "@/lib/services/analytics/analyticsService";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Bookmark, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PlanCardProps {
  plan: Plan;
  input: ForgeInput;
  planId?: string;
  isTopPick?: boolean;
  originalBudget?: number;
}

export default function PlanCard({ plan, input, planId: initialPlanId, isTopPick = false, originalBudget }: PlanCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [planId, setPlanId] = useState<string | undefined>(initialPlanId);
  const { openModal } = useAuth();

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
        toast.success("Plan saved to your dashboard.");
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

  const diff = originalBudget ? originalBudget - plan.totalCost : 0;
  
  // Format the assurance string
  let assuranceStr = "Comfortably within your budget.";
  if (diff < 0) assuranceStr = "Slightly above your original budget.";
  else if (diff < 2000) assuranceStr = "Right on budget.";

  return (
    <div className={`w-full bg-white transition-all duration-300 overflow-hidden ${
      isTopPick 
        ? "border-none shadow-[0px_24px_48px_rgba(0,0,0,0.06)] rounded-[32px]" 
        : "border border-border-default shadow-sm hover:shadow-md rounded-[24px]"
    }`}>
      
      {/* Editorial Header */}
      <div className={`px-6 sm:px-10 pt-10 pb-8 ${isTopPick ? 'bg-surface-grey/50' : 'bg-white'}`}>
        <p className="text-[11px] sm:text-[13px] font-[800] tracking-[0.15em] uppercase text-text-muted mb-4">
          {getHeadline()}
        </p>
        
        <h2 className="text-[40px] sm:text-[56px] font-[900] tracking-tight leading-none text-text-primary mb-3">
          Around ₦{plan.totalCost.toLocaleString()}
        </h2>
        
        <p className="type-body text-text-secondary">
          {assuranceStr}
        </p>
      </div>

      <div className="w-full h-px bg-border-default/50" />

      {/* Plan Ingredients */}
      <div className="px-6 sm:px-10 py-8 space-y-8">
        
        {/* Ingredient: Venue */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
          <div className="space-y-1">
            <p className="type-caption text-text-muted uppercase tracking-wider font-[700]">
              {plan.spot.category || 'Location'}
            </p>
            <p className="text-[20px] sm:text-[24px] font-[600] text-text-primary">
              {plan.spot.name}
            </p>
            {plan.spot.image_url && (
              <div className="w-full sm:w-[120px] h-[80px] mt-3 rounded-[12px] overflow-hidden relative border border-border-default">
                <Image 
                  src={plan.spot.image_url} 
                  alt={plan.spot.name} 
                  fill 
                  className="object-cover"
                />
              </div>
            )}
          </div>
          
          <div className="text-left sm:text-right">
            <p className="type-body text-text-secondary">
              ₦{plan.foodCost.toLocaleString()} est.
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-border-default/30" />

        {/* Ingredient: Transport */}
        <div className="flex items-center justify-between group">
          <div className="space-y-1">
            <p className="type-caption text-text-muted uppercase tracking-wider font-[700]">
              Transport
            </p>
            <p className="text-[20px] sm:text-[24px] font-[600] text-text-primary">
              Ride-hailing
            </p>
          </div>
          <div className="text-right">
            <p className="type-body text-text-secondary">
              ₦{plan.transportCost.toLocaleString()} est.
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-border-default/30" />

        {/* Ingredient: Duration */}
        <div className="flex items-center justify-between group">
          <div className="space-y-1">
            <p className="type-caption text-text-muted uppercase tracking-wider font-[700]">
              Duration
            </p>
            <p className="text-[20px] sm:text-[24px] font-[600] text-text-primary">
              2–3 hours
            </p>
          </div>
        </div>

      </div>

      <div className="w-full h-px bg-border-default/50" />

      {/* Trust Context */}
      <div className="px-6 sm:px-10 py-6 bg-surface-grey/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="type-caption text-text-secondary">
            {plan.spot.price_updated_at ? 'Updated this week' : 'Estimated from recent venue pricing'}
          </p>
          <p className="text-[11px] text-text-muted">
            Includes all taxes and fees.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={handleSavePlan}
            disabled={isSaving || isSaved}
            variant="outline"
            className={`h-12 px-6 rounded-[12px] type-label flex-1 sm:flex-none transition-colors border-border-default text-text-primary hover:bg-surface-grey ${isSaved ? '!bg-brand-green/10 !text-brand-green !border-transparent' : ''}`}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : isSaved ? (
              <Bookmark className="w-4 h-4 mr-2 fill-current" />
            ) : (
              <Bookmark className="w-4 h-4 mr-2" />
            )}
            {isSaved ? "Saved" : "Save Plan"}
          </Button>

          {planId ? (
            <Link href={`/plan/${planId}`} className="flex-1 sm:flex-none">
              <Button className="w-full h-12 px-6 rounded-[12px] type-label bg-text-primary hover:bg-black text-white border-none shadow-none flex items-center justify-center">
                View Plan <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <div className="flex-1 sm:flex-none">
              <WhatsAppCopyButton plan={plan} input={input} variant="filled" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
