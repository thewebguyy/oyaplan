"use client";

import { BudgetFitBadge, BudgetFitStatus } from "@/components/ui/budget-fit-badge";
import { HelpCircle, Check, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { NumericCounter } from "@/components/ui/NumericCounter";

import { TransportEstimate } from "@/lib/types";

interface ReceiptStructureProps {
  venueName: string;
  venueCost: number; // For the entire squad
  transportCost: number; // For the entire squad
  squadSize: number;
  budgetFitStatus: BudgetFitStatus;
  hasCar: boolean;
  transportToggleNode: React.ReactNode;
  budget: number;
  transportEstimate?: TransportEstimate;
  hasFood?: boolean;
  category?: string;
  freshnessText?: string;
}

export function ReceiptStructure({ 
  venueName, 
  venueCost, 
  transportCost, 
  squadSize, 
  budgetFitStatus,
  hasCar,
  transportToggleNode,
  budget,
  transportEstimate,
  hasFood = true,
  category,
  freshnessText
}: ReceiptStructureProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const [splitMode, setSplitMode] = useState<"equal" | "custom">("equal");

  // Re-calculate math based on exact pricing model
  const squadFoodCost = venueCost;
  const perPersonFoodCost = Math.round(squadFoodCost / squadSize);
  const avgEntree = Math.round((perPersonFoodCost * 0.75) / 100) * 100;
  const avgDrink = Math.round((perPersonFoodCost * 0.25) / 100) * 100;
  // Non-food spots (parks, nature, beaches) don't have restaurant dining VAT/service surcharge
  const taxesCost = hasFood ? Math.round((squadFoodCost * 0.1) / 100) * 100 : 0;

  const totalCost = squadFoodCost + transportCost + taxesCost;
  const perPersonTotal = Math.round(totalCost / squadSize);
  const remainingBuffer = Math.max(0, budget - totalCost);
  const spendPercentage = Math.min(100, Math.round((totalCost / budget) * 100));

  // Custom split logic: 1 driver (food+tax only) vs other squad members who split transport
  const driverShare = Math.round((squadFoodCost + taxesCost) / squadSize);
  const riderShare = squadSize > 1 && transportCost > 0
    ? Math.round(((squadFoodCost + taxesCost) / squadSize) + (transportCost / (squadSize - 1)))
    : perPersonTotal;

  return (
    <div className="max-w-lg mx-auto w-full mt-8">
      {/* Transport Toggle sits above the receipt */}
      <div className="mb-4 flex justify-end">
        {transportToggleNode}
      </div>

      {/* Tactile Receipt Container */}
      <div className="relative">
        {/* Receipt Paper Top Perforation / Tear Strip */}
        <div 
          className="w-full h-3 bg-[#E5E7EB] opacity-60 rounded-t-sm"
          style={{
            backgroundImage: "radial-gradient(circle at 6px -1px, transparent 5px, #FFFFFF 6px)",
            backgroundSize: "12px 12px",
            backgroundRepeat: "repeat-x"
          }}
        />

        <div className="w-full border-2 border-[#111827] bg-white rounded-b-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.08),0_4px_0_0_#111827] flex flex-col font-mono text-sm overflow-hidden scroll-reveal is-visible">
          
          {/* Official Verification Watermark Header */}
          <div className="px-5 py-3 border-b border-dashed border-[#111827]/30 bg-[#FBFBFA] flex items-center justify-between text-[10px] uppercase tracking-widest text-[#6B7280]">
            <span className="font-bold">OyaPlan Verified Receipt</span>
            <span className="font-bold text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded">LAGOS • SEP 2026</span>
          </div>

          {/* Header Row */}
          <div className="flex justify-between items-center px-5 py-3 border-b-2 border-[#111827] bg-[#F5F5F3]">
            <span className="font-black tracking-widest text-[10px] uppercase text-[#374151]">Itemized Breakdown</span>
            <span className="font-black tracking-widest text-[10px] uppercase text-[#374151]">Est. Landed Cost</span>
          </div>

          {/* Venue Information */}
          <div className="p-5 border-b border-[#111827] space-y-2">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-black text-[#111827] text-lg uppercase tracking-tight font-sans">{venueName}</h3>
                <div className="flex items-center gap-1.5 text-xs text-[#008751] font-bold font-sans">
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {hasFood
                      ? (freshnessText ? `Verified Menu • ${freshnessText}` : "Verified Menu Pricing")
                      : (freshnessText ? `Verified Entry • ${freshnessText}` : "Verified Admission Fee")}
                  </span>
                </div>
              </div>
              <BudgetFitBadge status={budgetFitStatus} size="sm" className="shrink-0" />
            </div>
          </div>

          {/* Venue Chop / Entry Section */}
          <div className="p-5 border-b border-[#111827] space-y-2.5 bg-[#FAFAF8]">
            <div className="flex justify-between font-bold text-[#111827] uppercase">
              <span>{hasFood ? "Food & Drinks" : "Admission / Entry Fee"}</span>
              <span>₦{squadFoodCost.toLocaleString()}</span>
            </div>
            {hasFood ? (
              <div className="pl-4 text-xs text-[#6B7280] space-y-1.5">
                <div className="flex justify-between">
                  <span>└─ Average entrée:</span>
                  <span className="font-semibold text-[#111827]">₦{avgEntree.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>└─ Average drink:</span>
                  <span className="font-semibold text-[#111827]">₦{avgDrink.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>└─ Recommended spend:</span>
                  <span className="font-semibold text-[#111827]">₦{perPersonFoodCost.toLocaleString()} / person</span>
                </div>
              </div>
            ) : (
              <div className="pl-4 text-xs text-[#6B7280] space-y-1.5">
                <div className="flex justify-between">
                  <span>└─ Standard entry rate:</span>
                  <span className="font-semibold text-[#111827]">₦{perPersonFoodCost.toLocaleString()} / person</span>
                </div>
                <div className="flex justify-between">
                  <span>└─ Total squad entry ({squadSize} {squadSize === 1 ? 'person' : 'people'}):</span>
                  <span className="font-semibold text-[#111827]">₦{squadFoodCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>└─ Experience category:</span>
                  <span className="font-semibold text-[#111827] capitalize">{category || "Activity / Nature"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Transport Section */}
          <div className="p-5 border-b border-[#111827] space-y-2.5">
            <div className="flex justify-between font-bold text-[#111827] uppercase items-center">
              <div className="flex items-center gap-1.5">
                <span>Transport (Round-trip)</span>
                <button 
                  className="text-[#6B7280] hover:text-[#111827] transition-colors"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  aria-label="How transport is computed"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <span>{hasCar ? "₦0" : (transportEstimate && transportEstimate.low > 0 ? `₦${transportEstimate.low.toLocaleString()} – ₦${transportEstimate.high.toLocaleString()}` : `₦${transportCost.toLocaleString()}`)}</span>
            </div>

            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute z-50 w-64 bg-[#111827] text-white p-3 rounded-lg font-sans text-xs shadow-xl leading-relaxed">
                {hasCar 
                  ? "Car selected: transport fare zeroed out. Only venue and statutory costs apply."
                  : `Round-trip ride-hailing estimate for ${squadSize} people in Lagos, including cross-bridge traffic corridors.`
                }
              </div>
            )}

            {!hasCar && transportCost > 0 && (
              <div className="pl-4 text-xs text-[#6B7280] space-y-1.5">
                <div className="flex justify-between">
                  <span>└─ Outbound ride to venue:</span>
                  <span className="font-semibold text-[#111827]">
                    {transportEstimate && transportEstimate.low > 0 
                      ? `₦${(transportEstimate.low / 2).toLocaleString()} – ₦${(transportEstimate.high / 2).toLocaleString()}`
                      : `₦${(transportCost / 2).toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>└─ Return ride home:</span>
                  <span className="font-semibold text-[#111827]">
                    {transportEstimate && transportEstimate.low > 0 
                      ? `₦${(transportEstimate.low / 2).toLocaleString()} – ₦${(transportEstimate.high / 2).toLocaleString()}`
                      : `₦${(transportCost / 2).toLocaleString()}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Taxes & Service */}
          <div className="flex justify-between items-center p-5 border-b border-[#111827]">
            <div className="space-y-0.5">
              <span className="font-bold text-[#111827] uppercase">{hasFood ? "Taxes & Service Charge" : "Taxes & Access Levies"}</span>
              <div className="text-[10px] text-[#6B7280] font-sans">
                {hasFood ? "VAT 7.5% + venue service fee 2.5%" : "Included in entry & access rate"}
              </div>
            </div>
            <span className="font-bold text-[#111827]">₦{taxesCost.toLocaleString()}</span>
          </div>

          {/* Final Tally Inverted Summary Row */}
          <div className="p-6 bg-[#111827] text-white font-sans space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-black tracking-widest text-[11px] uppercase text-white/80">Total Landed Cost</span>
              <span className="font-black text-3xl text-[#FCC630] font-mono">₦<NumericCounter value={totalCost} /></span>
            </div>
            <div className="flex justify-between text-xs text-white/70 font-medium">
              <span>Squad of {squadSize} ({squadSize === 1 ? "solo" : "linkup"})</span>
              <span className="font-bold text-white">₦{perPersonTotal.toLocaleString()} / person</span>
            </div>
          </div>

          {/* Who Dey Pay? Squad Bill-Split Module */}
          {squadSize > 1 && (
            <div className="p-5 bg-[#FBFBFA] border-b border-[#111827] space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#111827] flex items-center gap-1.5">
                  <span>⚡</span> Who Dey Pay? (Squad Split)
                </span>
                <div className="flex gap-1 bg-[#E5E7EB] p-0.5 rounded-lg text-[11px] font-bold">
                  <button
                    onClick={() => setSplitMode("equal")}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      splitMode === "equal" ? "bg-white text-[#111827] shadow-xs" : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    Equal
                  </button>
                  {!hasCar && transportCost > 0 && (
                    <button
                      onClick={() => setSplitMode("custom")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        splitMode === "custom" ? "bg-white text-[#111827] shadow-xs" : "text-[#6B7280] hover:text-[#111827]"
                      }`}
                    >
                      Driver vs Cabs
                    </button>
                  )}
                </div>
              </div>

              {splitMode === "equal" ? (
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-[#111827]">Straight 50/50 Split</p>
                    <p className="text-[11px] text-[#6B7280]">Everyone sends the exact same amount</p>
                  </div>
                  <span className="font-mono font-black text-sm text-[#008751]">
                    ₦{perPersonTotal.toLocaleString()} / person
                  </span>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#111827]">Car Owner (1 person)</p>
                      <p className="text-[11px] text-[#6B7280]">Pays food + tax only (zero ride share)</p>
                    </div>
                    <span className="font-mono font-black text-sm text-[#111827]">
                      ₦{driverShare.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#111827]">Cab Passengers ({squadSize - 1} people)</p>
                      <p className="text-[11px] text-[#6B7280]">Food + tax + split ride-hailing</p>
                    </div>
                    <span className="font-mono font-black text-sm text-[#008751]">
                      ₦{riderShare.toLocaleString()} / each
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Remaining Buffer Progress */}
          <div className="p-5 bg-[#FFFDF5] space-y-2">
            <div className="flex justify-between items-center font-sans">
              <span className="font-bold text-[#111827] text-xs uppercase tracking-wider">Remaining Buffer</span>
              <span className="font-bold text-[#008751] font-mono text-sm">₦{remainingBuffer.toLocaleString()}</span>
            </div>
            <div className="space-y-1">
              <div className="w-full h-2.5 bg-[#EAE8E3] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#008751] rounded-full transition-all duration-500" 
                  style={{ width: `${spendPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#6B7280] font-sans">
                <span>{spendPercentage}% of budget utilized</span>
                <span>Budget Cap: ₦{budget.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* What's Included Transparency Module */}
      <div className="mt-6 border border-[#E5E7EB] bg-[#FAFAF8] rounded-2xl p-5 scroll-reveal is-visible">
        <h4 className="type-ui-label text-[#111827] text-xs uppercase font-bold tracking-widest mb-3">Verified in this landed estimate</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            "Verified Food Menu",
            "Drink Price Baselines",
            "VAT (7.5%) & State Tax",
            "Service Charge (2.5%)",
            "Round-Trip Uber Corridor",
            "Zero Hidden Cover Fees"
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#008751]/10 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-[#008751]" strokeWidth={3} />
              </div>
              <span className="text-[#4B5563] font-medium text-[11px]">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
