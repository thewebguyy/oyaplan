"use client";

import { BudgetFitBadge, BudgetFitStatus } from "@/components/ui/budget-fit-badge";
import { HelpCircle, Check, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { NumericCounter } from "@/components/ui/NumericCounter";

interface ReceiptStructureProps {
  venueName: string;
  venueCost: number; // For the entire squad
  transportCost: number; // For the entire squad
  squadSize: number;
  budgetFitStatus: BudgetFitStatus;
  hasCar: boolean;
  transportToggleNode: React.ReactNode;
  budget: number;
}

export function ReceiptStructure({ 
  venueName, 
  venueCost, 
  transportCost, 
  squadSize, 
  budgetFitStatus,
  hasCar,
  transportToggleNode,
  budget
}: ReceiptStructureProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Re-calculate math based on exact pricing model
  const squadFoodCost = venueCost;
  const perPersonFoodCost = Math.round(squadFoodCost / squadSize);
  const avgEntree = Math.round((perPersonFoodCost * 0.75) / 100) * 100;
  const avgDrink = Math.round((perPersonFoodCost * 0.25) / 100) * 100;
  const taxesCost = Math.round((squadFoodCost * 0.1) / 100) * 100;

  const totalCost = squadFoodCost + transportCost + taxesCost;
  const perPersonTotal = Math.round(totalCost / squadSize);
  const remainingBuffer = Math.max(0, budget - totalCost);
  const spendPercentage = Math.min(100, Math.round((totalCost / budget) * 100));

  return (
    <div className="max-w-lg mx-auto w-full mt-8">
      {/* Transport Toggle sits above the receipt */}
      <div className="mb-4 flex justify-end">
        {transportToggleNode}
      </div>

      <div className="w-full border-2 border-black bg-white rounded-[20px] shadow-[0_8px_0_0_#1A1A1A] flex flex-col font-mono text-sm overflow-hidden scroll-reveal is-visible">
        
        {/* Header Row */}
        <div className="flex justify-between items-center p-4 border-b-2 border-black bg-[#F5F5F5]">
          <span className="font-black tracking-widest text-[10px] uppercase text-text-secondary">Receipt Item</span>
          <span className="font-black tracking-widest text-[10px] uppercase text-text-secondary">Est. Cost</span>
        </div>

        {/* Venue Information */}
        <div className="p-4 border-b border-black space-y-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="font-black text-black text-base uppercase tracking-tight">{venueName}</h3>
              <div className="flex items-center gap-1.5 text-xs text-[#008751] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Menu: Updated 2 days ago</span>
              </div>
            </div>
            <BudgetFitBadge status={budgetFitStatus} size="sm" className="shrink-0" />
          </div>
        </div>

        {/* Food & Drinks Section */}
        <div className="p-4 border-b border-black space-y-2 bg-[#FAFAF8]">
          <div className="flex justify-between font-bold text-black uppercase">
            <span>Food &amp; Drinks</span>
            <span>₦{squadFoodCost.toLocaleString()}</span>
          </div>
          <div className="pl-4 text-xs text-[#6B7280] space-y-1">
            <div className="flex justify-between">
              <span>└─ Average entrée:</span>
              <span className="font-semibold text-[#1A1A1A]">₦{avgEntree.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>└─ Average drink:</span>
              <span className="font-semibold text-[#1A1A1A]">₦{avgDrink.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>└─ Recommended spend:</span>
              <span className="font-semibold text-[#1A1A1A]">₦{perPersonFoodCost.toLocaleString()}/person</span>
            </div>
          </div>
        </div>

        {/* Transport Section */}
        <div className="p-4 border-b border-black space-y-2">
          <div className="flex justify-between font-bold text-black uppercase items-center">
            <div className="flex items-center gap-1.5">
              <span>Transport (Uber)</span>
              <button 
                className="text-[#6B7280] hover:text-black transition-colors"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                aria-label="How transport is computed"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <span>{hasCar ? "₦0" : `₦${transportCost.toLocaleString()}`}</span>
          </div>

          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute z-50 w-60 bg-black text-white p-3 rounded-[8px] font-sans text-xs shadow-lg leading-relaxed">
              {hasCar 
                ? "You selected car travel. Transport fare is zeroed out."
                : `Round-trip ride-sharing fare estimate for ${squadSize} people in Lagos.`
              }
            </div>
          )}

          {!hasCar && transportCost > 0 && (
            <div className="pl-4 text-xs text-[#6B7280] space-y-1">
              <div className="flex justify-between">
                <span>└─ Outbound to venue:</span>
                <span className="font-semibold text-[#1A1A1A]">₦{(transportCost / 2).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>└─ Return fare:</span>
                <span className="font-semibold text-[#1A1A1A]">₦{(transportCost / 2).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Taxes & Service */}
        <div className="flex justify-between items-center p-4 border-b border-black">
          <div className="space-y-0.5">
            <span className="font-bold text-black uppercase">Taxes &amp; Service</span>
            <div className="text-[10px] text-[#6B7280] font-sans">VAT 7.5% + local service fee 2.5%</div>
          </div>
          <span className="font-bold text-[#1A1A1A]">₦{taxesCost.toLocaleString()}</span>
        </div>

        {/* Final Tally Inverted Summary Row */}
        <div className="p-5 bg-black text-white font-sans space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-black tracking-widest text-[11px] uppercase">Total Estimated</span>
            <span className="font-black text-2xl text-[#10B981]">₦<NumericCounter value={totalCost} /></span>
          </div>
          <div className="flex justify-between text-xs text-[#D1D5DB] font-medium">
            <span>Per Person ({squadSize} {squadSize === 1 ? "person" : "people"})</span>
            <span>₦{perPersonTotal.toLocaleString()}/person</span>
          </div>
        </div>

        {/* Remaining Buffer */}
        <div className="p-4 bg-[#FFFDF5] space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-black uppercase">Buffer Remaining</span>
            <span className="font-bold text-[#FCC630] font-mono">₦{remainingBuffer.toLocaleString()}</span>
          </div>
          <div className="space-y-1">
            <div className="w-full h-2 bg-[#EAE8E3] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#008751]" 
                style={{ width: `${spendPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#6B7280] font-sans">
              <span>{spendPercentage}% Budget Used</span>
              <span>Budget Cap: ₦{budget.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

      {/* What's Included Transparency Module */}
      <div className="mt-6 border border-border-default bg-[#F9F9F9] rounded-[12px] p-5 scroll-reveal is-visible">
        <h4 className="type-ui-label text-text-primary text-xs uppercase font-bold tracking-widest mb-3">Included in this estimate</h4>
        <div className="space-y-2">
          {[
            "Food",
            "Drinks",
            "VAT & State Taxes",
            "Service Charge",
            "Estimated Round-Trip Transport",
            "Buffer for small extras"
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-brand-green/20 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-brand-green" strokeWidth={3} />
              </div>
              <span className="type-caption text-text-secondary font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
