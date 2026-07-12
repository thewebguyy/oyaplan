"use client";

import { useState, useEffect } from "react";
import { Spot, ForgeInput, PlanEvaluation } from "@/lib/types";
import { forgePlans, applyPlanAdjustment } from "@/lib/services/matching/forgeMatcher";
import { evaluatePlan } from "@/lib/services/matching/evaluators/evaluatePlan";
import { submitSpotSuggestion } from "@/lib/actions/submitSpotSuggestion";
import { AnalyticsService } from "@/lib/services/analytics/analyticsService";
import LoadingState from "@/components/LoadingState";
import dynamic from "next/dynamic";
const EditorialPlan = dynamic(() => import("@/components/EditorialPlan"));
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ForgeResultsClientProps {
  allSpots: Spot[];
  params: {
    startArea?: string;
    squadSize?: string;
    budget?: string;
    vibe?: string;
    pinnedSpotId?: string;
    categoryGroup?: string;
    daypart?: string;
  };
}

export default function ForgeResultsClient({ allSpots, params }: ForgeResultsClientProps) {
  const [isForging, setIsForging] = useState(true);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [evaluations, setEvaluations] = useState<PlanEvaluation[]>([]);
  const [nearbySpots, setNearbySpots] = useState<Spot[]>([]);
  const [targetAreaName, setTargetAreaName] = useState("");
  const [forgeInput, setForgeInput] = useState<ForgeInput | null>(null);
  const [vibeMetrics, setVibeMetrics] = useState<{ min: number; median: number; max: number } | null>(null);

  const handleAdjustBudget = async (delta: number) => {
    if (!forgeInput) return;
    setIsAdjusting(true);
    
    // Artificial delay to show 'Adjusting your plan...' if computation is instant
    const startTime = Date.now();
    
    const newBudget = forgeInput.budget + delta;
    const adjustedInput = applyPlanAdjustment(forgeInput, { budget: newBudget });
    
    setForgeInput(adjustedInput);
    
    const generatedPlans = forgePlans(adjustedInput, allSpots);
    
    // Evaluate plans (D2 Evaluator Pattern)
    const newEvaluations = generatedPlans.map(plan => evaluatePlan({
      currentPlan: plan,
      previousPlan: evaluations.find(e => e.plan.spot.id === plan.spot.id)?.plan, // Compare against itself if it existed
      candidatePlans: generatedPlans,
      input: adjustedInput
    }));
    
    setEvaluations(newEvaluations);
    
    const elapsed = Date.now() - startTime;
    if (elapsed < 300) {
      await new Promise(resolve => setTimeout(resolve, 300 - elapsed));
    }
    
    setIsAdjusting(false);
  };

  useEffect(() => {
    const fetchPlans = async () => {
      // 1. Prepare input with safe fallbacks
      const input: ForgeInput = {
        startArea: params.startArea || "ikeja",
        squadSize: parseInt(params.squadSize || "2"),
        budget: parseInt(params.budget || "50000"),
        vibe: params.vibe || "Chill",
        pinnedSpotId: params.pinnedSpotId,
        categoryGroup: params.categoryGroup,
        daypart: params.daypart as ForgeInput['daypart'],
      };

      setForgeInput(input);

      // Save to localStorage
      try {
        localStorage.setItem("oyaplan_last_inputs", JSON.stringify({
          ...input,
          timestamp: Date.now()
        }));
      } catch { /* ignore localStorage errors */ }

      // 2. Generate plans (deterministic)
      const startTime = Date.now();
      const generatedPlans = forgePlans(input, allSpots);
      
      const newEvaluations = generatedPlans.map(plan => evaluatePlan({
        currentPlan: plan,
        candidatePlans: generatedPlans,
        input: input
      }));
      
      setEvaluations(newEvaluations);

      if (newEvaluations.length === 0) {
        // We want to know if the vibe is valid but the budget is too low
        const vibeSpots = allSpots.filter(s => s.vibe_tags.includes(input.vibe));
        const prices = vibeSpots.map(s => s.price_per_person * input.squadSize * (s.has_food !== false ? 1.1 : 1.0));
        
        if (prices.length > 0) {
          const sortedPrices = [...prices].sort((a, b) => a - b);
          setVibeMetrics({
            min: sortedPrices[0],
            max: sortedPrices[sortedPrices.length - 1],
            median: sortedPrices[Math.floor(sortedPrices.length / 2)],
          });
        }

        const areaSpots = allSpots.filter(s => s.areas?.slug === input.startArea);
        const areaName = areaSpots[0]?.areas?.name;
        if (areaName) setTargetAreaName(areaName);
        const nearby = areaSpots
          .filter(s => s.active)
          .sort((a, b) => a.price_per_person - b.price_per_person)
          .slice(0, 3);
        setNearbySpots(nearby);
      }

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 1200 - elapsed);
      const timer = setTimeout(() => {
        setIsForging(false);
        AnalyticsService.track('forge_completed', {
          session_id: 'browser',
          properties: {
            category: 'Activation',
            plans_generated: newEvaluations.length,
            vibe: input.vibe,
            budget: input.budget,
            version: '1.0'
          }
        });
      }, remaining);

      return () => clearTimeout(timer);
    };

    fetchPlans();
  }, [allSpots, params]);

  if (isForging) {
    return (
      <div className="pt-20">
        <LoadingState />
      </div>
    );
  }

  const startAreaLabel = allSpots.find(s => s.areas?.slug === forgeInput?.startArea)?.areas?.name || forgeInput?.startArea;
  const recoveryBudget = (vibeMetrics && forgeInput && forgeInput.budget < vibeMetrics.median)
    ? vibeMetrics.median 
    : (forgeInput?.budget || 0) * 1.2;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500 motion-reduce:duration-0">
      {/* Recommendations Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 animate-slide-up animation-delay-0">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="type-heading text-text-primary">Our recommendations.</h1>
          </div>
          <p className="type-body text-text-secondary">
            Based on <span className="text-text-primary font-[600] lowercase">{startAreaLabel}</span> & <span className="text-text-primary font-[600]">₦{forgeInput?.budget.toLocaleString()}</span> for <span className="text-text-primary font-[600]">{forgeInput?.squadSize} people</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="type-label text-text-secondary hover:text-brand-green transition-colors flex items-center gap-2 tap-feedback px-3 py-2 rounded-[10px]">
              <ArrowLeft className="w-3.5 h-3.5" />
              Change details
            </button>
          </Link>
          <Button 
            className="bg-brand-green hover:bg-brand-green-70 text-white type-label h-[44px] px-6 rounded-[10px] tap-feedback flex items-center gap-2 border-none shadow-none"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4" />
            Get Another Plan
          </Button>
        </div>
      </div>

      {evaluations.length > 0 ? (
        <div className="space-y-12">
          {/* Fallback Banner */}
          {evaluations[0].plan.explanation?.reason === "semantic_classification_missing" && (
            <div className="bg-brand-yellow-15 border border-brand-yellow text-text-primary p-5 rounded-2xl mb-8 flex items-start gap-4">
              <div className="mt-0.5">
                <AlertCircle className="w-5 h-5 text-brand-green" />
              </div>
              <div className="space-y-1">
                <h3 className="type-label">We haven&apos;t classified enough <span className="lowercase">{forgeInput?.vibe}</span> venues yet.</h3>
                <p className="type-caption text-text-secondary">Here are the best places within your budget while we continue verifying venue personalities.</p>
              </div>
            </div>
          )}

          {/* Plan 1: Full Width */}
          <div className="w-full animate-slide-up animation-delay-0">
            <EditorialPlan 
              key={`top-${evaluations[0].plan.spot.id}`} 
              evaluation={evaluations[0]} 
              isTopPick={true} 
              input={forgeInput!} 
              originalBudget={forgeInput?.budget}
              onAdjustBudget={handleAdjustBudget}
              isAdjusting={isAdjusting}
            />
          </div>
          
          {/* Plans 2 & 3: Grid */}
          {evaluations.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {evaluations.slice(1, 3).map((evaluation, index) => (
                <div key={evaluation.plan.spot.id} className={`animate-slide-up ${index === 0 ? 'animation-delay-80' : 'animation-delay-160'}`}>
                  <EditorialPlan 
                    key={`other-${evaluation.plan.spot.id}`}
                    evaluation={evaluation} 
                    isTopPick={false} 
                    input={forgeInput!} 
                    originalBudget={forgeInput?.budget}
                    onAdjustBudget={handleAdjustBudget}
                    isAdjusting={isAdjusting}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
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
            <h2 className="type-heading text-text-primary">Budget too low for this vibe.</h2>
            <p className="type-body text-text-muted max-w-md mx-auto">
              Your budget of ₦{(forgeInput?.budget || 0).toLocaleString()} is a bit tight for a <span className="lowercase">{forgeInput?.vibe}</span> vibe in {targetAreaName || "this area"}. Increase your budget to see spots.
            </p>
          </div>
          
          <div className="space-y-4">
            {vibeMetrics && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <p className="type-caption text-text-muted">
                  Your budget may be tight for <span className="lowercase">{forgeInput?.vibe}</span> outings. Here is what <span className="lowercase">{forgeInput?.vibe}</span> usually costs in Lagos:
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

            <Link href={`/?startArea=${forgeInput?.startArea}&budget=${Math.round(recoveryBudget)}&vibe=${forgeInput?.vibe}&squadSize=${forgeInput?.squadSize}`}>
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
                    <Link href={`/explore/${params.startArea || "ikeja"}?pinned=${spot.id}`} className="w-full sm:w-auto">
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
            <SpotSuggestionForm currentArea={forgeInput?.startArea || "Unknown"} />
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
              onClick={() => window.location.reload()}
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
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
      // Silently fail for suggestions, or we could add a toast later
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
