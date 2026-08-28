'use client';

import { useState } from "react";
import { useAuth } from "./providers/AuthProvider";
import { savePlan } from "@/lib/actions/savePlan";
import { Button } from "./ui/button";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics/trackClient";
import { triggerMoment } from "@/components/ui/moment-of-delight";

export default function SavePlanButton({ planId, variant = "outline" }: { planId: string, variant?: "outline" | "ghost" | "default" | "filled" }) {
  const { session, openModal } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSavePlan = async () => {
    if (!session) {
      openModal("Sign in to save plans", `/plan/${planId}`);
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await savePlan(planId);
      if (res.success) {
        setIsSaved(true);
        toast.success("Added to your plans.");
        triggerMoment("plan_saved");
        trackEvent('plan_saved', {
          category: 'Engagement',
          shared_plan_id: planId,
          version: '1.0'
        });
      } else if (res.error === 'unauthorized') {
        openModal("Sign in to save plans", `/plan/${planId}`);
      } else {
        toast.error("We couldn't load this right now. Try again.");
      }
    } catch (e) {
      console.error(e);
      toast.error("We couldn't load this right now. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      onClick={handleSavePlan}
      disabled={isSaving || isSaved}
      variant={variant === "filled" ? "default" : variant}
      aria-label={isSaved ? "Plan saved" : isSaving ? "Saving plan" : "Save plan"}
      className={`h-[56px] w-[56px] rounded-[12px] flex-shrink-0 flex items-center justify-center transition-colors ${
        isSaved ? 'bg-brand-green/10 border-transparent text-brand-green' : 'border-border-default hover:bg-surface-grey text-text-primary'
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
  );
}

