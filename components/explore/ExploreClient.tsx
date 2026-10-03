"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ArrowUpDown, Compass, Check, Users, Wallet } from "lucide-react";
import { Spot } from "@/lib/types";
import { DiscoverySearchInput } from "./DiscoverySearchInput";
import { DiscoveryVenueCard } from "./DiscoveryVenueCard";
import { DiscoveryFilterSheet, FilterState, SortMode } from "./DiscoveryFilterSheet";
import { DiscoveryEmptyState } from "./DiscoveryEmptyState";
import { RecentlyViewedRow } from "@/components/venue/RecentlyViewedRow";
import { useSavedSpots } from "@/hooks/useSavedSpots";

interface ExploreClientProps {
  initialSpots: Spot[];
  availableAreas: Array<{ id: string; name: string; slug: string; activeSpotCount?: number }>;
  preselectedAreaSlug?: string;
  preselectedAreaName?: string;
  title?: string;
  subtitle?: string;
}

const QUICK_CATEGORIES = [
  { label: "All Spots", value: "all" },
  { label: "🍽️ Dining", value: "restaurant" },
  { label: "🍸 Bars & Drinks", value: "bar" },
  { label: "☕ Cafes", value: "cafe" },
  { label: "🎯 Activities", value: "activity" },
  { label: "🏖️ Beach & Nature", value: "beach" },
];

