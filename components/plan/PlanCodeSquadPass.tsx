'use client';

import React, { useState } from 'react';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';
import { trackEvent } from '@/lib/analytics/trackClient';
import { Copy, Check, MessageSquare, Info, Smartphone, X } from 'lucide-react';
import { triggerHaptic } from '@/lib/ui/haptics';

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
  const [showStoryModal, setShowStoryModal] = useState(false);

  const perPerson = Math.ceil(totalCost / Math.max(1, squadSize));

  const handleCopy = async () => {
    triggerHaptic('selection');
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
    <>
      <div className="bg-[#111111] text-white rounded-[20px] p-5 sm:p-6 space-y-4 border border-[#222222] shadow-[0_12px_36px_rgba(0,0,0,0.25)] relative overflow-hidden font-sans">
        {/* Top yellow accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#F9E828]" />

        {/* Header Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F9E828] animate-pulse" />
            <span className="text-[11px] font-black text-[#F9E828] uppercase tracking-widest font-mono">
              Host Pass • Squad Outing
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">
            Lagos Ledger
          </span>
        </div>

        {/* Code & Quick Action Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1A1A1A] p-4 rounded-xl border border-[#333333]">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider font-mono">
              Visit Identification Code
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-[#F9E828] select-all">
              {planCode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="h-10 px-4 bg-[#F9E828] hover:bg-[#F0DE1A] text-[#111111] text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer tap-feedback shrink-0 shadow-xs uppercase tracking-wider font-mono"
            >
              {copied ? <Check className="w-4 h-4 text-[#111111]" /> : <Copy className="w-4 h-4 text-[#111111]" />}
              <span>{copied ? 'Copied ✓ Go win the group chat.' : 'Copy Code'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowStoryModal(true);
              }}
              title="Preview IG Story / Host Pass Card"
              className="h-10 px-3 bg-[#262626] hover:bg-[#333333] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer tap-feedback shrink-0 border border-[#444444]"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#F9E828]" />
              <span className="hidden sm:inline">Story Card</span>
            </button>
          </div>
        </div>

        {/* Quick Outing Summary Monospace Pill */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2 px-3 bg-[#161616] rounded-xl border border-[#2A2A2A] font-mono text-xs">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-gray-500 block">Venue</span>
            <span className="font-bold text-white truncate block">{venueName}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-gray-500 block">Squad</span>
            <span className="font-bold text-white">{squadSize} people</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[9px] uppercase tracking-wider text-gray-500 block">Landed Damage</span>
            <span className="font-bold text-[#F9E828] tabular-nums">~₦{perPerson.toLocaleString('en-NG')} / person</span>
          </div>
        </div>

        {/* Non-Reservation Disclaimer */}
        <div className="flex items-start gap-2.5 text-xs text-gray-300 bg-[#1A1A1A]/80 p-3 rounded-xl border border-[#2D2D2D]">
          <Info className="w-4 h-4 text-[#F9E828] shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            Show this pass to your server or host upon arrival to confirm your visit.
            <strong className="text-white block font-semibold pt-0.5">
              This is a verified outing budget plan, not a table reservation or guaranteed entry.
            </strong>
          </p>
        </div>

        {/* WhatsApp Availability Check */}
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
              className="w-full h-11 px-4 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all tap-feedback cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Check Table Availability on WhatsApp</span>
            </a>
          </div>
        )}
      </div>

      {/* IG Story / Host Pass Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#111111] border-2 border-[#333333] rounded-[24px] p-6 text-white shadow-2xl space-y-6">
            <button
              type="button"
              onClick={() => setShowStoryModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#222222] text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close story preview"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Simulated 9:16 IG Story Host Pass Graphic */}
            <div className="border border-dashed border-[#444444] rounded-2xl p-5 bg-[#161616] space-y-5 text-left relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#333333] pb-3">
                <span className="text-[10px] font-mono font-black text-[#F9E828] uppercase tracking-widest">
                  OYAPLAN • HOST PASS
                </span>
                <span className="text-[10px] font-mono text-gray-400">{todayStr}</span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-gray-500 block">DESTINATION</span>
                <h3 className="text-2xl font-black text-white font-display uppercase tracking-tight">
                  {venueName}
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Lagos Leisure Outing</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#111111] rounded-xl border border-[#2D2D2D] font-mono">
                <div>
                  <span className="text-[9px] uppercase text-gray-500 block">SQUAD</span>
                  <span className="text-sm font-bold text-white">{squadSize} PEOPLE</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-gray-500 block">EACH</span>
                  <span className="text-sm font-black text-[#F9E828] tabular-nums">
                    ₦{perPerson.toLocaleString('en-NG')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#111111] rounded-xl border border-[#2D2D2D] font-mono text-center">
                <span className="text-[9px] uppercase text-gray-500 block">OFFICIAL PASS CODE</span>
                <span className="text-xl font-black tracking-widest text-white select-all">
                  {planCode}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#333333] text-[10px] font-mono text-gray-500">
                <span>oyaplan.com</span>
                <span className="text-[#F9E828] font-bold">KNOW THE DAMAGE</span>
              </div>
              <div className="text-[8px] font-mono text-gray-500 uppercase tracking-widest text-center">
                THIS IS THE PLAN • NOT A TABLE RESERVATION
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full h-11 bg-[#F9E828] hover:bg-[#F0DE1A] text-[#111111] font-mono font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer tap-feedback"
              >
                {copied ? <Check className="w-4 h-4 text-[#111111]" /> : <Copy className="w-4 h-4 text-[#111111]" />}
                <span>{copied ? 'Copied ✓ Go win the group chat.' : 'Copy Pass Code'}</span>
              </button>
              <p className="text-[11px] text-center text-gray-400">
                Screenshot to share to your Instagram Story or squad group chat.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
