"use client";

import { useState, useEffect } from "react";
import { Spot, Plan, ForgeInput } from "@/lib/types";
import { forgePlans } from "@/lib/matchingEngine";
import LoadingState from "@/components/LoadingState";
import PlanCard from "@/components/PlanCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ForgeResultsClientProps {
  allSpots: Spot[];
  params: {
    startArea?: string;
    squadSize?: string;
    budget?: string;
    vibe?: string;
  };
}

export default function ForgeResultsClient({ allSpots, params }: ForgeResultsClientProps) {
  const [isForging, setIsForging] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    // 1. Prepare input with safe fallbacks
    const input: ForgeInput = {
      startArea: params.startArea || "ikeja",
      squadSize: parseInt(params.squadSize || "2"),
      budget: parseInt(params.budget || "50000"),
      vibe: params.vibe || "Lowkey",
    };

    // 2. Generate plans (deterministic)
    forgePlans(input, allSpots).then((generatedPlans) => {
      setPlans(generatedPlans);

      // 3. Simulated loading time (as per new requirements)
      const timer = setTimeout(() => {
        setIsForging(false);
      }, 2500); // 2.5s

      return () => clearTimeout(timer);
    });
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
          <h1 className="text-3xl font-black text-gray-900">Your Squad Plans Are Ready</h1>
          <p className="text-gray-500">Pick the best vibe and share with the group chat.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="gap-2 border-[#008751] text-[#008751] hover:bg-[#008751]/5"
            onClick={() => {
              const text = plans.map((p, i) => `Plan ${i+1}: ${p.spot.name} - Total ₦${p.totalCost.toLocaleString()}`).join('\n');
              navigator.clipboard.writeText(text);
              alert('Summary copied to clipboard!');
            }}
          >
            Copy All 3 Plans
          </Button>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Adjust
            </Button>
          </Link>
          <Button 
            variant="default" 
            className="bg-[#008751] hover:bg-[#007043] gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4" />
            Forge Another
          </Button>
        </div>
      </div>

      {plans.length > 0 ? (
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
          {plans.map((plan, index) => (
            <PlanCard key={plan.spot.id} plan={plan} index={index} />
          ))}
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
              <Button variant="outline">Try Again</Button>
            </Link>
            <Button 
              className="bg-[#008751] hover:bg-[#007043]"
              onClick={() => {
                const currentBudget = parseInt(params.budget || "50000");
                const newBudget = Math.floor(currentBudget * 1.2);
                const urlParams = new URLSearchParams({
                  ...params,
                  budget: newBudget.toString()
                });
                window.location.href = `/forge?${urlParams.toString()}`;
              }}
            >
              Re-run with +20% budget
            </Button>
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
