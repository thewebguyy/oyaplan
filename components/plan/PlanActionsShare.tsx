'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics/trackClient';
import { Copy, Check, MessageSquare, Share2, Sliders, ShieldCheck, Sparkles, Send } from 'lucide-react';
import { PlanCodeSquadPass } from './PlanCodeSquadPass';
import SavePlanButton from '@/components/SavePlanButton';
import { WhatsAppDropModal } from '@/components/motion/WhatsAppDropModal';

type BroadcastTone = 'chill' | 'strict' | 'baller';

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
  const [isDropping, setIsDropping] = useState(false);
  const [selectedTone, setSelectedTone] = useState<BroadcastTone>('chill');

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

  const perPerson = Math.ceil(totalCost / Math.max(1, squadSize));
  const squadUrl = getSquadUrl();

  const getBroadcastMessage = (tone: BroadcastTone) => {
    switch (tone) {
      case 'strict':
        return (
          `🚨 *SQUAD LINKUP: TRANSFER BEFORE WE MOVE*\n\n` +
          `Spot: *${venueName}*\n` +
          `Damage per head: *₦${perPerson.toLocaleString('en-NG')}*\n` +
          `Total table + transport math: ₦${totalCost.toLocaleString('en-NG')}\n\n` +
          `No stories at POS checkout. Check the verified damage slip here:\n` +
          `${squadUrl}\n\n` +
          `Confirm your transfer so we book our ride! 🤝`
        );
      case 'baller':
        return (
          `🥂 *OUTING LOCKED: ${venueName.toUpperCase()}*\n\n` +
          `Table is handled! Squad damage is ~₦${totalCost.toLocaleString('en-NG')}.\n` +
          `Transport corridor is ~₦${Math.ceil(transportCost / Math.max(1, squadSize)).toLocaleString('en-NG')} per head.\n\n` +
          `Check the verified venue dossier:\n` +
          `${squadUrl}\n\n` +
          `Step out looking 10/10 tonight. 🌴`
        );
      case 'chill':
      default:
        return (
          `Found the spot.\n\n` +
          `*${venueName}*\n\n` +
          `The Outside Math:\n` +
          `₦${totalCost.toLocaleString('en-NG')} total\n` +
          `₦${perPerson.toLocaleString('en-NG')} each\n\n` +
          `Venue + transport + applicable charges included.\n\n` +
          `${squadUrl}\n\n` +
          `We running this?`
        );
    }
  };

  const handleWhatsAppShare = () => {
    setIsDropping(true);
    trackEvent('plan_shared', {
      category: 'Sharing',
      plan_id: planId,
      share_method: `whatsapp_${selectedTone}`,
      version: '1.0',
    });
    const message = encodeURIComponent(getBroadcastMessage(selectedTone));
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getBroadcastMessage(selectedTone));
      setCopiedLink(true);
      trackEvent('plan_shared', {
        category: 'Sharing',
        plan_id: planId,
        share_method: `copy_gist_${selectedTone}`,
        version: '1.0',
      });
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Squad Outing at ${venueName} — OyaPlan`,
          text: getBroadcastMessage(selectedTone),
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
    <section className="space-y-4 font-sans">
      {/* 1. Share & Edit Primary Actions with Neo-Brutalist Danfo Styling */}
      <div className="bg-white border-3 border-[#111111] rounded-3xl p-5 sm:p-7 shadow-[8px_8px_0px_0px_#111111] space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#111111]" />
              <span>WhatsApp Squad Broadcast</span>
            </h2>
          </div>
          <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-[#F9E828] text-[#111111] border border-[#111111] px-2.5 py-0.5 rounded-full shadow-[2px_2px_0px_0px_#111111]">
            1-Tap Gist
          </span>
        </div>

        {/* Tone Selector Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#555555]">
            <span>Pick your broadcast vibe:</span>
            <span className="text-[10px] uppercase text-[#008751]">Formats WhatsApp text</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedTone('chill')}
              className={`p-2.5 rounded-2xl border-2 border-[#111111] text-xs font-bold transition-all tap-feedback cursor-pointer flex flex-col items-center justify-center gap-1 ${
                selectedTone === 'chill'
                  ? 'bg-[#111111] text-[#F9E828] shadow-[3px_3px_0px_0px_#111111]'
                  : 'bg-white text-[#111111] hover:bg-[#F6F6F2]'
              }`}
            >
              <span className="text-sm">🌴</span>
              <span className="font-display uppercase text-[11px] font-black">Soft Life</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTone('strict')}
              className={`p-2.5 rounded-2xl border-2 border-[#111111] text-xs font-bold transition-all tap-feedback cursor-pointer flex flex-col items-center justify-center gap-1 ${
                selectedTone === 'strict'
                  ? 'bg-[#111111] text-[#F9E828] shadow-[3px_3px_0px_0px_#111111]'
                  : 'bg-white text-[#111111] hover:bg-[#F6F6F2]'
              }`}
            >
              <span className="text-sm">🛡️</span>
              <span className="font-display uppercase text-[11px] font-black">Sapa Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTone('baller')}
              className={`p-2.5 rounded-2xl border-2 border-[#111111] text-xs font-bold transition-all tap-feedback cursor-pointer flex flex-col items-center justify-center gap-1 ${
                selectedTone === 'baller'
                  ? 'bg-[#111111] text-[#F9E828] shadow-[3px_3px_0px_0px_#111111]'
                  : 'bg-white text-[#111111] hover:bg-[#F6F6F2]'
              }`}
            >
              <span className="text-sm">🥂</span>
              <span className="font-display uppercase text-[11px] font-black">Baller</span>
            </button>
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="bg-[#F6F6F2] p-3.5 rounded-2xl border-2 border-[#111111] text-xs font-mono text-[#333333] whitespace-pre-line leading-relaxed shadow-[2px_2px_0px_0px_#111111]">
          {getBroadcastMessage(selectedTone)}
        </div>

        {/* Squad Decision Room Hero CTA */}
        <Link
          href={`/squad/${planId}`}
          className="w-full h-12 rounded-2xl bg-[#111111] hover:bg-black text-[#F9E828] text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all tap-feedback font-display cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Open Live Squad Decision Room (&ldquo;Who&apos;s In?&rdquo;)</span>
        </Link>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* WhatsApp Direct Share */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="h-12 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-display font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-[#111111] flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer tap-feedback"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Send to Squad →</span>
          </button>

          {/* Copy Formatted Gist */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="h-12 w-full bg-white hover:bg-[#F6F6F2] text-[#111111] font-display font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-[#111111] flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer tap-feedback"
          >
            {copiedLink ? <Check className="w-4 h-4 text-[#008751]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Gist Copied! 📋' : 'Copy Full Gist'}</span>
          </button>

          {/* Save Plan Button */}
          <SavePlanButton planId={planId} showLabel={true} />
        </div>

        {/* Edit Plan in Forge */}
        <div className="pt-3 border-t-2 border-[#111111]/15 flex items-center justify-between">
          <span className="text-xs text-[#555555] font-medium">Need to tweak budget, squad, or area?</span>
          <Link
            href={editUrl}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 border-[#111111] hover:bg-[#FFFEE5] text-xs font-black uppercase text-[#111111] bg-white transition-all tap-feedback font-display shadow-[2px_2px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
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

      {/* WhatsApp Envelope Drop Kinetic Metaphor */}
      <WhatsAppDropModal
        isDropping={isDropping}
        venueName={venueName}
        onDropComplete={() => setIsDropping(false)}
      />
    </section>
  );
}
