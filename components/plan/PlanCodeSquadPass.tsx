'use client';

import React, { useState } from 'react';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';
import { trackEvent } from '@/lib/analytics/trackClient';
import { Copy, Check, MessageSquare, ShieldCheck, Info } from 'lucide-react';

interface PlanCodeSquadPassProps {
  planCode: string;
  venueName: string;
  squadSize: number;
  totalCost: number;
  venuePhone?: string | null;
}

export function PlanCodeSquadPass({
  planCode,
  venueName,
  squadSize,
  totalCost,
  venuePhone,
}: PlanCodeSquadPassProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(planCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const availabilityUrl = getBusinessWhatsAppUrl('availability_inquiry', {
    venueName,
    customPhone: venuePhone,
    availability: {
      venueName,
      squadSize,
      date: todayStr,
      time: 'Evening (20:00)',
      estimatedSpend: totalCost,
    },
  });

  return (
    <div className="bg-[#07150E] text-white rounded-2xl p-5 sm:p-6 space-y-4 shadow-lagoon border border-[#143825]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          <span className="text-[11px] font-bold text-[#A3F3C6] uppercase tracking-wider">
            Squad Plan Pass
          </span>
        </div>
        <span className="text-[10px] text-gray-400 font-mono">Verified Itinerary</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0C2217] p-4 rounded-xl border border-[#1D4A32]">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
            Public Plan Code
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-widest text-[#EAFDF3] select-all">
            {planCode}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="h-10 px-4 bg-brand-green hover:bg-[#007043] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer tap-feedback shrink-0 shadow-xs"
        >
          {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
          <span>{copied ? 'Code Copied!' : 'Copy Code'}</span>
        </button>
      </div>

      {/* Non-Reservation Disclaimer */}
      <div className="flex items-start gap-2.5 text-xs text-gray-300 bg-[#0C2217]/60 p-3 rounded-xl border border-[#143825]">
        <Info className="w-4 h-4 text-[#A3F3C6] shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          Show this code to your server or host when you arrive so they can confirm your visit.
          <strong className="text-white block font-semibold pt-0.5">
            This is an outing budget plan, not a table reservation or guaranteed entry.
          </strong>
        </p>
      </div>

      {/* Stage 5: WhatsApp Availability Check Experiment */}
      {availabilityUrl && (
        <div className="pt-1">
          <a
            href={availabilityUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent('availability_whatsapp_clicked', {
                category: 'Engagement',
                venue_name: venueName,
                squad_size: squadSize,
                version: '1.0',
              });
            }}
            className="w-full h-11 px-4 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all tap-feedback"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Check Table Availability on WhatsApp</span>
          </a>
        </div>
      )}
    </div>
  );
}
