'use client';

import React from 'react';
import { Plan } from '@/lib/types';
import { CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { NumericCounter } from '@/components/ui/NumericCounter';

interface BudgetConfidenceCardProps {
  plan: Plan;
  originalBudget?: number;
}

export function BudgetConfidenceCard({ plan, originalBudget }: BudgetConfidenceCardProps) {
  const budget = originalBudget || plan.totalCost;
  const diff = budget - plan.totalCost;
  const isOverBudget = diff < 0;
  const isWellUnderBudget = budget > 0 && plan.totalCost < budget * 0.6;

  const hasFood = plan.spot.has_food !== false;
  const venueCost = plan.foodCost;
  const transportCost = plan.transportCost;
  const taxesCost = Math.max(0, plan.totalCost - (venueCost + transportCost));

  return (
    <div
      className="bg-[#FAF7F2] border border-[#E5E0D8] rounded-2xl p-5 sm:p-7 space-y-5 shadow-xs transition-all"
      style={{ transitionDuration: 'var(--duration-editorial)' }}
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]/60">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#008751] block">
            Budget Relationship
          </span>
          <h3 className="text-base sm:text-lg font-black text-midnight-lagoon">
            Outing Cost Estimate
          </h3>
        </div>
        <span className="text-[11px] font-bold text-[#008751] flex items-center gap-1 bg-[#008751]/10 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Landed Estimate</span>
        </span>
      </div>

      {/* 2. Three Pillars: Budget | Estimated Spend | Remaining */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center">
        {/* User Target */}
        <div className="space-y-0.5 min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold text-text-secondary truncate">
            Your Budget
          </p>
          <p className="text-base sm:text-xl font-black text-midnight-lagoon font-mono tabular-nums tracking-tight truncate">
            ₦{budget.toLocaleString('en-NG')}
          </p>
          <p className="text-[10px] text-text-muted hidden sm:block">Limit specified</p>
        </div>

        {/* Estimated Spend */}
        <div className="space-y-0.5 text-center min-w-0 bg-white py-2.5 px-1.5 sm:px-3 rounded-xl border border-border-default/60 shadow-xs">
          <p className="text-[11px] sm:text-xs font-bold text-[#008751] truncate">
            Estimated Spend
          </p>
          <p className="text-lg sm:text-2xl font-black text-[#008751] font-mono tabular-nums tracking-tight truncate">
            ~₦<NumericCounter value={plan.totalCost} />
          </p>
          <p className="text-[10px] text-text-muted hidden sm:block">Landed total</p>
        </div>

        {/* Remaining Left Over */}
        <div className="space-y-0.5 text-right min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold text-text-secondary truncate">
            {isOverBudget ? 'Over Budget' : 'Remaining'}
          </p>
          <p
            className={`text-base sm:text-xl font-black font-mono tabular-nums tracking-tight truncate ${
              isOverBudget ? 'text-amber-700' : 'text-midnight-lagoon'
            }`}
          >
            {isOverBudget ? '-' : ''}₦{Math.abs(diff).toLocaleString('en-NG')}
          </p>
          <p className="text-[10px] text-text-muted hidden sm:block">
            {isOverBudget ? 'Exceeds budget' : 'Left over'}
          </p>
        </div>
      </div>

      {/* 3. Itemized Landed Breakdown */}
      <div className="py-3 px-4 bg-white border border-border-default/60 rounded-xl space-y-2 text-xs font-mono">
        <div className="flex justify-between items-center text-[#4B5563]">
          <span className="font-sans font-semibold">
            {hasFood ? '🍽️ Food & Drinks' : '🎟️ Admission / Passes'}
          </span>
          <span className="font-bold text-[#111827]">₦{venueCost.toLocaleString('en-NG')}</span>
        </div>
        <div className="flex justify-between items-center text-[#4B5563]">
          <span className="font-sans font-semibold">🚗 Round-trip Transport</span>
          <span className="font-bold text-[#111827]">
            {transportCost === 0 ? '₦0 (Driving/Walking)' : `₦${transportCost.toLocaleString('en-NG')}`}
          </span>
        </div>
        {taxesCost > 0 && (
          <div className="flex justify-between items-center text-[#4B5563]">
            <span className="font-sans font-semibold">🧾 Taxes &amp; Service</span>
            <span className="font-bold text-[#111827]">₦{taxesCost.toLocaleString('en-NG')}</span>
          </div>
        )}
      </div>

      {/* 4. Contextual Feedback */}
      {isWellUnderBudget && (
        <div className="flex items-start gap-2 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3 text-xs text-[#065F46] font-medium leading-relaxed">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#008751] mt-0.5" />
          <p>
            <strong>This plan comes in well below your budget.</strong> You have ₦
            {diff.toLocaleString('en-NG')} remaining left over to flex at this venue or upgrade orders.
          </p>
        </div>
      )}

      {isOverBudget && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 font-medium leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <p>
            This plan stretches ₦{Math.abs(diff).toLocaleString('en-NG')} over your target limit.
          </p>
        </div>
      )}
    </div>
  );
}
