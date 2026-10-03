"use client";

import React from "react";
import Link from "next/link";
import { Venue } from "@/lib/types";
import { ArrowRight, Tag, Users, ShieldCheck, Info } from "lucide-react";
import { getVerificationText } from "@/lib/planning/presentation/decisionCardMapper";
import { buildVenuePlanUrl } from "@/lib/planning/buildVenuePlanUrl";
import { knownPerPerson, venueFoodTotal, suggestPlanBudget } from "@/lib/venue/venueSpend";

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

  // Canonical: real per-person spend or null. No invented ranges or fallback prices.
  const perPerson = knownPerPerson(venue);
  const total2 = perPerson !== null ? venueFoodTotal(perPerson, 2) : null;
  const total4 = perPerson !== null ? venueFoodTotal(perPerson, 4) : null;

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

  return (
    <section id="pricing" className="scroll-mt-32">
      <div className="bg-white rounded-[28px] border border-[#E5E5DE] p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5DE] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#111111] uppercase tracking-tight">
              The damage
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Food &amp; drinks only. Transport depends on where you&apos;re starting from — plan it to see the full total.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F6F6F2] border border-[#E5E5DE] text-[#111111]">
              <Tag className="w-3.5 h-3.5 text-[#111111]" />
              <span>{freshnessText}</span>
            </span>
          </div>
        </div>

        {perPerson !== null ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#F6F6F2] border border-[#E5E5DE] flex flex-col justify-between space-y-2">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-text-muted">
                  Typical / person
                </p>
                <p className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight mt-1 font-mono tabular-nums">
                  ₦{perPerson.toLocaleString("en-NG")}
                </p>
              </div>
              <p className="text-[11px] text-text-secondary">VAT included in venue price</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F6F6F2] border border-[#E5E5DE] flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-text-muted">
                  <Users className="w-3.5 h-3.5 text-[#111111]" />
                  <span>For 2</span>
                </div>
                <p className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight mt-1 font-mono tabular-nums">
                  ₦{(total2 as number).toLocaleString("en-NG")}
                </p>
              </div>
              <p className="text-[11px] text-text-secondary">Before transport</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F6F6F2] border border-[#E5E5DE] flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-text-muted">
                  <Users className="w-3.5 h-3.5 text-[#111111]" />
                  <span>For 4</span>
                </div>
                <p className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight mt-1 font-mono tabular-nums">
                  ₦{(total4 as number).toLocaleString("en-NG")}
                </p>
              </div>
              <p className="text-[11px] text-text-secondary">Before transport</p>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-[#F6F6F2] border border-dashed border-[#E5E5DE] flex items-start gap-3">
            <Info className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-black text-[#111111]">We don&apos;t have a verified price for this spot yet.</p>
              <p className="text-xs text-text-secondary">
                We won&apos;t guess. Use &ldquo;Report update&rdquo; if you know what it costs, or plan it to see how it compares with spots we do have prices for.
              </p>
            </div>
          </div>
        )}

        {/* Trust & Action */}
        <div className="p-4 rounded-2xl border border-[#E5E5DE] bg-[#F6F6F2] text-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-[#111111] shrink-0" />
              <span>
                {isPartnerVerified
                  ? "Venue-verified pricing"
                  : isVerified
                  ? "Verified menu data"
                  : "Estimated pricing"}
              </span>
            </div>
            <p className="text-xs text-[#374151] leading-relaxed">
              {isPartnerVerified
                ? "Menu prices and house rules were confirmed directly by this venue."
                : isVerified
                ? "Prices come from menu data we've checked."
                : "This is our best estimate and hasn't been verified yet. Treat it as a guide, not a quote."}
            </p>
          </div>

          <Link
            href={forgeUrl}
            className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#111111] hover:bg-[#2a2a2a] text-[#F9E828] rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shrink-0 transition-colors shadow-sm flex items-center justify-center gap-2 tap-feedback cursor-pointer"
          >
            <span>Plan this spot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