export function ExploreClient({
  initialSpots,
  availableAreas,
  preselectedAreaSlug,
  preselectedAreaName,
  title = "Find your spot. Know the damage.",
  subtitle = "Real menus, verified prices, and round-trip transport for Lagos outings.",
}: ExploreClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSaved, saveSpot, removeSpot } = useSavedSpots();

  // URL Parameter Initial State
  const initialQuery = searchParams.get("q") || "";
  const initialArea = preselectedAreaSlug || searchParams.get("area") || "all";
  const initialCategory = searchParams.get("category") || "all";
  const initialVibe = searchParams.get("vibe") || null;
  const initialBudget = searchParams.get("budget") ? parseInt(searchParams.get("budget")!) : null;
  const initialSquad = searchParams.get("squad") ? Math.max(1, parseInt(searchParams.get("squad")!)) : 2;
  const initialSort = (searchParams.get("sort") as SortMode) || "best-fit";

  // Filter State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<FilterState>({
    areaSlug: initialArea,
    category: initialCategory,
    vibe: initialVibe,
    budget: initialBudget,
    squadSize: initialSquad,
    sortBy: initialSort,
  });

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Sync state to URL without full-page reloads
  const updateUrlParams = useCallback((newFilters: FilterState, query: string) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (newFilters.areaSlug && newFilters.areaSlug !== "all" && !preselectedAreaSlug) {
      params.set("area", newFilters.areaSlug);
    }
    if (newFilters.category && newFilters.category !== "all") {
      params.set("category", newFilters.category);
    }
    if (newFilters.vibe) {
      params.set("vibe", newFilters.vibe);
    }
    if (newFilters.budget) {
      params.set("budget", newFilters.budget.toString());
    }
    if (newFilters.squadSize && newFilters.squadSize !== 2) {
      params.set("squad", newFilters.squadSize.toString());
    }
    if (newFilters.sortBy && newFilters.sortBy !== "best-fit") {
      params.set("sort", newFilters.sortBy);
    }

    const basePath = preselectedAreaSlug ? `/explore/${preselectedAreaSlug}` : "/explore";
    const qs = params.toString();
    const targetUrl = qs ? `${basePath}?${qs}` : basePath;
    window.history.replaceState(null, "", targetUrl);
  }, [preselectedAreaSlug]);

  const handleUpdateFilters = (updates: Partial<FilterState>) => {
    const nextFilters = { ...filters, ...updates };
    setFilters(nextFilters);
    updateUrlParams(nextFilters, searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateUrlParams(filters, query);
  };

  const handleResetFilters = () => {
    const defaultFilters: FilterState = {
      areaSlug: preselectedAreaSlug || "all",
      category: "all",
      vibe: null,
      budget: null,
      squadSize: 2,
      sortBy: "best-fit",
    };
    setSearchQuery("");
    setFilters(defaultFilters);
    updateUrlParams(defaultFilters, "");
  };

  // Deterministic Filtering Logic
  const filteredSpots = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return initialSpots.filter((spot) => {
      // 1. Search Query
      if (q) {
        const nameMatch = spot.name?.toLowerCase().includes(q);
        const areaMatch = spot.areas?.name?.toLowerCase().includes(q) || spot.address?.toLowerCase().includes(q);
        const catMatch = spot.category?.toLowerCase().includes(q);
        const vibeMatch = spot.vibe_tags?.some((v) => v.toLowerCase().includes(q));
        if (!nameMatch && !areaMatch && !catMatch && !vibeMatch) return false;
      }

      // 2. Area Filter
      if (filters.areaSlug && filters.areaSlug !== "all") {
        const spotArea = spot.areas?.slug || spot.address_slug;
        if (spotArea !== filters.areaSlug) return false;
      }

      // 3. Category Filter
      if (filters.category && filters.category !== "all") {
        if (spot.category?.toLowerCase() !== filters.category.toLowerCase()) {
          // Check for subcategory / experience match if direct category doesn't match
          if (spot.subcategory?.toLowerCase() !== filters.category.toLowerCase()) {
            return false;
          }
        }
      }

      // 4. Vibe Filter
      if (filters.vibe) {
        const targetVibe = filters.vibe.toLowerCase();
        const hasVibe = spot.vibe_tags?.some((v) => {
          const lower = v.toLowerCase();
          return lower.includes(targetVibe) || targetVibe.includes(lower);
        });
        if (!hasVibe) return false;
      }

      // 5. Total Squad Budget Filter
      if (filters.budget) {
        const spotSpend = (spot.price_per_person || 12000) * filters.squadSize;
        if (spotSpend > filters.budget) return false;
      }

      return true;
    });
  }, [initialSpots, searchQuery, filters]);

  // Deterministic Sorting Logic
  const sortedSpots = useMemo(() => {
    const results = [...filteredSpots];

    switch (filters.sortBy) {
      case "price-asc":
        return results.sort((a, b) => {
          const costA = (a.price_per_person || 12000) * filters.squadSize;
          const costB = (b.price_per_person || 12000) * filters.squadSize;
          return costA - costB;
        });

      case "price-desc":
        return results.sort((a, b) => {
          const costA = (a.price_per_person || 12000) * filters.squadSize;
          const costB = (b.price_per_person || 12000) * filters.squadSize;
          return costB - costA;
        });

      case "verified":
        return results.sort((a, b) => {
          const dateA = a.price_updated_at ? new Date(a.price_updated_at).getTime() : 0;
          const dateB = b.price_updated_at ? new Date(b.price_updated_at).getTime() : 0;
          return dateB - dateA;
        });

      case "best-fit":
      default:
        return results.sort((a, b) => {
          // 1. Budget Fit Proximity: Safely under budget without being dangerously far
          if (filters.budget) {
            const costA = (a.price_per_person || 12000) * filters.squadSize;
            const costB = (b.price_per_person || 12000) * filters.squadSize;
            const diffA = Math.abs(filters.budget - costA);
            const diffB = Math.abs(filters.budget - costB);
            if (diffA !== diffB) return diffA - diffB;
          }
          // 2. High confidence score
          const scoreA = a.computed_confidence_score || 50;
          const scoreB = b.computed_confidence_score || 50;
          if (scoreA !== scoreB) return scoreB - scoreA;
          // 3. Alphabetical fallback
          return a.name.localeCompare(b.name);
        });
    }
  }, [filteredSpots, filters.sortBy, filters.budget, filters.squadSize]);

  // Calculate active filter count for the badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.areaSlug !== "all" && !preselectedAreaSlug) count += 1;
    if (filters.category !== "all") count += 1;
    if (filters.vibe !== null) count += 1;
    if (filters.budget !== null) count += 1;
    if (filters.squadSize !== 2) count += 1;
    if (filters.sortBy !== "best-fit") count += 1;
    return count;
  }, [filters, preselectedAreaSlug]);

  const activeAreaName = useMemo(() => {
    if (filters.areaSlug === "all") return "All Lagos";
    const found = availableAreas.find((a) => a.slug === filters.areaSlug);
    return found?.name || filters.areaSlug;
  }, [filters.areaSlug, availableAreas]);

  const BUDGET_PILLS = [
    { label: "Any Budget", value: null },
    { label: "Under ₦20k", value: 20000 },
    { label: "Under ₦40k", value: 40000 },
    { label: "Under ₦60k", value: 60000 },
    { label: "Under ₦100k", value: 100000 },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#F6F6F2] pt-20 sm:pt-24 pb-20 px-4 sm:px-6 md:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Editorial Discovery Hero */}
        <div className="text-left space-y-3">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-[#F9E828] bg-[#111111] px-3 py-1 rounded-full shadow-xs">
            <span>OYAPLAN SPOT DIRECTORY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] tracking-tight font-display uppercase">
            {title}
          </h1>
          <p className="text-sm md:text-base text-[#555555] max-w-2xl font-medium leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Factual Recently Viewed Shelf */}
        <RecentlyViewedRow className="pt-1" />

        {/* Master Discovery & Filter Dashboard */}
        <div className="space-y-3.5">
          
          {/* Top Row: Instant Search + Filter Sheet Trigger */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <DiscoverySearchInput
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search spot name, area, cuisine, or vibe..."
              />
            </div>

            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(true)}
              aria-label={`Open filters. ${activeFilterCount} active filters`}
              className={`h-[50px] px-4 rounded-xl border font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 tap-feedback cursor-pointer ${
                activeFilterCount > 0
                  ? "bg-[#111111] border-[#111111] text-[#F9E828] shadow-xs"
                  : "bg-white border-[#E5E5DE] text-[#111111] hover:border-[#111111] shadow-2xs"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#F9E828] text-[#111111] text-[10px] flex items-center justify-center font-black">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Budget Pills (Horizontal Rail) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] font-bold shrink-0 mr-1">
              Budget:
            </span>
            {BUDGET_PILLS.map((pill) => {
              const isSelected = filters.budget === pill.value;
              return (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => handleUpdateFilters({ budget: pill.value })}
                  className={`py-1.5 px-3 rounded-full border text-xs font-mono font-bold shrink-0 transition-all snap-start tap-feedback cursor-pointer ${
                    isSelected
                      ? "bg-[#111111] border-[#111111] text-[#F9E828] shadow-xs"
                      : "bg-white border-[#E5E5DE] text-[#555555] hover:text-[#111111] hover:border-[#111111]"
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Quick Area Chips (Scrollable Horizontal Strip) */}
          {!preselectedAreaSlug && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
              <button
                type="button"
                onClick={() => handleUpdateFilters({ areaSlug: "all" })}
                className={`py-1.5 px-3 rounded-full border text-xs font-bold uppercase tracking-wider shrink-0 transition-all snap-start tap-feedback cursor-pointer ${
                  filters.areaSlug === "all"
                    ? "bg-[#111111] border-[#111111] text-white shadow-xs"
                    : "bg-white border-[#E5E5DE] text-[#555555] hover:border-[#111111]"
                }`}
              >
                All Lagos ({initialSpots.length})
              </button>
              {availableAreas.map((area) => {
                const isSelected = filters.areaSlug === area.slug;
                return (
                  <button
                    key={area.slug}
                    type="button"
                    onClick={() => handleUpdateFilters({ areaSlug: area.slug })}
                    className={`py-2 px-3.5 rounded-full border text-xs font-extrabold uppercase tracking-wide shrink-0 transition-all snap-start tap-feedback cursor-pointer ${
                      isSelected
                        ? "bg-midnight-lagoon border-midnight-lagoon text-white shadow-xs"
                        : "bg-white border-[#EAE4DC] text-text-secondary hover:border-midnight-lagoon"
                    }`}
                  >
                    {area.name} {area.activeSpotCount ? `(${area.activeSpotCount})` : ""}
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {QUICK_CATEGORIES.map((cat) => {
              const isSelected = filters.category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleUpdateFilters({ category: cat.value })}
                  className={`py-2 px-3.5 rounded-full border text-xs font-extrabold uppercase tracking-wide shrink-0 transition-all snap-start tap-feedback cursor-pointer ${
                    isSelected
                      ? "bg-[#008751] border-[#008751] text-white shadow-xs"
                      : "bg-white border-[#EAE4DC] text-text-secondary hover:border-[#008751]/40"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Quick Active Controls Banner */}
          <div className="p-3.5 bg-white rounded-2xl border border-[#EAE4DC] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Squad Selector Quick Indicator */}
              <div className="flex items-center gap-1.5 text-text-secondary font-bold">
                <Users className="w-4 h-4 text-[#008751]" />
                <span>Squad:</span>
                <span className="font-black text-midnight-lagoon">{filters.squadSize} people</span>
              </div>

              {/* Budget Quick Indicator */}
              <div className="flex items-center gap-1.5 text-text-secondary font-bold">
                <Wallet className="w-4 h-4 text-[#008751]" />
                <span>Budget:</span>
                <span className="font-black text-[#008751]">
                  {filters.budget ? `₦${filters.budget.toLocaleString("en-NG")}` : "Any"}
                </span>
              </div>
            </div>

            {/* Quick Sorting Dropdown */}
            <div className="flex items-center gap-1.5 text-text-muted">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#008751]" />
              <select
                value={filters.sortBy}
                onChange={(e) => handleUpdateFilters({ sortBy: e.target.value as SortMode })}
                className="bg-transparent border-none text-xs font-black text-midnight-lagoon focus:ring-0 p-0 cursor-pointer"
                aria-label="Sort venues"
              >
                <option value="best-fit">Sort: Best Match</option>
                <option value="price-asc">Sort: Spend Low to High</option>
                <option value="price-desc">Sort: Spend High to Low</option>
                <option value="verified">Sort: Recently Verified</option>
              </select>
            </div>
          </div>

        </div>

        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-sm font-black uppercase tracking-wider text-text-muted">
            {sortedSpots.length === 1 ? "1 Verified Spot Fits" : `${sortedSpots.length} Verified Spots Fit`}
          </h2>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-extrabold text-[#008751] hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Results Grid / Empty State */}
        {sortedSpots.length === 0 ? (
          <DiscoveryEmptyState
            searchQuery={searchQuery}
            activeAreaName={activeAreaName}
            activeCategory={filters.category}
            activeVibe={filters.vibe}
            currentBudget={filters.budget}
            squadSize={filters.squadSize}
            onClearSearch={() => handleSearchChange("")}
            onIncreaseBudget={(newBudget) => handleUpdateFilters({ budget: newBudget })}
            onExpandArea={() => handleUpdateFilters({ areaSlug: "all" })}
            onClearVibe={() => handleUpdateFilters({ vibe: null })}
            onResetAll={handleResetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 items-stretch">
            {sortedSpots.map((spot) => (
              <DiscoveryVenueCard
                key={spot.id}
                spot={spot}
                squadSize={filters.squadSize}
                budget={filters.budget}
                isSaved={isSaved(spot.id)}
                onToggleSave={() => {
                  if (isSaved(spot.id)) {
                    removeSpot(spot.id);
                  } else {
                    saveSpot(spot);
                  }
                }}
              />
            ))}
          </div>
        )}

      </div>

      {/* Filter Bottom Sheet */}
      <DiscoveryFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        onUpdateFilters={handleUpdateFilters}
        onResetFilters={handleResetFilters}
        availableAreas={availableAreas}
        matchCount={filteredSpots.length}
      />
    </div>
  );
}
