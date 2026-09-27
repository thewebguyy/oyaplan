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
    <div className="pt-6 border-t border-[#EAE4DC] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wider text-text-muted">Fine-Tune Outing Budget</span>
        <span className="text-[10px] font-bold text-[#008751]">±₦5,000 Step</span>
      </div>
      <div className="flex items-center justify-between p-1.5 bg-surface-grey rounded-2xl border border-[#EAE4DC]">
        <button 
          type="button"
          onClick={() => onAdjustBudget(-5000)}
          disabled={isAdjusting || input.budget <= 5000}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-[#EAE4DC] hover:border-midnight-lagoon text-midnight-lagoon shadow-xs tap-feedback disabled:opacity-40 cursor-pointer transition-all"
          aria-label="Decrease budget by ₦5,000"
        >
          <Minus className="w-4 h-4 stroke-[2.5]" />
        </button>
        <div className="flex flex-col items-center px-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Target Budget</span>
          <span className="font-mono font-black text-midnight-lagoon text-base sm:text-lg tabular-nums">₦{input.budget.toLocaleString('en-NG')}</span>
        </div>
        <button 
          type="button"
          onClick={() => onAdjustBudget(5000)}
          disabled={isAdjusting}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-[#EAE4DC] hover:border-midnight-lagoon text-midnight-lagoon shadow-xs tap-feedback disabled:opacity-40 cursor-pointer transition-all"
          aria-label="Increase budget by ₦5,000"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
      {isAdjusting && (
        <div className="flex items-center justify-center gap-2 pt-1 animate-in fade-in">
          <Loader2 className="w-4 h-4 animate-spin text-[#008751]" />
          <span className="text-xs font-bold text-[#008751]">Updating your Lagos plan...</span>
        </div>
      )}
    </div>
  );
}
