"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Wallet, Compass, Sparkles, ArrowUpDown, RotateCcw } from "lucide-react";
import { Area } from "@/lib/types";

export type SortMode = "best-fit" | "price-asc" | "price-desc" | "verified";

export interface FilterState {
  areaSlug: string;
  category: string;
  vibe: string | null;
  budget: number | null; // Total squad budget
  squadSize: number;
  sortBy: SortMode;
}

interface DiscoveryFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onUpdateFilters: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  availableAreas: Array<{ id: string; name: string; slug: string; activeSpotCount?: number }>;
  matchCount: number;
}

const BUDGET_PRESETS = [
  { label: "Any", value: null },
  { label: "₦20k", value: 20000 },
  { label: "₦40k", value: 40000 },
  { label: "₦60k", value: 60000 },
  { label: "₦100k", value: 100000 },
  { label: "₦150k+", value: 150000 },
];

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "all" },
  { label: "Restaurants & Dining", value: "restaurant" },
  { label: "Bars & Lounges", value: "bar" },
  { label: "Cafes & Coffee", value: "cafe" },
  { label: "Activities & Games", value: "activity" },
  { label: "Beach & Waterfront", value: "beach" },
  { label: "Parks & Nature", value: "nature" },
  { label: "Entertainment & Cinema", value: "entertainment" },
  { label: "Cultural & Experiences", value: "experience" },
];

const VIBE_OPTIONS = [
  { label: "All Vibes", value: null },
  { label: "💕 Date Night", value: "date-night" },
  { label: "👥 Squad Hangout", value: "chill" },
  { label: "🎉 Birthday Turn Up", value: "party" },
  { label: "⚡ Quick Bites", value: "quick" },
  { label: "🍲 Serious Chop", value: "foodie" },
  { label: "🥞 Weekend Brunch", value: "brunch" },
];

const SORT_OPTIONS: Array<{ label: string; value: SortMode; desc: string }> = [
  { label: "Best Match", value: "best-fit", desc: "Closest fit to your budget and chosen vibe" },
  { label: "Spend: Low to High", value: "price-asc", desc: "Most budget-friendly total cost first" },
  { label: "Spend: High to Low", value: "price-desc", desc: "Premium and celebratory options first" },
  { label: "Recently Verified", value: "verified", desc: "Most recently audited menu prices" },
];

