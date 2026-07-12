"use client";

import { Minus, Plus, Loader2 } from "lucide-react";
import { ForgeInput } from "@/lib/types";

export function AdjustmentPanel({
  input,
  onAdjustBudget,
  isAdjusting = false
}: {
  input: ForgeInput;
  onAdjustBudget?: (delta: number) => void;
  isAdjusting?: boolean;
}) {
  if (!onAdjustBudget) return null;

  return (
    <div className="pt-6 border-t border-border-default space-y-4">
      <p className="type-caption text-text-muted uppercase tracking-wider font-[700]">Adjust this plan</p>
      <div className="flex items-center justify-between p-1 bg-surface-grey rounded-[16px]">
        <button 
          onClick={() => onAdjustBudget(-5000)}
          disabled={isAdjusting || input.budget <= 5000}
          className="w-12 h-12 flex items-center justify-center rounded-[12px] bg-white border border-border-default shadow-sm tap-feedback disabled:opacity-50"
        >
          <Minus className="w-4 h-4 text-text-primary" />
        </button>
        <div className="flex flex-col items-center">
          <span className="type-label text-text-primary">Budget</span>
          <span className="type-caption text-text-secondary">₦{input.budget.toLocaleString()}</span>
        </div>
        <button 
          onClick={() => onAdjustBudget(5000)}
          disabled={isAdjusting}
          className="w-12 h-12 flex items-center justify-center rounded-[12px] bg-white border border-border-default shadow-sm tap-feedback disabled:opacity-50"
        >
          <Plus className="w-4 h-4 text-text-primary" />
        </button>
      </div>
      {isAdjusting && (
        <div className="flex items-center justify-center gap-2 pt-2 animate-in fade-in">
          <Loader2 className="w-4 h-4 animate-spin text-brand-green" />
          <span className="type-caption text-text-secondary">Adjusting your plan...</span>
        </div>
      )}
    </div>
  );
}
