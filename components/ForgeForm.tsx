"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Area } from "@/lib/types";
import { AnalyticsService } from "@/lib/services/analytics/analyticsService";
import { Button } from "@/components/ui/button";
import { Heart, Coffee, Utensils, Music, Zap, Sun } from "lucide-react";

interface ForgeFormProps {
  areas: Area[];
}

const VIBE_OPTIONS = [
  { value: "Dinner", label: "Date Night", icon: Heart },
  { value: "Chill",  label: "Chill Hangout", icon: Coffee },
  { value: "Foodie", label: "Serious Chop", icon: Utensils },
  { value: "Party",  label: "Turn Up", icon: Music },
  { value: "Quick",  label: "Quick Link", icon: Zap },
  { value: "Brunch", label: "Brunch Vibes", icon: Sun },
];

const SQUAD_OPTIONS = [
  { value: "1", label: "Just Me" },
  { value: "2", label: "2 people" },
  { value: "4", label: "3-4 people" },
  { value: "6", label: "5+ people" },
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
  { id: 'vibe', title: "What's the plan today?" },
  { id: 'squad', title: "Nice. How many people?", reassurance: "Great choice." },
  { id: 'budget', title: "What's comfortable to spend?", reassurance: "Perfect. We'll find something that fits." },
  { id: 'area', title: "Anywhere in mind?", reassurance: "Almost there." }
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

export default function ForgeForm({ areas }: ForgeFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const rawVibe = searchParams.get("vibe") || "";
  const initialVibe = VIBE_URL_MAP[rawVibe] || rawVibe;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    vibe: initialVibe,
    squadSize: searchParams.get("squad") || "",
    budget: searchParams.get("budget") || "",
    startArea: searchParams.get("area") || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSelect = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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
    
    AnalyticsService.track('forge_started', {
      session_id: 'browser',
      properties: {
        category: 'Activation',
        source: 'conversational_flow',
        area: formData.startArea,
        budget: Number(formData.budget),
        squad_size: Number(formData.squadSize),
        version: '1.0'
      }
    });

    router.push(`/forge?${params.toString()}`);
  };

  const currentStep = STEPS[currentStepIndex];

  // Helper to render the summary ribbon
  const renderSummaryRibbon = () => {
    const parts = [];
    if (formData.vibe) {
      const v = VIBE_OPTIONS.find(o => o.value === formData.vibe)?.label;
      if (v) parts.push({ label: v, step: 0 });
    }
    if (formData.squadSize) {
      const s = SQUAD_OPTIONS.find(o => o.value === formData.squadSize)?.label;
      if (s) parts.push({ label: s, step: 1 });
    }
    if (formData.budget) {
      const b = BUDGET_OPTIONS.find(o => o.value === formData.budget)?.label;
      if (b) parts.push({ label: b, step: 2 });
    }
    if (formData.startArea) {
      const a = formData.startArea === "Anywhere" ? "Anywhere" : areas.find(a => a.slug === formData.startArea)?.name;
      if (a) parts.push({ label: a, step: 3 });
    }

    if (parts.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 mb-8 animate-in fade-in slide-in-from-top-2">
        {parts.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentStepIndex(p.step)}
              className="type-ui-label text-text-secondary hover:text-text-primary transition-colors py-1 px-3 bg-surface-grey rounded-full tap-feedback"
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
          {currentStep.reassurance && (
            <p className="type-body text-text-muted animate-in fade-in slide-in-from-bottom-1 delay-150 fill-mode-both">
              {currentStep.reassurance}
            </p>
          )}
          <h1 className="type-heading text-text-primary">
            {currentStep.title}
          </h1>
        </div>

        {/* Step 0: Vibe (Large Cards) */}
        {currentStep.id === 'vibe' && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {VIBE_OPTIONS.map((o) => {
              const isSelected = formData.vibe === o.value;
              return (
                <button
                  key={o.value}
                  onClick={() => handleSelect('vibe', o.value)}
                  className={`flex flex-col items-start p-5 rounded-[8px] transition-all duration-200 tap-feedback text-left border-2 ${
                    isSelected 
                      ? "bg-[#0A0A0A] border-[#0A0A0A] text-white shadow-sm" 
                      : "bg-[#F7F7F7] border-transparent text-text-primary hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A]"
                  }`}
                >
                  <o.icon className="w-6 h-6 mb-3" />
                  <span className="type-body font-bold tracking-tight">{o.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 1: Squad (Large Pills) */}
        {currentStep.id === 'squad' && (
          <div className="flex flex-col gap-3">
            {SQUAD_OPTIONS.map((o) => {
              const isSelected = formData.squadSize === o.value;
              return (
                <button
                  key={o.value}
                  onClick={() => handleSelect('squadSize', o.value)}
                  className={`w-full text-left px-6 py-5 rounded-[8px] transition-all duration-200 tap-feedback border-2 ${
                    isSelected
                      ? "bg-[#0A0A0A] border-[#0A0A0A] text-white"
                      : "bg-[#F7F7F7] border-transparent text-text-primary hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A]"
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
                  className={`w-full text-left px-6 py-5 rounded-[8px] transition-all duration-200 tap-feedback border-2 ${
                    isSelected
                      ? "bg-[#0A0A0A] border-[#0A0A0A] text-white"
                      : "bg-[#F7F7F7] border-transparent text-text-primary hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A]"
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
              className={`w-full text-left px-6 py-4 rounded-[8px] transition-all duration-200 tap-feedback border-2 ${
                formData.startArea === 'Anywhere'
                  ? "bg-[#0A0A0A] border-[#0A0A0A] text-white"
                  : "bg-[#F7F7F7] border-transparent text-text-primary hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A]"
              }`}
            >
              <span className="type-body font-semibold">Anywhere</span>
            </button>
            {areas.map((a) => {
              const isSelected = formData.startArea === a.slug;
              return (
                <button
                  key={a.slug}
                  onClick={() => handleSelect('startArea', a.slug)}
                  className={`w-full text-left px-6 py-4 rounded-[8px] transition-all duration-200 tap-feedback border-2 ${
                    isSelected
                      ? "bg-[#0A0A0A] border-[#0A0A0A] text-white"
                      : "bg-[#F7F7F7] border-transparent text-text-primary hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A]"
                  }`}
                >
                  <span className="type-body font-semibold">{a.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Final CTA - Only show when we're on the last step and have a value */}
        {currentStep.id === 'area' && formData.startArea !== "" && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-[64px] rounded-[8px] bg-[#0A0A0A] hover:bg-black/80 text-white type-venue-name overflow-hidden tap-feedback btn-intent-snaps"
            >
              {loading ? "Finding your plan..." : "See My Plan"}
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}
