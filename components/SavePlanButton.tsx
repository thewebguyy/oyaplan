'use client';

import { useState } from "react";
import { useAuth } from "./providers/AuthProvider";
import { savePlan } from "@/lib/actions/savePlan";
import { Button } from "./ui/button";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics/trackClient";
import { triggerMoment } from "@/components/ui/moment-of-delight";

interface SavePlanButtonProps {
  planId: string;
  variant?: "outline" | "ghost" | "default" | "filled";
  showLabel?: boolean;
  className?: string;
}

export default function SavePlanButton({
  planId,
  variant = "outline",
  showLabel = false,
  className = "",
}: SavePlanButtonProps) {
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
        toast.success("Added to your saved plans.");
        triggerMoment("plan_saved");
        trackEvent("plan_saved", {
          category: "Engagement",
          shared_plan_id: planId,
          version: "1.0",
        });
      } else if (res.error === "unauthorized") {
        openModal("Sign in to save plans", `/plan/${planId}`);
      } else {
        toast.error("We couldn't save this plan right now. Try again.");
      }
    } catch (e) {
      console.error(e);
      toast.error("We couldn't save this plan right now. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (showLabel) {
    return (
      <Button
        onClick={handleSavePlan}
        disabled={isSaving || isSaved}
        aria-label={isSaved ? "Plan saved to your account" : isSaving ? "Saving plan" : "Save this plan"}
        className={`h-12 w-full rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all tap-feedback cursor-pointer shadow-xs ${
          isSaved
            ? "bg-[#008751]/10 text-[#008751] border border-[#008751]/30 hover:bg-[#008751]/15"
            : "bg-white hover:bg-surface-grey border border-border-default text-midnight-lagoon"
        } ${className}`}
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSaved ? (
          <Bookmark className="w-4 h-4 fill-current text-[#008751]" />
        ) : (
          <Bookmark className="w-4 h-4 text-midnight-lagoon" />
        )}
        <span>{isSaving ? "Saving..." : isSaved ? "Plan Saved" : "Save Plan"}</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleSavePlan}
      disabled={isSaving || isSaved}
      variant={variant === "filled" ? "default" : variant}
      aria-label={isSaved ? "Plan saved" : isSaving ? "Saving plan" : "Save plan"}
      className={`h-[56px] w-[56px] rounded-[12px] flex-shrink-0 flex items-center justify-center transition-colors ${
        isSaved
          ? "bg-brand-green/10 border-transparent text-brand-green"
          : "border-border-default hover:bg-surface-grey text-text-primary"
      } ${className}`}
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
