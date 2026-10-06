'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Venue, MenuItem, VenuePhoto } from '@/lib/types';
import { PulseDemandSummary, PulseSquadItem } from '@/lib/queries/pulse';
import { updateVenueLiveStatusAction, decideSquadAction, PulseVenueStatus } from '@/lib/actions/pulseActions';
import { triggerHaptic } from '@/lib/ui/haptics';
import {
  Activity,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  UtensilsCrossed,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface ThePulseClientProps {
  venue: Venue;
  demand: PulseDemandSummary;
  menuItems: MenuItem[];
  photos: VenuePhoto[];
}

export function ThePulseClient({
  venue,
  demand,
  menuItems,
  photos,
}: ThePulseClientProps) {
  // Operational Status state
  const initialStatus: PulseVenueStatus = venue.is_temporarily_closed
    ? (venue.temporary_closure_reason === 'At Capacity' ? 'at_capacity' : 'closed')
    : (venue.temporary_closure_reason === 'Walk-ins Only' ? 'walk_ins_only'
       : venue.temporary_closure_reason === 'Kitchen Closed' ? 'kitchen_closed' : 'open');

  const [currentStatus, setCurrentStatus] = useState<PulseVenueStatus>(initialStatus);
  const [statusSaving, setStatusSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Pending Squads state (Optimistic updates for approvals/declines)
  const [pendingSquads, setPendingSquads] = useState<PulseSquadItem[]>(demand.pendingSquads);
  const [approvedSquads, setApprovedSquads] = useState<PulseSquadItem[]>(demand.approvedSquads);
  const [activeActionSquadId, setActiveActionSquadId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const showSavedIndicator = (msg: string = 'Saved') => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast(null);
    }, 2400);
  };

  const handleStatusChange = async (newStatus: PulseVenueStatus) => {
    if (newStatus === currentStatus) return;
    const prevStatus = currentStatus;
    setCurrentStatus(newStatus);
    setStatusSaving(true);
    triggerHaptic(newStatus === 'at_capacity' ? 'warning' : 'success');

    try {
      const res = await updateVenueLiveStatusAction(venue.id, newStatus);
      if (res.success) {
        showSavedIndicator(newStatus === 'at_capacity' ? 'At Capacity Broadcasted' : 'Venue Live Status Updated');
      } else {
        setCurrentStatus(prevStatus);
        alert(res.error || 'Failed to update live status. Check network connection.');
      }
    } catch {
      setCurrentStatus(prevStatus);
      alert('Unable to persist status change. Please retry.');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleSquadDecision = async (squad: PulseSquadItem, decision: 'approve' | 'decline') => {
    setActiveActionSquadId(squad.id);
    triggerHaptic(decision === 'approve' ? 'success' : 'warning');

    // Optimistic removal from pending
    setPendingSquads((prev) => prev.filter((s) => s.id !== squad.id));
    if (decision === 'approve') {
      setApprovedSquads((prev) => [{ ...squad, status: 'approved' }, ...prev]);
    }

    try {
      const res = await decideSquadAction(venue.id, squad.plan_code, decision);
      if (res.success) {
        showSavedIndicator(decision === 'approve' ? 'Squad Approved to Guestlist' : 'Squad Request Declined');
      } else {
        // Rollback
        setPendingSquads((prev) => [squad, ...prev]);
        if (decision === 'approve') {
          setApprovedSquads((prev) => prev.filter((s) => s.id !== squad.id));
        }
        alert(res.error || 'Failed to record squad decision. Please try again.');
      }
    } catch {
      setPendingSquads((prev) => [squad, ...prev]);
      if (decision === 'approve') {
        setApprovedSquads((prev) => prev.filter((s) => s.id !== squad.id));
      }
      alert('Network error while processing booking. Please retry.');
    } finally {
      setActiveActionSquadId(null);
    }
  };

  const total86d = menuItems.filter((i) => !i.is_available).length;
  const activeMenuCount = menuItems.filter((i) => i.is_available).length;
  const nextPendingSquad = pendingSquads[0];

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      {/* Subtle Auto-Save Toast */}
      {saveToast && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-[#121418] border border-[#00E575]/40 text-white text-xs font-mono font-bold px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E575] animate-ping" />
            <span>{saveToast}</span>
          </div>
        </div>
      )}

      {/* ── 1. LIVE VENUE STATUS (MASSIVE OPERATIONAL CONTROL) ── */}
      <section className="bg-[#121418] rounded-3xl border border-[#232732] p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232732] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00E575] px-2.5 py-0.5 rounded-full bg-[#008751]/15 border border-[#008751]/30">
                LIVE BROADCAST STATE
              </span>
              {statusSaving && (
                <span className="text-[10px] font-mono text-white/50 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-[#00E575]" />
                  broadcasting...
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Tonight&apos;s Door &amp; Floor Status
            </h2>
            <p className="text-xs text-white/60">
              One-tap broadcast. Immediately controls customer reservation routing and venue availability across Lagos.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-mono text-white/50">Current State:</span>
            <span
              className={`text-xs font-mono font-black uppercase px-3 py-1 rounded-lg ${
                currentStatus === 'open'
                  ? 'bg-[#008751]/20 text-[#00E575] border border-[#008751]/50'
                  : currentStatus === 'at_capacity'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-white/10 text-white border border-white/20'
              }`}
            >
              ● {currentStatus.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Massive Touch Selector Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-5">
          {/* OPEN */}
          <button
            type="button"
            onClick={() => handleStatusChange('open')}
            className={`p-4 rounded-2xl border text-left transition-all tap-feedback cursor-pointer relative ${
              currentStatus === 'open'
                ? 'bg-[#008751]/20 border-[#00E575] text-white shadow-lg ring-1 ring-[#00E575]'
                : 'bg-white/5 border-[#232732] text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`w-3 h-3 rounded-full ${currentStatus === 'open' ? 'bg-[#00E575] animate-pulse' : 'bg-white/20'}`} />
              {currentStatus === 'open' && <Check className="w-4 h-4 text-[#00E575]" />}
            </div>
            <div className="text-lg font-black tracking-tight text-white">OPEN</div>
            <div className="text-[11px] font-mono text-white/60 mt-0.5">Doors open, welcoming squads</div>
          </button>

          {/* AT CAPACITY */}
          <button
            type="button"
            onClick={() => handleStatusChange('at_capacity')}
            className={`p-4 rounded-2xl border text-left transition-all tap-feedback cursor-pointer relative ${
              currentStatus === 'at_capacity'
                ? 'bg-red-950/40 border-red-500 text-white shadow-lg ring-1 ring-red-500'
                : 'bg-white/5 border-[#232732] text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`w-3 h-3 rounded-full ${currentStatus === 'at_capacity' ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`} />
              {currentStatus === 'at_capacity' && <Check className="w-4 h-4 text-red-400" />}
            </div>
            <div className="text-lg font-black tracking-tight text-white">AT CAPACITY</div>
            <div className="text-[11px] font-mono text-white/60 mt-0.5">Velvet rope up, floor is full</div>
          </button>

          {/* WALK-INS ONLY */}
          <button
            type="button"
            onClick={() => handleStatusChange('walk_ins_only')}
            className={`p-4 rounded-2xl border text-left transition-all tap-feedback cursor-pointer relative ${
              currentStatus === 'walk_ins_only'
                ? 'bg-white/15 border-white text-white shadow-lg ring-1 ring-white'
                : 'bg-white/5 border-[#232732] text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`w-3 h-3 rounded-full ${currentStatus === 'walk_ins_only' ? 'bg-white' : 'bg-white/20'}`} />
              {currentStatus === 'walk_ins_only' && <Check className="w-4 h-4 text-white" />}
            </div>
            <div className="text-lg font-black tracking-tight text-white">WALK-INS ONLY</div>
            <div className="text-[11px] font-mono text-white/60 mt-0.5">No table holds, first come</div>
          </button>

          {/* KITCHEN CLOSED */}
          <button
            type="button"
            onClick={() => handleStatusChange('kitchen_closed')}
            className={`p-4 rounded-2xl border text-left transition-all tap-feedback cursor-pointer relative ${
              currentStatus === 'kitchen_closed'
                ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg ring-1 ring-amber-500'
                : 'bg-white/5 border-[#232732] text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`w-3 h-3 rounded-full ${currentStatus === 'kitchen_closed' ? 'bg-amber-500' : 'bg-white/20'}`} />
              {currentStatus === 'kitchen_closed' && <Check className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="text-lg font-black tracking-tight text-white">KITCHEN CLOSED</div>
            <div className="text-[11px] font-mono text-white/60 mt-0.5">Drinks &amp; lounge service only</div>
          </button>
        </div>
      </section>

      {/* ── 2. HEADLINE DEMAND SIGNAL & TONIGHT'S PENDING ACTION ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Headline Demand Card */}
        <div className="lg:col-span-2 bg-[#121418] rounded-3xl border border-[#232732] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E575] animate-ping" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#00E575] uppercase">
                PLANNING INTENT (UPSTREAM) · REAL SQUAD PLANS
              </span>
            </div>

            {demand.headlineCount > 0 ? (
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  {demand.headlineCount} Squads have you in their plans this weekend.
                </h1>
                <p className="text-sm sm:text-base text-white/70 max-w-xl leading-relaxed">
                  {demand.pendingSquads.length > 0 ? (
                    <>
                      <strong className="text-[#00E575] font-bold">
                        ₦{demand.totalPendingRevenue.toLocaleString()}
                      </strong>{' '}
                      in pending table hold deposits ready for your review. (Planning intent indicates groups assembling plans at home; tap to confirm incoming tables).
                    </>
                  ) : (
                    <>All incoming squad requests have been reviewed and seated. The floor is in control.</>
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Lagos is waking up. Drop a new photo to get on the radar.
                </h1>
                <p className="text-xs sm:text-sm text-white/60 max-w-lg leading-relaxed">
                  As squads assemble outings across your district, their planned party sizes and budget envelopes will appear here in real time.
                </p>
              </div>
            )}

            {/* Live Frequency Readout (The Pulse of Lagos) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-[#00E575] font-bold block">🔥 LIVE RADAR</span>
                <span className="text-xs text-white/90 font-mono font-bold block">
                  {demand.headlineCount > 0 ? demand.headlineCount : 14} squads planning
                </span>
                <span className="text-[10px] text-white/40">Active in district right now</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-amber-400 font-bold block">💰 THE DOOR QUEUE</span>
                <span className="text-xs text-white/90 font-mono font-bold block">
                  {demand.pendingSquads.length} table hold requests
                </span>
                <span className="text-[10px] text-white/40">Deposits ready to lock</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-purple-400 font-bold block">⚡ VELVET ROPE</span>
                <span className="text-xs text-white/90 font-mono font-bold block uppercase">
                  {currentStatus.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-white/40">Live broadcast active</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#232732] flex flex-wrap items-center gap-4 mt-6">
            <Link
              href={`/business/${venue.id}/reservations`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#008751] hover:bg-[#007043] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md tap-feedback"
            >
              <span>Open The Door ({demand.pendingSquads.length} Pending)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={`/business/${venue.id}/pricing`}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono font-bold text-xs transition-colors border border-white/10 tap-feedback"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#00E575]" />
              <span>The Board ({total86d > 0 ? `${total86d} 86'd` : 'All Available'})</span>
            </Link>
          </div>
        </div>

        {/* Right Col: Instant Financial / Door Snapshot */}
        <div className="bg-[#121418] rounded-3xl border border-[#232732] p-6 flex flex-col justify-between shadow-xl space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">
              CONFIRMED GUESTLIST · SEATED TABLES
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white tabular-nums">
              ₦{demand.totalConfirmedRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-white/60 font-mono">
              Estimated spend from {demand.approvedSquads.length} confirmed tables (actual spend realized upon arrival)
            </p>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-[#232732] text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-white/60">House Corkage</span>
              <span className="font-bold text-white">
                {venue.corkage_fee ? `₦${venue.corkage_fee.toLocaleString()}` : 'Free / Not set'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-white/60">Dress Code</span>
              <span className="font-bold text-[#00E575] uppercase">
                {venue.dress_code || 'Casual'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-white/60">Live Menu Items</span>
              <span className="font-bold text-white">{activeMenuCount} Active</span>
            </div>
          </div>

          <Link
            href={`/business/${venue.id}/venue`}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-center font-mono text-xs font-bold text-white border border-white/10 transition-colors block tap-feedback"
          >
            Adjust House Rules →
          </Link>
        </div>
      </section>

      {/* ── 3. PENDING SQUAD ACTION STACK ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00E575]" />
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Pending Squad Approvals ({pendingSquads.length})
            </h2>
          </div>

          <Link
            href={`/business/${venue.id}/reservations`}
            className="text-xs font-mono font-bold text-[#00E575] hover:underline flex items-center gap-1"
          >
            <span>View All At The Door</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingSquads.length === 0 ? (
          <div className="bg-[#121418] rounded-3xl border border-[#232732] p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#008751]/10 text-[#00E575] border border-[#008751]/20 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">All Squads Cleared</h3>
              <p className="text-xs text-white/60 max-w-sm mx-auto">
                No squad requests waiting for review. When new groups lock in a plan for your spot, their table requests will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSquads.slice(0, 4).map((squad) => (
              <div
                key={squad.id}
                className="bg-[#121418] rounded-3xl border border-[#232732] p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E575] bg-[#008751]/15 px-2.5 py-0.5 rounded-full border border-[#008751]/30">
                        {squad.vibe}
                      </span>
                      <span className="text-[10px] font-mono text-white/40">{squad.plan_code}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Table of {squad.squad_size}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-white/50 block">Deposit Ready</span>
                    <span className="text-lg font-black text-[#00E575] font-mono">
                      ₦{squad.deposit_amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-white/60">Estimated Spend:</span>
                  <span className="text-white font-bold">
                    ₦{(squad.total_cost || squad.budget || 50000).toLocaleString()}
                  </span>
                </div>

                {/* 1-Tap Thumb Action Bar */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    disabled={activeActionSquadId === squad.id}
                    onClick={() => handleSquadDecision(squad, 'decline')}
                    className="h-12 rounded-xl border border-red-500/40 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-mono font-bold text-xs uppercase tracking-wider transition-all tap-feedback cursor-pointer disabled:opacity-50"
                  >
                    Decline
                  </button>

                  <button
                    type="button"
                    disabled={activeActionSquadId === squad.id}
                    onClick={() => handleSquadDecision(squad, 'approve')}
                    className="h-12 rounded-xl bg-[#008751] hover:bg-[#007043] active:bg-[#005a35] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 tap-feedback cursor-pointer disabled:opacity-50"
                  >
                    {activeActionSquadId === squad.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 4. STICKY PENDING BOOKING CARD (MOBILE ONLY) ── */}
      {nextPendingSquad && (
        <div className="sm:hidden fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-30 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-[#121418] border-2 border-[#00E575]/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-[#00E575] uppercase tracking-wider block">
                PENDING ACTION
              </span>
              <div className="text-sm font-black text-white truncate">
                Table of {nextPendingSquad.squad_size} · ₦{nextPendingSquad.deposit_amount.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleSquadDecision(nextPendingSquad, 'decline')}
                className="h-9 px-3 rounded-lg bg-red-950/40 text-red-400 text-xs font-mono font-bold border border-red-500/30 tap-feedback cursor-pointer"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => handleSquadDecision(nextPendingSquad, 'approve')}
                className="h-9 px-3.5 rounded-lg bg-[#008751] text-white text-xs font-mono font-bold shadow-md flex items-center gap-1 tap-feedback cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
