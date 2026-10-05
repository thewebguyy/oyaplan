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

  // Squad Room URL
  const getSquadUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/squad/${planId}`;
    }
    return `https://oyaplan.vercel.app/squad/${planId}`;
  };

  const generateWhatsAppMessage = () => {
    const perPerson = Math.ceil(totalCost / Math.max(1, squadSize));
    const squadUrl = getSquadUrl();

    return (
      `Found the spot.\n\n` +
      `*${venueName}*\n` +
      `• Squad: ${squadSize} people\n` +
      `• Total Outing Cost: ~₦${perPerson.toLocaleString('en-NG')} each (~₦${totalCost.toLocaleString('en-NG')} total)\n` +
      `• Verified food, drinks & round-trip rides accounted for.\n\n` +
      `We moving?\n` +
      `${squadUrl}`
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
      await navigator.clipboard.writeText(getSquadUrl());
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
          text: `Check out our ~₦${totalCost.toLocaleString('en-NG')} plan for ${squadSize} people at ${venueName}. Tap to say you're in!`,
          url: getSquadUrl(),
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
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DE]">
          <h2 className="text-base font-black text-[#111111] flex items-center gap-2 font-display">
            <Share2 className="w-4 h-4 text-[#111111]" />
            <span>Squad Decision &amp; Actions</span>
          </h2>
          <span className="text-[11px] font-mono font-bold text-[#6B7280]">1-Tap Distribution</span>
        </div>

        {/* Squad Decision Room Hero CTA */}
        <Link
          href={`/squad/${planId}`}
          className="w-full h-12 rounded-xl bg-[#111111] hover:bg-black text-[#F9E828] text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all tap-feedback font-mono"
        >
          <Share2 className="w-4 h-4" />
          <span>Open Squad Decision Room (&ldquo;Who&apos;s In?&rdquo;)</span>
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* WhatsApp Direct Share */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="h-12 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer tap-feedback font-mono"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Send to the Squad →</span>
          </button>

          {/* Copy Link / Native Share */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="h-12 w-full bg-[#111111] hover:bg-black text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer tap-feedback font-mono"
          >
            {copiedLink ? <Check className="w-4 h-4 text-[#F9E828]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Squad Link'}</span>
          </button>

          {/* Save Plan Button */}
          <SavePlanButton planId={planId} showLabel={true} />
        </div>

        {/* Edit Plan in Forge */}
        <div className="pt-2 border-t border-[#E5E5DE] flex items-center justify-between">
          <span className="text-xs text-[#6B7280] font-sans">Need to change budget, squad, or area?</span>
          <Link
            href={editUrl}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5DE] hover:border-[#111111] text-xs font-bold text-[#111111] bg-[#F6F6F2] hover:bg-white transition-all tap-feedback font-mono"
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
