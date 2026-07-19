"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Area, Spot } from "@/lib/types";
import { AnalyticsService } from "@/lib/services/analytics/analyticsService";
import { Button } from "@/components/ui/button";
import { Heart, Coffee, Utensils, Music, Zap, Sun } from "lucide-react";
import { getAvailableOptions } from "@/lib/services/matching/forgeMatcher";

interface ForgeFormProps {
  areas: Area[];
  spots: Spot[];
}

const VIBE_OPTIONS = [
  { value: "Dinner", label: "Date Night (Chop Eye)", icon: Heart },
  { value: "Chill",  label: "Chill Vibe", icon: Coffee },
  { value: "Foodie", label: "Serious Chop", icon: Utensils },
  { value: "Party",  label: "Turn Up", icon: Music },
  { value: "Quick",  label: "Quick Linkup", icon: Zap },
  { value: "Brunch", label: "Brunch Vibe", icon: Sun },
];

const SQUAD_OPTIONS = [
  { value: "1", label: "Na only me (1)" },
  { value: "2", label: "Me & plus one (2)" },
  { value: "4", label: "Small squad (3-4)" },
  { value: "6", label: "Full entourage (5+)" },
];

const BUDGET_OPTIONS = [
  { value: "15000", label: "₦15k" },
  { value: "25000", label: "₦25k" },
  { value: "50000", label: "₦50k" },
  { value: "100000", label: "₦100k" },
  { value: "250000", label: "₦250k+" },
];

type StepId = 'vibe' | 'squad' | 'budget' | 'area';

interface Step {
  id: StepId;
  title: string;
  reassurance?: string;
}

const STEPS: Step[] = [
  { id: 'budget', title: "How much is your budget? (What's the damage?)" },
  { id: 'area', title: "Where you wan go?", reassurance: "Understood. We'll find somewhere fresh that fits." },
  { id: 'squad', title: "Who's coming? (Na only you or squad?)", reassurance: "Solid squad size." },
  { id: 'vibe', title: "What's the gbedu/vibe?", reassurance: "Almost active. Prepping plans..." }
];

const VIBE_URL_MAP: Record<string, string> = {
  "date-night": "Dinner",
  "chill": "Chill",
  "foodie": "Foodie",
  "party": "Party",
  "quick-link": "Quick",
  "brunch": "Brunch"
};

const VIBE_TO_URL_MAP: Record<string, string> = {
  "Dinner": "date-night",
  "Chill": "chill",
  "Foodie": "foodie",
  "Party": "party",
  "Quick": "quick-link",
  "Brunch": "brunch"
};

