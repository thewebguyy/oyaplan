'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, Sliders } from 'lucide-react';

interface PlanMobileStickyBarProps {
  planId: string;
  venueName: string;
  squadSize: number;
  budget: number;
  totalCost: number;
  foodCost: number;
  transportCost: number;
  vibe?: string;
  startArea?: string;
}

export function PlanMobileStickyBar({
  planId,
  venueName,
  squadSize,
  budget,
  totalCost,
  foodCost,
  transportCost,
  vibe = 'Dinner',
  startArea = 'lekki',
}: PlanMobileStickyBarProps) {
  // Derive Edit URL
  const VIBE_TO_URL_MAP: Record<string, string> = {
    Dinner: 'date-night',
    Chill: 'chill',
    Foodie: 'foodie',
    Party: 'party',
    Quick: 'quick-link',
    Brunch: 'brunch',
  };
  const urlVibe = VIBE_TO_URL_MAP[vibe] || vibe.toLowerCase();

  const editParams = new URLSearchParams();
  editParams.set('vibe', urlVibe);
  editParams.set('squad', squadSize.toString());
  editParams.set('budget', budget.toString());
  if (startArea && startArea !== 'anywhere') {
    editParams.set('area', startArea);
  }
  const editUrl = `/?${editParams.toString()}`;

  const handleWhatsAppShare = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://oyaplan.vercel.app';
    const shareUrl = `${origin}/plan/${planId}`;
    const perPerson = Math.ceil(totalCost / Math.max(1, squadSize));

    const message = encodeURIComponent(
      `Found the spot.\n\n` +
      `*${venueName}*\n` +
      `• Squad: ${squadSize} people\n` +
      `• Landed Damage: ~₦${perPerson.toLocaleString('en-NG')} each (~₦${totalCost.toLocaleString('en-NG')} total)\n` +
      `• Verified food, drinks & round-trip rides accounted for.\n\n` +
      `We moving?\n` +
      `${shareUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <aside
      aria-label="Mobile plan actions"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border-default px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] animate-slide-up"
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        {/* Edit Button */}
        <Link
          href={editUrl}
          className="flex-1 h-12 bg-surface-grey border border-border-default text-midnight-lagoon font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 tap-feedback transition-colors hover:bg-gray-100"
        >
          <Sliders className="w-4 h-4" />
          <span>Edit Plan</span>
        </Link>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="flex-1 h-12 bg-[#008751] hover:bg-[#007043] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs tap-feedback transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 fill-white" />
          <span>Share Plan</span>
        </button>
      </div>
    </aside>
  );
}
