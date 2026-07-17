"use client";

import { ForgeInput, PlanEvaluation } from "@/lib/types";
import { PlanHeader } from "./editorial/PlanHeader";
import { BudgetConfidenceCard } from "./editorial/BudgetConfidenceCard";
import { PlanFacts } from "./editorial/PlanFacts";
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
  const { plan, trustSignals } = evaluation;
  const diff = originalBudget ? originalBudget - plan.totalCost : 0;
  
  // Format the assurance string
  let budgetAssurance = "Typically fits within your budget";
  if (originalBudget) {
    if (diff < 0) {
      budgetAssurance = `Slightly above your ₦${originalBudget.toLocaleString()} budget (by ~₦${Math.abs(diff).toLocaleString()})`;
    } else if (diff < 2000) {
      budgetAssurance = `Fits exactly within your ₦${originalBudget.toLocaleString()} budget`;
    } else {
      budgetAssurance = `Fits comfortably within your ₦${originalBudget.toLocaleString()} budget`;
    }
  }

  // Compile the final facts
  const decisionFacts = [
    budgetAssurance,
    ...(trustSignals ? trustSignals.slice(1) : []), // Skip the generic budget signal, we use budgetAssurance
    input.vibe ? `Strong choice for a ${input.vibe.toLowerCase()} outing` : null,
    plan.whyItFits && plan.whyItFits.length > 5 ? plan.whyItFits : null
  ].filter(Boolean) as string[];

  return (
    <div className={`w-full bg-white transition-[colors,box-shadow,transform] overflow-hidden ${
      isTopPick 
        ? "border-none shadow-[0px_28px_56px_-10px_rgba(1,5,40,0.15),0px_4px_0px_0px_rgba(0,135,81,0.9)] rounded-[32px]" 
        : "border border-border-default/60 shadow-lagoon hover:shadow-lift-lagoon card-lift rounded-[28px]"
    }`} style={{ transitionDuration: 'var(--duration-editorial)' }}>
      
      <PlanHeader input={input} plan={plan} isTopPick={isTopPick} />

      <div className="w-full h-px bg-border-default/50" />

      <div className={`${isTopPick ? 'px-6 sm:px-10 py-10' : 'px-6 sm:px-10 py-8'} bg-white space-y-6`}>
        <BudgetConfidenceCard plan={plan} originalBudget={originalBudget} />

        <AdjustmentPanel 
          input={input} 
          onAdjustBudget={onAdjustBudget} 
          isAdjusting={isAdjusting} 
        />

        <ChangeSummary changes={evaluation.changes} />

        <PlanFacts decisionFacts={decisionFacts} />

        <ExclusionList exclusions={evaluation.exclusions} />
      </div>
      
      <div className="w-full h-px bg-border-default/50" />

      <TrustFooter 
        plan={plan} 
        actions={<PlanActions plan={plan} input={input} initialPlanId={initialPlanId} />} 
      />
    </div>
  );
}
