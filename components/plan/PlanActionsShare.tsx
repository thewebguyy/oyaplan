'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics/trackClient';
import { Copy, Check, MessageSquare, Share2, Sliders, ShieldCheck } from 'lucide-react';
import { PlanCodeSquadPass } from './PlanCodeSquadPass';
import SavePlanButton from '@/components/SavePlanButton';

interface PlanActionsShareProps {
  planId: string;
  venueName: string;
  squadSize: number;
  budget: number;
  totalCost: number;
  foodCost: number;
  transportCost: number;
  vibe?: string;
  startArea?: string;
  planCode?: string;
  venuePhone?: string | null;
}

export function PlanActionsShare({
  planId,
  venueName,
  squadSize,
  budget,
  totalCost,
  foodCost,
  transportCost,
  vibe = 'Dinner',
  startArea = 'lekki',
  planCode,
  venuePhone,
}: PlanActionsShareProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  // Derive Edit URL for Forge
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

  // WhatsApp formatted share text
  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/plan/${planId}`;
    }
    return `https://oyaplan.vercel.app/plan/${planId}`;
  };

  const generateWhatsAppMessage = () => {
    const remaining = budget - totalCost;
    const shareUrl = getShareUrl();
    const taxes = Math.max(0, totalCost - (foodCost + transportCost));

    return (
      `*OyaPlan Squad Outing: ${venueName}*\n\n` +
      `👥 *Squad:* ${squadSize} people\n` +
      `💰 *Estimated Outing Total:* ~₦${totalCost.toLocaleString('en-NG')}\n` +
      `💵 *Your Budget:* ₦${budget.toLocaleString('en-NG')} (${
        remaining >= 0 ? `₦${remaining.toLocaleString('en-NG')} left over` : 'near budget limit'
      })\n\n` +
      `🍽️ *Food & Drinks:* ₦${foodCost.toLocaleString('en-NG')}\n` +
      `🚗 *Rides (Round-trip):* ₦${transportCost.toLocaleString('en-NG')}\n` +
      (taxes > 0 ? `🧾 *VAT & Service:* ₦${taxes.toLocaleString('en-NG')}\n` : '') +
      `\nSee full breakdown & menu items:\n${shareUrl}`
    );
  };

  const handleWhatsAppShare = () => {
    trackEvent('plan_shared', {
      category: 'Sharing',
      plan_id: planId,
      share_method: 'whatsapp',
      version: '1.0',
    });
    const message = encodeURIComponent(generateWhatsAppMessage());
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopiedLink(true);
      trackEvent('plan_shared', {
        category: 'Sharing',
        plan_id: planId,
        share_method: 'copy_link',
        version: '1.0',
      });
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Ignore
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Squad Outing at ${venueName} — OyaPlan`,
          text: `Check out our ~₦${totalCost.toLocaleString('en-NG')} plan for ${squadSize} people at ${venueName}.`,
          url: getShareUrl(),
        });
        trackEvent('plan_shared', {
          category: 'Sharing',
          plan_id: planId,
          share_method: 'native_share',
          version: '1.0',
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const resolvedCode = planCode || `OYA-${planId.slice(0, 6).toUpperCase()}`;

  return (
    <section className="space-y-4">
      {/* 1. Share & Edit Primary Actions */}
      <div className="bg-white border border-border-default rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border-default/60">
          <h2 className="text-base font-black text-midnight-lagoon flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#008751]" />
            <span>Squad Actions</span>
          </h2>
          <span className="text-[11px] font-bold text-text-muted">1-Tap Distribution</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* WhatsApp Direct Share */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="h-12 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer tap-feedback"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>WhatsApp</span>
          </button>

          {/* Copy Link / Native Share */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="h-12 w-full bg-midnight-lagoon hover:bg-black text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer tap-feedback"
          >
            {copiedLink ? <Check className="w-4 h-4 text-[#A3F3C6]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Plan Link'}</span>
          </button>

          {/* Save Plan Button */}
          <SavePlanButton planId={planId} showLabel={true} />
        </div>

        {/* Edit Plan in Forge */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-text-muted">Need to change budget, squad, or area?</span>
          <Link
            href={editUrl}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-default hover:border-midnight-lagoon text-xs font-bold text-midnight-lagoon bg-surface-grey hover:bg-white transition-all tap-feedback"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Edit Plan</span>
          </Link>
        </div>
      </div>

      {/* 2. Official Plan Code & Squad Pass */}
      <PlanCodeSquadPass
        planCode={resolvedCode}
        venueName={venueName}
        squadSize={squadSize}
        totalCost={totalCost}
        venuePhone={venuePhone}
      />
    </section>
  );
}
