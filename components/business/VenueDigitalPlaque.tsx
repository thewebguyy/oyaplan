'use client';

import React, { useState } from 'react';
import { ShieldCheck, Award, Copy, Check, ExternalLink } from 'lucide-react';
import { Venue } from '@/lib/types';
import { triggerHaptic } from '@/lib/ui/haptics';

interface VenueDigitalPlaqueProps {
  venue: Venue;
}

export function VenueDigitalPlaque({ venue }: VenueDigitalPlaqueProps) {
  const [copied, setCopied] = useState(false);
  const isVerified = venue.partner_state === 'verified_partner';

  const plaqueCode = `PLAQUE-${venue.id.slice(0, 8).toUpperCase()}`;

  const handleCopyLink = async () => {
    triggerHaptic('selection');
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/venue/${venue.id}` 
      : `https://oyaplan.com/venue/${venue.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative rounded-[22px] bg-[#121417] text-white p-6 sm:p-7 border-2 border-[#2A2E37] shadow-[0_12px_32px_rgba(0,0,0,0.35)] overflow-hidden font-sans">
      {/* Subtle metallic brass top edge */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#F9E828] to-[#AA7C11]" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242831] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E232B] to-[#14171C] border border-[#3A404E] flex items-center justify-center shrink-0 shadow-inner">
            <Award className="w-6 h-6 text-[#F9E828]" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#F9E828] uppercase block">
              Official Digital Plaque
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-white">
              {venue.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#EAFDF3]/15 text-[#34D399] border border-[#34D399]/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              VERIFIED SPOT
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FAF7F2]/10 text-amber-300 border border-amber-300/30">
              CLAIMED SPOT
            </span>
          )}
        </div>
      </div>

      {/* Plaque Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 font-mono text-xs">
        <div className="p-3 rounded-xl bg-[#1A1E24] border border-[#272D37]">
          <span className="text-[9px] uppercase tracking-wider text-gray-400 block">Location</span>
          <span className="font-bold text-white truncate block">{venue.address || 'Lagos, Nigeria'}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#1A1E24] border border-[#272D37]">
          <span className="text-[9px] uppercase tracking-wider text-gray-400 block">Plaque Registry</span>
          <span className="font-bold text-[#F9E828] select-all">{plaqueCode}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#1A1E24] border border-[#272D37]">
          <span className="text-[9px] uppercase tracking-wider text-gray-400 block">Trust Standard</span>
          <span className="font-bold text-white">Owner Confirmed Pricing</span>
        </div>
      </div>

      {/* Plaque Footer Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <p className="text-xs text-gray-400">
          This digital credential confirms that your menu and pricing are actively confirmed by the venue operator for Lagos squads.
        </p>

        <button
          type="button"
          onClick={handleCopyLink}
          className="h-10 px-4 rounded-xl bg-[#262B34] hover:bg-[#323945] text-white text-xs font-mono font-bold flex items-center justify-center gap-2 border border-[#3A404E] transition-all cursor-pointer tap-feedback shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#F9E828]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Plaque Link Copied!' : 'Share Plaque Link'}</span>
        </button>
      </div>
    </div>
  );
}
