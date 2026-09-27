"use client";

import React from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, MapPin, Sparkles, ArrowRight, Check } from "lucide-react";
import { Spot } from "@/lib/types";
import { VenueImage } from "@/components/ui/VenueImage";
import { TrustBadge } from "@/components/ui/trust-badge";
import { deriveTrustIndicator, getVerificationText } from "@/lib/planning/presentation/decisionCardMapper";
import { buildVenuePlanUrl } from "@/lib/planning/buildVenuePlanUrl";

interface DiscoveryVenueCardProps {
  spot: Spot;
  squadSize: number;
  budget: number | null; // Total squad budget
  isSaved: boolean;
  onToggleSave: () => void;
  className?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  restaurant: { bg: "bg-[#008751]/10", text: "text-[#008751]" },
  bar: { bg: "bg-purple-100", text: "text-purple-700" },
  cafe: { bg: "bg-sky-100", text: "text-sky-700" },
  activity: { bg: "bg-orange-100", text: "text-orange-700" },
  beach: { bg: "bg-teal-100", text: "text-teal-700" },
  nature: { bg: "bg-emerald-100", text: "text-emerald-700" },
  entertainment: { bg: "bg-indigo-100", text: "text-indigo-700" },
  experience: { bg: "bg-pink-100", text: "text-pink-700" },
};

