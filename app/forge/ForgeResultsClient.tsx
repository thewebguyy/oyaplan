"use client";

import { useState, useEffect } from "react";
import { Spot, Plan, ForgeInput } from "@/lib/types";
import { forgePlans } from "@/lib/matchingEngine";
import { supabase } from "@/lib/supabase";
import LoadingState from "@/components/LoadingState";
import PlanCard from "@/components/PlanCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Here's Your Plan.</h1>
          <p className="text-gray-500">Top pick below — alternatives underneath.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/">
            <Button variant="outline" className="gap-2 h-[52px]">
              <ArrowLeft className="w-4 h-4" />
              Adjust
            </Button>
          </Link>
          <Button 
            variant="default" 
            className="bg-[#008751] hover:bg-[#007043] gap-2 h-[52px]"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4" />
            Get Another Plan
          </Button>
        </div>
      </div>

      {plans.length > 0 ? (
        <div className="space-y-8">
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
          {plans.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {plans.slice(1).map((plan, index) => (
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
        <div className="text-center py-20 space-y-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-6xl">😕</div>
          <h2 className="text-2xl font-bold">No perfect match found.</h2>
          <p className="text-gray-500 max-w-md mx-auto px-4">
            Lagos is tough! Try increasing your budget or choosing a different starting area.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
            <Link href="/">
              <Button variant="outline" className="rounded-xl h-12 px-8">Try Again</Button>
            </Link>
          </div>

          {nearbySpots.length > 0 && (
            <div className="mt-12 px-6 border-t border-gray-100 pt-10 text-left">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6">
                Nothing in budget — but here's what's in {targetAreaName}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {nearbySpots.map(spot => (
                  <div key={spot.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl transition-all hover:border-[#008751]/30">
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{spot.name}</span>
                        <Badge className="text-[9px] h-4 px-1.5 uppercase bg-green-50 text-[#008751] border-none font-black tracking-tighter">
                          {spot.category}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">from ₦{spot.price_per_person.toLocaleString()} per person</span>
                    </div>
                    <Link href={`/explore/${params.startArea || "ikeja"}?pinned=${spot.id}`}>
                      <Button variant="outline" size="sm" className="text-[11px] font-bold h-8 border-gray-200 rounded-lg px-4 hover:bg-gray-50 hover:text-[#008751]">
                         Explore this spot
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spot Suggestion Form */}
          <div className="mt-8 px-6 pt-6 border-t border-gray-50">
            <SpotSuggestionForm currentArea={targetAreaName || params.startArea || "Lagos"} />
          </div>
        </div>
      )}

      {plans.length > 0 && (
        <div className="text-center pt-8">
          <p className="text-sm text-gray-400 mb-4 italic">
            "Stop the wahala. Just pick one and send it."
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
            <span>Deterministic Engine v1.0</span>
            <span>•</span>
            <span>Lagos Mainland/Island Data</span>
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
      <p className="text-xs font-bold text-[#008751] animate-in fade-in duration-300">
        Thanks — we'll look into it.
      </p>
    );
  }

  if (!expanded) {
    return (
      <button 
        onClick={() => setExpanded(true)}
        className="text-xs font-bold text-gray-400 hover:text-[#008751] transition-colors"
      >
        Know a spot that should be here? Add it &rarr;
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-top-2 duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <Input 
            required
            placeholder="Spot name"
            className="h-10 text-xs rounded-lg border-gray-100 bg-gray-50 focus:bg-white transition-all"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div>
          <Select 
            value={formData.price}
            onValueChange={v => setFormData({...formData, price: v || ""})}
          >
            <SelectTrigger className="h-10 text-xs rounded-lg border-gray-100 bg-gray-50">
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
        </div>
        <div>
          <Input 
            placeholder="WhatsApp (optional)"
            className="h-10 text-xs rounded-lg border-gray-100 bg-gray-50 focus:bg-white transition-all"
            value={formData.whatsapp}
            onChange={e => setFormData({...formData, whatsapp: e.target.value})}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-gray-400 font-medium italic">
          We'll notify you when it's added.
        </p>
        <div className="flex items-center gap-3">
          {error && <span className="text-[10px] font-bold text-red-500">Something went wrong</span>}
          <Button 
            type="submit" 
            disabled={loading}
            size="sm" 
            className="bg-[#008751] hover:bg-[#007043] text-white text-[11px] font-black h-8 px-4 rounded-lg"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Suggest this spot"}
          </Button>
        </div>
      </div>
    </form>
  );
}
