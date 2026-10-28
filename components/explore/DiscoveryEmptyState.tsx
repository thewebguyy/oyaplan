"use client";

import React from "react";
import { Compass, RotateCcw, PlusCircle, Globe, Sparkles } from "lucide-react";

interface DiscoveryEmptyStateProps {
  searchQuery?: string;
  activeAreaName?: string;
  activeCategory?: string;
  activeVibe?: string | null;
  currentBudget?: number | null;
  squadSize?: number;
  onClearSearch?: () => void;
  onIncreaseBudget?: (newBudget: number) => void;
  onExpandArea?: () => void;
  onClearVibe?: () => void;
  onResetAll?: () => void;
}

export function DiscoveryEmptyState({
  searchQuery,
  activeAreaName,
  activeCategory,
  activeVibe,
  currentBudget,
  squadSize = 2,
  onClearSearch,
  onIncreaseBudget,
  onExpandArea,
  onClearVibe,
  onResetAll,
}: DiscoveryEmptyStateProps) {
  // Build informative contextual explanation
  const constraints: string[] = [];
  if (searchQuery) constraints.push(`matching "${searchQuery}"`);
  if (activeAreaName && activeAreaName !== "All Lagos") constraints.push(`in ${activeAreaName}`);
  if (activeCategory && activeCategory !== "all") constraints.push(`category "${activeCategory}"`);
  if (activeVibe) constraints.push(`with "${activeVibe}" vibe`);
  if (currentBudget) constraints.push(`under ₦${currentBudget.toLocaleString("en-NG")} for ${squadSize}`);

  const suggestedHigherBudget = currentBudget ? Math.round(currentBudget * 1.5 / 10000) * 10000 : null;

  return (
    <div className="w-full max-w-lg mx-auto py-10 px-6 sm:px-8 bg-white rounded-2xl border-2 border-[#111111] text-center shadow-[6px_6px_0px_#111111] space-y-6">
      <div className="w-14 h-14 rounded-xl bg-[#010528] text-[#F9E828] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center mx-auto">
        <Compass className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-black text-[#010528] font-display uppercase tracking-tight">
          No verified spots fit all these constraints
        </h3>
        <p className="text-xs text-[#111111]/70 max-w-md mx-auto leading-relaxed font-mono">
          {constraints.length > 0 ? (
            <>We verified no spots {constraints.join(", ")}.</>
          ) : (
            <>We couldn&apos;t find any active venues matching this query.</>
          )}
        </p>
      </div>

      {/* Relax One Thing Actions */}
      <div className="pt-2 border-t-2 border-[#111111]/10 space-y-3 text-left">
        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#111111]/60 text-center">
          You can relax one constraint:
        </p>

        <div className="flex flex-col gap-2">
          {searchQuery && onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="w-full p-3.5 rounded-xl bg-[#FAF8F8] hover:bg-white border-2 border-[#111111]/20 hover:border-[#111111] text-xs font-mono font-bold text-[#111111] flex items-center justify-between transition-all shadow-[2px_2px_0px_rgba(1,5,40,0.04)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none tap-feedback cursor-pointer"
            >
              <span>Clear search query &ldquo;{searchQuery}&rdquo;</span>
              <RotateCcw className="w-4 h-4 text-[#008751] shrink-0" />
            </button>
          )}

          {suggestedHigherBudget && onIncreaseBudget && (
            <button
              type="button"
              onClick={() => onIncreaseBudget(suggestedHigherBudget)}
              className="w-full p-3.5 rounded-xl bg-[#FAF8F8] hover:bg-white border-2 border-[#111111]/20 hover:border-[#111111] text-xs font-mono font-bold text-[#111111] flex items-center justify-between transition-all shadow-[2px_2px_0px_rgba(1,5,40,0.04)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none tap-feedback cursor-pointer"
            >
              <span>Increase budget to ₦{suggestedHigherBudget.toLocaleString("en-NG")}</span>
              <PlusCircle className="w-4 h-4 text-[#008751] shrink-0" />
            </button>
          )}

          {activeAreaName && activeAreaName !== "All Lagos" && onExpandArea && (
            <button
              type="button"
              onClick={onExpandArea}
              className="w-full p-3.5 rounded-xl bg-[#FAF8F8] hover:bg-white border-2 border-[#111111]/20 hover:border-[#111111] text-xs font-mono font-bold text-[#111111] flex items-center justify-between transition-all shadow-[2px_2px_0px_rgba(1,5,40,0.04)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none tap-feedback cursor-pointer"
            >
              <span>Expand to All Lagos Areas</span>
              <Globe className="w-4 h-4 text-[#008751] shrink-0" />
            </button>
          )}

          {activeVibe && onClearVibe && (
            <button
              type="button"
              onClick={onClearVibe}
              className="w-full p-3.5 rounded-xl bg-[#FAF8F8] hover:bg-white border-2 border-[#111111]/20 hover:border-[#111111] text-xs font-mono font-bold text-[#111111] flex items-center justify-between transition-all shadow-[2px_2px_0px_rgba(1,5,40,0.04)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none tap-feedback cursor-pointer"
            >
              <span>Clear vibe filter &ldquo;{activeVibe}&rdquo;</span>
              <Sparkles className="w-4 h-4 text-[#008751] shrink-0" />
            </button>
          )}

          {onResetAll && (
            <button
              type="button"
              onClick={onResetAll}
              className="w-full py-2.5 text-center text-xs font-mono font-bold uppercase tracking-wider text-[#010528] hover:text-[#008751] hover:underline transition-colors cursor-pointer"
            >
              Reset all filters to default
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
