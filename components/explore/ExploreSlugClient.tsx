"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, LayoutGrid, Layers, Users, Wallet, Compass, Landmark } from "lucide-react";
import Link from "next/link";
import { Spot } from "@/lib/types";
import { DecisionCardViewModel } from "@/lib/planning/presentation/types";
import { VenueCard } from "./VenueCard";
import { VenueCardStack } from "./VenueCardStack";
import { useSavedSpots } from "@/hooks/useSavedSpots";

// Active start areas (must use only active beta areas)
const ACTIVE_AREAS = [
  { id: "ikeja", name: "Ikeja" },
  { id: "yaba", name: "Yaba" },
  { id: "vi", name: "Victoria Island" },
  { id: "lekki-phase-1", name: "Lekki Phase 1" },
];

const VIBE_OPTIONS = [
  { label: "Date Night", value: "date-night" },
  { label: "Chill Out", value: "chill" },
  { label: "Foodie", value: "foodie" },
  { label: "Party", value: "party" },
  { label: "Brunch", value: "brunch" },
];

interface ExploreSlugClientProps {
  slug: string;
  areaName: string;
  initialSpots: DecisionCardViewModel[];
  rawSpots: Spot[];
  initialBudget: number | null;
  initialVibe: string | null;
  initialSquadCount: number;
  initialStartArea: string | null;
}

