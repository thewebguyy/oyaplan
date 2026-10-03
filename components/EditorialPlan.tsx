"use client";

import { useState } from "react";
import { ForgeInput, PlanEvaluation, PlanExplanation } from "@/lib/types";
import { PlanHeader } from "./editorial/PlanHeader";
import { AdjustmentPanel } from "./editorial/AdjustmentPanel";
import { PlanActions } from "./editorial/PlanActions";
import { TrustFooter } from "./editorial/TrustFooter";
import { ChangeSummary } from "./editorial/ChangeSummary";
import { ExclusionList } from "./editorial/ExclusionList";
import { formatConfidenceEvidence } from "@/lib/utils/editorialFormatter";
import { getVibeConfig } from "@/lib/constants/vibes";
import { calculateTransportTime } from "@/lib/utils/calculateTransportTime";
import { Shield, Check, ChevronDown } from "lucide-react";
import RouteCard from "./dossier/RouteCard";
import TransportEstimateCard from "./TransportEstimateCard";
import { LocationService } from "@/lib/services/LocationService";

import { DamageSlip } from "@/components/DamageSlip";

interface EditorialPlanProps {
  evaluation: PlanEvaluation;
  input: ForgeInput;
  planId?: string;
  isTopPick?: boolean;
  alternativeIndex?: number;
  originalBudget?: number;
  onAdjustBudget?: (delta: number) => void;
  isAdjusting?: boolean;
}

