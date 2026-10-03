"use client";

import React from "react";
import Link from "next/link";
import { Venue } from "@/lib/types";
import { Heart, ArrowRight } from "lucide-react";
import { useSavedSpots } from "@/hooks/useSavedSpots";
import { buildVenuePlanUrl } from "@/lib/planning/buildVenuePlanUrl";
import { knownPerPerson, suggestPlanBudget } from "@/lib/venue/venueSpend";
import { toast } from "sonner";

interface VenueMobileStickyCTAProps {
  venue: Venue;
  areaSlug?: string;
  coverImage?: string;
  fromPlan?: boolean;
  planSquad?: number;
  planBudget?: number;
  planVibe?: string;
}

export function VenueMobileStickyCTA({
  venue,
  areaSlug = "ikeja",
  coverImage,
  fromPlan,
  planSquad,
  planBudget,
  planVibe,
}: VenueMobileStickyCTAProps) {
  const { isSaved, saveSpot, removeSpot } = useSavedSpots();
  const saved = isSaved(venue.id);

  const perPerson = knownPerPerson(venue);

  const targetSquad = planSquad && planSquad > 0 ? planSquad : 2;
  const targetBudget = planBudget && planBudget > 0 ? planBudget : suggestPlanBudget(perPerson, targetSquad);
  const targetVibe = planVibe || venue.vibe_tags?.[0] || "chill";

  const forgeUrl = buildVenuePlanUrl({
    venueId: venue.id,
    area: areaSlug,
    squad: targetSquad,
    budget: targetBudget,
    vibe: targetVibe,
  });

  const handleToggleSave = () => {
    if (saved) {
      removeSpot(venue.id);
      toast.success(`${venue.name} removed from your Shortlist`);
    } else {
      saveSpot({
        id: venue.id,
        name: venue.name,
        price_per_person: perPerson ?? 0,
        image_url: coverImage || venue.cover_url || "",
        vibe_tags: venue.vibe_tags || ["Chill"],
        address: venue.address,
        address_slug: areaSlug,
        area_id: venue.district_id || areaSlug,
        transport_matrix: {},
        is_featured: venue.is_featured || false,
        active: venue.active,
        computed_confidence_score: venue.computed_confidence_score || 80,
      });
      toast.success(`${venue.name} added to your Shortlist`);
    }
  };

  return (
    <aside
      aria-label="Venue mobile actions"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#EAE4DC] px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_30px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        <button
          type="button"
          onClick={handleToggleSave}
          aria-label={saved ? "Remove from Shortlist" : "Add to Shortlist"}
          aria-pressed={saved}
          className={`h-12 w-12 rounded-xl flex items-center justify-center border transition-all tap-feedback shrink-0 ${
            saved
              ? "bg-red-50 border-red-200 text-red-600"
              : "bg-surface-grey border-[#EAE4DC] text-midnight-lagoon"
          }`}
        >
          <Heart className={`w-5 h-5 ${saved ? "fill-[#E54D2E] text-[#E54D2E]" : ""}`} />
        </button>

        <Link
          href={forgeUrl}
          className="flex-1 h-12 rounded-xl bg-[#111111] hover:bg-[#2a2a2a] text-[#F9E828] text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-between px-4 shadow-sm transition-all tap-feedback"
        >
          <div className="text-left">
            <p className="leading-none">Plan this spot</p>
            <p className="text-[10px] text-white/70 mt-0.5 font-mono normal-case tracking-normal font-normal">
              {perPerson !== null ? `~₦${perPerson.toLocaleString("en-NG")} / person` : "Price not verified yet"}
            </p>
          </div>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
