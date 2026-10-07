'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Venue } from '@/lib/types';
import { PulseDemandSummary, PulseSquadItem } from '@/lib/queries/pulse';
import { decideSquadAction } from '@/lib/actions/pulseActions';
import { triggerHaptic } from '@/lib/ui/haptics';
import {
  Users,
  Check,
  X,
  CreditCard,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  ChevronRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface TheFloorClientProps {
  venue: Venue;
  demand: PulseDemandSummary;
}

export function TheFloorClient({ venue, demand }: TheFloorClientProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'declined'>('pending');
  const [pendingSquads, setPendingSquads] = useState<PulseSquadItem[]>(demand.pendingSquads);
  const [confirmedSquads, setConfirmedSquads] = useState<PulseSquadItem[]>(demand.approvedSquads);
  const [declinedSquads, setDeclinedSquads] = useState<PulseSquadItem[]>([]);
  const [activeSquadId, setActiveSquadId] = useState<string | null>(null);

  // Swipe gesture state
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startXRef = useRef<number>(0);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const handleDecision = async (squad: PulseSquadItem, decision: 'approve' | 'decline') => {
    setActiveSquadId(squad.id);
    triggerHaptic(decision === 'approve' ? 'success' : 'warning');

    // Optimistic removal from queue
    setPendingSquads((prev) => prev.filter((s) => s.id !== squad.id));
    if (decision === 'approve') {
      setConfirmedSquads((prev) => [{ ...squad, status: 'approved' }, ...prev]);
    } else {
      setDeclinedSquads((prev) => [{ ...squad, status: 'declined' }, ...prev]);
    }

    setDragOffset(0);

    try {
      const res = await decideSquadAction(venue.id, squad.plan_code, decision);
      if (res.success) {
        showToast(decision === 'approve' ? `Table of ${squad.squad_size} Approved!` : 'Squad Request Declined');
      } else {
        // Rollback
        setPendingSquads((prev) => [squad, ...prev]);
        if (decision === 'approve') {
          setConfirmedSquads((prev) => prev.filter((s) => s.id !== squad.id));
        } else {
          setDeclinedSquads((prev) => prev.filter((s) => s.id !== squad.id));
        }
        alert(res.error || 'Failed to process squad booking.');
      }
    } catch {
      setPendingSquads((prev) => [squad, ...prev]);
      if (decision === 'approve') {
        setConfirmedSquads((prev) => prev.filter((s) => s.id !== squad.id));
      } else {
        setDeclinedSquads((prev) => prev.filter((s) => s.id !== squad.id));
      }
      alert('Network issue while processing squad. Please retry.');
    } finally {
      setActiveSquadId(null);
    }
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    // Dampen drag
    setDragOffset(diff);
  };

  const handleTouchEnd = (squad: PulseSquadItem) => {
    setIsDragging(false);
    if (dragOffset > 90) {
      // Swiped Right -> Approve
      handleDecision(squad, 'approve');
    } else if (dragOffset < -90) {
      // Swiped Left -> Decline
      handleDecision(squad, 'decline');
    } else {
      // Reset
      setDragOffset(0);
    }
  };

  const currentTopSquad = pendingSquads[0];

  return (
    <div className="space-y-6 pb-20">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-[#121418] border border-[#00E575]/50 text-white text-xs font-mono font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E575] animate-ping" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ── Floor / Door Command Header ── */}
      <div className="bg-[#121418] text-[#F8F9FA] rounded-3xl border border-[#232732] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#00E575] uppercase px-2.5 py-0.5 rounded-full bg-[#008751]/15 border border-[#008751]/30">
                THE DOOR · VELVET ROPE &amp; GUESTLIST
              </span>
              <span className="text-white/20 font-mono">/</span>
              <span className="text-xs font-mono text-white/50">{venue.name}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              The Door: Incoming Squads &amp; Guestlist
            </h1>

            <p className="text-xs sm:text-sm text-white/60 max-w-xl leading-relaxed">
              You control who gets past the velvet rope. Swipe right to approve table holds and collect deposits. Swipe left to decline. All deposits pay 100% directly to your business.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Link
              href={`/business/${venue.id}/bouncer`}
              className="px-4 py-2.5 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5 tap-feedback"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Open Bouncer Stand</span>
            </Link>

            <Link
              href={`/business/${venue.id}/venue`}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-[#232732] text-xs font-mono font-bold transition-colors tap-feedback"
            >
              Deposit Settings (₦{(venue.reservation_fee || 0).toLocaleString()})
            </Link>
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-[#232732] font-mono">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] uppercase text-white/50 tracking-wider block">Pending</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-[#00E575] tabular-nums">
                {pendingSquads.length}
              </span>
              <span className="text-[11px] text-white/40">squads</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] uppercase text-white/50 tracking-wider block">Confirmed</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {confirmedSquads.length}
              </span>
              <span className="text-[11px] text-white/40">seated</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] uppercase text-white/50 tracking-wider block">Declined</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white/50 tabular-nums">
                {declinedSquads.length}
              </span>
              <span className="text-[11px] text-white/40">cleared</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floor Filter Tabs ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#121418] border border-[#232732] w-fit font-mono text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl transition-all tap-feedback cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-[#008751] text-white shadow-md'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Pending Queue ({pendingSquads.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('confirmed')}
          className={`px-4 py-2 rounded-xl transition-all tap-feedback cursor-pointer ${
            activeTab === 'confirmed'
              ? 'bg-[#008751] text-white shadow-md'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Confirmed Guestlist ({confirmedSquads.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('declined')}
          className={`px-4 py-2 rounded-xl transition-all tap-feedback cursor-pointer ${
            activeTab === 'declined'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Declined ({declinedSquads.length})
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {pendingSquads.length === 0 ? (
            <div className="bg-[#121418] rounded-3xl border border-[#232732] p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#008751]/15 text-[#00E575] flex items-center justify-center mx-auto border border-[#008751]/30">
                <Check className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">The Floor is Clear</h3>
                <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto leading-relaxed">
                  No squad requests waiting for review. As groups assemble plans for {venue.name}, their booking cards will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* SWIPE CARD STACK HERO (Touch + 1-Tap) */}
              {currentTopSquad && (
                <div className="relative max-w-lg mx-auto select-none">
                  <div
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={() => handleTouchEnd(currentTopSquad)}
                    style={{
                      transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)`,
                      transition: isDragging ? 'none' : 'transform 0.25s ease-out',
                    }}
                    className="relative bg-[#181B22] rounded-3xl border-2 border-[#232732] p-6 sm:p-8 shadow-2xl space-y-6 touch-pan-y cursor-grab active:cursor-grabbing"
                  >
                    {/* Visual Stamp Feedback */}
                    {dragOffset > 30 && (
                      <div
                        style={{ opacity: Math.min(1, dragOffset / 80) }}
                        className="absolute top-6 right-6 px-4 py-1.5 rounded-xl border-2 border-[#00E575] text-[#00E575] font-mono font-black text-sm uppercase tracking-widest rotate-12 bg-black/60 backdrop-blur-md pointer-events-none"
                      >
                        APPROVE ✓
                      </div>
                    )}
                    {dragOffset < -30 && (
                      <div
                        style={{ opacity: Math.min(1, Math.abs(dragOffset) / 80) }}
                        className="absolute top-6 left-6 px-4 py-1.5 rounded-xl border-2 border-red-500 text-red-400 font-mono font-black text-sm uppercase tracking-widest -rotate-12 bg-black/60 backdrop-blur-md pointer-events-none"
                      >
                        DECLINE ✕
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E575] bg-[#008751]/15 px-3 py-1 rounded-full border border-[#008751]/30">
                          {currentTopSquad.vibe}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight pt-1">
                          Table of {currentTopSquad.squad_size}
                        </h2>
                        <div className="text-xs font-mono text-white/50">
                          Plan Code: <span className="text-white font-bold">{currentTopSquad.plan_code}</span>
                        </div>
                      </div>

                      <div className="text-right space-y-0.5">
                        <span className="text-[10px] font-mono uppercase text-[#00E575] font-bold block">
                          Direct Deposit [100% Direct]
                        </span>
                        <div className="text-2xl font-black text-[#00E575] font-mono">
                          ₦{currentTopSquad.deposit_amount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Estimated Outing Spend:</span>
                        <span className="font-bold text-white">
                          ₦{(currentTopSquad.total_cost || currentTopSquad.budget || 50000).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Requested:</span>
                        <span className="text-white/80">
                          {new Date(currentTopSquad.created_at).toLocaleDateString('en-NG', {
                            weekday: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Hint text */}
                    <div className="text-center text-[11px] font-mono text-white/40">
                      ← Swipe left to decline · Swipe right to lock table →
                    </div>

                    {/* Physical Thumb Buttons */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <button
                        type="button"
                        disabled={activeSquadId === currentTopSquad.id}
                        onClick={() => handleDecision(currentTopSquad, 'decline')}
                        className="h-14 rounded-2xl border-2 border-red-500/40 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 tap-feedback cursor-pointer disabled:opacity-50 text-center"
                      >
                        <X className="w-4 h-4" />
                        <span>DECLINE</span>
                      </button>

                      <button
                        type="button"
                        disabled={activeSquadId === currentTopSquad.id}
                        onClick={() => handleDecision(currentTopSquad, 'approve')}
                        className="h-14 rounded-2xl bg-[#008751] hover:bg-[#007043] active:bg-[#005a35] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg tap-feedback cursor-pointer disabled:opacity-50 text-center"
                      >
                        {activeSquadId === currentTopSquad.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-white" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>ACCEPT &amp; LOCK</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Remaining Squads List */}
              {pendingSquads.length > 1 && (
                <div className="space-y-3 pt-4 max-w-xl mx-auto">
                  <span className="text-xs font-mono font-bold text-white/50 uppercase tracking-widest block">
                    Next in Queue ({pendingSquads.length - 1})
                  </span>

                  <div className="space-y-2.5">
                    {pendingSquads.slice(1).map((squad) => (
                      <div
                        key={squad.id}
                        className="bg-[#121418] rounded-2xl border border-[#232732] p-4 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">Table of {squad.squad_size}</span>
                            <span className="text-[10px] font-mono text-[#00E575] bg-[#008751]/15 px-2 py-0.5 rounded">
                              {squad.vibe}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-white/50">{squad.plan_code}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDecision(squad, 'decline')}
                            className="h-9 px-3 rounded-xl bg-red-950/30 text-red-400 text-xs font-mono font-bold border border-red-500/30 tap-feedback cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecision(squad, 'approve')}
                            className="h-9 px-3.5 rounded-xl bg-[#008751] text-white text-xs font-mono font-bold tap-feedback cursor-pointer shadow-sm"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── CONFIRMED GUESTLIST TAB ── */}
      {activeTab === 'confirmed' && (
        <div className="space-y-4">
          {confirmedSquads.length === 0 ? (
            <div className="bg-[#121418] rounded-3xl border border-[#232732] p-12 text-center space-y-2">
              <Users className="w-8 h-8 text-white/40 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Seated Squads Yet</h3>
              <p className="text-xs text-white/60">
                Squads you approve from the pending queue will immediately appear here on tonight’s guestlist.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {confirmedSquads.map((squad) => (
                <div
                  key={squad.id}
                  className="bg-[#121418] rounded-2xl border border-[#008751]/40 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E575] bg-[#008751]/15 px-2.5 py-0.5 rounded-full">
                        CONFIRMED SEATED
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1">
                        Table of {squad.squad_size}
                      </h3>
                      <span className="text-xs font-mono text-white/50">{squad.plan_code}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-white/50 block">Deposit</span>
                      <span className="text-base font-mono font-bold text-[#00E575]">
                        ₦{squad.deposit_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/60">
                    <span>Est. Spend: ₦{(squad.total_cost || 50000).toLocaleString()}</span>
                    <span>{squad.vibe}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── DECLINED TAB ── */}
      {activeTab === 'declined' && (
        <div className="space-y-4">
          {declinedSquads.length === 0 ? (
            <div className="bg-[#121418] rounded-3xl border border-[#232732] p-12 text-center space-y-2">
              <Check className="w-8 h-8 text-white/40 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Declined Squads</h3>
              <p className="text-xs text-white/60">
                Any requests you decline will be tracked here for operational audit.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {declinedSquads.map((squad) => (
                <div
                  key={squad.id}
                  className="bg-[#121418] rounded-2xl border border-red-500/20 p-5 space-y-2 opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Table of {squad.squad_size}</span>
                    <span className="text-xs font-mono text-red-400">DECLINED</span>
                  </div>
                  <div className="text-xs font-mono text-white/50">Plan Code: {squad.plan_code}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
