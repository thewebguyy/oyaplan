"use client";

import { ForgeInput, PlanEvaluation } from "@/lib/types";
import { PlanHeader } from "./editorial/PlanHeader";
import { BudgetConfidenceCard } from "./editorial/BudgetConfidenceCard";
import { AdjustmentPanel } from "./editorial/AdjustmentPanel";
import { PlanActions } from "./editorial/PlanActions";
import { TrustFooter } from "./editorial/TrustFooter";
import { ChangeSummary } from "./editorial/ChangeSummary";
import { ExclusionList } from "./editorial/ExclusionList";

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

  // Dynamic scorecard calculation
  const getQualityMetrics = () => {
    let budgetScore = 10;
    if (diff < 0) {
      const overPercentage = Math.abs(diff) / (originalBudget || plan.totalCost);
      budgetScore = Math.max(5, Math.round(10 - overPercentage * 20));
    } else if (diff / (originalBudget || 1) < 0.05) {
      budgetScore = 9;
    }

    const travelScore = input.startArea && input.startArea !== "anywhere" ? 8 : 10;
    const vibeScore = 10;
    const groupFitScore = input.squadSize > 6 ? 8 : 10;

    const averageScore = Math.round((budgetScore + travelScore + vibeScore + groupFitScore) * 2.5);

    let matchLabel = "Good Match";
    if (averageScore >= 95) matchLabel = "Excellent Match";
    else if (averageScore >= 85) matchLabel = "Great Match";
    else if (averageScore >= 75) matchLabel = "Fair Match";

    return {
      budgetScore,
      travelScore,
      vibeScore,
      groupFitScore,
      averageScore,
      matchLabel
    };
  };

  const { budgetScore, travelScore, vibeScore, groupFitScore, averageScore, matchLabel } = getQualityMetrics();

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
        {/* Quality Scorecard */}
        <div className="bg-[#FAFAF8] border border-border-default/80 rounded-[20px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-text-muted">Vibe Match Score</span>
              <p className="text-lg font-black text-midnight-lagoon">{matchLabel}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-midnight-lagoon">{averageScore}%</span>
            </div>
          </div>

          <p className="text-sm text-text-secondary">
            Perfect for your ₦{(originalBudget || plan.totalCost).toLocaleString()} budget and squad of {getSquadWord(input.squadSize)}.
          </p>

          <div className="space-y-2.5 pt-2">
            {[
              { label: "Budget Fit", score: budgetScore },
              { label: "Transit Time", score: travelScore },
              { label: "Vibe Match", score: vibeScore },
              { label: "Squad Fit", score: groupFitScore }
            ].map(metric => (
              <div key={metric.label} className="space-y-1">
                <div className="flex justify-between text-xs text-text-secondary font-medium">
                  <span>{metric.label}</span>
                </div>
                <div className="flex gap-0.5" role="img" aria-label={`${metric.label}: ${metric.score}/10`}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-xs ${
                        i < metric.score 
                          ? "bg-palm-green" 
                          : "bg-surface-grey/85 border border-border-default/10"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
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
                  ? `Bolt rides are under 20 mins from ${input.startArea}`
                  : "Bolt transport costs are factored into standard Lagos routes"
                }
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-text-secondary">
              <span className="text-palm-green font-bold select-none">•</span>
              <span>Hits your chosen {input.vibe.toLowerCase()} vibe</span>
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