export function DiscoveryVenueCard({
  spot,
  squadSize,
  budget,
  isSaved,
  onToggleSave,
  className = "",
}: DiscoveryVenueCardProps) {
  const pricePerPerson = spot.price_per_person || 12000;
  const estimatedTotal = pricePerPerson * squadSize;
  const budgetRemaining = budget ? budget - estimatedTotal : null;
  const fitsBudget = budget ? estimatedTotal <= budget : true;

  const areaName = spot.areas?.name || spot.address_slug || "Lagos";
  const areaSlug = spot.areas?.slug || spot.address_slug || "lagos";
  const categoryKey = (spot.category || "restaurant").toLowerCase();
  const catStyle = CATEGORY_COLORS[categoryKey] || { bg: "bg-gray-100", text: "text-gray-800" };

  const confidenceScore = spot.computed_confidence_score || 75;
  const trustIndicator = deriveTrustIndicator(confidenceScore);
  const verificationText = getVerificationText(spot.price_updated_at);

  const trustStatus = trustIndicator.level === "high" 
    ? "verified" 
    : trustIndicator.level === "medium" 
      ? "estimated" 
      : "pending";

  const forgeUrl = buildVenuePlanUrl({
    venueId: spot.id,
    area: areaSlug,
    squad: squadSize,
    budget: budget || (spot.price_per_person * squadSize),
    vibe: spot.vibe_tags?.[0] || "chill",
  });

  const firstVibe = spot.vibe_tags?.slice(0, 2).join(" • ") || "Vetted Outing Spot";

  const venueHeroImage = spot.cover_url || spot.image_url || (spot.gallery_urls && spot.gallery_urls[0]) || null;

  return (
    <article
      className={`group bg-white rounded-[28px] border border-[#EAE4DC] hover:border-[#008751]/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden relative ${className}`}
    >
      {/* Top Image Section (Aspect 16:10) */}
      <div className="relative aspect-[16/10] w-full bg-[#F4F1EB] overflow-hidden shrink-0">
        <Link 
          href={`/venue/${spot.id}`} 
          className="absolute inset-0 block"
          tabIndex={-1}
          aria-hidden="true"
        >
          <VenueImage
            src={venueHeroImage}
            alt={`${spot.name} in ${areaName}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            fallbackCategory={spot.category}
            className="group-hover:scale-103 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

        {/* Top Badges Row */}
        <div className="absolute top-3 inset-x-3 flex items-start justify-between z-10 pointer-events-none">
          <span 
            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-xs ${catStyle.bg} ${catStyle.text}`}
          >
            {spot.category || "Spot"}
          </span>

          <TrustBadge
            status={trustStatus}
            freshnessText={verificationText}
            size="sm"
            className="shadow-sm backdrop-blur-md bg-white/95 text-midnight-lagoon border-none"
          />
        </div>

        {/* Gallery Thumbnails Overlay (if multiple photos available) */}
        {spot.gallery_urls && spot.gallery_urls.length > 1 && (
          <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 z-10 pointer-events-auto">
            {spot.gallery_urls.slice(0, 3).map((imgUrl, i) => (
              <div 
                key={i} 
                className="relative w-8 h-8 rounded-md border border-white/90 overflow-hidden shadow-xs bg-black/30 shrink-0"
              >
                <VenueImage 
                  src={imgUrl} 
                  alt={`${spot.name} view ${i+1}`} 
                  fill 
                  sizes="32px" 
                  className="object-cover" 
                />
              </div>
            ))}
            {spot.gallery_urls.length > 3 && (
              <span className="w-8 h-8 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-black flex items-center justify-center border border-white/90 shadow-xs">
                +{spot.gallery_urls.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4 text-left">
        <div>
          {/* Header Row: Title & Save Bookmark */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <Link 
                href={`/venue/${spot.id}`} 
                className="group-hover:text-[#008751] transition-colors block"
              >
                <h3 className="text-xl font-black text-midnight-lagoon tracking-tight truncate">
                  {spot.name}
                </h3>
              </Link>
              <p className="text-xs text-text-muted flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#008751] shrink-0" />
                <span className="font-bold text-text-secondary truncate">{areaName}</span>
                <span>•</span>
                <span className="truncate">{spot.address}</span>
              </p>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={onToggleSave}
              aria-label={isSaved ? `Remove ${spot.name} from saved` : `Save ${spot.name}`}
              className={`p-2.5 rounded-xl border transition-all shrink-0 tap-feedback cursor-pointer ${
                isSaved
                  ? "bg-[#008751]/10 border-[#008751] text-[#008751]"
                  : "bg-surface-grey border-transparent text-text-muted hover:text-midnight-lagoon hover:bg-gray-200"
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
          </div>

          {/* Pricing Highlight Container */}
          <div className="mt-3.5 p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#EAE4DC] flex items-baseline justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
                {squadSize === 1 ? "Estimated Outing" : `Estimated for Squad (${squadSize})`}
              </span>
              <div className="text-2xl font-black text-[#008751] tracking-tight">
                ₦{estimatedTotal.toLocaleString("en-NG")}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-text-muted block">Per Person</span>
              <span className="text-xs font-black text-midnight-lagoon">
                ~₦{pricePerPerson.toLocaleString("en-NG")}
              </span>
            </div>
          </div>

          {/* Budget Fit Indicator (when budget entered) */}
          {budget && (
            <div className="mt-2 text-[11px] font-bold">
              {fitsBudget ? (
                <span className="text-[#008751] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Fits your ₦{budget.toLocaleString("en-NG")} target</span>
                  {budgetRemaining && budgetRemaining > 0 && (
                    <span className="text-text-muted">(₦{budgetRemaining.toLocaleString("en-NG")} left)</span>
                  )}
                </span>
              ) : (
                <span className="text-amber-700">
                  ₦{Math.abs(budgetRemaining || 0).toLocaleString("en-NG")} over target budget
                </span>
              )}
            </div>
          )}

          {/* Context Snippet */}
          <div className="mt-3 pt-3 border-t border-[#EAE4DC]/60 flex items-center justify-between text-xs">
            <span className="font-bold text-text-secondary line-clamp-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#008751] shrink-0" />
              <span>{firstVibe}</span>
            </span>
            <span className="text-[10px] font-bold text-text-muted shrink-0">
              {verificationText}
            </span>
          </div>
        </div>

        {/* Action Buttons Row — Primary Plan, Secondary View Venue */}
        <div className="pt-2 flex items-center gap-2.5">
          <Link
            href={`/venue/${spot.id}`}
            className="px-4 py-3 rounded-xl border border-[#EAE4DC] hover:border-midnight-lagoon bg-white hover:bg-surface-grey text-midnight-lagoon text-center text-xs font-bold uppercase tracking-wider transition-colors tap-feedback shrink-0"
          >
            View Venue
          </Link>

          <Link
            href={forgeUrl}
            aria-label={`Plan outing at ${spot.name}`}
            className="flex-1 py-3 px-4 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-center text-xs font-black uppercase tracking-wider transition-all shadow-xs tap-feedback flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Plan Outing</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
