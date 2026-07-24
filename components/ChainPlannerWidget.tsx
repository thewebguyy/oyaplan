"use client";

import { useState } from "react";
import { Location } from "@/lib/services/LocationService";
import { Spot } from "@/lib/types";
import { generateChainPlan, ChainPlanResult } from "@/lib/services/chainPlanner";
import { CHAIN_VIBE_SEQS } from "@/lib/config/chainVibes";
import { Sparkles, Navigation, AlertCircle, Plus, Trash2 } from "lucide-react";

interface ChainPlannerWidgetProps {
  spots: Spot[];
  areas: Location[];
}

export default function ChainPlannerWidget({
  spots,
  areas,
}: ChainPlannerWidgetProps) {
  const [startArea, setStartArea] = useState("lekki");
  const [squadSize, setSquadSize] = useState(3);
  const [budget, setBudget] = useState(100000);
  const [sequenceKey, setSequenceKey] = useState("date_night");

  // Selected venues for the chain stops
  const [selectedSpots, setSelectedSpots] = useState<string[]>([]);
  const [planResult, setPlanResult] = useState<ChainPlanResult | null>(null);

  const handleAddStop = (spotId: string) => {
    if (selectedSpots.length >= 4) return;
    if (selectedSpots.includes(spotId)) return;
    const newSpots = [...selectedSpots, spotId];
    setSelectedSpots(newSpots);
    triggerPlan(newSpots);
  };

  const handleRemoveStop = (index: number) => {
    const newSpots = selectedSpots.filter((_, i) => i !== index);
    setSelectedSpots(newSpots);
    triggerPlan(newSpots);
  };

  const triggerPlan = (currentSpots: string[]) => {
    if (currentSpots.length === 0) {
      setPlanResult(null);
      return;
    }

    const spotsObjects = currentSpots
      .map((id) => spots.find((s) => s.id === id))
      .filter(Boolean) as Spot[];

    const result = generateChainPlan(
      startArea,
      budget,
      sequenceKey,
      spotsObjects,
      squadSize
    );
    setPlanResult(result);
  };

  // Group spots by category for category filter lists
  const getSpotsByCategory = (cat: string) => {
    return spots.filter((s) => s.category === cat || s.category?.toLowerCase() === cat);
  };

  const currentCfg = CHAIN_VIBE_SEQS[sequenceKey];

  return (
    <div className="space-y-8">
      {/* Parameter Cards */}
      <div className="bg-white border border-border-default/60 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-lagoon">
        <h2 className="text-xl font-black text-midnight-lagoon">Plan A Full Night</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Start Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
              Starting Location
            </label>
            <select
              value={startArea}
              onChange={(e) => {
                setStartArea(e.target.value);
                triggerPlan(selectedSpots);
              }}
              className="w-full h-11 px-3 bg-surface-grey border border-border-default rounded-[10px] text-sm focus:outline-none"
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Squad Size */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
              Squad Size
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={squadSize}
              onChange={(e) => {
                setSquadSize(parseInt(e.target.value) || 1);
                triggerPlan(selectedSpots);
              }}
              className="w-full h-11 px-3 bg-surface-grey border border-border-default rounded-[10px] text-sm focus:outline-none"
            />
          </div>

          {/* Outing Budget */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
              Total Budget (₦)
            </label>
            <input
              type="text"
              value={budget}
              onChange={(e) => {
                const val = parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0;
                setBudget(val);
                triggerPlan(selectedSpots);
              }}
              className="w-full h-11 px-3 bg-surface-grey border border-border-default rounded-[10px] text-sm font-bold focus:outline-none"
            />
          </div>
        </div>

        {/* Outing Progression Style */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
            Outing Flow / Vibe
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(CHAIN_VIBE_SEQS).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => {
                  setSequenceKey(key);
                  // Trigger update with new config
                  const spotsObjects = selectedSpots
                    .map((id) => spots.find((s) => s.id === id))
                    .filter(Boolean) as Spot[];
                  const result = generateChainPlan(
                    startArea,
                    budget,
                    key,
                    spotsObjects,
                    squadSize
                  );
                  setPlanResult(result);
                }}
                className={`p-4 border rounded-[16px] text-left transition-all ${
                  sequenceKey === key
                    ? "border-[#008751] bg-[#008751]/5"
                    : "border-border-default bg-white hover:bg-gray-50"
                }`}
              >
                <p className="text-xs font-black text-midnight-lagoon uppercase tracking-wider">
                  {cfg.name}
                </p>
                <p className="text-[10px] text-text-muted mt-1 leading-snug">{cfg.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Stop Builder list */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-midnight-lagoon">Outing Stops ({selectedSpots.length}/4)</h3>
            {selectedSpots.length < 4 && currentCfg && (
              <span className="text-xs bg-[#008751]/10 text-[#008751] px-2.5 py-0.5 rounded-full font-bold">
                Next stop category: {currentCfg.sequence[selectedSpots.length]}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {selectedSpots.map((spotId, idx) => {
              const spot = spots.find((s) => s.id === spotId);
              const stopPlan = planResult?.stops[idx];
              if (!spot) return null;

              return (
                <div
                  key={spotId}
                  className="bg-white border border-border-default/50 rounded-2xl p-5 flex items-center justify-between shadow-xs"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#008751] tracking-wider">
                      Stop {idx + 1}
                    </span>
                    <h4 className="font-bold text-text-primary">{spot.name}</h4>
                    <p className="text-xs text-text-muted">{spot.address || spot.address_slug}</p>
                    {stopPlan && (
                      <div className="flex gap-4 mt-2 text-xs">
                        <span>Allocated: <strong>₦{stopPlan.allocatedBudget.toLocaleString()}</strong></span>
                        <span>Estimated: <strong>₦{stopPlan.actualCost.toLocaleString()}</strong></span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveStop(idx)}
                    className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {selectedSpots.length === 0 && (
              <div className="bg-white border border-border-default/50 rounded-2xl p-12 text-center text-gray-400 text-sm italic">
                Add spots using the lists on the right to start building your route.
              </div>
            )}
          </div>

          {/* Plan Tally Receipt */}
          {planResult && (
            <div className="bg-white border border-border-default/60 rounded-[24px] p-6 space-y-4 shadow-lagoon">
              <h4 className="text-xs font-black uppercase text-midnight-lagoon tracking-wider">
                Cost Tally & Route Analysis
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Total Food/Drinks Cost:</span>
                  <span className="font-bold text-text-primary">
                    ₦{planResult.stops.reduce((s, st) => s + st.actualCost, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-[#008751]" /> Leg-to-Leg Transport:
                  </span>
                  <span className="font-bold text-text-primary">
                    ₦{planResult.totalTransportCost.toLocaleString()}
                  </span>
                </div>
                <div className="h-px bg-gray-100 my-2" />
                <div className="flex justify-between text-base">
                  <span className="font-black text-[#1A1A1A]">TOTAL OUTING COST:</span>
                  <span className={`font-black ${planResult.isWithinBudget ? "text-[#008751]" : "text-red-600"}`}>
                    ₦{planResult.totalOutingCost.toLocaleString()}
                  </span>
                </div>
              </div>

              {!planResult.isWithinBudget && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Over Budget Plan</p>
                    <p className="mt-0.5 leading-snug">
                      Your current stops exceed your ₦{budget.toLocaleString()} limit. Swap a spot for a cheaper alternative.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Spot Selection Category Tabs */}
        <div className="bg-white border border-border-default/60 rounded-[28px] p-6 space-y-6 shadow-xs h-[600px] overflow-y-auto">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-black text-midnight-lagoon uppercase tracking-wider">Lagos Spots Directory</h3>
          </div>

          <div className="space-y-4">
            {currentCfg && (
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded-full block w-fit">
                  Recommended category: {currentCfg.sequence[selectedSpots.length] || "restaurant"}
                </span>

                <div className="space-y-2">
                  {getSpotsByCategory(currentCfg.sequence[selectedSpots.length] || "restaurant")
                    .filter((s) => !selectedSpots.includes(s.id))
                    .slice(0, 10)
                    .map((spot) => (
                      <div
                        key={spot.id}
                        className="p-3.5 border border-border-default/50 rounded-xl flex items-center justify-between gap-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-text-primary truncate">{spot.name}</p>
                          <p className="text-xs text-text-muted mt-0.5">
                            ₦{spot.price_per_person.toLocaleString()} per person • {spot.vibe_tags.slice(0, 2).join(", ")}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddStop(spot.id)}
                          disabled={selectedSpots.length >= 4}
                          className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 flex items-center justify-center text-text-primary transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
