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
import { EditorialBlock } from "./ui/EditorialBlock";

interface EditorialPlanProps {
  plan: Plan;
  input: ForgeInput;
  planId?: string;
  isTopPick?: boolean;
  originalBudget?: number;
}

export default function EditorialPlan({ plan, input, planId: initialPlanId, isTopPick = false, originalBudget }: EditorialPlanProps) {
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
  
  // Format the assurance string (for C3 "Why we'd recommend this" section)
  let budgetAssurance = "Typically fits within your budget.";
  if (originalBudget) {
    if (diff < 0) {
      budgetAssurance = `Slightly above your original budget (by ~₦${Math.abs(diff).toLocaleString()}).`;
    } else if (diff < 2000) {
      budgetAssurance = "Fits your budget exactly.";
    } else {
      budgetAssurance = "Typically fits within your budget.";
    }
  }

  return (
    <div className={`w-full bg-white transition-all duration-300 overflow-hidden ${
      isTopPick 
        ? "border-none shadow-[0px_24px_48px_rgba(0,0,0,0.06)] rounded-[32px]" 
        : "border border-border-default shadow-sm hover:shadow-md rounded-[24px]"
    }`}>
      
      {/* Editorial Header */}
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

      <div className="w-full h-px bg-border-default/50" />

      {/* Budget Breakdown (Trust Sprint 2) */}
      <div className="px-6 sm:px-10 py-8 bg-white space-y-6">
        <div>
          <p className="type-caption text-text-muted uppercase tracking-wider font-[700] mb-1">Estimated Total</p>
          <p className="text-[32px] font-[600] font-display text-text-primary leading-none">₦{plan.totalCost.toLocaleString()}</p>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between type-body text-text-secondary">
            <span>Food</span>
            <span className="type-price">₦{plan.foodCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between type-body text-text-secondary">
            <span>Transport estimate</span>
            <span className="type-price">₦{plan.transportCost.toLocaleString()}</span>
          </div>
        </div>

        {originalBudget && originalBudget > 0 && diff > 0 && (
          <div className="pt-5 border-t border-border-default/50">
            <p className="type-caption text-text-muted uppercase tracking-wider font-[700] mb-1">Remaining Budget</p>
            <p className="text-[20px] font-[600] text-brand-green">About ₦{diff.toLocaleString()}</p>
          </div>
        )}
      </div>
      
      <div className="w-full h-px bg-border-default/50" />

      {/* Why we'd recommend this (Trust Sprint 1) */}
      <div className="px-6 sm:px-10 py-8 bg-surface-grey/20">
        <div className="mb-6">
          <h3 className="type-ui-label text-text-primary mb-2">Your plan</h3>
          <p className="type-body text-text-secondary">
            {[
              input.vibe ? <span className="capitalize" key="vibe">{input.vibe}</span> : null,
              input.squadSize ? `${input.squadSize} people` : null,
              originalBudget && originalBudget > 0 ? `Around ₦${originalBudget.toLocaleString()}` : null,
              input.startArea && input.startArea !== "Anywhere" ? input.startArea : null
            ].filter(Boolean).map((item, i, arr) => (
              <span key={i}>
                {item}
                {i < arr.length - 1 && <span className="mx-2 text-text-muted">•</span>}
              </span>
            ))}
          </p>
        </div>
        
        <h3 className="type-ui-label text-text-primary mb-4">Why we'd recommend this</h3>
        <ul className="space-y-4 type-body text-text-secondary">
          <li className="flex items-start gap-3">
            <span className="text-brand-green mt-0.5">•</span>
            <span>{budgetAssurance}</span>
          </li>
          {input.vibe && (
            <li className="flex items-start gap-3">
              <span className="text-brand-green mt-0.5">•</span>
              <span>It's a strong choice for a {input.vibe.toLowerCase()} outing.</span>
            </li>
          )}
          {plan.whyItFits && plan.whyItFits.length > 5 && (
            <li className="flex items-start gap-3">
              <span className="text-brand-green mt-0.5">•</span>
              <span>{plan.whyItFits}</span>
            </li>
          )}
        </ul>
      </div>

      <div className="w-full h-px bg-border-default/50" />

      {/* Trust Context */}
      <div className="px-6 sm:px-10 py-6 bg-surface-grey/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="type-caption font-[600] text-text-primary">
            {plan.spot.price_updated_at ? 'Prices verified this week.' : 'Based on recent venue pricing.'}
          </p>
          <p className="type-caption text-text-muted">
            Estimate includes: Food • Drinks • Ride-hailing
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
