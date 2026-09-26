"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, ArrowRight, Users, Wallet, CheckCircle2 } from "lucide-react";
import { Venue } from "@/lib/types";

interface VenuePlanContextCardProps {
  venue: Venue;
  areaSlug?: string;
  areaName?: string;
  planSquad?: number;
  planBudget?: number;
  planVibe?: string;
}

export function VenuePlanContextCard({
  venue,
  areaSlug = "ikeja",
  areaName = "Lagos",
  planSquad,
  planBudget,
  planVibe,
}: VenuePlanContextCardProps) {
  const router = useRouter();

  const squadSize = planSquad && planSquad > 0 ? planSquad : 2;
  const perPersonCost = venue.derived_typical_cost > 0 ? venue.derived_typical_cost : 18000;
  const estimatedSquadCost = Math.round((perPersonCost * squadSize * 0.9) / 1000) * 1000;
  const targetBudget = planBudget && planBudget > 0 ? planBudget : estimatedSquadCost;
  const isWithinBudget = targetBudget >= estimatedSquadCost;
  const vibe = planVibe || venue.vibe_tags?.[0] || "outing";

  const forgeUrl = `/forge?pinned=${venue.id}&area=${areaSlug}&squad=${squadSize}&budget=${targetBudget}&vibe=${encodeURIComponent(vibe)}&fresh=true`;

  return (
    <div className="bg-gradient-to-br from-[#008751]/10 via-white to-[#FAF7F2] border border-[#008751]/30 rounded-[24px] p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#008751]/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#008751] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#008751]">
              Recommended In Your Plan
            </span>
            <h3 className="font-black text-base sm:text-lg text-midnight-lagoon">
              {venue.name} fits your {vibe} outing
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-midnight-lagoon transition-colors py-1 px-2.5 rounded-lg hover:bg-black/5 self-start sm:self-auto tap-feedback cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Plan</span>
        </button>
      </div>

      {/* Plan Parameters & Matching Reasons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-white rounded-xl border border-[#EAE4DC] flex items-center gap-3">
          <Users className="w-4 h-4 text-[#008751] shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase">Squad Size</p>
            <p className="text-sm font-black text-midnight-lagoon">{squadSize} People</p>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#EAE4DC] flex items-center gap-3">
          <Wallet className="w-4 h-4 text-[#008751] shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase">Target Budget</p>
            <p className="text-sm font-black text-midnight-lagoon">₦{targetBudget.toLocaleString("en-NG")}</p>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#EAE4DC] flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-[#008751] shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase">Estimated Outing</p>
            <p className="text-sm font-black text-[#008751]">
              ~₦{estimatedSquadCost.toLocaleString("en-NG")} ({isWithinBudget ? "On Budget" : "Near Budget"})
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-text-secondary leading-relaxed">
          Ready to lock in this plan or tweak your budget parameters?
        </p>
        <Link href={forgeUrl}>
          <button
            type="button"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all tap-feedback cursor-pointer"
          >
            <span>Plan This Venue in Forge</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}