export function ExploreSlugClient({
  slug,
  areaName,
  initialSpots,
  rawSpots,
  initialBudget,
  initialVibe,
  initialSquadCount,
  initialStartArea,
}: ExploreSlugClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for UI toggles
  const [viewMode, setViewMode] = useState<"swipe" | "grid">("swipe");
  const { isSaved, saveSpot, removeSpot } = useSavedSpots();

  // Active filter states
  const squadCount = initialSquadCount;
  const budget = initialBudget;
  const vibe = initialVibe;
  const startArea = initialStartArea;

  const updateFilters = (updates: {
    squad?: number;
    budget?: number | null;
    vibe?: string | null;
    startArea?: string | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updates.squad !== undefined) {
      params.set("squad", updates.squad.toString());
    }
    if (updates.budget !== undefined) {
      if (updates.budget === null) params.delete("budget");
      else params.set("budget", updates.budget.toString());
    }
    if (updates.vibe !== undefined) {
      if (updates.vibe === null) params.delete("vibe");
      else params.set("vibe", updates.vibe);
    }
    if (updates.startArea !== undefined) {
      if (updates.startArea === null) params.delete("startArea");
      else params.set("startArea", updates.startArea);
    }

    startTransition(() => {
      router.push(`/explore/${slug}?${params.toString()}`);
    });
  };

  const resolveSpot = (card: DecisionCardViewModel): Spot => {
    return rawSpots.find(s => s.id === card.spotId) || {
      id: card.spotId,
      name: card.spotName,
      address: card.address,
      address_slug: card.addressSlug || slug,
      area_id: slug,
      vibe_tags: card.whyItFits ? card.whyItFits.split(' • ') : ['Chill'],
      price_per_person: card.pricePerPerson || Math.round(card.venueCost / squadCount),
      price_updated_at: new Date().toISOString(),
      price_source: 'manual',
      transport_matrix: {},
      is_featured: false,
      active: true,
      category: (card.category as Spot['category']) || 'restaurant',
      has_food: true,
      typical_duration_hours: 2,
    };
  };

  const handleSaveToggle = (card: DecisionCardViewModel) => {
    if (isSaved(card.spotId)) {
      removeSpot(card.spotId);
    } else {
      saveSpot(resolveSpot(card));
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF8] pt-8 flex flex-col relative overflow-x-hidden pb-12 antialiased">
      {/* Header and Controls */}
      <div className="w-full max-w-lg mx-auto px-6 mb-6 flex flex-col z-10 relative">
        <Link href="/explore" className="inline-flex items-center gap-2 type-label text-text-muted hover:text-[#010528] transition-colors mb-4 w-fit tap-feedback">
          <ArrowLeft className="w-4 h-4" />
          All Areas
        </Link>

        {/* Title Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-[#010528] capitalize leading-none">{areaName}</h1>
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mt-1.5">
              {initialSpots.length} verified spots
            </span>
          </div>

          {/* Grid vs Swipe Toggle */}
          <div className="flex bg-white border border-border-default/60 rounded-xl p-1 shadow-sm shrink-0">
            <button
              onClick={() => setViewMode("swipe")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "swipe"
                  ? "bg-[#010528] text-white"
                  : "text-text-muted hover:text-[#010528]"
              }`}
              title="Swipe Mode"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-[#010528] text-white"
                  : "text-text-muted hover:text-[#010528]"
              }`}
              title="Grid List Mode"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Control Dashboard */}
        <div className="bg-white border border-border-default/60 rounded-2xl p-4 shadow-sm space-y-4">
          
          {/* Row 1: Squad Counter & Start Area Dropdown */}
          <div className="grid grid-cols-2 gap-3">
            {/* Squad */}
            <div className="bg-[#FAFAF8] rounded-xl p-2.5 border border-border-default/40 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-text-muted flex items-center gap-1 select-none">
                <Users className="w-3.5 h-3.5 text-[#008751]" /> Squad
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateFilters({ squad: Math.max(1, squadCount - 1) })}
                  aria-label="Decrease squad size"
                  className="w-8 h-8 rounded-lg bg-white border border-border-default flex items-center justify-center font-bold text-base text-[#010528] hover:bg-[#010528]/5 tap-feedback transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="font-extrabold text-sm text-[#010528] w-5 text-center">{squadCount}</span>
                <button
                  type="button"
                  onClick={() => updateFilters({ squad: squadCount + 1 })}
                  aria-label="Increase squad size"
                  className="w-8 h-8 rounded-lg bg-white border border-border-default flex items-center justify-center font-bold text-base text-[#010528] hover:bg-[#010528]/5 tap-feedback transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Starting Area */}
            <div className="bg-[#FAFAF8] rounded-xl p-2.5 border border-border-default/40 flex flex-col justify-center">
              <span className="text-[9px] font-black uppercase text-text-muted flex items-center gap-1 mb-1 select-none">
                <Compass className="w-3 h-3 text-[#008751]" /> Leaving From
              </span>
              <select
                value={startArea || "anywhere"}
                onChange={(e) => updateFilters({ startArea: e.target.value === "anywhere" ? null : e.target.value })}
                className="bg-transparent border-none text-xs font-black text-[#010528] focus:ring-0 p-0 cursor-pointer w-full select-none"
              >
                <option value="anywhere">Anywhere (Lagos)</option>
                {ACTIVE_AREAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Vibe selector pills */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-black uppercase text-text-muted block select-none">
              Outing Vibe
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => updateFilters({ vibe: null })}
                className={`px-3 py-1.5 rounded-full border text-[11px] font-extrabold uppercase tracking-wide shrink-0 transition-all ${
                  !vibe
                    ? "bg-[#010528] border-[#010528] text-white"
                    : "bg-white border-border-default text-text-muted hover:text-[#010528]"
                }`}
              >
                All
              </button>
              {VIBE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFilters({ vibe: opt.value })}
                  className={`px-3 py-1.5 rounded-full border text-[11px] font-extrabold uppercase tracking-wide shrink-0 transition-all ${
                    vibe === opt.value
                      ? "bg-[#010528] border-[#010528] text-white"
                      : "bg-white border-border-default text-text-muted hover:text-[#010528]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Budget slider / Quick options */}
          <div className="space-y-2 border-t border-border-default/40 pt-3">
            <div className="flex justify-between items-center select-none">
              <span className="text-[9px] font-black uppercase text-text-muted flex items-center gap-1">
                <Wallet className="w-3 h-3 text-[#008751]" /> Max Budget per person
              </span>
              <span className="text-xs font-extrabold text-[#008751]">
                {budget ? `₦${budget.toLocaleString()}` : "Any budget"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateFilters({ budget: null })}
                className={`flex-1 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider text-center ${
                  !budget
                    ? "bg-[#008751] border-[#008751] text-white"
                    : "bg-[#FAFAF8] border-border-default/60 text-text-muted hover:bg-white"
                }`}
              >
                Any
              </button>
              {[15000, 25000, 45000].map((val) => (
                <button
                  key={val}
                  onClick={() => updateFilters({ budget: val })}
                  className={`flex-1 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider text-center ${
                    budget === val
                      ? "bg-[#008751] border-[#008751] text-white"
                      : "bg-[#FAFAF8] border-border-default/60 text-text-muted hover:bg-white"
                  }`}
                >
                  ₦{val / 1000}k
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 w-full flex items-center justify-center pb-12 z-10 relative">
        {isPending && (
          <div className="absolute inset-0 bg-[#FAFAF8]/60 backdrop-blur-[1px] z-30 flex items-center justify-center pointer-events-auto">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#010528]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008751] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008751]"></span>
              </span>
              <span>Running numbers...</span>
            </div>
          </div>
        )}

        {initialSpots.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center px-6 py-12">
            <div className="w-16 h-16 bg-[#F0EDE8] rounded-full flex items-center justify-center mb-4">
              <Compass className="w-8 h-8 text-text-muted animate-pulse" />
            </div>
            <h3 className="text-lg font-black text-[#010528] mb-1.5">No matches found</h3>
            <p className="text-text-muted text-xs mb-6 max-w-[280px]">
              We verified no spots fitting these squad metrics. Try raising your budget or selecting &apos;All Vibes&apos;.
            </p>
          </div>
        ) : viewMode === "swipe" ? (
          <VenueCardStack
            spots={initialSpots}
            rawSpots={rawSpots}
            slug={slug}
            budget={budget || undefined}
            vibe={vibe || undefined}
            squadCount={squadCount}
          />
        ) : (
          /* Grid View Layout (Optimized for Mobile first but scalable to Desktop) */
          <div className="w-full max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 items-stretch justify-items-center">
            {initialSpots.map((card) => (
              <div key={card.spotId} className="w-full max-w-[400px]">
                <VenueCard
                  card={card}
                  slug={slug}
                  isSaved={isSaved(card.spotId)}
                  onSaveToggle={() => handleSaveToggle(card)}
                  budget={budget || undefined}
                  vibe={vibe || undefined}
                  squadCount={squadCount}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decorative background glow using brand green */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-10" 
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #008751 0%, transparent 65%)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
        }} 
      />
    </div>
  );
}
