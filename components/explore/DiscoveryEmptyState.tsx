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
    <div className="w-full max-w-lg mx-auto py-12 px-6 bg-white rounded-3xl border border-[#E5E7EB] text-center shadow-xs space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-[#008751]/10 text-[#008751] flex items-center justify-center mx-auto">
        <Compass className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-black text-midnight-lagoon">
          No verified spots fit all these constraints
        </h3>
        <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
          {constraints.length > 0 ? (
            <>We verified no spots {constraints.join(", ")}.</>
          ) : (
            <>We couldn&apos;t find any active venues matching this query.</>
          )}
        </p>
      </div>

      {/* Relax One Thing Actions */}
      <div className="pt-2 border-t border-[#E5E7EB] space-y-2.5 text-left">
        <p className="text-[11px] font-black uppercase tracking-wider text-text-muted text-center">
          You can relax one constraint:
        </p>

        <div className="flex flex-col gap-2">
          {searchQuery && onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="w-full p-3 rounded-xl bg-[#FAFAF8] hover:bg-[#F4F3EF] border border-[#E5E7EB] text-xs font-black text-midnight-lagoon flex items-center justify-between transition-colors tap-feedback cursor-pointer"
            >
              <span>Clear search query &ldquo;{searchQuery}&rdquo;</span>
              <RotateCcw className="w-4 h-4 text-[#008751]" />
            </button>
          )}

          {suggestedHigherBudget && onIncreaseBudget && (
            <button
              type="button"
              onClick={() => onIncreaseBudget(suggestedHigherBudget)}
              className="w-full p-3 rounded-xl bg-[#FAFAF8] hover:bg-[#F4F3EF] border border-[#E5E7EB] text-xs font-black text-midnight-lagoon flex items-center justify-between transition-colors tap-feedback cursor-pointer"
            >
              <span>Increase budget to ₦{suggestedHigherBudget.toLocaleString("en-NG")}</span>
              <PlusCircle className="w-4 h-4 text-[#008751]" />
            </button>
          )}

          {activeAreaName && activeAreaName !== "All Lagos" && onExpandArea && (
            <button
              type="button"
              onClick={onExpandArea}
              className="w-full p-3 rounded-xl bg-[#FAFAF8] hover:bg-[#F4F3EF] border border-[#E5E7EB] text-xs font-black text-midnight-lagoon flex items-center justify-between transition-colors tap-feedback cursor-pointer"
            >
              <span>Expand to All Lagos Areas</span>
              <Globe className="w-4 h-4 text-[#008751]" />
            </button>
          )}

          {activeVibe && onClearVibe && (
            <button
              type="button"
              onClick={onClearVibe}
              className="w-full p-3 rounded-xl bg-[#FAFAF8] hover:bg-[#F4F3EF] border border-[#E5E7EB] text-xs font-black text-midnight-lagoon flex items-center justify-between transition-colors tap-feedback cursor-pointer"
            >
              <span>Clear vibe filter &ldquo;{activeVibe}&rdquo;</span>
              <Sparkles className="w-4 h-4 text-[#008751]" />
            </button>
          )}

          {onResetAll && (
            <button
              type="button"
              onClick={onResetAll}
              className="w-full py-2.5 text-center text-xs font-extrabold text-[#008751] hover:underline cursor-pointer"
            >
              Reset all filters to default
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
