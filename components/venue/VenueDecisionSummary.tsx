"use client";

import React from "react";
import Link from "next/link";
import { Venue, Spot } from "@/lib/types";
import { 
  ArrowRight, 
  Tag, 
  Users, 
  ShieldCheck, 
  Info, 
  Car, 
  Bookmark, 
  BookmarkCheck, 
  AlertTriangle
} from "lucide-react";
import { getVerificationText } from "@/lib/planning/presentation/decisionCardMapper";
import { buildVenuePlanUrl } from "@/lib/planning/buildVenuePlanUrl";
import { knownPerPerson, venueFoodTotal, suggestPlanBudget } from "@/lib/venue/venueSpend";
import { getTemporaryTransportEstimate, classifyDestinationZone } from "@/lib/planning/temporaryTransport";
import { useSavedSpots } from "@/hooks/useSavedSpots";
import { toast } from "sonner";

interface VenueDecisionSummaryProps {
  venue: Venue;
  areaSlug?: string;
  fromPlan?: boolean;
  planSquad?: number;
  planBudget?: number;
  planVibe?: string;
}

export function VenueDecisionSummary({ 
  venue, 
  areaSlug = "ikeja",
  planSquad,
  planBudget,
  planVibe,
}: VenueDecisionSummaryProps) {
  const isPartnerVerified = venue.partner_state === "verified_partner";
  const isVerified = isPartnerVerified || venue.operational_status === "verified" || venue.operational_status === "fresh";
  const freshnessText = getVerificationText(venue.last_price_updated_at);

  const transportInfo = getTemporaryTransportEstimate(areaSlug || venue.address);
  const zone = classifyDestinationZone(areaSlug || venue.address);
  const isIsland = zone === "island";

  const { isSaved, saveSpot, removeSpot } = useSavedSpots();
  const spotSaved = isSaved(venue.id);

  // Canonical: real per-person spend or null. No invented ranges or fallback prices.
  const perPerson = knownPerPerson(venue);
  const food2 = perPerson !== null ? venueFoodTotal(perPerson, 2) : null;
  const food4 = perPerson !== null ? venueFoodTotal(perPerson, 4) : null;
  const total2 = food2 !== null ? food2 + transportInfo.cost : null;
  const total4 = food4 !== null ? food4 + transportInfo.cost : null;

  const activeSquad = planSquad && planSquad > 0 ? planSquad : 2;
  const activeBudget = planBudget && planBudget > 0 ? planBudget : suggestPlanBudget(perPerson, activeSquad);
  const activeVibe = planVibe || venue.vibe_tags?.[0] || "chill";

  const forgeUrl = buildVenuePlanUrl({
    venueId: venue.id,
    area: areaSlug,
    squad: activeSquad,
    budget: activeBudget,
    vibe: activeVibe,
  });

  const handleToggleSave = () => {
    if (spotSaved) {
      removeSpot(venue.id);
      toast.info(`Removed ${venue.name} from your shortlist`);
    } else {
      const spotObj: Spot = {
        id: venue.id,
        name: venue.name,
        address: venue.address,
        area_id: venue.district_id || areaSlug,
        vibe_tags: venue.vibe_tags || [],
        price_per_person: perPerson || venue.derived_typical_cost || 0,
        transport_matrix: {},
        is_featured: false,
        active: true,
        category: (venue.category as any) || "restaurant",
        cover_url: venue.cover_url,
        image_url: venue.cover_url,
      };
      saveSpot(spotObj);
      toast.success(`Saved ${venue.name} to your shortlist!`);
    }
  };

  return (
    <section id="pricing" className="scroll-mt-32">
      <div className="bg-white rounded-[24px] border-3 border-[#111111] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#111111] space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#111111] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#F9E828] border border-[#111111] text-[10px] font-black uppercase tracking-wider text-[#111111]">
                <Tag className="w-3 h-3" />
                <span>{freshnessText}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#008751] bg-[#EAFDF3] border border-[#008751]/30 px-2 py-0.5 rounded">
                Zero-Markup Direct Pricing
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#111111] uppercase tracking-tight">
              Total Outing Cost &amp; Damage Matrix
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Verified food &amp; drinks + round-trip Lagos transit estimate for the squad.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleToggleSave}
              className={`h-10 px-3.5 rounded-xl border-2 border-[#111111] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all tap-feedback cursor-pointer ${
                spotSaved
                  ? "bg-[#EAFDF3] text-[#008751] border-[#008751]"
                  : "bg-[#F9E828] text-[#111111] shadow-[2px_2px_0px_0px_#111111] hover:bg-[#ebd915]"
              }`}
            >
              {spotSaved ? <BookmarkCheck className="w-4 h-4 text-[#008751]" /> : <Bookmark className="w-4 h-4" />}
              <span>{spotSaved ? "Saved" : "Shortlist"}</span>
            </button>
          </div>
        </div>

        {/* Spend Damage Breakdown */}
        {perPerson !== null ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border-2 border-[#111111] flex flex-col justify-between space-y-2 shadow-xs">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-text-muted">
                  Venue / person
                </p>
                <p className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight mt-1 font-mono tabular-nums">
                  ₦{perPerson.toLocaleString("en-NG")}
                </p>
              </div>
              <p className="text-[11px] text-text-secondary font-medium">Food, drinks &amp; VAT included</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF7F2] border-2 border-[#111111] flex flex-col justify-between space-y-2 shadow-xs">
              <div>
                <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-text-muted">
                  <Users className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Squad of 2 (Total)</span>
                </div>
                <p className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight mt-1 font-mono tabular-nums">
                  ₦{(total2 as number).toLocaleString("en-NG")}
                </p>
              </div>
              <p className="text-[11px] text-text-secondary font-medium">
                ₦{Math.round((total2 as number) / 2).toLocaleString("en-NG")} / head (with ~₦{transportInfo.cost.toLocaleString("en-NG")} rides)
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF7F2] border-2 border-[#111111] flex flex-col justify-between space-y-2 shadow-xs">
              <div>
                <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-text-muted">
                  <Users className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Squad of 4 (Total)</span>
                </div>
                <p className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight mt-1 font-mono tabular-nums">
                  ₦{(total4 as number).toLocaleString("en-NG")}
                </p>
              </div>
              <p className="text-[11px] text-text-secondary font-medium">
                ₦{Math.round((total4 as number) / 4).toLocaleString("en-NG")} / head (with ~₦{transportInfo.cost.toLocaleString("en-NG")} rides)
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border-2 border-dashed border-[#111111] flex items-start gap-3">
            <Info className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-black text-[#111111]">We don&apos;t have a verified price for this spot yet.</p>
              <p className="text-xs text-text-secondary">
                We won&apos;t guess. Use &ldquo;Report update&rdquo; if you know what it costs, or plan it to see how it compares with spots we do have prices for.
              </p>
            </div>
          </div>
        )}

        {/* Island vs. Mainland Commute & Surge Corridor Matrix */}
        <div className="p-5 rounded-2xl border-2 border-[#111111] bg-[#FAF7F2] space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-2.5">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-[#008751]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                Lagos Transit &amp; Surge Corridors ({isIsland ? "Island Spot" : "Mainland Spot"})
              </h3>
            </div>
            <span className="text-[10px] font-black uppercase bg-[#111111] text-[#F9E828] px-2 py-0.5 rounded">
              {transportInfo.zoneLabel} Zone
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-[#EAE4DC] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-[#111111] uppercase tracking-wide">
                  {isIsland ? "From Lekki / VI / Ikoyi" : "From Ikeja / Surulere / Yaba"}
                </span>
                <span className="text-xs font-mono font-black text-[#008751]">
                  ~₦{isIsland ? "3,000 – ₦5,000" : "2,500 – ₦4,500"}
                </span>
              </div>
              <p className="text-[10px] text-text-muted">
                Local side commute. Quick Bolt/Uber trip with minimal bridge bottleneck.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#EAE4DC] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-[#111111] uppercase tracking-wide">
                  {isIsland ? "From Mainland via 3MB / Eko Bridge" : "From Island via 3MB / Eko Bridge"}
                </span>
                <span className="text-xs font-mono font-black text-[#E11D48]">
                  ~₦{isIsland ? "8,000 – ₦12,500" : "7,500 – ₦11,000"}
                </span>
              </div>
              <p className="text-[10px] text-text-muted">
                Cross-bridge ride. Expect peak toll gate &amp; bridge transit times.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[11px] text-[#92400E]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#D97706]" />
            <p className="leading-snug">
              <strong>Lagos Surge Factor:</strong> Friday evening rush (5pm–9:30pm) and sudden downpours typically spike app rides by 1.5x–2.2x. Factor an extra ₦3,000 buffer into your squad math.
            </p>
          </div>
        </div>

        {/* Trust & Action */}
        <div className="p-5 rounded-2xl border-2 border-[#111111] bg-white text-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wide text-[#111111]">
              <ShieldCheck className="w-4 h-4 text-[#008751] shrink-0" />
              <span>
                {isPartnerVerified
                  ? "Venue-verified pricing"
                  : isVerified
                  ? "Verified menu data"
                  : "Estimated pricing"}
              </span>
            </div>
            <p className="text-xs text-[#374151] leading-relaxed max-w-lg">
              {isPartnerVerified
                ? "Menu prices, corkage rules, and VAT were confirmed directly by the management of this venue."
                : isVerified
                ? "Prices cross-checked with physical menus and direct guest receipts. Zero hidden surprises."
                : "This is our verified benchmark. Treat it as a realistic guide before you leave home."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={forgeUrl}
              className="px-6 py-3.5 bg-[#111111] hover:bg-[#2a2a2a] text-[#F9E828] rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-[3px_3px_0px_0px_#111111] border-2 border-[#111111] flex items-center justify-center gap-2 tap-feedback cursor-pointer"
            >
              <span>Plan This Spot</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
