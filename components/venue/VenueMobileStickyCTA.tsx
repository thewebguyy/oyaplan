"use client";

import React from "react";
import Link from "next/link";
import { Venue } from "@/lib/types";
import { Heart, ArrowRight } from "lucide-react";
import { useSavedSpots } from "@/hooks/useSavedSpots";
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

  const typicalCost = venue.derived_typical_cost > 0 ? venue.derived_typical_cost : 18000;
  const low2 = Math.round((typicalCost * 1.8) / 1000) * 1000;

  const targetSquad = planSquad || 2;
  const targetBudget = planBudget || low2;
  const targetVibe = planVibe || venue.vibe_tags?.[0] || "chill";

  const forgeUrl = `/forge?pinned=${venue.id}&area=${areaSlug}&squad=${targetSquad}&budget=${targetBudget}&vibe=${encodeURIComponent(targetVibe)}&fresh=true`;

  const handleToggleSave = () => {
    if (saved) {
      removeSpot(venue.id);
      toast.success(`${venue.name} removed from Saved Spots`);
    } else {
      saveSpot({
        id: venue.id,
        name: venue.name,
        price_per_person: typicalCost,
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
      toast.success(`${venue.name} saved!`);
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE4DC] px-4 py-3 pb-safe shadow-lg">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggleSave}
          aria-label={saved ? "Remove from saved spots" : "Save this spot"}
          className={`h-12 w-12 rounded-xl flex items-center justify-center border transition-all tap-feedback shrink-0 ${
            saved
              ? "bg-red-50 border-red-200 text-red-600"
              : "bg-surface-grey border-[#EAE4DC] text-midnight-lagoon"
          }`}
        >
          <Heart className={`w-5 h-5 ${saved ? "fill-red-600 text-red-600" : ""}`} />
        </button>

        <Link
          href={forgeUrl}
          className="flex-1 h-12 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-xs sm:text-sm font-bold flex items-center justify-between px-4 shadow-sm transition-all tap-feedback"
        >
          <div className="text-left">
            <p className="leading-none">Plan This Venue</p>
            <p className="text-[10px] text-white/80 mt-0.5 font-normal">~₦{typicalCost.toLocaleString("en-NG")} / person</p>
          </div>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
