'use client';

import React from 'react';
import { MenuItem, Spot, Venue } from '@/lib/types';
import { Utensils, Sparkles, Check, HelpCircle, Ticket } from 'lucide-react';

interface PlanWhatYouGetProps {
  squadSize: number;
  foodCost: number;
  spot?: Spot | null;
  venue?: Venue | null;
  menuItems?: MenuItem[];
  hasFood?: boolean;
}

export function PlanWhatYouGet({
  squadSize,
  foodCost,
  spot,
  venue,
  menuItems = [],
  hasFood = true,
}: PlanWhatYouGetProps) {
  const isActivity = hasFood === false || spot?.has_food === false;

  // Filter available items
  const availableItems = menuItems.filter((i) => i.is_available !== false);

  // Derive scannable summary label
  const getSummaryPill = () => {
    if (isActivity) {
      return `${squadSize} × Admission & Activity Passes`;
    }
    if (availableItems.length >= 3) {
      const mains = availableItems.filter((i) => i.category === 'main').length;
      const drinks = availableItems.filter((i) =>
        ['cocktail', 'wine', 'beer', 'soft_drink', 'spirits'].includes(i.category)
      ).length;
      const starters = availableItems.filter((i) => i.category === 'starter').length;

      const parts: string[] = [];
      if (mains > 0) parts.push(`${mains} main${mains > 1 ? 's' : ''}`);
      if (starters > 0) parts.push(`${starters} starter${starters > 1 ? 's' : ''}`);
      if (drinks > 0) parts.push(`${drinks} drink${drinks > 1 ? 's' : ''}`);

      if (parts.length > 0) return parts.join(' · ');
    }

    if (squadSize === 1) return '1 main meal + drink';
    return `${squadSize} meals + drinks allocation`;
  };

  return (
    <section className="bg-white border border-border-default rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border-default/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#008751]/10 text-[#008751] flex items-center justify-center">
            {isActivity ? <Ticket className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
          </div>
          <h2 className="text-base font-black text-midnight-lagoon">
            {isActivity ? "What You're Getting" : "What You're Getting"}
          </h2>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 bg-[#FAF7F2] border border-[#E5E0D8] text-midnight-lagoon rounded-full">
          {getSummaryPill()}
        </span>
      </div>

      {/* Menu / Experience Scenario List */}
      {availableItems.length > 0 ? (
        <div className="space-y-2">
          <div className="divide-y divide-gray-100">
            {availableItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Check className="w-3.5 h-3.5 text-[#008751] shrink-0" />
                  <span className="font-semibold text-text-primary truncate">{item.name}</span>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider hidden sm:inline-block px-1.5 py-0.5 bg-gray-50 rounded">
                    {item.category.replace('_', ' ')}
                  </span>
                </div>
                <span className="font-mono font-bold text-midnight-lagoon shrink-0 tabular-nums">
                  ₦{item.price.toLocaleString('en-NG')}
                </span>
              </div>
            ))}
          </div>

          {availableItems.length > 6 && (
            <p className="text-[11px] text-text-muted pt-1 text-center">
              + {availableItems.length - 6} more items on venue menu
            </p>
          )}
        </div>
      ) : (
        /* Fallback for venues without granular menu entries */
        <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#E5E0D8]/60 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-text-secondary font-semibold">
            <HelpCircle className="w-4 h-4 text-text-muted shrink-0" />
            <span>
              {isActivity
                ? 'Admission & Experience Allocation'
                : 'Estimated Outing Selection'}
            </span>
          </div>
          <p className="text-text-muted leading-relaxed">
            {isActivity
              ? `Estimated entry fees and core experiences for ${squadSize} person(s). Final activities depend on selection at the venue.`
              : `Granular itemized menu data is limited. Estimated around ₦${Math.round(
                  foodCost / squadSize
                ).toLocaleString('en-NG')} per person based on venue price range.`}
          </p>
        </div>
      )}

      {/* Subtotal Banner */}
      <div className="pt-3 border-t border-border-default/60 flex items-center justify-between text-xs sm:text-sm">
        <span className="font-semibold text-text-secondary">
          {isActivity ? 'Estimated Activity / Entry Cost' : 'Estimated Food & Drinks'}
        </span>
        <span className="font-mono font-black text-midnight-lagoon text-sm sm:text-base">
          ₦{foodCost.toLocaleString('en-NG')}
        </span>
      </div>
    </section>
  );
}