export default function ForgeForm({ areas, spots }: ForgeFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const getInitialVibe = () => {
    const rawVibe = searchParams.get("vibe") || "";
    return VIBE_URL_MAP[rawVibe] || rawVibe;
  };

  const getInitialState = () => {
    return {
      vibe: getInitialVibe(),
      squadSize: searchParams.get("squad") || searchParams.get("squadSize") || "",
      budget: searchParams.get("budget") || "",
      startArea: searchParams.get("area") || searchParams.get("startArea") || "",
      pinnedSpotId: searchParams.get("pinned") || searchParams.get("pinnedSpotId") || "",
    };
  };

  const [formData, setFormData] = useState(getInitialState);

  // Determine initial step dynamically on load based on prefilled URL parameters
  const getInitialStep = () => {
    const init = getInitialState();
    if (!init.budget) return 0;
    if (!init.startArea) return 1;
    if (!init.squadSize) return 2;
    if (!init.vibe) return 3;
    return 3;
  };

  const [currentStepIndex, setCurrentStepIndex] = useState(getInitialStep);
  const [loading, setLoading] = useState(false);

  // Sync component state when URL search parameters change (Back/Forward, Explore redirection)
  useEffect(() => {
    const nextState = getInitialState();
    setFormData(nextState);
  }, [searchParams]);

  // Compute option viability using the shared matching constraints from forgeMatcher
  const selections = {
    budget: formData.budget ? Number(formData.budget) : undefined,
    startArea: formData.startArea || undefined,
    squadSize: formData.squadSize ? Number(formData.squadSize) : undefined,
    vibe: formData.vibe || undefined,
  };

  const viability = getAvailableOptions(spots || [], selections);

  const handleSelect = (field: keyof typeof formData, value: string) => {
    setFormData(prev => {
      const nextState = { ...prev, [field]: value };
      
      // Cascade resets: invalidate subsequent choices if they become impossible under the new selection
      const currentViability = getAvailableOptions(spots || [], {
        budget: nextState.budget ? Number(nextState.budget) : undefined,
        startArea: nextState.startArea || undefined,
        squadSize: nextState.squadSize ? Number(nextState.squadSize) : undefined,
        vibe: nextState.vibe || undefined,
      });

      if (field === 'budget') {
        if (nextState.startArea && nextState.startArea !== 'Anywhere' && currentViability.areas[nextState.startArea]?.disabled) {
          nextState.startArea = '';
        }
        if (nextState.squadSize && currentViability.squadSizes[nextState.squadSize]?.disabled) {
          nextState.squadSize = '';
        }
        if (nextState.vibe && currentViability.vibes[nextState.vibe]?.disabled) {
          nextState.vibe = '';
        }
      } else if (field === 'startArea') {
        if (nextState.squadSize && currentViability.squadSizes[nextState.squadSize]?.disabled) {
          nextState.squadSize = '';
        }
        if (nextState.vibe && currentViability.vibes[nextState.vibe]?.disabled) {
          nextState.vibe = '';
        }
      } else if (field === 'squadSize') {
        if (nextState.vibe && currentViability.vibes[nextState.vibe]?.disabled) {
          nextState.vibe = '';
        }
      }

      return nextState;
    });
    
    // Auto-advance
    if (currentStepIndex < STEPS.length - 1) {
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 300); // 300ms delay for smooth transition
    }
  };

  const handleSubmit = () => {
    if (!formData.vibe || !formData.squadSize || !formData.budget) {
      return;
    }
    setLoading(true);
    
    const params = new URLSearchParams();
    if (formData.vibe) {
      const urlVibe = VIBE_TO_URL_MAP[formData.vibe] || formData.vibe;
      params.append("vibe", urlVibe);
    }
    if (formData.squadSize) params.append("squad", formData.squadSize);
    if (formData.budget) params.append("budget", formData.budget);
    if (formData.startArea && formData.startArea !== "Anywhere") {
      params.append("area", formData.startArea);
    }
    if (formData.pinnedSpotId) {
      params.append("pinned", formData.pinnedSpotId);
    }
    
    AnalyticsService.track('forge_started', {
      session_id: '00000000-0000-0000-0000-000000000000',
      properties: {
        category: 'Activation',
        source: 'conversational_flow',
        area: formData.startArea,
        budget: Number(formData.budget),
        squad_size: Number(formData.squadSize),
        version: '1.0'
      }
    });

    params.set("fresh", "true");
    router.push(`/forge?${params.toString()}`);
  };

  const currentStep = STEPS[currentStepIndex];

  // Helper to render the summary ribbon
  const renderSummaryRibbon = () => {
    const parts = [];
    if (formData.budget) {
      const b = BUDGET_OPTIONS.find(o => o.value === formData.budget)?.label;
      if (b) parts.push({ label: b, step: 0 });
    }
    if (formData.startArea) {
      const a = formData.startArea === "Anywhere" ? "Anywhere" : areas.find(a => a.slug === formData.startArea)?.name;
      if (a) parts.push({ label: a, step: 1 });
    }
    if (formData.squadSize) {
      const s = SQUAD_OPTIONS.find(o => o.value === formData.squadSize)?.label;
      if (s) parts.push({ label: s, step: 2 });
    }
    if (formData.vibe) {
      const v = VIBE_OPTIONS.find(o => o.value === formData.vibe)?.label;
      if (v) parts.push({ label: v, step: 3 });
    }

    if (parts.length === 0) return null;


    return (
      <div className="flex flex-wrap items-center gap-2 mb-8 animate-in fade-in slide-in-from-top-2">
        {parts.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentStepIndex(p.step)}
              className="type-ui-label text-text-secondary hover:text-midnight-lagoon transition-colors py-1 px-3 bg-surface-grey hover:bg-lasgidi-yellow/20 rounded-full tap-feedback"
            >
              {p.label}
            </button>
            {i < parts.length - 1 && <span className="text-border-default">•</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto py-4 px-4 sm:px-0 min-h-[400px]">
      
      {renderSummaryRibbon()}

      <div key={currentStep.id} className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="space-y-2 mb-8">
          <h1 className="type-heading text-text-primary">
            {currentStep.title}
          </h1>
        </div>

        {/* Step 0: Vibe (Large Cards) */}
        {currentStep.id === 'vibe' && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {VIBE_OPTIONS.map((o) => {
              const isSelected = formData.vibe === o.value;
              const vViab = viability.vibes[o.value] || { disabled: false };
              return (
                <button
                  key={o.value}
                  disabled={vViab.disabled}
                  onClick={() => !vViab.disabled && handleSelect('vibe', o.value)}
                  className={`flex flex-col items-start p-5 rounded-[8px] transition-[colors,border-color,box-shadow] duration-[var(--duration-hover)] tap-feedback text-left border-2 ${
                    isSelected 
                      ? "bg-midnight-lagoon border-midnight-lagoon text-white shadow-sm" 
                      : vViab.disabled 
                      ? "bg-surface-grey border-transparent text-text-muted opacity-40 cursor-not-allowed"
                      : "bg-white-sand border-transparent text-text-primary hover:bg-midnight-lagoon hover:text-white hover:border-midnight-lagoon"
                  }`}
                >
                  <o.icon className="w-6 h-6 mb-3" />
                  <span className="type-body font-bold tracking-tight">{o.label}</span>
                  {vViab.disabled && vViab.reason && (
                    <span className="text-[10px] text-red-500 font-semibold mt-1 block">
                      {vViab.reason}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Step 1: Squad (Large Pills - Always selectable for user flexibility) */}
        {currentStep.id === 'squad' && (
          <div className="flex flex-col gap-3">
            {SQUAD_OPTIONS.map((o) => {
              const isSelected = formData.squadSize === o.value;
              return (
                <button
                  key={o.value}
                  onClick={() => handleSelect('squadSize', o.value)}
                  className={`w-full text-left px-6 py-5 rounded-[8px] transition-[colors,border-color,box-shadow] duration-[var(--duration-hover)] tap-feedback border-2 ${
                    isSelected
                      ? "bg-midnight-lagoon border-midnight-lagoon text-white"
                      : "bg-white-sand border-transparent text-text-primary hover:bg-midnight-lagoon hover:text-white hover:border-midnight-lagoon"
                  }`}
                >
                  <span className="type-venue-name">{o.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Budget (Large Pills) */}
        {currentStep.id === 'budget' && (
          <div className="flex flex-col gap-3">
            {BUDGET_OPTIONS.map((o) => {
              const isSelected = formData.budget === o.value;
              return (
                <button
                  key={o.value}
                  onClick={() => handleSelect('budget', o.value)}
                  className={`w-full text-left px-6 py-5 rounded-[8px] transition-[colors,border-color,box-shadow] duration-[var(--duration-hover)] tap-feedback border-2 ${
                    isSelected
                      ? "bg-midnight-lagoon border-midnight-lagoon text-white"
                      : "bg-white-sand border-transparent text-text-primary hover:bg-midnight-lagoon hover:text-white hover:border-midnight-lagoon"
                  }`}
                >
                  <span className="type-venue-name">{o.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 3: Area (Vertical list of pills for mobile ease, mimicking horizontal on desktop if we wanted, but vertical is safer for one-handed reach) */}
        {currentStep.id === 'area' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleSelect('startArea', 'Anywhere')}
              className={`w-full text-left px-6 py-4 rounded-[8px] transition-[colors,border-color,box-shadow] duration-[var(--duration-hover)] tap-feedback border-2 ${
                formData.startArea === 'Anywhere'
                  ? "bg-midnight-lagoon border-midnight-lagoon text-white"
                  : "bg-white-sand border-transparent text-text-primary hover:bg-midnight-lagoon hover:text-white hover:border-midnight-lagoon"
              }`}
            >
              <span className="type-body font-semibold">Anywhere</span>
            </button>
            {areas.map((a) => {
              const isSelected = formData.startArea === a.slug;
              const aViab = viability.areas[a.slug] || { disabled: false };
              return (
                <button
                  key={a.slug}
                  disabled={aViab.disabled}
                  onClick={() => !aViab.disabled && handleSelect('startArea', a.slug)}
                  className={`w-full text-left px-6 py-4 rounded-[8px] transition-[colors,border-color,box-shadow] duration-[var(--duration-hover)] tap-feedback border-2 flex items-center justify-between ${
                    isSelected
                      ? "bg-midnight-lagoon border-midnight-lagoon text-white"
                      : aViab.disabled
                      ? "bg-surface-grey border-transparent text-text-muted opacity-40 cursor-not-allowed"
                      : "bg-white-sand border-transparent text-text-primary hover:bg-midnight-lagoon hover:text-white hover:border-midnight-lagoon"
                  }`}
                >
                  <span className="type-body font-semibold">{a.name}</span>
                  {aViab.disabled && aViab.reason && (
                    <span className="text-xs text-red-500 font-semibold">
                      {aViab.reason}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Final CTA - Only show when we're on the last step and have a value */}
        {currentStep.id === 'vibe' && formData.vibe !== "" && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-[64px] rounded-full bg-lasgidi-yellow hover:bg-lasgidi-yellow/90 text-midnight-lagoon font-extrabold text-lg overflow-hidden tap-feedback btn-spring disabled:opacity-50"
            >
              {loading ? "Finding your plan..." : "Find Places"}
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}

