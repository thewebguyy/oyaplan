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
    <section className="bg-white border border-border-default rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border-default/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#008751]/10 text-[#008751] flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <h2 className="text-base font-black text-midnight-lagoon">Estimated Cost Breakdown</h2>
        </div>
        <span className="text-[11px] font-bold text-text-muted">Total Landed Cost</span>
      </div>

      {/* Itemized Rows */}
      <div className="space-y-2.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between py-1">
          <span className="font-semibold text-text-secondary">
            {hasFood ? 'Food & Drinks (Squad)' : 'Admission & Venue (Squad)'}
          </span>
          <span className="font-mono font-bold text-midnight-lagoon tabular-nums">
            ₦{foodCost.toLocaleString('en-NG')}
          </span>
        </div>

        <div className="flex items-center justify-between py-1">
          <div className="flex flex-col">
            <span className="font-semibold text-text-secondary">
              {hasCar ? 'Transport (Driving/Car)' : 'Ride-Hailing Transport (Round Trip)'}
            </span>
            {!hasCar && transportCost > 0 && squadSize > 1 && (
              <span className="text-[10px] text-text-muted font-mono">
                ~₦{Math.round(transportCost / squadSize).toLocaleString('en-NG')}/person • {Math.ceil(squadSize / 4)} {Math.ceil(squadSize / 4) > 1 ? 'cars' : 'car'}
              </span>
            )}
          </div>
          <span className="font-mono font-bold text-midnight-lagoon tabular-nums">
            {hasCar || transportCost === 0 ? '₦0' : `~₦${transportCost.toLocaleString('en-NG')}`}
          </span>
        </div>

        {taxesCost > 0 && (
          <div className="flex items-center justify-between py-1">
            <span className="font-semibold text-text-secondary">
              Service & VAT ({serviceChargePct}% + {vatPct}%)
            </span>
            <span className="font-mono font-bold text-midnight-lagoon tabular-nums">
              ₦{taxesCost.toLocaleString('en-NG')}
            </span>
          </div>
        )}

        {/* Total Cost Row */}
        <div className="pt-3 border-t border-dashed border-gray-200 flex items-center justify-between font-bold">
          <div>
            <span className="text-midnight-lagoon text-sm sm:text-base font-black block">
              Estimated Outing Total
            </span>
            {squadSize > 1 && (
              <span className="text-[11px] font-bold text-[#008751] font-mono block">
                ~₦{Math.round(totalCost / squadSize).toLocaleString('en-NG')} per person
              </span>
            )}
          </div>
          <span className="font-mono font-black text-[#008751] text-base sm:text-lg tabular-nums">
            ~₦{totalCost.toLocaleString('en-NG')}
          </span>
        </div>

        {/* Budget vs Remaining Comparison */}
        <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E5E0D8]/60 flex items-center justify-between text-xs">
          <div>
            <span className="text-text-muted font-medium block">Your Budget</span>
            <span className="font-mono font-bold text-midnight-lagoon">
              ₦{budget.toLocaleString('en-NG')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-text-muted font-medium block">
              {remaining < 0 ? 'Over Budget' : 'Remaining Left Over'}
            </span>
            <span
              className={`font-mono font-bold ${
                remaining < 0 ? 'text-amber-700' : 'text-[#008751]'
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
