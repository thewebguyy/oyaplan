'use client';

import React, { useState } from 'react';
import { ChevronDown, Calculator, Car, Receipt, Shield, Clock } from 'lucide-react';
import { TransportEstimate } from '@/lib/types';

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

  const taxesCost = Math.max(0, totalCost - (foodCost + transportCost));
  const remaining = budget - totalCost;

  return (
    <section className="bg-white border border-[#E5E5DE] rounded-[16px] p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DE]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <h2 className="text-base font-black text-[#111111] font-display uppercase tracking-tight">Damage Slip Breakdown</h2>
        </div>
        <span className="text-[11px] font-mono font-bold text-[#6B7280] uppercase tracking-wider">Lagos Landed</span>
      </div>

      {/* Itemized Rows */}
      <div className="space-y-2.5 text-xs sm:text-sm font-mono">
        <div className="flex items-center justify-between py-1 border-b border-dashed border-[#111111]/10">
          <span className="text-[#555555]">
            {hasFood ? 'Food & Drinks (Squad)' : 'Admission & Passes (Squad)'}
          </span>
          <span className="font-bold text-[#111111] tabular-nums">
            ₦{foodCost.toLocaleString('en-NG')}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-dashed border-[#111111]/10">
          <div className="flex flex-col">
            <span className="text-[#555555]">
              {hasCar ? 'Transport (Self Drive)' : 'Round-Trip Ride-Hailing'}
            </span>
            {!hasCar && transportCost > 0 && squadSize > 1 && (
              <span className="text-[10px] text-[#6B7280]">
                ~₦{Math.round(transportCost / squadSize).toLocaleString('en-NG')}/person • {Math.ceil(squadSize / 4)} {Math.ceil(squadSize / 4) > 1 ? 'cars' : 'car'}
              </span>
            )}
          </div>
          <span className="font-bold text-[#111111] tabular-nums">
            {hasCar || transportCost === 0 ? '₦0' : `~₦${transportCost.toLocaleString('en-NG')}`}
          </span>
        </div>

        {taxesCost > 0 && (
          <div className="flex items-center justify-between py-1 border-b border-dashed border-[#111111]/10">
            <span className="text-[#555555]">
              Service &amp; VAT ({serviceChargePct}% + {vatPct}%)
            </span>
            <span className="font-bold text-[#111111] tabular-nums">
              ₦{taxesCost.toLocaleString('en-NG')}
            </span>
          </div>
        )}

        {/* Total Cost Row */}
        <div className="pt-3 border-t-2 border-dashed border-[#111111]/25 flex items-center justify-between font-bold">
          <div>
            <span className="text-[#111111] text-sm sm:text-base font-black uppercase tracking-wider block">
              Total Landed Damage
            </span>
            {squadSize > 1 && (
              <span className="text-[11px] font-bold text-[#111111] block">
                ~₦{Math.round(totalCost / squadSize).toLocaleString('en-NG')} / person
              </span>
            )}
          </div>
          <span className="font-black text-[#111111] text-lg sm:text-xl tabular-nums">
            ~₦{totalCost.toLocaleString('en-NG')}
          </span>
        </div>

        {/* Budget vs Remaining Comparison */}
        <div className="bg-[#F6F6F2] p-3.5 rounded-xl border border-[#E5E5DE] flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-[#6B7280] font-medium block">Squad Target</span>
            <span className="font-bold text-[#111111]">
              ₦{budget.toLocaleString('en-NG')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[#6B7280] font-medium block">
              {remaining < 0 ? 'Over Target' : 'Left Over'}
            </span>
            <span
              className={`font-bold ${
                remaining < 0 ? 'text-[#E54D2E]' : 'text-[#111111]'
              }`}
            >
              {remaining < 0 ? '-' : ''}₦{Math.abs(remaining).toLocaleString('en-NG')}
            </span>
          </div>
        </div>
      </div>

      {/* Progressive Disclosure: How We Estimated This */}
      <div className="pt-2 border-t border-border-default/60">
        <button
          type="button"
          onClick={() => setIsEvidenceOpen(!isEvidenceOpen)}
          className="w-full py-2 flex items-center justify-between text-xs font-bold text-text-secondary hover:text-midnight-lagoon transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-[#008751]" />
            <span>How we estimated this</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isEvidenceOpen ? 'rotate-180 text-midnight-lagoon' : 'text-text-muted'
            }`}
          />
        </button>

        {isEvidenceOpen && (
          <div className="mt-3 p-4 bg-[#FAF7F2] rounded-xl border border-[#E5E0D8] space-y-3 text-xs animate-slide-up">
            {/* Menu Evidence */}
            <div className="space-y-1">
              <p className="font-bold text-midnight-lagoon flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#008751]" />
                <span>Menu Pricing</span>
              </p>
              <p className="text-text-secondary leading-relaxed">
                Prices are based on venue menu data collected by OyaPlan. Food and drink
                allocations are estimated for {squadSize} person(s).
              </p>
            </div>

            {/* Transport Evidence */}
            <div className="space-y-1">
              <p className="font-bold text-midnight-lagoon flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[#008751]" />
                <span>Transport Route</span>
              </p>
              <p className="text-text-secondary leading-relaxed">
                {transportEstimate?.mode || 'Ride-hailing'} estimated round trip from{' '}
                <strong>{startAreaName}</strong> to venue using standard Lagos traffic profiles.
              </p>
            </div>

            {/* Mandatory Charges */}
            <div className="space-y-1">
              <p className="font-bold text-midnight-lagoon flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#008751]" />
                <span>Mandatory Charges</span>
              </p>
              <p className="text-text-secondary leading-relaxed">
                {vatPct > 0 && serviceChargePct > 0
                  ? `${vatPct}% VAT and ${serviceChargePct}% service charge are factored into this estimate. Actual charges at the venue may vary.`
                  : vatPct > 0
                  ? `${vatPct}% VAT is factored into this estimate. Service charge policies vary by venue.`
                  : serviceChargePct > 0
                  ? `${serviceChargePct}% service charge is factored into this estimate.`
                  : 'VAT and service charge policies vary by venue and are not explicitly specified for this location.'}
              </p>
            </div>

            {/* Freshness */}
            {freshnessText && (
              <div className="pt-2 border-t border-[#E5E0D8] flex items-center gap-1.5 text-[11px] text-text-muted">
                <Clock className="w-3 h-3 text-[#008751]" />
                <span>Data freshness: {freshnessText}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
