"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Plan, ForgeInput } from "@/lib/types";
import { useAuth } from "../providers/AuthProvider";
import { savePlan } from "@/lib/actions/savePlan";
import { AnalyticsService } from "@/lib/services/analytics/analyticsService";
import WhatsAppCopyButton from "../WhatsAppCopyButton";

export function PlanActions({
  plan,
  input,
  initialPlanId
}: {
  plan: Plan;
  input: ForgeInput;
  initialPlanId?: string;
}) {
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
        toast.success("Plan saved to your Saved Plans.");
        AnalyticsService.track('plan_saved', {
          session_id: '00000000-0000-0000-0000-000000000000',
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

  return (
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
  );
}

