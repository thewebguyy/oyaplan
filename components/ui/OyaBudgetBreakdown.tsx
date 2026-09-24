"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatNaira, OyaPrice } from "@/components/ui/OyaPrice";

export interface BudgetBreakdownLineItem {
  id: string;
  label: string;
  amount: number;
  note?: string;
  isSecondary?: boolean;
}

export interface OyaBudgetBreakdownProps extends React.HTMLAttributes<HTMLDivElement> {
  items: BudgetBreakdownLineItem[];
  total: number;
  squadSize?: number;
  budgetTarget?: number;
  showFitBadge?: boolean;
  compact?: boolean;
}

export function OyaBudgetBreakdown({
  items,
  total,
  squadSize = 1,
  budgetTarget,
  showFitBadge = true,
  compact = false,
  className,
  ...props
}: OyaBudgetBreakdownProps) {
  // Budget fit calculation
  const fitStatus = React.useMemo(() => {
    if (!budgetTarget) return null;
    const diff = budgetTarget - total;
    if (diff >= 0) {
      const pctLeft = Math.round((diff / budgetTarget) * 100);
      return {
        type: "within" as const,
        label: `Fits your ${formatNaira(budgetTarget, true)} budget`,
        sublabel: diff === 0 ? "Exact match" : `${formatNaira(diff)} remaining (${pctLeft}%)`,
        badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
      };
    } else {
      const overBy = Math.abs(diff);
      const isSlight = overBy <= budgetTarget * 0.15;
      return {
        type: isSlight ? ("stretch" as const) : ("over" as const),
        label: isSlight ? "Slight stretch" : "Over budget",
        sublabel: `${formatNaira(overBy)} over target`,
        badgeClass: isSlight 
          ? "bg-amber-50 text-amber-800 border-amber-200/60" 
          : "bg-red-50 text-red-800 border-red-200/60",
      };
    }
  }, [budgetTarget, total]);

  return (
    <div
      className={cn(
        "rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] p-4 sm:p-5 flex flex-col gap-4 text-text-primary",
        className
      )}
      {...props}
    >
      {/* Fit status banner if budget target provided */}
      {showFitBadge && fitStatus && (
        <div
          className={cn(
            "flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold",
            fitStatus.badgeClass
          )}
        >
          <span>{fitStatus.label}</span>
          <span className="font-normal opacity-90">{fitStatus.sublabel}</span>
        </div>
      )}

      {/* Ledger Line Items */}
      <div className="flex flex-col gap-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center justify-between text-xs sm:text-sm",
              item.isSecondary ? "text-text-muted" : "text-text-primary font-medium"
            )}
          >
            <div className="flex items-center gap-1.5">
              <span>{item.label}</span>
              {item.note && (
                <span className="text-[11px] text-text-muted font-normal">
                  ({item.note})
                </span>
              )}
            </div>
            {/* Dotted fill line for editorial ledger scannability */}
            <div className="flex-1 mx-2 border-b border-dotted border-border-default/80" />
            <span className="tabular-nums font-semibold shrink-0">
              {formatNaira(item.amount)}
            </span>
          </div>
        ))}
      </div>

      {/* Total Section */}
      <div className="pt-3 border-t border-[#EAE4DC] flex items-baseline justify-between">
        <div>
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
            Estimated Total
          </span>
          {squadSize > 1 && (
            <span className="text-xs text-text-muted">
              {formatNaira(Math.round(total / squadSize))} / person ({squadSize} people)
            </span>
          )}
        </div>
        <OyaPrice
          amount={total}
          size={compact ? "md" : "lg"}
          trend={fitStatus ? fitStatus.type : "neutral"}
        />
      </div>
    </div>
  );
}

export default OyaBudgetBreakdown;
