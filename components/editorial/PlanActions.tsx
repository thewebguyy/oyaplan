"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Plan, ForgeInput } from "@/lib/types";
import { savePlan } from "@/lib/actions/savePlan";
import { saveVenueAction } from "@/lib/actions/savedVenueActions";
import { createShareablePlan } from "@/lib/actions/sharePlan";
import { trackEvent } from "@/lib/analytics/trackClient";
import WhatsAppCopyButton from "../WhatsAppCopyButton";
import { triggerMoment } from "@/components/ui/moment-of-delight";
import { enqueueFeedback } from "@/lib/storage/feedbackQueue";

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
          window.dispatchEvent(new Event("oyaplan_saved_spots_updated"));
        }
      } catch { /* ignore localStorage issues */ }

      // Also ensure the venue is synchronized with server
      saveVenueAction(plan.spot.id).catch(() => {});

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
          
          enqueueFeedback({
            planId: currentPlanId,
            spotId: plan.spot.id,
            spotName: plan.spot.name,
            estimatedTotal: plan.totalCost
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
        className={`w-full md:w-auto h-12 px-6 rounded-xl type-label flex-1 md:flex-none transition-all border-2 border-[#111111] text-[#111111] bg-white hover:bg-[#FAF7F2] shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] font-black uppercase tracking-wider text-xs ${isSaved ? '!bg-[#008751]/10 !text-[#008751] !border-[#008751] !shadow-none' : ''}`}
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
          <Button className="w-full h-12 px-6 rounded-xl type-label bg-[#111111] hover:bg-[#1D1D1F] text-[#F9E828] border-2 border-[#111111] shadow-[3px_3px_0px_#008751] active:translate-x-[2px] active:translate-y-[2px] font-black uppercase tracking-wider text-xs flex items-center justify-center">
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

