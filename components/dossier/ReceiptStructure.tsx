"use client";

import { BudgetFitBadge, BudgetFitStatus } from "@/components/ui/budget-fit-badge";
import { HelpCircle } from "lucide-react";
import { useState } from "react";

interface ReceiptStructureProps {
  venueName: string;
  venueCost: number; // For the entire squad
  transportCost: number; // For the entire squad
  squadSize: number;
  budgetFitStatus: BudgetFitStatus;
  hasCar: boolean;
  transportToggleNode: React.ReactNode;
}

export function ReceiptStructure({ 
  venueName, 
  venueCost, 
  transportCost, 
  squadSize, 
  budgetFitStatus,
  hasCar,
  transportToggleNode
}: ReceiptStructureProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const baseTotal = venueCost + transportCost;
  const contingency = baseTotal * 0.15;
  const finalTallyTotal = baseTotal + contingency;
  const finalTallyPerPerson = finalTallyTotal / squadSize;

  return (
    <div className="max-w-lg mx-auto w-full mt-8">
      {/* Transport Toggle sits above the receipt */}
      <div className="mb-4 flex justify-end">
        {transportToggleNode}
      </div>

      <div className="w-full border border-black bg-white flex flex-col font-mono text-sm shadow-sm relative">
        
        {/* Header Row */}
        <div className="flex justify-between items-center p-4 border-b border-black bg-[#F5F5F5]">
          <span className="font-bold tracking-widest text-[10px] uppercase text-text-secondary">Line Item</span>
          <span className="font-bold tracking-widest text-[10px] uppercase text-text-secondary">Est. Cost</span>
        </div>

        {/* Venue Row */}
        <div className="flex justify-between items-start p-4 border-b border-black">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-black uppercase tracking-tight">{venueName}</span>
            <BudgetFitBadge status={budgetFitStatus} size="sm" className="w-fit" />
          </div>
          <span className="font-bold">₦{venueCost.toLocaleString()}</span>
        </div>

        {/* Logistics Row */}
        <div className="flex justify-between items-center p-4 border-b border-black">
          <div className="flex items-center gap-2 relative">
            <span className="font-bold text-black uppercase tracking-tight">Logistics</span>
            
            <button 
              className="text-text-muted hover:text-black transition-colors"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              aria-label="How we calculate logistics"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute top-6 left-0 z-50 w-64 bg-black text-white p-3 rounded-[4px] font-sans text-xs shadow-lg leading-relaxed pointer-events-none">
                {hasCar 
                  ? "You noted you have a car. Transport costs are zeroed out."
                  : `Round-trip Bolt/Uber estimate for ${squadSize} people. Prices may surge based on time of day.`
                }
              </div>
            )}
          </div>
          <span className="font-bold">{hasCar ? "₦0" : `₦${transportCost.toLocaleString()}`}</span>
        </div>

        {/* Contingency Row */}
        <div className="flex justify-between items-center p-4 border-b border-black">
          <span className="font-bold text-black uppercase tracking-tight text-text-muted">Contingency (15%)</span>
          <span className="font-bold text-text-muted">₦{Math.round(contingency).toLocaleString()}</span>
        </div>

        {/* Final Tally Inverted Row */}
        <div className="flex justify-between items-center p-5 bg-black text-white font-sans">
          <span className="font-black tracking-widest text-[11px] uppercase">Final Tally (Per Person)</span>
          <span className="font-black text-xl">₦{Math.round(finalTallyPerPerson).toLocaleString()}</span>
        </div>

      </div>
    </div>
  );
}
