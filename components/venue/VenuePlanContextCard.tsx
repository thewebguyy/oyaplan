"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Users, Wallet, Receipt } from "lucide-react";
import { Venue } from "@/lib/types";
import { buildVenuePlanUrl } from "@/lib/planning/buildVenuePlanUrl";
import { knownPerPerson, venueFoodTotal, suggestPlanBudget } from "@/lib/venue/venueSpend";

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
  planSquad,
  planBudget,
  planVibe,
}: VenuePlanContextCardProps) {
  const router = useRouter();

  const squadSize = planSquad && planSquad > 0 ? planSquad : 2;
  const perPerson = knownPerPerson(venue);
  const foodTotal = perPerson !== null ? venueFoodTotal(perPerson, squadSize) : null;
  const hasBudget = Boolean(planBudget && planBudget > 0);
  const targetBudget = hasBudget ? (planBudget as number) : suggestPlanBudget(perPerson, squadSize);
  const vibe = planVibe || venue.vibe_tags?.[0] || "chill";

  // Honest status: venue spend alone (before transport) vs the user's ceiling.
  let status: string;
  if (foodTotal === null) status = "Price not verified yet";
  else if (!hasBudget) status = "Before transport";
  else if (foodTotal > targetBudget) status = "Over budget before transport";
  else status = "Before transport";

  const forgeUrl = buildVenuePlanUrl({
    venueId: venue.id,
    area: areaSlug,
    squad: squadSize,
    budget: targetBudget,
    vibe,
  });

  return (
    <div className="bg-[#F6F6F2] border border-[#E5E5DE] rounded-[24px] p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dashed border-[#E5E5DE] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F9E828] flex items-center justify-center shrink-0 shadow-xs">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
              From your plan
            </span>
            <h3 className="font-black text-base sm:text-lg text-[#111111]">
              {venue.name}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-[#111111] transition-colors py-2 px-3 rounded-lg hover:bg-black/5 self-start sm:self-auto tap-feedback cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to your plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-white rounded-xl border border-[#E5E5DE] flex items-center gap-3">
          <Users className="w-4 h-4 text-[#111111] shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase">Squad</p>
            <p className="text-sm font-black text-[#111111]">{squadSize} {squadSize === 1 ? "person" : "people"}</p>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E5E5DE] flex items-center gap-3">
          <Wallet className="w-4 h-4 text-[#111111] shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase">{hasBudget ? "Your budget" : "Starting budget"}</p>
            <p className="text-sm font-black text-[#111111] font-mono tabular-nums">₦{targetBudget.toLocaleString("en-NG")}</p>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E5E5DE] flex items-center gap-3">
          <Receipt className="w-4 h-4 text-[#111111] shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase">Venue spend</p>
            <p className={`text-sm font-black font-mono tabular-nums ${status.startsWith("Over") ? "text-[#E54D2E]" : "text-[#111111]"}`}>
              {foodTotal !== null ? `₦${foodTotal.toLocaleString("en-NG")}` : "—"}
            </p>
            <p className="text-[10px] text-text-muted">{status}</p>
          </div>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-text-secondary leading-relaxed">
          Want the full damage with transport? Re-run the plan with this spot locked in.
        </p>
        <Link
          href={forgeUrl}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#111111] hover:bg-[#2a2a2a] text-[#F9E828] text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all tap-feedback cursor-pointer"
        >
          <span>Plan this spot</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
