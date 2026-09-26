"use client";

import React from "react";
import Link from "next/link";
import { Venue } from "@/lib/types";
import { ArrowRight, Tag, Users, ShieldCheck, Sparkles, TrendingUp, Info } from "lucide-react";
import { getVerificationText } from "@/lib/planning/presentation/decisionCardMapper";

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
  fromPlan = false,
  planSquad,
  planBudget,
  planVibe,
}: VenueDecisionSummaryProps) {
  const isPartnerVerified = venue.partner_state === "verified_partner";
  const isVerified = isPartnerVerified || venue.operational_status === "verified" || venue.operational_status === "fresh";
  const freshnessText = getVerificationText(venue.last_price_updated_at);

  const perPersonCost = venue.derived_typical_cost > 0 ? venue.derived_typical_cost : 18000;
  const low2 = Math.round((perPersonCost * 1.8) / 1000) * 1000;
  const high2 = Math.round((low2 * 1.4) / 1000) * 1000;

  const low4 = Math.round((perPersonCost * 3.6) / 1000) * 1000;
  const high4 = Math.round((low4 * 1.35) / 1000) * 1000;

  const activeSquad = planSquad || 2;
  const activeBudget = planBudget || (activeSquad === 4 ? low4 : low2);
  const activeVibe = planVibe || venue.vibe_tags?.[0] || "chill";

  const forgeUrl = `/forge?pinned=${venue.id}&area=${areaSlug}&squad=${activeSquad}&budget=${activeBudget}&vibe=${encodeURIComponent(activeVibe)}&fresh=true`;

  return (
    <section id="pricing" className="scroll-mt-32">
      <div className="bg-white rounded-[28px] border border-[#EAE4DC] p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE4DC] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#008751]/10 text-[#008751] text-[10px] font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Financial Clarity</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-midnight-lagoon uppercase tracking-tight">
              What It Costs
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Typical spend ranges to help you decide whether this spot fits your outing budget.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-surface-grey border border-[#EAE4DC] text-midnight-lagoon">
              <Tag className="w-3.5 h-3.5 text-[#008751]" />
              <span>{freshnessText}</span>
            </span>
          </div>
        </div>

        {/* 3-Column Spend Rhythm */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Per Person */}
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] flex flex-col justify-between space-y-2">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-text-muted">
                Typical Spend / Person
              </p>
              <p className="text-2xl sm:text-3xl font-black text-[#008751] tracking-tight mt-1">
                ₦{perPersonCost.toLocaleString("en-NG")}
              </p>
            </div>
            <p className="text-[11px] text-text-secondary">
              Main course + drink + typical house fees
            </p>
          </div>

          {/* 2 People Outing */}
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-text-muted">
                <Users className="w-3.5 h-3.5 text-midnight-lagoon" />
                <span>For 2 People (Date / Pair)</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-midnight-lagoon tracking-tight mt-1">
                ~₦{low2.toLocaleString("en-NG")} – ₦{high2.toLocaleString("en-NG")}
              </p>
            </div>
            <p className="text-[11px] text-text-secondary">
              2 mains + shared side + 2 cocktails
            </p>
          </div>

          {/* 4 People Squad */}
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-text-muted">
                <Users className="w-3.5 h-3.5 text-midnight-lagoon" />
                <span>For 4 People (Squad)</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-midnight-lagoon tracking-tight mt-1">
                ~₦{low4.toLocaleString("en-NG")} – ₦{high4.toLocaleString("en-NG")}
              </p>
            </div>
            <p className="text-[11px] text-text-secondary">
              Food + drinks + group platters
            </p>
          </div>

        </div>

        {/* Verification & Trust Banner */}
        <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
          isPartnerVerified
            ? "bg-[#EAFDF3] border-[#A3F3C6] text-[#00603A]"
            : "bg-surface-grey border-[#EAE4DC] text-midnight-lagoon"
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-[#008751] shrink-0" />
              <span>
                {isPartnerVerified
                  ? "Partner Verified Pricing"
                  : isVerified
                  ? "Verified Menu Data"
                  : "Estimated Pricing Model"}
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {isPartnerVerified
                ? "This venue actively updates and verifies its menu prices and operating rules directly on OyaPlan."
                : "Pricing is derived from verified menus, crowd receipts, and verified Lagos outing signals."}
            </p>
          </div>

          <Link
            href={forgeUrl}
            className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs flex items-center gap-1.5 tap-feedback"
          >
            <span>Plan Outing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
