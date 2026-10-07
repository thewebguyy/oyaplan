'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Venue } from '@/lib/types';
import { PulseDemandSummary, PulseSquadItem } from '@/lib/queries/pulse';
import { decideSquadAction } from '@/lib/actions/pulseActions';
import { triggerHaptic } from '@/lib/ui/haptics';
import {
  ShieldCheck,
  Check,
  Search,
  Users,
  Copy,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  Share2,
  Hash,
} from 'lucide-react';
import { QuickCodePunchModal } from '@/components/pulse/QuickCodePunchModal';

interface BouncerModeClientProps {
  venue: Venue;
  demand: PulseDemandSummary;
}

export function BouncerModeClient({ venue, demand }: BouncerModeClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [squads, setSquads] = useState<PulseSquadItem[]>(
    demand.approvedSquads.length > 0 ? demand.approvedSquads : demand.pendingSquads
  );
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPunchModal, setShowPunchModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  const handleCheckIn = async (squad: PulseSquadItem) => {
    triggerHaptic('success');
    setCheckedInIds((prev) => {
      const next = new Set(prev);
      if (next.has(squad.id)) {
        next.delete(squad.id);
        showToast(`Check-in reversed for ${squad.plan_code}`);
      } else {
        next.add(squad.id);
        showToast(`✓ ${squad.plan_code} Seated & Checked In!`);
      }
      return next;
    });

    try {
      // Ensure squad is marked approved in system
      await decideSquadAction(venue.id, squad.plan_code, 'approve');
    } catch {
      // Non-blocking in bouncer stand
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast('Bouncer link copied for door staff');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const filteredSquads = squads.filter((squad) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      squad.plan_code.toLowerCase().includes(q) ||
      squad.vibe.toLowerCase().includes(q) ||
      `table of ${squad.squad_size}`.includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#07080A] text-[#F8F9FA] antialiased p-4 sm:p-6 max-w-xl mx-auto space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 left-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-[#121418] border-2 border-[#00E575] text-white text-xs font-mono font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E575] animate-ping" />
              <span>{toastMessage}</span>
            </span>
          </div>
        </div>
      )}

      {/* Header — Door Staff Clean Mode */}
      <div className="flex items-center justify-between pt-2 pb-2 border-b border-white/10">
        <Link
          href={`/business/${venue.id}`}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/60 hover:text-white tap-feedback"
        >
          <ArrowLeft className="w-4 h-4 text-[#00E575]" />
          <span>Exit Bouncer Mode</span>
        </Link>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-bold border border-white/10 tap-feedback cursor-pointer"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-[#00E575]" /> : <Share2 className="w-3.5 h-3.5 text-white/70" />}
          <span>{copiedLink ? 'Copied!' : 'Share Stand Link'}</span>
        </button>
      </div>

      {/* Door Staff Identity Banner */}
      <div className="bg-[#121418] rounded-3xl border border-white/10 p-5 sm:p-6 space-y-2 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E575] animate-pulse" />
            <span className="text-[11px] font-mono font-black text-[#00E575] uppercase tracking-widest">
              THE VELVET ROPE · BOUNCER STAND
            </span>
          </div>
          <span className="text-[10px] font-mono text-white/50 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
            NO FINANCIALS VISIBLE
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {venue.name} Guestlist
        </h1>
        <p className="text-xs text-white/60 font-mono">
          Door check-in console. Verify customer OyaPlan codes and mark squads seated in one tap.
        </p>
      </div>

      {/* Search & Tactile Code Punch Launch Bar */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code or size..."
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[#14171E] border-2 border-white/15 text-white text-base font-mono placeholder:text-white/30 focus:border-[#00E575] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs font-mono font-bold"
            >
              CLEAR
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('success');
            setShowPunchModal(true);
          }}
          className="h-14 px-4 sm:px-5 rounded-2xl bg-[#008751] hover:bg-[#007043] active:bg-[#005a35] text-white font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/40 shrink-0 tap-feedback cursor-pointer"
        >
          <Hash className="w-4 h-4" />
          <span className="hidden sm:inline">PUNCH CODE</span>
          <span className="sm:hidden">KEYPAD</span>
        </button>
      </div>

      {/* Quick Code Punch Modal */}
      <QuickCodePunchModal
        venueId={venue.id}
        venueName={venue.name}
        isOpen={showPunchModal}
        onClose={() => setShowPunchModal(false)}
        squads={squads}
        onSquadVerified={(planCode) => {
          const matched = squads.find((s) => s.plan_code === planCode);
          if (matched) {
            setCheckedInIds((prev) => new Set(prev).add(matched.id));
            showToast(`✓ ${planCode} Seated & Checked In!`);
          }
        }}
      />

      {/* Live Guestlist Count */}
      <div className="flex items-center justify-between text-xs font-mono px-1">
        <span className="text-white/60">
          Showing {filteredSquads.length} Incoming {filteredSquads.length === 1 ? 'Squad' : 'Squads'}
        </span>
        <span className="text-[#00E575] font-bold">
          {checkedInIds.size} Seated Tonight
        </span>
      </div>

      {/* Guestlist Cards */}
      <div className="space-y-4">
        {filteredSquads.length === 0 ? (
          <div className="bg-[#121418] rounded-3xl border border-white/10 p-10 text-center space-y-3">
            <ShieldCheck className="w-10 h-10 text-white/30 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Matching Squad Found</h3>
            <p className="text-xs text-white/50 max-w-xs mx-auto">
              Check customer’s phone for their 6-character OyaPlan code (e.g. OYA-8B4X9).
            </p>
          </div>
        ) : (
          filteredSquads.map((squad) => {
            const isSeated = checkedInIds.has(squad.id);
            return (
              <div
                key={squad.id}
                className={`rounded-3xl border-2 p-5 sm:p-6 transition-all space-y-4 shadow-xl ${
                  isSeated
                    ? 'bg-[#008751]/10 border-[#00E575]/60 text-white'
                    : 'bg-[#121418] border-white/10 text-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E575] bg-[#008751]/20 px-2.5 py-0.5 rounded-full border border-[#008751]/30">
                      {squad.vibe}
                    </span>

                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
                      Table of {squad.squad_size}
                    </h2>

                    <div className="text-sm font-mono font-bold text-[#00E575] pt-0.5 flex items-center gap-1.5">
                      <span className="text-white/40">CODE:</span>
                      <span className="bg-black/50 px-2.5 py-0.5 rounded-lg border border-white/10 text-white text-base">
                        {squad.plan_code}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-[#008751]/20 text-[#00E575] border border-[#008751]/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Deposit Paid</span>
                    </span>
                  </div>
                </div>

                {/* Massive 1-Tap Physical Check-in Button */}
                <button
                  type="button"
                  onClick={() => handleCheckIn(squad)}
                  className={`w-full h-14 rounded-2xl font-mono font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 tap-feedback cursor-pointer shadow-lg ${
                    isSeated
                      ? 'bg-white/10 hover:bg-white/15 text-white/80 border border-white/20'
                      : 'bg-[#008751] hover:bg-[#007043] active:bg-[#005a35] text-white shadow-emerald-950/50'
                  }`}
                >
                  {isSeated ? (
                    <>
                      <Check className="w-5 h-5 text-[#00E575]" />
                      <span>SEATED ✓ (TAP TO UNDO)</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>LET THEM IN · SEAT SQUAD</span>
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Safety Notice */}
      <div className="text-center pt-4 pb-8 text-[11px] font-mono text-white/40">
        Door staff console · Zero banking details displayed · Host Pass Door Mode
      </div>
    </div>
  );
}
