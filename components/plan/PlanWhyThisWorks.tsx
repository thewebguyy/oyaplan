'use client';

import React, { useState } from 'react';
import { Check, CheckCircle2, ChevronDown } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(true);
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
    <section className="bg-white border border-border-default rounded-2xl overflow-hidden shadow-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-black/[0.02] transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#008751]/10 text-[#008751] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-black text-midnight-lagoon truncate">
              Why We Picked {spotName}
            </h2>
            <p className="text-xs text-text-muted font-medium truncate">
              {reasonsToDisplay.length} key match reasons for your budget & vibe
            </p>
          </div>
        </div>

        <div className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-border-default flex items-center justify-center shrink-0 text-[#4B5563]">
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#008751]' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-1 border-t border-border-default/50 animate-in fade-in-50 duration-200">
          <ul className="space-y-2.5 pt-2">
            {reasonsToDisplay.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary">
                <div className="w-4 h-4 rounded-full bg-[#008751]/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-[#008751] stroke-[3]" />
                </div>
                <span className="font-medium text-text-primary leading-snug">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
