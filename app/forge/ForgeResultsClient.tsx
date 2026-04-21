"use client";

import { useState, useEffect } from "react";
import { Spot, Plan, ForgeInput } from "@/lib/types";
import { forgePlans } from "@/lib/matchingEngine";
import { supabase } from "@/lib/supabase";
import LoadingState from "@/components/LoadingState";
import PlanCard from "@/components/PlanCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft, Loader2 } from "lucide-react";
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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [nearbySpots, setNearbySpots] = useState<Spot[]>([]);
  const [targetAreaName, setTargetAreaName] = useState("");
  const [forgeInput, setForgeInput] = useState<ForgeInput | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      // 1. Prepare input with safe fallbacks
      const input: ForgeInput = {
        startArea: params.startArea || "ikeja",
        squadSize: parseInt(params.squadSize || "2"),
        budget: parseInt(params.budget || "50000"),
        vibe: params.vibe || "Chill",
        pinnedSpotId: (params as any).pinnedSpotId,
        categoryGroup: (params as any).categoryGroup,
        daypart: (params as any).daypart,
      };

      setForgeInput(input);

      // 2. Generate plans (deterministic)
      const generatedPlans = forgePlans(input, allSpots);
      setPlans(generatedPlans);

      if (generatedPlans.length === 0) {
        const { data: areaData } = await supabase
          .from("areas")
          .select("name, spots(*)")
          .eq("slug", input.startArea)
          .single();
        
        if (areaData) {
          setTargetAreaName(areaData.name);
          const spots = (areaData.spots as Spot[])
            ?.filter(s => s.active)
            .sort((a, b) => a.price_per_person - b.price_per_person)
            .slice(0, 3);
          setNearbySpots(spots || []);
        }
      }

      // 3. Simulated loading time
      const timer = setTimeout(() => {
        setIsForging(false);
      }, 2500);

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

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Redesigned Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="type-heading text-text-primary">We found the best link for you.</h1>
          <p className="type-caption text-text-muted">
            Based on <span className="text-text-secondary font-[700] lowercase">{startAreaLabel}</span> & <span className="text-text-secondary font-[700]">₦{forgeInput?.budget.toLocaleString()}</span> for <span className="text-text-secondary font-[700]">{forgeInput?.squadSize} people</span>.
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

      {plans.length > 0 ? (
        <div className="space-y-12">
          {/* Plan 1: Full Width */}
          <div className="w-full">
            <PlanCard 
              key={plans[0].spot.id} 
              plan={plans[0]} 
              index={0} 
              isTopPick={true} 
              input={forgeInput!} 
              originalBudget={forgeInput?.budget}
            />
          </div>
          
          {/* Plans 2 & 3: Grid */}
          {plans.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {plans.slice(1, 3).map((plan, index) => (
                <PlanCard 
                  key={plan.spot.id} 
                  plan={plan} 
                  index={index + 1} 
                  isTopPick={false} 
                  input={forgeInput!} 
                  originalBudget={forgeInput?.budget}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Redesigned Empty State */
        <div className="text-center py-24 px-6 bg-white rounded-[24px] border border-border-default space-y-6">
          <div className="text-5xl">😕</div>
          <div className="space-y-2">
            <h2 className="type-heading text-text-primary">No perfect match found.</h2>
            <p className="type-body text-text-muted max-w-md mx-auto">
              Lagos is tough! Try increasing your budget or choosing a different starting area.
            </p>
          </div>
          
          <Link href="/">
            <Button className="bg-brand-green text-white type-label h-12 px-10 rounded-[12px] tap-feedback shadow-none">Try Again</Button>
          </Link>

          {nearbySpots.length > 0 && (
            <div className="mt-16 pt-12 border-t border-border-default text-left max-w-2xl mx-auto">
              <h3 className="type-label text-text-muted mb-8 text-center md:text-left">
                Nothing in budget — but here's what's in {targetAreaName || "that area"}
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

          {/* Spot Suggestion Form */}
          <div className="mt-12 pt-8 border-t border-border-default">
            <SpotSuggestionForm currentArea={targetAreaName || params.startArea || "Lagos"} />
          </div>
        </div>
      )}

      {/* Redesigned Footer */}
      {plans.length > 0 && (
        <div className="text-center pt-12 space-y-4">
          <p className="type-body text-text-muted">
            "Stop the wahala. Just pick one and send it."
          </p>
          <div className="flex items-center justify-center gap-4 type-label text-text-muted opacity-50 uppercase tracking-[0.1em]">
            <span>Deterministic Engine v1.0</span>
            <span className="text-border-default">•</span>
            <span>Lagos Data</span>
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
    setLoading(true);
    setError(false);

    try {
      const { error: insertError } = await supabase.from("spot_suggestions").insert({
        spot_name: formData.name,
        area_name: currentArea,
        rough_price_per_person: parseInt(formData.price),
        suggester_whatsapp: formData.whatsapp || null
      });

      if (insertError) throw insertError;
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <p className="type-label text-brand-green animate-in fade-in">
        Thanks — we'll look into it.
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
          <SelectTrigger className="h-12 type-body rounded-[10px] border-border-default bg-surface-grey focus:bg-white focus-ring">
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
          We'll notify you when it's added.
        </p>
        <div className="flex items-center gap-3">
          {error && <span className="type-caption text-error">Something went wrong</span>}
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-brand-green hover:bg-brand-green-70 text-white type-label h-10 px-6 rounded-[8px] tap-feedback shadow-none border-none"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Suggest spot"}
          </Button>
        </div>
      </div>
    </form>
  );
}