export default function EditorialPlan({ 
  evaluation, 
  input, 
  planId: initialPlanId, 
  isTopPick = false, 
  alternativeIndex = 0,
  originalBudget, 
  onAdjustBudget, 
  isAdjusting = false 
}: EditorialPlanProps) {
  const { plan } = evaluation;
  const explanation: Partial<PlanExplanation> = plan.explanation || {};
  const diff = originalBudget ? originalBudget - plan.totalCost : 0;
  const [isWhyDropdownOpen, setIsWhyDropdownOpen] = useState(false);

  const getSquadWord = (size: number) => {
    const words = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
    return words[size - 1] || size.toString();
  };

  const getCardClasses = () => {
    if (isTopPick) {
      return "border border-[#111111] shadow-[0px_24px_48px_-12px_rgba(17,17,17,0.12)] rounded-[24px] bg-white";
    }
    // Alternative 1: Subtle warm ecru accent
    if (alternativeIndex === 0) {
      return "bg-[#F6F6F2] border border-[#E5E5DE] shadow-xs hover:shadow-md card-lift rounded-[20px]";
    }
    // Alternative 2: Clean neutral style
    return "bg-white border border-[#E5E5DE] shadow-xs hover:shadow-md card-lift rounded-[20px]";
  };

  return (
    <div className={`w-full transition-[colors,box-shadow,transform] overflow-hidden ${getCardClasses()}`} style={{ transitionDuration: 'var(--duration-editorial)' }}>
      
      {/* 1. Venue & Experience Header */}
      <PlanHeader input={input} plan={plan} isTopPick={isTopPick} alternativeIndex={alternativeIndex} />

      <div className="w-full h-px bg-border-default/50" />

      <div className={`${isTopPick ? 'px-6 sm:px-10 py-10 bg-white' : 'px-6 sm:px-10 py-8 bg-transparent'} space-y-6`}>
        {/* 2. Flagship Damage Slip */}
        <DamageSlip
          plan={plan}
          squadSize={input.squadSize || 1}
          budget={originalBudget || input.budget}
          startAreaName={input.startArea || "Lagos"}
          shareUrl={typeof window !== "undefined" ? `${window.location.origin}/venue/${plan.spot.id}` : undefined}
          isCompact={!isTopPick}
        />

        {/* 3. Decision Summary Callout */}
        {plan.decisionSummary && (
          <div className="bg-[#FAF7F2] border border-[#E5E5DE] rounded-[20px] p-6 shadow-xs relative overflow-hidden flex items-start gap-4">
            <div className="w-1.5 h-full absolute left-0 top-0 bottom-0 bg-[#111111]" />
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#111111] block">Decision Summary</span>
              <p className="type-body text-[#111111] text-sm font-semibold leading-relaxed">
                {plan.decisionSummary}
              </p>
            </div>
          </div>
        )}

        {/* 4. Unified Landed Guarantee & Why We Picked This Spot (Collapsible Accordion for Mobile Simplicity) */}
        <div className="bg-[#FAF7F2] border border-[#E5E5DE] rounded-[24px] overflow-hidden shadow-xs transition-all">
          <button
            type="button"
            onClick={() => setIsWhyDropdownOpen(!isWhyDropdownOpen)}
            className="w-full p-5 sm:p-6 flex items-center justify-between gap-3 text-left hover:bg-black/[0.02] transition-colors cursor-pointer"
            aria-expanded={isWhyDropdownOpen}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#111111] flex items-center justify-center text-[#F9E828] shrink-0">
                <Shield className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-[#111111] block">Anti-Deception Check</span>
                  <span className="text-[10px] font-bold text-[#111111] bg-[#F9E828] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    100% Transparent
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-[#111111] truncate mt-0.5">
                  Lagos Landed Guarantee & Match Reasons
                </h4>
                <p className="text-xs text-text-muted font-medium truncate">
                  {isWhyDropdownOpen ? "Tap to collapse guarantee & reasoning" : "Tap to view menu verification, fees & reasoning"}
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-white border border-[#E5E5DE] flex items-center justify-center shrink-0 text-[#111111] shadow-xs">
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isWhyDropdownOpen ? 'rotate-180 text-[#111111]' : ''}`} />
            </div>
          </button>

          {isWhyDropdownOpen && (
            <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#E5E7EB]/70 space-y-5 animate-in fade-in-50 duration-200">
              {/* Tangible Proof Items */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
                  Price Protection & Inclusions
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white p-4 rounded-xl border border-[#E5E5DE]">
                  <div className="flex items-center gap-2.5 text-xs text-[#111111] font-semibold">
                    <div className="w-4 h-4 rounded-full bg-[#111111] text-[#F9E828] flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{plan.spot.has_food === false ? "Verified admission & entry rate" : "Real menu & drink prices"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#111111] font-semibold">
                    <div className="w-4 h-4 rounded-full bg-[#111111] text-[#F9E828] flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>Round-trip ride-hailing covered</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#111111] font-semibold">
                    <div className="w-4 h-4 rounded-full bg-[#111111] text-[#F9E828] flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{plan.spot.has_food === false ? "Access & gate fees accounted for" : "VAT 7.5% & service charges included"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#111111] font-semibold">
                    <div className="w-4 h-4 rounded-full bg-[#111111] text-[#F9E828] flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>Zero hidden cover or surprise fees</span>
                  </div>
                </div>
              </div>

              {/* Why this spot for you */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
                  Why We Picked {plan.spot.name}
                </span>
                <div className="bg-white p-4 rounded-xl border border-border-default/60">
                  <ul className="space-y-2.5">
                    {(explanation.ordered_reasons || []).length > 0 ? (
                      explanation.ordered_reasons?.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary font-medium">
                          <span className="text-[#111111] font-bold select-none">•</span>
                          <span>{reason}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary font-medium">
                          <span className="text-[#111111] font-bold select-none">•</span>
                          <span>
                            {diff < 0 
                              ? `Stays near your budget limits, costing ₦${plan.totalCost.toLocaleString()} total`
                              : `Fits comfortably inside your ₦${(originalBudget || plan.totalCost).toLocaleString()} budget limit`
                            }
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary font-medium">
                          <span className="text-[#111111] font-bold select-none">•</span>
                          <span>
                            {input.startArea && input.startArea !== "anywhere"
                              ? calculateTransportTime(input.startArea, plan.spot.coordinates).displayCopy
                              : "Est. round-trip transport (Uber/Bolt) is factored into standard Lagos routes"
                            }
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary font-medium">
                          <span className="text-[#111111] font-bold select-none">•</span>
                          <span>{getVibeConfig(input.vibe).receiptFull}</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary font-medium">
                          <span className="text-[#111111] font-bold select-none">•</span>
                          <span>Perfect for a squad size of {getSquadWord(input.squadSize)}</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* Things to Know — Surfacing Trade-Offs */}
              {(explanation.things_to_know || []).length > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-1.5">
                  <h4 className="text-xs font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                    <span>⚠️ Things to know</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {explanation.things_to_know?.map((item, idx) => (
                      <li key={idx} className="text-xs text-amber-900 font-medium flex items-start gap-2">
                        <span className="select-none text-amber-600">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 8. Transport Range & Route Evidence */}
        {(() => {
          const startAreaKey = input.startArea;
          const resolvedStartAreaName = startAreaKey && startAreaKey !== "anywhere"
            ? (LocationService.getAllAreas().find((a) => a.id === startAreaKey || a.name.toLowerCase() === startAreaKey.toLowerCase())?.name ||
               startAreaKey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
            : "Lagos";

          return (
            <>
              <TransportEstimateCard
                minCost={plan.transportMinCost}
                maxCost={plan.transportMaxCost}
                transportCost={plan.transportCost}
                costPerPerson={plan.transportEstimate?.costPerPerson}
                minCostPerPerson={plan.transportEstimate?.minCostPerPerson}
                maxCostPerPerson={plan.transportEstimate?.maxCostPerPerson}
                partySize={input.squadSize || 1}
                vehiclesRequired={plan.transportEstimate?.vehiclesRequired || (input.squadSize ? Math.ceil(input.squadSize / 4) : 1)}
                mode={plan.transportMode || input.transportMode || "ride-hailing"}
                confidenceScore={plan.transportConfidenceScore}
                confidenceLabel={plan.transportConfidenceLabel || "Typical estimate"}
                badgeColor={plan.transportConfidenceBadgeColor || "yellow"}
                assumptions={plan.transportAssumptions}
                startAreaName={resolvedStartAreaName}
                originDistrictId={input.originDistrictId}
                destinationDistrictId={plan.spot.area_id}
                spotId={plan.spot.id}
                departureAt={input.departureAt}
              />

              {/* Route Card — only when we have a start area and venue coordinates */}
              {input.startArea && input.startArea !== "anywhere" && plan.spot.coordinates && (() => {
                const transport = calculateTransportTime(input.startArea, plan.spot.coordinates, input.departureAt);
                return (
                  <RouteCard
                    startAreaName={resolvedStartAreaName}
                    startAreaSlug={input.startArea}
                    venueName={plan.spot.name}
                    venueAddress={plan.spot.address}
                    venueCoords={plan.spot.coordinates}
                    transportCost={plan.transportCost}
                    distanceKm={transport.distanceKm}
                    transportEstimate={plan.transportEstimate}
                  />
                );
              })()}
            </>
          );
        })()}

        {/* Squad Actions (WhatsApp Share / Save Plan) */}
        <div className="flex items-center justify-between flex-wrap gap-3 py-4 border-t border-b border-border-default/40">
          <span className="text-xs font-bold text-text-muted">
            Ready to lock it in with your squad?
          </span>
          <PlanActions plan={plan} input={input} initialPlanId={initialPlanId} />
        </div>

        <ChangeSummary changes={evaluation.changes} />

        <ExclusionList exclusions={evaluation.exclusions} />

        <AdjustmentPanel 
          input={input} 
          onAdjustBudget={onAdjustBudget} 
          isAdjusting={isAdjusting} 
        />
      </div>
      
      <div className="w-full h-px bg-border-default/50" />

      <TrustFooter 
        plan={plan} 
        actions={<PlanActions plan={plan} input={input} initialPlanId={initialPlanId} />} 
        isTopPick={isTopPick}
      />
    </div>
  );
}

