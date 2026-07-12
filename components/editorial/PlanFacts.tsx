"use client";

import { Check } from "lucide-react";

export function PlanFacts({ decisionFacts }: { decisionFacts: string[] }) {
  if (!decisionFacts || decisionFacts.length === 0) return null;

  return (
    <div className="pt-6 border-t border-border-default space-y-3">
      <p className="type-caption text-text-muted uppercase tracking-wider font-[700]">What to know</p>
      <div className="space-y-2">
        {decisionFacts.map((fact, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-brand-green mt-0.5 shrink-0" />
            <span className="type-body text-text-primary">{fact}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
