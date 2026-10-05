"use client";

import React from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, MapPin, Sparkles, ArrowRight, Check } from "lucide-react";
import { Spot } from "@/lib/types";
import { VenueImage } from "@/components/ui/VenueImage";
import { TrustBadge } from "@/components/ui/trust-badge";
import { deriveTrustIndicator, getVerificationText } from "@/lib/planning/presentation/decisionCardMapper";
import { buildVenuePlanUrl } from "@/lib/planning/buildVenuePlanUrl";
import { knownPerPerson, venueFoodTotal, suggestPlanBudget } from "@/lib/venue/venueSpend";
import { ShortlistStamp } from "@/components/motion/ShortlistStamp";
import { getTemporaryTransportEstimate } from "@/lib/planning/temporaryTransport";

interface DiscoveryVenueCardProps {
  spot: Spot;
  squadSize: number;
  budget: number | null; // Total squad budget
  isSaved: boolean;
  onToggleSave: () => void;
  onOpenReceipt?: () => void;
  className?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  restaurant: { bg: "bg-[#F6F6F2]", text: "text-[#111111]" },
  bar: { bg: "bg-purple-100", text: "text-purple-700" },
  cafe: { bg: "bg-sky-100", text: "text-sky-700" },
  activity: { bg: "bg-orange-100", text: "text-orange-700" },
  beach: { bg: "bg-teal-100", text: "text-teal-700" },
  nature: { bg: "bg-emerald-100", text: "text-emerald-700" },
  entertainment: { bg: "bg-indigo-100", text: "text-indigo-700" },
  experience: { bg: "bg-pink-100", text: "text-pink-700" },
};

function getWhatThisCovers(category?: string, hasFood?: boolean | null, price?: number | null): string {
  const cat = (category || "").toLowerCase();
  if (hasFood === false) {
    return "Covers: Entry / activity pass + service";
  }
  if (cat === "bar" || cat === "lounge" || cat === "pub") {
    return "Covers: 2 Drinks + Small chops + Tax";
  }
  if (cat === "cafe" || cat === "bakery") {
    return "Covers: 1 Coffee / Drink + 1 Pastry + Tax";
  }
  if (cat === "beach") {
    return "Covers: Beach access + 2 Drinks + Tax";
  }
  if (cat === "activity" || cat === "experience" || cat === "entertainment") {
    return "Covers: Activity session + Refreshments";
  }
  if (price && price >= 30000) {
    return "Covers: 2 Mains + 2 Premium cocktails + Tax & Service";
  }
  return "Covers: 1 Main + 1 Drink + Tax & Service";
}