export function DiscoveryFilterSheet({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onResetFilters,
  availableAreas,
  matchCount,
}: DiscoveryFilterSheetProps) {
  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-end md:items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#010528]/50 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Sheet / Dialog Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            role="dialog"
            aria-modal="true"
            aria-label="Filter Outing Spots"
            className="relative z-10 w-full max-w-lg max-h-[88vh] md:max-h-[85vh] bg-[#FAFAF8] rounded-t-[32px] md:rounded-[32px] shadow-2xl border border-[#E5E7EB] flex flex-col overflow-hidden text-left"
          >
            {/* Sheet Handle for Mobile Touch */}
            <div className="md:hidden w-full pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#008751]/10 text-[#008751] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black text-midnight-lagoon">Filter Outing</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="p-2 rounded-full text-text-muted hover:text-midnight-lagoon hover:bg-surface-grey transition-colors tap-feedback cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filter Options Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              
              {/* 1. Squad Size Stepper */}
              <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-midnight-lagoon flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#008751]" /> Squad Size
                    </label>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {filters.squadSize === 1 ? "Solo outing" : `Outing for ${filters.squadSize} people`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onUpdateFilters({ squadSize: Math.max(1, filters.squadSize - 1) })}
                      disabled={filters.squadSize <= 1}
                      aria-label="Decrease squad size"
                      className="w-10 h-10 rounded-xl bg-surface-grey border border-[#E5E7EB] text-midnight-lagoon font-black text-lg flex items-center justify-center hover:bg-[#EAE4DC] disabled:opacity-40 disabled:pointer-events-none tap-feedback transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-black text-lg text-midnight-lagoon w-6 text-center">
                      {filters.squadSize}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateFilters({ squadSize: Math.min(20, filters.squadSize + 1) })}
                      disabled={filters.squadSize >= 20}
                      aria-label="Increase squad size"
                      className="w-10 h-10 rounded-xl bg-surface-grey border border-[#E5E7EB] text-midnight-lagoon font-black text-lg flex items-center justify-center hover:bg-[#EAE4DC] disabled:opacity-40 disabled:pointer-events-none tap-feedback transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Total Outing Budget */}
              <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-midnight-lagoon flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-[#008751]" /> Total Squad Budget
                  </label>
                  <span className="text-xs font-black text-[#008751]">
                    {filters.budget ? `₦${filters.budget.toLocaleString("en-NG")}` : "Any budget"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {BUDGET_PRESETS.map((preset) => {
                    const isSelected = filters.budget === preset.value;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => onUpdateFilters({ budget: preset.value })}
                        className={`py-2 px-3 rounded-xl border text-xs font-black transition-all tap-feedback cursor-pointer ${
                          isSelected
                            ? "bg-[#008751] border-[#008751] text-white shadow-xs"
                            : "bg-[#FAFAF8] border-[#E5E7EB] text-text-secondary hover:border-[#008751]/40"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {filters.budget && filters.squadSize > 1 && (
                  <p className="text-[11px] text-text-muted text-right">
                    ~₦{Math.round(filters.budget / filters.squadSize).toLocaleString("en-NG")} per person
                  </p>
                )}
              </div>

              {/* 3. Area Filter */}
              <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-midnight-lagoon flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#008751]" /> Destination Area
                </label>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateFilters({ areaSlug: "all" })}
                    className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition-all tap-feedback cursor-pointer ${
                      filters.areaSlug === "all"
                        ? "bg-[#010528] border-[#010528] text-white"
                        : "bg-[#FAFAF8] border-[#E5E7EB] text-text-secondary hover:border-[#010528]"
                    }`}
                  >
                    All Lagos
                  </button>
                  {availableAreas.map((area) => {
                    const isSelected = filters.areaSlug === area.slug;
                    return (
                      <button
                        key={area.slug}
                        type="button"
                        onClick={() => onUpdateFilters({ areaSlug: area.slug })}
                        className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition-all tap-feedback cursor-pointer ${
                          isSelected
                            ? "bg-[#010528] border-[#010528] text-white"
                            : "bg-[#FAFAF8] border-[#E5E7EB] text-text-secondary hover:border-[#010528]"
                        }`}
                      >
                        {area.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Category Filter */}
              <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-midnight-lagoon">
                  Category
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = filters.category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => onUpdateFilters({ category: cat.value })}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all tap-feedback cursor-pointer ${
                          isSelected
                            ? "bg-[#008751]/10 border-[#008751] text-[#008751]"
                            : "bg-[#FAFAF8] border-[#E5E7EB] text-text-secondary hover:border-gray-400"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Vibe & Experience Filter */}
              <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-midnight-lagoon">
                  Outing Vibe
                </label>

                <div className="flex flex-wrap gap-2">
                  {VIBE_OPTIONS.map((v) => {
                    const isSelected = filters.vibe === v.value;
                    return (
                      <button
                        key={v.label}
                        type="button"
                        onClick={() => onUpdateFilters({ vibe: v.value })}
                        className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition-all tap-feedback cursor-pointer ${
                          isSelected
                            ? "bg-[#010528] border-[#010528] text-white"
                            : "bg-[#FAFAF8] border-[#E5E7EB] text-text-secondary hover:border-[#010528]"
                        }`}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Deterministic Sort Mode */}
              <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-midnight-lagoon flex items-center gap-1.5">
                  <ArrowUpDown className="w-4 h-4 text-[#008751]" /> Sorting Order
                </label>

                <div className="space-y-2">
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = filters.sortBy === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onUpdateFilters({ sortBy: opt.value })}
                        className={`w-full p-3 rounded-xl border text-left transition-all tap-feedback flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-[#EAFDF3] border-[#008751] text-midnight-lagoon"
                            : "bg-[#FAFAF8] border-[#E5E7EB] text-text-secondary hover:border-gray-400"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-black">{opt.label}</p>
                          <p className="text-[10px] text-text-muted">{opt.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#008751] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Sticky Bottom Actions Footer */}
            <div className="p-4 bg-white border-t border-[#E5E7EB] flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onResetFilters}
                className="py-3.5 px-4 rounded-xl border border-[#E5E7EB] text-text-muted hover:text-midnight-lagoon hover:bg-surface-grey font-black text-xs uppercase tracking-wider flex items-center gap-1.5 tap-feedback transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 px-5 rounded-xl bg-[#008751] hover:bg-[#007043] text-white font-black text-xs uppercase tracking-wider shadow-sm tap-feedback transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Show {matchCount} {matchCount === 1 ? "Spot" : "Spots"}</span>
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
