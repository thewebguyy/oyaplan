"use client";

import { ForgeInput, PlanEvaluation, PlanExplanation } from "@/lib/types";
import { PlanHeader } from "./editorial/PlanHeader";
import { BudgetConfidenceCard } from "./editorial/BudgetConfidenceCard";
import { AdjustmentPanel } from "./editorial/AdjustmentPanel";
import { PlanActions } from "./editorial/PlanActions";
import { TrustFooter } from "./editorial/TrustFooter";
import { ChangeSummary } from "./editorial/ChangeSummary";
import { ExclusionList } from "./editorial/ExclusionList";
import { formatConfidenceEvidence } from "@/lib/utils/editorialFormatter";
import { getVibeConfig } from "@/lib/constants/vibes";
import { calculateTransportTime } from "@/lib/utils/calculateTransportTime";
import { Shield, Check } from "lucide-react";
import RouteCard from "./dossier/RouteCard";
import TransportEstimateCard from "./TransportEstimateCard";
import { LocationService } from "@/lib/services/LocationService";

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

  const getSquadWord = (size: number) => {
    const words = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
    return words[size - 1] || size.toString();
  };

  const getCardClasses = () => {
    if (isTopPick) {
      return "border-none shadow-[0px_28px_56px_-10px_rgba(1,5,40,0.15),0px_4px_0px_0px_rgba(0,135,81,0.9)] rounded-[32px] bg-white";
    }
    // Alternative 1: Yellow style
    if (alternativeIndex === 0) {
      return "bg-[#FEFCE8] border-2 border-[#FCC630] shadow-lagoon hover:shadow-lift-lagoon card-lift rounded-[28px]";
    }
    // Alternative 2: Purple style
    return "bg-[#FAF5FF] border-2 border-[#A855F7]/40 shadow-lagoon hover:shadow-lift-lagoon card-lift rounded-[28px]";
  };

  return (
    <div className={`w-full transition-[colors,box-shadow,transform] overflow-hidden ${getCardClasses()}`} style={{ transitionDuration: 'var(--duration-editorial)' }}>
      
      <PlanHeader input={input} plan={plan} isTopPick={isTopPick} alternativeIndex={alternativeIndex} />

      <div className="w-full h-px bg-border-default/50" />

      <div className={`${isTopPick ? 'px-6 sm:px-10 py-10 bg-white' : 'px-6 sm:px-10 py-8 bg-transparent'} space-y-6`}>
        {/* Decision Summary Callout */}
        {plan.decisionSummary && (
          <div className="bg-[#FAFAF8] border border-border-default/50 rounded-[20px] p-6 shadow-xs relative overflow-hidden flex items-start gap-4">
            <div className="w-1.5 h-full absolute left-0 top-0 bottom-0 bg-[#008751]" />
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#008751] block">Decision Summary</span>
              <p className="type-body text-text-primary text-sm font-semibold leading-relaxed">
                {plan.decisionSummary}
              </p>
            </div>
          </div>
        )}

        {/* Decision Confidence Scorecard */}
        <div className="bg-[#FAFAF8] border border-border-default/80 rounded-[20px] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className={`w-5 h-5 ${
                plan.decisionConfidence?.level === "Very High" || plan.decisionConfidence?.level === "High"
                  ? "text-[#008751]"
                  : "text-amber-500"
              }`} />
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted block">Decision Confidence</span>
                <p className="text-base font-black text-midnight-lagoon">{plan.decisionConfidence?.level || "High"} Confidence</p>
              </div>
            </div>
            {plan.spot.computed_confidence_score !== undefined && (
              <span className="text-3xl font-black text-midnight-lagoon">{Math.round(plan.spot.computed_confidence_score)}%</span>
            )}
          </div>

          {plan.decisionConfidence?.evidenceList && plan.decisionConfidence.evidenceList.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border-default/45">
              {plan.decisionConfidence.evidenceList.map((ev, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-palm-green/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#008751] stroke-[3]" />
                  </div>
                  <span className="text-xs text-text-secondary font-medium">
                    {formatConfidenceEvidence(ev, plan.spot.price_updated_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Why this plan? Section */}
        <div className="bg-white border border-border-default/60 rounded-[20px] p-6 space-y-3">
          <h4 className="type-ui-label font-bold text-midnight-lagoon uppercase tracking-wider text-xs">Why we picked {plan.spot.name} for you</h4>
          <ul className="space-y-2.5">
            {(explanation.ordered_reasons || []).length > 0 ? (
              explanation.ordered_reasons?.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-text-secondary font-medium">
                  <span className="text-[#008751] font-bold select-none">•</span>
                  <span>{reason}</span>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-start gap-2.5 text-sm text-text-secondary font-medium">
                  <span className="text-[#008751] font-bold select-none">•</span>
                  <span>
                    {diff < 0 
                      ? `Stays near your budget limits, costing ₦${plan.totalCost.toLocaleString()} total`
                      : `Fits comfortably inside your ₦${(originalBudget || plan.totalCost).toLocaleString()} budget limit`
                    }
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-text-secondary font-medium">
                  <span className="text-[#008751] font-bold select-none">•</span>
                  <span>
                    {input.startArea && input.startArea !== "anywhere"
                      ? calculateTransportTime(input.startArea, plan.spot.coordinates).displayCopy
                      : "Est. round-trip transport (Uber/Bolt) is factored into standard Lagos routes"
                    }
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-text-secondary font-medium">
                  <span className="text-[#008751] font-bold select-none">•</span>
                  <span>{getVibeConfig(input.vibe).receiptFull}</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-text-secondary font-medium">
                  <span className="text-[#008751] font-bold select-none">•</span>
                  <span>Perfect for a squad size of {getSquadWord(input.squadSize)}</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Things to Know — Surfacing Trade-Offs */}
        {(explanation.things_to_know || []).length > 0 && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-[20px] p-5 space-y-2">
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

        {/* Transport Range & Confidence Card */}
        <TransportEstimateCard
          minCost={plan.transportMinCost}
          maxCost={plan.transportMaxCost}
          transportCost={plan.transportCost}
          mode={plan.transportMode || input.transportMode || "ride-hailing"}
          confidenceScore={plan.transportConfidenceScore}
          confidenceLabel={plan.transportConfidenceLabel || "Typical estimate"}
          badgeColor={plan.transportConfidenceBadgeColor || "yellow"}
          assumptions={plan.transportAssumptions}
          startAreaName={input.startArea && input.startArea !== "anywhere" ? input.startArea : "Yaba"}
          originDistrictId={input.originDistrictId}
          destinationDistrictId={plan.spot.area_id}
          spotId={plan.spot.id}
          departureAt={input.departureAt}
        />

        {/* Route Card — only when we have a start area and venue coordinates */}
        {input.startArea && input.startArea !== "anywhere" && plan.spot.coordinates && (() => {
          const startArea = LocationService.getVerifiedAreas().find(
            (a) => a.id === input.startArea
          );
          if (!startArea) return null;
          const transport = calculateTransportTime(input.startArea, plan.spot.coordinates);
          return (
            <RouteCard
              startAreaName={startArea.name}
              startAreaSlug={input.startArea}
              venueName={plan.spot.name}
              venueAddress={plan.spot.address}
              venueCoords={plan.spot.coordinates}
              transportCost={plan.transportCost}
              distanceKm={transport.distanceKm}
            />
          );
        })()}

        <ChangeSummary changes={evaluation.changes} />

        <ExclusionList exclusions={evaluation.exclusions} />

        {/* Pricing Reassurance & Controls (Subordinated to curational narrative) */}
        <BudgetConfidenceCard plan={plan} originalBudget={originalBudget} />

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

