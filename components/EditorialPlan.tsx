"use client";

import { ForgeInput, PlanEvaluation } from "@/lib/types";
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

interface EditorialPlanProps {
  evaluation: PlanEvaluation;
  input: ForgeInput;
  planId?: string;
  isTopPick?: boolean;
  originalBudget?: number;
  onAdjustBudget?: (delta: number) => void;
  isAdjusting?: boolean;
}

export default function EditorialPlan({ 
  evaluation, 
  input, 
  planId: initialPlanId, 
  isTopPick = false, 
  originalBudget, 
  onAdjustBudget, 
  isAdjusting = false 
}: EditorialPlanProps) {
  const { plan } = evaluation;
  const diff = originalBudget ? originalBudget - plan.totalCost : 0;

  const getSquadWord = (size: number) => {
    const words = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
    return words[size - 1] || size.toString();
  };

  return (
    <div className={`w-full bg-white transition-[colors,box-shadow,transform] overflow-hidden ${
      isTopPick 
        ? "border-none shadow-[0px_28px_56px_-10px_rgba(1,5,40,0.15),0px_4px_0px_0px_rgba(0,135,81,0.9)] rounded-[32px]" 
        : "border border-border-default/60 shadow-lagoon hover:shadow-lift-lagoon card-lift rounded-[28px]"
    }`} style={{ transitionDuration: 'var(--duration-editorial)' }}>
      
      <PlanHeader input={input} plan={plan} isTopPick={isTopPick} />

      <div className="w-full h-px bg-border-default/50" />

      <div className={`${isTopPick ? 'px-6 sm:px-10 py-10' : 'px-6 sm:px-10 py-8'} bg-white space-y-6`}>
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
                    {formatConfidenceEvidence(ev)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Why this plan? Section */}
        <div className="bg-white border border-border-default/60 rounded-[20px] p-6 space-y-3">
          <h4 className="type-ui-label font-bold text-midnight-lagoon uppercase tracking-wider text-xs">Why this fits you</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2.5 text-sm text-text-secondary">
              <span className="text-palm-green font-bold select-none">•</span>
              <span>
                {diff < 0 
                  ? `Stays near your budget limits, costing ₦${plan.totalCost.toLocaleString()} total`
                  : `Fits comfortably inside your ₦${(originalBudget || plan.totalCost).toLocaleString()} budget limit (no cap)`
                }
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-text-secondary">
              <span className="text-palm-green font-bold select-none">•</span>
              <span>
                {input.startArea && input.startArea !== "anywhere"
                  ? calculateTransportTime(input.startArea, plan.spot.coordinates).displayCopy
                  : "Uber transport costs are factored into standard Lagos routes"
                }
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-text-secondary">
              <span className="text-palm-green font-bold select-none">•</span>
              <span>{getVibeConfig(input.vibe).receiptFull}</span>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-text-secondary">
              <span className="text-palm-green font-bold select-none">•</span>
              <span>Perfect for a squad size of {getSquadWord(input.squadSize)}</span>
            </li>
          </ul>
        </div>

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
      />
    </div>
  );
}

