'use client';

import React, { useState } from 'react';
import { ChevronDown, Calculator, Car, Receipt, Shield, Clock, CloudRain, CheckCircle2, Sparkles } from 'lucide-react';
import { TransportEstimate } from '@/lib/types';
import { NairaSplitVisual } from '@/components/cultural/NairaSplitVisual';
import { RainBufferVisual } from '@/components/cultural/RainBufferVisual';

interface PlanCostBreakdownProps {
  foodCost: number;
  transportCost: number;
  totalCost: number;
  budget: number;
  squadSize: number;
  startAreaName?: string;
  transportEstimate?: TransportEstimate;
  freshnessText?: string;
  hasCar?: boolean;
  hasFood?: boolean;
  serviceChargePct?: number;
  vatPct?: number;
}

export function PlanCostBreakdown({
  foodCost,
  transportCost,
  totalCost,
  budget,
  squadSize,
  startAreaName = 'Lagos',
  transportEstimate,
  freshnessText,
  hasCar = false,
  hasFood = true,
  serviceChargePct = 5,
  vatPct = 7.5,
}: PlanCostBreakdownProps) {
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isRainSimulated, setIsRainSimulated] = useState(false);

  const taxesCost = Math.max(0, totalCost - (foodCost + transportCost));
  const remaining = budget - totalCost;

  // Surge Simulator (Worst-Case Lagos Downpour scenario calculation)
  const simulatedRainTransport = Math.round((transportCost * 1.45) / 500) * 500;
  const surgeBuffer = Math.max(0, simulatedRainTransport - transportCost);
  const simulatedTotalCost = totalCost + surgeBuffer;

  const perPersonCost = Math.round(totalCost / Math.max(1, squadSize));

  return (
    <div className="relative w-full transition-all duration-300 font-mono">
      {/* Subtle Halo Glow Behind Till Slip */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-[#F9E828]/20 via-[#008751]/15 to-[#F9E828]/20 rounded-3xl blur-xl opacity-75 pointer-events-none" />

      {/* Main Digital Till Slip Container */}
      <section className="relative bg-white border-3 border-[#111111] rounded-3xl p-5 sm:p-7 shadow-[8px_8px_0px_0px_#111111] space-y-5 overflow-hidden">
        
        {/* Top Perforated Receipt Header */}
        <div className="flex justify-between items-center pb-3.5 border-b-2 border-dashed border-[#111111]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#111111]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#111111]">
              The Outside Math • Till Slip
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#666666] tracking-wider">
            POS #OYA-{Math.abs(totalCost % 9999).toString().padStart(4, '0')}
          </span>
        </div>

        {/* Receipt Brand Banner */}
        <div className="text-center py-1 space-y-1">
          <p className="text-xs font-black uppercase tracking-wider text-[#111111] font-display">
            ★ Verified Outing Receipt ★
          </p>
          <p className="text-[10px] text-[#777777] font-medium">
            Squad of {squadSize} • Departing from {startAreaName}
          </p>
        </div>

        {/* Itemized Outing Costs */}
        <div className="space-y-2.5 text-xs sm:text-sm">
          {/* Food & Table Line */}
          <div className="flex items-center justify-between py-1 border-b border-dashed border-[#111111]/15">
            <div className="flex flex-col text-left">
              <span className="font-bold text-[#111111]">
                {hasFood ? 'Food & Drinks Allocation' : 'Entry & Activity Allocation'}
              </span>
              <span className="text-[10px] text-[#777777]">
                Audited venue menu baseline
              </span>
            </div>
            <span className="font-black text-[#111111] tabular-nums shrink-0">
              ₦{foodCost.toLocaleString('en-NG')}
            </span>
          </div>

          {/* Transport Corridor Line */}
          <div className="flex items-center justify-between py-1 border-b border-dashed border-[#111111]/15">
            <div className="flex flex-col text-left">
              <span className="font-bold text-[#111111]">
                {hasCar ? 'Transport (Self Drive / Car)' : 'Estimated Ride Corridor (Round-Trip)'}
              </span>
              {!hasCar && transportCost > 0 && (
                <span className="text-[10px] text-[#777777]">
                  ~₦{Math.round(transportCost / Math.max(1, squadSize)).toLocaleString('en-NG')}/person based on zone modeling
                </span>
              )}
            </div>
            <span className="font-black text-[#111111] tabular-nums shrink-0">
              {hasCar || transportCost === 0 ? '₦0' : `~₦${transportCost.toLocaleString('en-NG')}`}
            </span>
          </div>

          {/* Taxes & Service Charge */}
          {taxesCost > 0 && (
            <div className="flex items-center justify-between py-1 border-b border-dashed border-[#111111]/15">
              <div className="flex flex-col text-left">
                <span className="font-bold text-[#C2410C]">
                  Service &amp; VAT ({serviceChargePct}% + {vatPct}%)
                </span>
                <span className="text-[10px] text-[#777777]">
                  No surprise POS markup at checkout
                </span>
              </div>
              <span className="font-black text-[#C2410C] tabular-nums shrink-0">
                ₦{taxesCost.toLocaleString('en-NG')}
              </span>
            </div>
          )}

          {/* Perforated Cut to Total */}
          <div className="border-t-2 border-dashed border-[#111111] my-3" />

          {/* Total Cost Row */}
          <div className="pt-1 flex items-center justify-between font-bold">
            <div>
              <span className="text-[#111111] text-sm sm:text-base font-black uppercase tracking-wider block font-display">
                Total Landed Outing Math
              </span>
              <span className="text-xs font-black text-[#008751] block">
                ~₦{perPersonCost.toLocaleString('en-NG')} damage per head
              </span>
            </div>
            <span className="font-black text-2xl sm:text-3xl text-[#111111] tabular-nums">
              ~₦{totalCost.toLocaleString('en-NG')}
            </span>
          </div>

          {/* The Green "OyaPlan Verified - No Surprises" Rubber Stamp */}
          <div className="relative pt-3 pb-1 flex justify-center">
            <div className="transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#008751] text-white border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111]">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span className="text-xs font-black uppercase tracking-wider font-display">
                  OyaPlan Verified — No Surprises
                </span>
              </div>
            </div>
          </div>

          {/* Budget vs Remaining Comparison */}
          <div className="bg-[#FFFEE5] p-3.5 rounded-2xl border-2 border-[#111111] flex items-center justify-between text-xs font-mono shadow-[2px_2px_0px_0px_#111111]">
            <div>
              <span className="text-[#6B7280] font-bold block uppercase text-[10px]">Squad Target</span>
              <span className="font-black text-[#111111]">
                ₦{budget.toLocaleString('en-NG')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[#6B7280] font-bold block uppercase text-[10px]">
                {remaining < 0 ? 'Over Target' : 'Left Over in Pocket'}
              </span>
              <span
                className={`font-black ${
                  remaining < 0 ? 'text-[#E54D2E]' : 'text-[#008751]'
                }`}
              >
                {remaining < 0 ? '-' : '+'}₦{Math.abs(remaining).toLocaleString('en-NG')}
              </span>
            </div>
          </div>

          {/* Surge Simulator: Worst-Case Lagos Downpour */}
          {!hasCar && transportCost > 0 && (
            <div className="p-4 rounded-2xl border-2 border-[#111111] bg-[#F6F6F2] space-y-3 font-mono shadow-[3px_3px_0px_0px_#111111]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-[#111111]" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#111111] font-display">
                    Surge Simulator • Lagos Downpour
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRainSimulated(!isRainSimulated)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer tap-feedback ${
                    isRainSimulated
                      ? "bg-[#F9E828] text-[#111111]"
                      : "bg-white text-[#111111] hover:bg-[#FFFEE5]"
                  }`}
                >
                  {isRainSimulated ? "Active 🌧" : "Simulate Rain"}
                </button>
              </div>

              {isRainSimulated && (
                <div className="pt-2 border-t border-dashed border-[#111111]/20 space-y-2 animate-in fade-in duration-200">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white p-2.5 rounded-xl border-2 border-[#111111]">
                      <span className="text-[9px] uppercase text-[#6B7280] block font-bold">Base Ride</span>
                      <span className="font-bold text-[#111111]">₦{transportCost.toLocaleString('en-NG')}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border-2 border-[#111111]">
                      <span className="text-[9px] uppercase text-[#6B7280] block font-bold">Rain Surge</span>
                      <span className="font-bold text-[#111111]">₦{simulatedRainTransport.toLocaleString('en-NG')}</span>
                    </div>
                    <div className="bg-[#111111] text-[#F9E828] p-2.5 rounded-xl border-2 border-[#111111]">
                      <span className="text-[9px] uppercase text-gray-400 block font-bold">Buffer</span>
                      <span className="font-black">+₦{surgeBuffer.toLocaleString('en-NG')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 px-1">
                    <span className="text-[#555555] font-bold">Simulated Outing Total:</span>
                    <span className="font-black text-[#111111] text-sm tabular-nums">
                      ~₦{simulatedTotalCost.toLocaleString('en-NG')}
                    </span>
                  </div>

                  <p className="text-[10px] text-[#6B7280] leading-relaxed italic px-1">
                    &ldquo;Lagos rain tax. Plan for it.&rdquo; — Worst-case scenario buffer for Third Mainland traffic surges.
                  </p>

                  <RainBufferVisual
                    isRainActive={true}
                    additionalBuffer={surgeBuffer}
                  />
                </div>
              )}
            </div>
          )}

          {/* Currency Split Visual for Squads */}
          {squadSize > 1 && (
            <div className="pt-2">
              <NairaSplitVisual
                totalCost={totalCost}
                squadSize={squadSize}
              />
            </div>
          )}

          {/* Barcode & Verification Metadata */}
          <div className="pt-4 border-t-2 border-dashed border-[#111111] flex flex-col items-center justify-center space-y-2">
            {/* SVG Barcode */}
            <div className="flex items-center gap-1 opacity-80 h-7" aria-hidden="true">
              {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 1, 3].map((w, idx) => (
                <span
                  key={idx}
                  className="bg-[#111111] h-full rounded-xs inline-block"
                  style={{ width: `${w * 2}px` }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between w-full text-[10px] text-[#777777] font-bold">
              <span>{freshnessText ? `RATES VERIFIED (${freshnessText.toUpperCase()})` : "RATES VERIFIED FOR LAGOS LEISURE"}</span>
              <span>OYAPLAN-POS-V2</span>
            </div>
          </div>
        </div>

        {/* Progressive Disclosure: How We Calculated This */}
        <div className="pt-2 border-t border-[#E5E5DE]">
          <button
            type="button"
            onClick={() => setIsEvidenceOpen(!isEvidenceOpen)}
            className="w-full py-2 flex items-center justify-between text-xs font-mono font-bold text-[#555555] hover:text-[#111111] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-[#111111]" />
              <span>How we calculated this cost</span>
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isEvidenceOpen ? 'rotate-180 text-[#111111]' : 'text-[#777777]'
              }`}
            />
          </button>

          {isEvidenceOpen && (
            <div className="mt-3 p-4 bg-[#F6F6F2] rounded-2xl border-2 border-[#111111] space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <p className="font-bold text-[#111111] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Menu Pricing</span>
                </p>
                <p className="text-[#555555] leading-relaxed">
                  Prices are based on venue menu data collected by OyaPlan. Food and drink allocations are estimated for {squadSize} person(s).
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-[#111111] flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Transport Route</span>
                </p>
                <p className="text-[#555555] leading-relaxed">
                  {transportEstimate?.mode || 'Ride-hailing'} estimated round trip from{' '}
                  <strong>{startAreaName}</strong> to venue using standard Lagos traffic profiles.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-[#111111] flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Mandatory Charges</span>
                </p>
                <p className="text-[#555555] leading-relaxed">
                  {vatPct > 0 && serviceChargePct > 0
                    ? `${vatPct}% VAT and ${serviceChargePct}% service charge are factored into this estimate. Actual charges at the venue may vary.`
                    : vatPct > 0
                    ? `${vatPct}% VAT is factored into this estimate.`
                    : serviceChargePct > 0
                    ? `${serviceChargePct}% service charge is factored into this estimate.`
                    : 'Standard VAT and service charge applied.'}
                </p>
              </div>

              {freshnessText && (
                <div className="pt-2 border-t border-[#E5E5DE] flex items-center gap-1.5 text-[11px] text-[#777777]">
                  <Clock className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Data freshness: {freshnessText}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