export function DiscoveryVenueCard({
  spot,
  squadSize,
  budget,
  isSaved,
  onToggleSave,
  onOpenReceipt,
  className = "",
}: DiscoveryVenueCardProps) {
  const pricePerPerson = knownPerPerson({ derived_typical_cost: spot.price_per_person });
  const estimatedFoodTotal = pricePerPerson !== null ? venueFoodTotal(pricePerPerson, squadSize) : null;
  const areaName = spot.areas?.name || spot.address_slug || "Lagos";
  const areaSlug = spot.areas?.slug || spot.address_slug || "lagos";
  const transportInfo = getTemporaryTransportEstimate(spot.areas?.slug || spot.address_slug || spot.address || areaSlug);

  const estimatedTotal = estimatedFoodTotal !== null ? estimatedFoodTotal + transportInfo.cost : null;
  const budgetRemaining = budget && estimatedTotal !== null ? budget - estimatedTotal : null;
  const fitsBudget = budget && estimatedTotal !== null ? estimatedTotal <= budget : true;
  const whatThisCovers = getWhatThisCovers(spot.category, spot.has_food, pricePerPerson);
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
    budget: budget || suggestPlanBudget(pricePerPerson, squadSize),
    vibe: spot.vibe_tags?.[0] || "chill",
  });

  const firstVibe = spot.vibe_tags?.slice(0, 2).join(" • ") || "Vetted Outing Spot";

  const venueHeroImage = spot.cover_url || spot.image_url || (spot.gallery_urls && spot.gallery_urls[0]) || null;
  const secondaryImage = (spot.gallery_urls && spot.gallery_urls.find((u) => u && u !== venueHeroImage)) || null;

  const [showStamp, setShowStamp] = React.useState(false);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSaved) {
      setShowStamp(true);
      setTimeout(() => setShowStamp(false), 1200);
    }
    onToggleSave();
  };

  return (
    <article
      className={`group bg-white sm:rounded-[20px] rounded-none border-y sm:border border-[#E5E5DE] hover:border-[#111111] -mx-4 sm:mx-0 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden relative font-sans ${className}`}
    >
      {/* Shortlist Save Stamp Impact Overlay */}
      {showStamp && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <ShortlistStamp isVisible={showStamp} />
        </div>
      )}

      {/* Top Image Section (Aspect 16:9 for media-rich editorial presentation) */}
      <div className="relative aspect-[16/9] w-full bg-[#F6F6F2] overflow-hidden shrink-0">
        <Link 
          href={`/venue/${spot.id}`} 
          className="absolute inset-0 block overflow-hidden"
          tabIndex={-1}
          aria-hidden="true"
        >
          <VenueImage
            src={venueHeroImage}
            alt={`${spot.name} in ${areaName}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            fallbackCategory={spot.category}
            className={`transition-all duration-700 ease-out group-hover:scale-105 ${
              secondaryImage ? "group-hover:opacity-0" : ""
            }`}
          />
          {secondaryImage && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out pointer-events-none">
              <VenueImage
                src={secondaryImage}
                alt={`${spot.name} atmosphere in ${areaName}`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                fallbackCategory={spot.category}
                className="scale-105 transition-transform duration-700 ease-out"
              />
            </div>
          )}
        </Link>

        {/* Subtle Dark Gradient Overlay for bottom-left cost readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

        {/* Top Badges Row — Max 2 Badges */}
        <div className="absolute top-3 inset-x-3 flex items-start justify-between z-10 pointer-events-none">
          <span 
            className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-xs bg-[#111111] text-[#F9E828]"
          >
            {spot.category || "Spot"}
          </span>

          <TrustBadge
            status={trustStatus}
            freshnessText={verificationText}
            size="sm"
            className="shadow-xs backdrop-blur-md bg-white/95 text-[#111111] border-none font-mono text-[10px]"
          />
        </div>

        {/* Bottom-left Overlaid Cost & Contextual "What This Covers" */}
        <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
          {pricePerPerson !== null ? (
            <div className="inline-flex flex-col bg-[#111111]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 shadow-md max-w-[90%]">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-lg sm:text-xl font-black text-[#F9E828] tabular-nums tracking-tight">
                  ₦{pricePerPerson.toLocaleString("en-NG")}
                </span>
                <span className="text-[10px] text-gray-300 font-medium font-sans">/ person</span>
              </div>
              <span className="text-[9px] font-mono text-gray-300 truncate">
                {whatThisCovers}
              </span>
            </div>
          ) : (
            <div className="inline-block bg-[#111111]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 text-[10px] font-mono font-bold text-gray-300">
              Price not verified yet
            </div>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3.5 text-left">
        <div>
          {/* Header Row: Title & Save Bookmark */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <Link 
                href={`/venue/${spot.id}`} 
                className="group-hover:text-[#111111] transition-colors block"
              >
                <h3 className="text-lg sm:text-xl font-black text-[#111111] font-display uppercase tracking-tight truncate">
                  {spot.name}
                </h3>
              </Link>
              <p className="text-xs text-[#6B7280] font-mono flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                <span className="font-bold text-[#111111] truncate">{areaName}</span>
                <span>•</span>
                <span className="truncate">{spot.address}</span>
              </p>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveClick}
              aria-label={isSaved ? `Remove ${spot.name} from saved` : `Save ${spot.name}`}
              className={`p-2 rounded-xl border transition-all shrink-0 tap-feedback cursor-pointer ${
                isSaved
                  ? "bg-[#111111] border-[#111111] text-[#F9E828]"
                  : "bg-[#F6F6F2] border-[#E5E5DE] text-[#6B7280] hover:text-[#111111] hover:border-[#111111]"
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>

          {/* Pricing Highlight Container: Drawer Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenReceipt?.();
            }}
            className="mt-3 p-3.5 rounded-xl bg-[#F6F6F2] hover:bg-[#EAEAE2] border border-[#E5E5DE] hover:border-[#111111] flex items-baseline justify-between font-mono text-left w-full transition-all cursor-pointer group/price tap-feedback"
            aria-label={`View total outing cost receipt for ${spot.name}`}
          >
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] uppercase font-bold text-[#6B7280] block font-mono">
                  Total Outing Cost
                </span>
                <span className="text-[9px] font-mono font-bold text-[#111111] bg-white border border-[#E5E5DE] px-1.5 py-0.5 rounded group-hover/price:border-[#111111]">
                  Receipt Slip ▾
                </span>
              </div>
              <div className="text-xs text-[#555555] font-mono">
                {whatThisCovers}
              </div>
            </div>

            {estimatedTotal !== null && (
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#6B7280] block">
                  {squadSize === 1 ? "Solo" : `Squad (${squadSize}x)`}
                </span>
                <span className="text-xs font-black text-[#111111] tabular-nums">
                  ~₦{estimatedTotal.toLocaleString("en-NG")}
                </span>
                <span className="text-[9px] text-[#6B7280] block">
                  incl. ₦{transportInfo.cost.toLocaleString("en-NG")} transport
                </span>
              </div>
            )}
          </button>

          {/* Budget Fit Indicator (when budget entered) */}
          {budget && estimatedTotal !== null && (
            <div className="mt-2 text-[11px] font-mono font-bold">
              {fitsBudget ? (
                <span className="text-[#111111] flex items-center gap-1 flex-wrap">
                  <Check className="w-3.5 h-3.5 stroke-[3] text-[#111111]" />
                  <span>Fits ₦{budget.toLocaleString("en-NG")} budget with transport</span>
                  {budgetRemaining !== null && budgetRemaining > 0 && (
                    <span className="text-[#6B7280]">(₦{budgetRemaining.toLocaleString("en-NG")} left)</span>
                  )}
                </span>
              ) : (
                <span className="text-[#E54D2E] font-bold">
                  {(() => {
                    const diffOver = Math.abs(budgetRemaining || 0);
                    const kOver = diffOver >= 1000 ? `${(diffOver / 1000).toFixed(diffOver % 1000 === 0 ? 0 : 1)}k` : `${diffOver}`;
                    return `Exceeds ₦${budget.toLocaleString("en-NG")} by ₦${kOver} — the stretch option.`;
                  })()}
                </span>
              )}
            </div>
          )}

          {/* Context Snippet */}
          <div className="mt-3 pt-2.5 border-t border-[#E5E5DE] flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[#555555] line-clamp-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#111111] shrink-0" />
              <span>{firstVibe}</span>
            </span>
            <span className="text-[10px] font-bold text-[#6B7280] shrink-0">
              {verificationText}
            </span>
          </div>
        </div>

        {/* Action Buttons Row — Primary Plan, Secondary View Venue */}
        <div className="pt-1 flex items-center gap-2">
          <Link
            href={`/venue/${spot.id}`}
            className="px-3.5 py-2.5 rounded-xl border border-[#E5E5DE] hover:border-[#111111] bg-white text-[#111111] text-center text-xs font-bold uppercase tracking-wider transition-colors tap-feedback shrink-0"
          >
            Menu
          </Link>

          <Link
            href={forgeUrl}
            aria-label={`Run plan for ${spot.name}`}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#111111] hover:bg-black text-[#F9E828] text-center text-xs font-black uppercase tracking-wider transition-all shadow-xs tap-feedback flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Run the Plan →</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
