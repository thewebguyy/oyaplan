'use client';

import React from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
import { getVibeConfig } from '@/lib/constants/vibes';

interface PlanWhyThisWorksProps {
  squadSize: number;
  budget: number;
  totalCost: number;
  vibe?: string;
  startAreaName?: string;
  orderedReasons?: string[];
  spotName: string;
}

export function PlanWhyThisWorks({
  squadSize,
  budget,
  totalCost,
  vibe = 'Chill',
  startAreaName,
  orderedReasons,
  spotName,
}: PlanWhyThisWorksProps) {
  const diff = budget - totalCost;

  const defaultReasons = [
    diff >= 0
      ? `Within your ₦${budget.toLocaleString('en-NG')} budget with ₦${diff.toLocaleString('en-NG')} to spare`
      : `Stretches slightly near your ₦${budget.toLocaleString('en-NG')} limit at ₦${totalCost.toLocaleString('en-NG')}`,
    `Comfortable seating and menu capacity for ${squadSize === 1 ? '1 person' : `${squadSize} people`}`,
    vibe ? `Matches your requested ${vibe} outing vibe` : 'Matches the requested outing vibe',
    startAreaName && startAreaName !== 'anywhere'
      ? `Round-trip transport from ${startAreaName} accounted for upfront`
      : 'Round-trip ride-hailing transport accounted for upfront',
  ];

  const reasonsToDisplay =
    orderedReasons && orderedReasons.length > 0 ? orderedReasons : defaultReasons;

  return (
    <section className="bg-white border border-border-default rounded-2xl p-4 sm:p-6 shadow-xs space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border-default/60">
        <div className="w-7 h-7 rounded-lg bg-[#008751]/10 text-[#008751] flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <h2 className="text-base font-black text-midnight-lagoon">
          Why We Picked {spotName}
        </h2>
      </div>

      <ul className="space-y-2.5 pt-1">
        {reasonsToDisplay.map((reason, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary">
            <div className="w-4 h-4 rounded-full bg-[#008751]/15 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-2.5 h-2.5 text-[#008751] stroke-[3]" />
            </div>
            <span className="font-medium text-text-primary leading-snug">{reason}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
