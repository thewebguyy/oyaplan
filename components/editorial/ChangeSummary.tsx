"use client";

import { ChangeEvaluation } from "@/lib/types";

export function ChangeSummary({ changes }: { changes?: ChangeEvaluation }) {
  if (!changes) return null;

  const hasChanges = changes.gained.length > 0 || changes.lost.length > 0;
  if (!hasChanges) return null;

  return (
    <div className="pt-6 border-t border-border-default space-y-4">
      <p className="type-caption text-text-muted uppercase tracking-wider font-[700]">What changed</p>
      
      <div className="space-y-3">
        {changes.gained.map((gain, i) => (
          <div key={`gain-${i}`} className="flex items-start gap-2">
            <span className="text-brand-green font-[700] mt-0.5">+</span>
            <span className="type-body text-text-primary">{gain}</span>
          </div>
        ))}
        {changes.lost.map((loss, i) => (
          <div key={`loss-${i}`} className="flex items-start gap-2">
            <span className="text-text-muted font-[700] mt-0.5">-</span>
            <span className="type-body text-text-secondary">{loss}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
