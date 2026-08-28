"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Plan, ForgeInput } from "@/lib/types";
import { savePlan } from "@/lib/actions/savePlan";
import { createShareablePlan } from "@/lib/actions/sharePlan";
import { trackEvent } from "@/lib/analytics/trackClient";
import WhatsAppCopyButton from "../WhatsAppCopyButton";
import { triggerMoment } from "@/components/ui/moment-of-delight";

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

  const handleSavePlan = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSaving || isSaved) return;
    
    setIsSaving(true);
    try {
      // 1. Immediately save to localStorage (anonymous-first invariant)
      try {
        const savedSpots = JSON.parse(localStorage.getItem("oyaplan_saved_ideas") || "[]");
        if (!savedSpots.some((s: { id: string }) => s.id === plan.spot.id)) {
          localStorage.setItem("oyaplan_saved_ideas", JSON.stringify([...savedSpots, plan.spot]));
        }
      } catch { /* ignore localStorage issues */ }

      setIsSaved(true);
      toast.success("Plan saved for later 📌");
      triggerMoment("plan_saved");

      // 2. Silently attempt server-side share/save sync if possible
      let currentPlanId = planId;
      if (!currentPlanId) {
        const shareRes = await createShareablePlan(plan, input);
        if (shareRes.success && shareRes.id) {
          currentPlanId = shareRes.id;
          setPlanId(currentPlanId);
        }
      }

      if (currentPlanId) {
        const res = await savePlan(currentPlanId);
        if (res.success) {
          trackEvent('plan_saved', {
            category: 'Engagement',
            shared_plan_id: currentPlanId,
            spot_id: plan.spot.id,
            total_cost: plan.totalCost,
            version: '1.0'
          });
        }
      }
    } catch (e) {
      console.error(e);
      // Fallback: still treat as saved locally
      setIsSaved(true);
      toast.success("Added to your plans.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-start gap-3 w-full">
      <Button
        onClick={handleSavePlan}
        disabled={isSaving || isSaved}
        variant="outline"
        className={`w-full md:w-auto h-12 px-6 rounded-[12px] type-label flex-1 md:flex-none transition-colors border-border-default text-text-primary hover:bg-surface-grey ${isSaved ? '!bg-brand-green/10 !text-brand-green !border-transparent' : ''}`}
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
        <Link href={`/plan/${planId}`} className="w-full md:w-auto flex-1 md:flex-none">
          <Button className="w-full h-12 px-6 rounded-[12px] type-label bg-midnight-lagoon hover:bg-charcoal text-white border-none shadow-none flex items-center justify-center">
            View Plan <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      ) : (
        <div className="w-full md:w-auto flex-1 md:flex-none">
          <WhatsAppCopyButton plan={plan} input={input} variant="filled" />
        </div>
      )}
    </div>
  );
}

