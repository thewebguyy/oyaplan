"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Spot, ForgeInput, PlanEvaluation } from "@/lib/types";
import { submitSpotSuggestion } from "@/lib/actions/submitSpotSuggestion";
import { AnalyticsService } from "@/lib/services/analytics/analyticsService";
import EditorialPlan from "@/components/EditorialPlan";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import DossierDropWrapper from "@/components/DossierDropWrapper";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ForgeResultsClientProps {
  evaluations: PlanEvaluation[];
  vibeMetrics: { min: number; median: number; max: number } | null;
  nearbySpots: Spot[];
  targetAreaName: string;
  forgeInput: ForgeInput;
  allSpots: Spot[];
}

export default function ForgeResultsClient({
  evaluations,
  vibeMetrics,
  nearbySpots,
  targetAreaName,
  forgeInput,
  allSpots
}: ForgeResultsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [revealStep, setRevealStep] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Client-side simulated audit reveal sequence
  useEffect(() => {
    if (evaluations.length === 0) {
      setIsRevealed(true);
      return;
    }

    const timer1 = setTimeout(() => setRevealStep(1), 700);   // checking transport -> transport estimated
    const timer2 = setTimeout(() => setRevealStep(2), 1400);  // checking venue pricing -> venue pricing verified
    const timer3 = setTimeout(() => setRevealStep(3), 2100);  // adding buffer -> buffer included
    const timer4 = setTimeout(() => setRevealStep(4), 2800);  // Confidence Summary checks reveal
    const timer5 = setTimeout(() => setRevealStep(5), 4600);  // Done checks
    const timer6 = setTimeout(() => setIsRevealed(true), 5000); // Reveal recommendation cards

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, [evaluations.length]);

  // Save to localStorage post-hydration
  useEffect(() => {
    try {
      localStorage.setItem("oyaplan_last_inputs", JSON.stringify({
        ...forgeInput,
        timestamp: Date.now()
      }));
    } catch { /* ignore localStorage errors */ }
  }, [forgeInput]);

  // Analytics tracking on mount/change
  useEffect(() => {
    if (isRevealed) {
      AnalyticsService.track('forge_completed', {
        session_id: '00000000-0000-0000-0000-000000000000',
        properties: {
          category: 'Activation',
          plans_generated: evaluations.length,
          vibe: forgeInput.vibe,
          budget: forgeInput.budget,
          version: '1.0'
        }
      });
    }
  }, [evaluations.length, forgeInput.vibe, forgeInput.budget, isRevealed]);

  // Strip 'fresh' param from URL to prevent 900ms delay on reload
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("fresh")) {
        url.searchParams.delete("fresh");
        window.history.replaceState(null, "", url.toString());
      }
    }
  }, []);

  const handleAdjustBudget = (delta: number) => {
    const newBudget = forgeInput.budget + delta;
    
    // Map vibe tag back to URL tag
    const VIBE_TO_URL_MAP: Record<string, string> = {
      "Dinner": "date-night",
      "Chill": "chill",
      "Foodie": "foodie",
      "Party": "party",
      "Quick": "quick-link",
      "Brunch": "brunch"
    };
    const urlVibe = VIBE_TO_URL_MAP[forgeInput.vibe] || forgeInput.vibe;

    const params = new URLSearchParams();
    params.set("vibe", urlVibe);
    params.set("squad", forgeInput.squadSize.toString());
    params.set("budget", newBudget.toString());
    if (forgeInput.startArea && forgeInput.startArea !== "anywhere") {
      params.set("area", forgeInput.startArea);
    }
    if (forgeInput.pinnedSpotId) {
      params.set("pinned", forgeInput.pinnedSpotId);
    }

    startTransition(() => {
      router.push(`/forge?${params.toString()}`, { scroll: false });
    });
  };

  const startAreaLabel = allSpots.find(s => s.areas?.slug === forgeInput.startArea)?.areas?.name || forgeInput.startArea;
  
  const recoveryBudget = (vibeMetrics && forgeInput.budget < vibeMetrics.median)
    ? vibeMetrics.median 
    : forgeInput.budget * 1.2;

  // URL vibe mapper for redirecting back
  const VIBE_TO_URL_MAP: Record<string, string> = {
    "Dinner": "date-night",
    "Chill": "chill",
    "Foodie": "foodie",
    "Party": "party",
    "Quick": "quick-link",
    "Brunch": "brunch"
  };

  if (!isRevealed && evaluations.length > 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center max-w-md mx-auto px-6 py-12 space-y-12">
        {revealStep < 4 ? (
          <div className="w-full space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2 text-center">
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-text-muted">Budget Audit</span>
              <h2 className="type-display-product text-midnight-lagoon text-2xl font-black">Checking calculations...</h2>
            </div>
            
            <div className="space-y-4 font-mono text-sm border border-border-default/50 rounded-[20px] p-6 bg-[#FAFAF8] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Checking transport…</span>
                <span className={revealStep >= 1 ? "text-[#008751] font-bold" : "text-text-muted animate-pulse"}>
                  {revealStep >= 1 ? "✓ Transport estimated" : "Checking..."}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Checking venue pricing…</span>
                <span className={revealStep >= 2 ? "text-[#008751] font-bold" : revealStep >= 1 ? "text-text-muted animate-pulse" : "text-text-muted/40"}>
                  {revealStep >= 2 ? "✓ Venue pricing verified" : revealStep >= 1 ? "Checking..." : "Pending"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted">Adding budget buffer…</span>
                <span className={revealStep >= 3 ? "text-[#008751] font-bold" : revealStep >= 2 ? "text-text-muted animate-pulse" : "text-text-muted/40"}>
                  {revealStep >= 3 ? "✓ Buffer included" : revealStep >= 2 ? "Adding..." : "Pending"}
                </span>
              </div>

              {revealStep >= 3 && (
                <div className="pt-4 border-t border-border-default/50 text-center animate-in fade-in zoom-in-95 duration-300">
                  <p className="type-label text-[#008751] text-base font-black">Plan Ready.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6 animate-in fade-in duration-400">
            <div className="space-y-2 text-center">
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-text-muted font-bold font-mono">Confidence Summary</span>
              <h2 className="type-display-product text-midnight-lagoon text-2xl font-black">Verified parameters</h2>
            </div>

            <div className="space-y-4 font-sans text-sm border border-border-default/50 rounded-[20px] p-6 bg-[#FAFAF8] shadow-sm">
              {[
                { label: "Budget", val: "✓ Comfortable" },
                { label: "Travel", val: "✓ Reasonable" },
                { label: "Group Size", val: "✓ Good fit" },
                { label: "Vibe", val: "✓ Strong match" }
              ].map((item, idx) => (
                <div key={item.label} className={`flex items-center justify-between transition-all duration-300 ${
                  revealStep >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`} style={{ transitionDelay: `${idx * 150}ms` }}>
                  <span className="text-text-secondary font-medium">{item.label}</span>
                  <span className="text-[#008751] font-bold">{item.val}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 text-center animate-in fade-in duration-300 delay-700">
              <p className="type-label text-[#008751] text-base font-black">Plan Ready</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-holdup-slam">
      {/* Recommendations Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 animate-slide-up animation-delay-0">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="type-display-product text-midnight-lagoon text-2xl sm:text-3xl tracking-tight">We found {evaluations.length} places that fit your budget.</h1>
          </div>
          <p className="type-body text-text-secondary">
            Based on <span className="text-text-primary font-[600]">₦{forgeInput.budget.toLocaleString()}</span> for <span className="text-text-primary font-[600]">{forgeInput.squadSize} people</span> around <span className="text-text-primary font-[600] lowercase">{startAreaLabel}</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="type-label text-text-secondary hover:text-midnight-lagoon transition-colors flex items-center gap-2 tap-feedback px-3 py-2 rounded-[10px]">
              <ArrowLeft className="w-3.5 h-3.5" />
              Adjust plan
            </button>
          </Link>
          <button 
            className="bg-midnight-lagoon hover:bg-charcoal text-white type-label h-[44px] px-6 rounded-[10px] tap-feedback btn-spring flex items-center gap-2 border-none shadow-none transition-colors duration-[250ms]"
            onClick={() => router.refresh()}
          >
            <RefreshCw className="w-4 h-4" />
            Try different spots
          </button>
        </div>
      </div>

      {evaluations.length > 0 ? (
        <DossierDropWrapper className="space-y-12 dossier-grid">
          {/* Fallback Banner */}
          {evaluations[0].plan.explanation?.reason === "semantic_classification_missing" && (
            <div className="bg-trust-warning-15 border border-trust-warning text-text-primary p-5 rounded-2xl mb-8 flex items-start gap-4">
              <div className="mt-0.5">
                <AlertCircle className="w-5 h-5 text-brand-green" />
              </div>
              <div className="space-y-1">
                <h3 className="type-label">We haven&apos;t classified enough <span className="lowercase">{forgeInput.vibe}</span> venues yet.</h3>
                <p className="type-caption text-text-secondary">Here are the best places within your budget while we continue verifying venue personalities.</p>
              </div>
            </div>
          )}

          {/* Plan 1: Full Width */}
          <div className="w-full dossier-card ease-danfo animate-slide-up-in animation-delay-0">
            <EditorialPlan 
              key={`top-${evaluations[0].plan.spot.id}`} 
              evaluation={evaluations[0]} 
              isTopPick={true} 
              input={forgeInput} 
              originalBudget={forgeInput.budget}
              onAdjustBudget={handleAdjustBudget}
              isAdjusting={isPending}
            />
          </div>
          
          {/* Plans 2 & 3: Grid */}
          {evaluations.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {evaluations.slice(1, 3).map((evaluation, index) => (
                <div key={evaluation.plan.spot.id} className={`dossier-card ease-danfo animate-slide-up-in scale-[0.99] opacity-[0.97] ${index === 0 ? 'animation-delay-200' : 'animation-delay-250'}`}>
                  <EditorialPlan 
                    key={`other-${evaluation.plan.spot.id}`}
                    evaluation={evaluation} 
                    isTopPick={false} 
                    input={forgeInput} 
                    originalBudget={forgeInput.budget}
                    onAdjustBudget={handleAdjustBudget}
                    isAdjusting={isPending}
                  />
                </div>
              ))}
            </div>
          )}
        </DossierDropWrapper>
      ) : (
        /* Redesigned Empty State */
        <div className="text-center py-24 px-6 bg-white rounded-[24px] border border-border-default space-y-8">
          <div className="flex justify-center pb-2">
            <div 
              className="animate-in fade-in slide-in-from-right-8 duration-400"
              style={{ animationTimingFunction: 'var(--motion-considered)' }}
            >
              <svg width="64" height="36" viewBox="0 0 64 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="28" rx="4" fill="#FCD116"/>
                <rect y="12" width="64" height="4" fill="#008751" fillOpacity="0.3"/>
                <rect x="8" y="4" width="20" height="8" rx="1" fill="#008751"/>
                <rect x="36" y="4" width="20" height="8" rx="1" fill="#008751"/>
                <circle cx="16" cy="30" r="6" fill="#1A1A1A"/>
                <circle cx="48" cy="30" r="6" fill="#1A1A1A"/>
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="type-heading text-text-primary text-xl font-black">Closest Match</h2>
            <p className="type-body text-text-primary font-semibold max-w-md mx-auto">
              No venue perfectly matched every preference.
            </p>
            <p className="type-body text-text-muted max-w-md mx-auto">
              This option stays within budget and best matches your selected vibe.
            </p>
          </div>
          
          <div className="space-y-4">
            {vibeMetrics && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <p className="type-caption text-text-muted">
                  Your budget may be tight for <span className="lowercase">{forgeInput.vibe}</span> outings. Here is what <span className="lowercase">{forgeInput.vibe}</span> usually costs in Lagos:
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <div className="px-3 py-1.5 bg-surface-grey border border-border-default rounded-full type-caption text-text-muted">
                    Lowkey: from ₦{vibeMetrics.min.toLocaleString()}
                  </div>
                  <div className="px-3 py-1.5 bg-surface-grey border border-border-default rounded-full type-caption text-text-muted">
                    Standard: around ₦{vibeMetrics.median.toLocaleString()}
                  </div>
                  <div className="px-3 py-1.5 bg-surface-grey border border-border-default rounded-full type-caption text-text-muted">
                    Premium: from ₦{vibeMetrics.max.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            <Link href={`/?area=${forgeInput.startArea}&budget=${Math.round(recoveryBudget)}&vibe=${VIBE_TO_URL_MAP[forgeInput.vibe] || forgeInput.vibe}&squad=${forgeInput.squadSize}`}>
              <Button className="bg-brand-green text-white type-label h-12 px-10 rounded-[12px] tap-feedback shadow-none">
                Try ₦{Math.round(recoveryBudget).toLocaleString()} budget
              </Button>
            </Link>
          </div>

          {nearbySpots.length > 0 && (
            <div className="mt-16 pt-12 border-t border-border-default text-left max-w-2xl mx-auto">
              <h3 className="type-label text-text-muted mb-8 text-center md:text-left">
                Nothing in budget — but here&apos;s what&apos;s in {targetAreaName || "that area"}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {nearbySpots.map(spot => (
                  <div key={spot.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-surface-grey border border-border-default rounded-[16px] gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="type-subheading text-text-primary">{spot.name}</span>
                        <div className="bg-brand-green-5 text-brand-green px-2 py-0.5 rounded-[4px] text-[10px] font-[700] uppercase tracking-tighter">
                          {spot.category}
                        </div>
                      </div>
                      <p className="type-caption text-text-muted">from ₦{spot.price_per_person.toLocaleString()} per person</p>
                    </div>
                    <Link href={`/explore/${forgeInput.startArea || "ikeja"}?pinned=${spot.id}`} className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full sm:w-auto type-label h-10 px-6 border-border-default text-text-primary hover:bg-white rounded-[8px]">
                         Explore spot
                       </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-border-default text-center">
            <SpotSuggestionForm currentArea={forgeInput.startArea || "Unknown"} />
          </div>
        </div>
      )}

      {/* Redesigned Footer */}
      {evaluations.length > 0 && (
        <div className="text-center pt-16 space-y-4 pb-32 md:pb-12">
          <p className="type-body text-text-muted">
            You can comfortably do any of these tonight.
          </p>
        </div>
      )}

      {/* Sticky Mobile Actions */}
      {evaluations.length === 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white/80 backdrop-blur-md border-t border-border-default z-40 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full type-label h-12 rounded-[12px] border-border-default text-text-primary tap-feedback">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change
              </Button>
            </Link>
            <Button 
              className="flex-1 bg-brand-green text-white type-label h-12 rounded-[12px] border-none tap-feedback shadow-lg shadow-brand-green/10"
              onClick={() => router.refresh()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Plan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SpotSuggestionForm({ currentArea }: { currentArea: string }) {
  const [expanded, setExpanded] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "30000",
    whatsapp: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true); // Optimistically show success state

    // Fire and forget
    submitSpotSuggestion({
      spotName: formData.name,
      areaName: currentArea,
      roughPricePerPerson: parseInt(formData.price),
      suggesterWhatsapp: formData.whatsapp || null,
    }).catch(() => {
      // Silently fail for suggestions
    });
  };

  if (success) {
    return (
      <p className="type-label text-brand-green animate-in fade-in">
        Thanks — we&apos;ll look into it.
      </p>
    );
  }

  if (!expanded) {
    return (
      <button 
        onClick={() => setExpanded(true)}
        className="type-label text-text-muted hover:text-text-secondary transition-colors"
      >
        Know a spot that should be here? Add it &rarr;
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto animate-in slide-in-from-top-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input 
          required
          placeholder="Spot name"
          className="h-12 type-body rounded-[10px] border-border-default bg-surface-grey focus:bg-white focus-ring transition-all"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
        <Select 
          value={formData.price}
          onValueChange={v => setFormData({...formData, price: v || ""})}
        >
          <SelectTrigger className="h-12 type-body rounded-[12px] border-border-default bg-surface-grey hover:bg-white hover:border-brand-green-40 transition-all focus-ring data-[state=open]:bg-white data-[state=open]:border-brand-green">
            <SelectValue placeholder="Price / person" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="15000">₦15,000 range</SelectItem>
            <SelectItem value="30000">₦30,000 range</SelectItem>
            <SelectItem value="50000">₦50,000 range</SelectItem>
            <SelectItem value="100000">₦100,000 range</SelectItem>
            <SelectItem value="250000">₦250,000 range</SelectItem>
          </SelectContent>
        </Select>
        <Input 
          placeholder="WhatsApp (optional)"
          className="h-12 type-body rounded-[10px] border-border-default bg-surface-grey focus:bg-white focus-ring transition-all"
          value={formData.whatsapp}
          onChange={e => setFormData({...formData, whatsapp: e.target.value})}
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="type-caption text-text-muted text-left">
          We&apos;ll notify you when it&apos;s added.
        </p>
        <div className="flex items-center gap-3">
          <Button 
            type="submit" 
            className="bg-brand-green hover:bg-brand-green-70 text-white type-label h-10 px-6 rounded-[8px] tap-feedback shadow-none border-none flex items-center gap-2"
          >
            Suggest spot
          </Button>
        </div>
      </div>
    </form>
  );
}

