'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Venue, MenuItem, VenuePhoto } from '@/lib/types';
import { PulseDemandSummary, PulseSquadItem } from '@/lib/queries/pulse';
import {
  updateVenueLiveStatusAction,
  decideSquadAction,
  updateVenueHouseRulesAction,
  PulseVenueStatus,
} from '@/lib/actions/pulseActions';
import { triggerHaptic } from '@/lib/ui/haptics';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';
import { QuickCodePunchModal } from '@/components/pulse/QuickCodePunchModal';
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
  Zap,
  CloudRain,
  Share2,
  Copy,
  Radio,
  MessageCircle,
  Wine,
  Wallet,
  Hash,
  Edit3,
  X,
  CreditCard,
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
    ? (venue.temporary_closure_reason === 'At Capacity'
       ? 'at_capacity'
       : venue.temporary_closure_reason === 'Private Buyout'
       ? 'private_buyout'
       : 'closed')
    : (venue.temporary_closure_reason === 'Tables Tight'
       ? 'tables_tight'
       : venue.temporary_closure_reason === 'Walk-ins Only'
       ? 'walk_ins_only'
       : venue.temporary_closure_reason === 'Kitchen Closed'
       ? 'kitchen_closed'
       : 'open');

  const [currentStatus, setCurrentStatus] = useState<PulseVenueStatus>(initialStatus);
  const [statusSaving, setStatusSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Live Outing Mirror Tappable Rules State
  const [corkageFee, setCorkageFee] = useState<number>(venue.corkage_fee || 0);
  const [minSpend, setMinSpend] = useState<number>(venue.minimum_spend || 0);
  const [depositFee, setDepositFee] = useState<number>(venue.reservation_fee || 0);
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [adjustModal, setAdjustModal] = useState<{
    field: 'corkage' | 'min_spend' | 'deposit';
    title: string;
    value: string;
  } | null>(null);
  const [savingRule, setSavingRule] = useState(false);

  // Live Vibe State: CHILL | PACKED | LIVE DJ TONIGHT | CLOSED
  const [liveVibe, setLiveVibe] = useState<'CHILL' | 'PACKED' | 'LIVE DJ' | 'VIP ONLY'>(
    venue.vibe_tags?.includes('Live DJ Tonight') ? 'LIVE DJ' : 'CHILL'
  );

  // Auto-Expiring Flash Promos State
  const [activePromo, setActivePromo] = useState<{
    id: string;
    title: string;
    description: string;
    remainingSeconds: number;
  } | null>(null);

  // Bouncer Stand Link Copy State
  const [bouncerLinkCopied, setBouncerLinkCopied] = useState(false);

  // Pending Squads state (Optimistic updates for approvals/declines)
  const [pendingSquads, setPendingSquads] = useState<PulseSquadItem[]>(demand.pendingSquads);
  const [approvedSquads, setApprovedSquads] = useState<PulseSquadItem[]>(demand.approvedSquads);
  const [activeActionSquadId, setActiveActionSquadId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  // Auto-expiry countdown for active flash promos
  useEffect(() => {
    if (!activePromo) return;
    const timer = setInterval(() => {
      setActivePromo((prev) => {
        if (!prev || prev.remainingSeconds <= 1) {
          showSavedIndicator('Flash Promo Ended Automatically');
          return null;
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activePromo]);

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
        showSavedIndicator(
          newStatus === 'at_capacity'
            ? 'At Capacity Broadcasted'
            : newStatus === 'tables_tight'
            ? 'Tables Tight Broadcasted'
            : newStatus === 'private_buyout'
            ? 'Private Buyout Broadcasted'
            : 'Venue Live Status Updated'
        );
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

  const handleSaveRuleAdjustment = async (customVal?: number) => {
    if (!adjustModal) return;
    const num = customVal !== undefined ? customVal : (parseInt(adjustModal.value, 10) || 0);
    setSavingRule(true);
    triggerHaptic('success');

    try {
      if (adjustModal.field === 'corkage') {
        setCorkageFee(num);
        await updateVenueHouseRulesAction(venue.id, { corkageFee: num });
        showSavedIndicator(num > 0 ? `Corkage set to ₦${num.toLocaleString()}` : 'Corkage is Free');
      } else if (adjustModal.field === 'min_spend') {
        setMinSpend(num);
        await updateVenueHouseRulesAction(venue.id, { minimumSpend: num });
        showSavedIndicator(num > 0 ? `Minimum spend set to ₦${num.toLocaleString()}` : 'No Minimum Spend');
      } else if (adjustModal.field === 'deposit') {
        setDepositFee(num);
        await updateVenueHouseRulesAction(venue.id, { reservationFee: num });
        showSavedIndicator(num > 0 ? `Table deposit set to ₦${num.toLocaleString()}` : 'No Deposit Required');
      }
      setAdjustModal(null);
    } catch {
      alert('Failed to save rule change.');
    } finally {
      setSavingRule(false);
    }
  };

  const handleVibeChange = (newVibe: 'CHILL' | 'PACKED' | 'LIVE DJ' | 'VIP ONLY') => {
    setLiveVibe(newVibe);
    triggerHaptic('success');
    showSavedIndicator(`Vibe Broadcast: ${newVibe} Live`);
  };

  const triggerFlashPromo = (id: string, title: string, description: string) => {
    setActivePromo({
      id,
      title,
      description,
      remainingSeconds: 3600, // 60 minutes
    });
    triggerHaptic('success');
    showSavedIndicator(`Flash Promo Pushed: ${title} (Auto-expires in 60m)`);
  };

  const cancelPromo = () => {
    setActivePromo(null);
    triggerHaptic('warning');
    showSavedIndicator('Flash Promo Cancelled');
  };

  const copyBouncerLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://oyaplan.com';
    const bouncerUrl = `${origin}/business/${venue.id}/bouncer`;
    navigator.clipboard?.writeText(bouncerUrl);
    setBouncerLinkCopied(true);
    triggerHaptic('success');
    showSavedIndicator('Bouncer Stand Link Copied to Clipboard');
    setTimeout(() => setBouncerLinkCopied(false), 2400);
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
  const bouncerShareWa = `https://wa.me/?text=${encodeURIComponent(`Here is the door check-in stand for ${venue.name}: https://oyaplan.com/business/${venue.id}/bouncer`)}`;

  return (
    <div className="space-y-6 pb-24 sm:pb-8 font-sans text-[#F8F9FA]">
      {/* Subtle Auto-Save Toast */}
      {saveToast && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-[#121418] border border-[#00E575]/40 text-white text-xs font-mono font-bold px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E575] animate-ping" />
            <span>{saveToast}</span>
          </div>
        </div>
      )}

      {/* ── 1. THE COMMAND SCREEN: WEEKEND RADAR (TOP CARD) ── */}
      <section className="bg-[#121418] rounded-3xl border border-[#232732] p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#232732] pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E575] animate-ping" />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#00E575] px-2.5 py-0.5 rounded-full bg-[#008751]/15 border border-[#008751]/30">
                THE WEEKEND RADAR · LIVE FLOOR DISPATCH
              </span>
              {statusSaving && (
                <span className="text-[10px] font-mono text-white/50 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-[#00E575]" />
                  broadcasting live...
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {demand.headlineCount > 0 ? demand.headlineCount : 42} squads have added you to their Friday/Saturday run.
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-mono text-white/70">
              <span className="text-[#00E575] font-black">
                ₦38,500/head average cart.
              </span>
              <span className="text-white/30 hidden sm:inline">|</span>
              <span>
                {demand.pendingSquads.length > 0 ? (
                  <>
                    <strong className="text-white font-bold">
                      ₦{demand.totalPendingRevenue.toLocaleString()}
                    </strong>{' '}
                    in pending table hold deposits ready for review (100% direct deposit).
                  </>
                ) : (
                  <>All table requests reviewed. Floor capacity in control.</>
                )}
              </span>
            </div>
          </div>

          {/* Quick Code Punch & Stand Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('success');
                setShowPunchModal(true);
              }}
              className="h-12 px-4 sm:px-5 rounded-2xl bg-[#008751] hover:bg-[#007043] active:bg-[#005a35] text-white font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/40 tap-feedback cursor-pointer"
            >
              <Hash className="w-4 h-4" />
              <span>PUNCH OYA- CODE</span>
            </button>

            <Link
              href={`/business/${venue.id}/bouncer`}
              className="h-12 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 font-mono text-xs font-bold flex items-center gap-2 tap-feedback"
            >
              <ShieldCheck className="w-4 h-4 text-[#00E575]" />
              <span className="hidden sm:inline">Door Mode</span>
            </Link>
          </div>
        </div>

        {/* ── PHYSICAL-FEELING DOOR STATUS TOGGLE (4 STATES) ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white/50 uppercase tracking-wider">Tactile Floor Status Toggle (Alerts Lagos in Real-Time):</span>
            <span className="text-[#00E575] font-bold">
              Current: {currentStatus === 'open' ? 'NORMAL SERVICE' : currentStatus === 'tables_tight' ? 'TABLES TIGHT' : currentStatus === 'at_capacity' ? 'AT CAPACITY' : currentStatus === 'private_buyout' ? 'PRIVATE BUYOUT' : currentStatus.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. NORMAL SERVICE */}
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
              <div className="text-base sm:text-lg font-black tracking-tight text-white">NORMAL SERVICE</div>
              <div className="text-[11px] font-mono text-white/60 mt-0.5">Doors open, welcoming squads</div>
            </button>

            {/* 2. TABLES TIGHT */}
            <button
              type="button"
              onClick={() => handleStatusChange('tables_tight')}
              className={`p-4 rounded-2xl border text-left transition-all tap-feedback cursor-pointer relative ${
                currentStatus === 'tables_tight'
                  ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg ring-1 ring-amber-500'
                  : 'bg-white/5 border-[#232732] text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-3 h-3 rounded-full ${currentStatus === 'tables_tight' ? 'bg-amber-400 animate-pulse' : 'bg-white/20'}`} />
                {currentStatus === 'tables_tight' && <Check className="w-4 h-4 text-amber-400" />}
              </div>
              <div className="text-base sm:text-lg font-black tracking-tight text-white">TABLES TIGHT</div>
              <div className="text-[11px] font-mono text-white/60 mt-0.5">Floor filling fast, priority holds</div>
            </button>

            {/* 3. AT CAPACITY / WALK-INS ONLY */}
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
              <div className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">AT CAPACITY</div>
              <div className="text-[11px] font-mono text-white/60 mt-0.5">Velvet rope up, walk-ins only</div>
            </button>

            {/* 4. PRIVATE BUYOUT */}
            <button
              type="button"
              onClick={() => handleStatusChange('private_buyout')}
              className={`p-4 rounded-2xl border text-left transition-all tap-feedback cursor-pointer relative ${
                currentStatus === 'private_buyout'
                  ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg ring-1 ring-purple-500'
                  : 'bg-white/5 border-[#232732] text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-3 h-3 rounded-full ${currentStatus === 'private_buyout' ? 'bg-purple-400 animate-pulse' : 'bg-white/20'}`} />
                {currentStatus === 'private_buyout' && <Check className="w-4 h-4 text-purple-400" />}
              </div>
              <div className="text-base sm:text-lg font-black tracking-tight text-white">PRIVATE BUYOUT</div>
              <div className="text-[11px] font-mono text-white/60 mt-0.5">Closed for exclusive buyout</div>
            </button>
          </div>
        </div>

        {/* Live Vibe Switcher Bar */}
        <div className="pt-3 border-t border-[#232732] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#00E575]" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Tonight&apos;s Room Vibe:
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none font-mono text-xs">
            {(['CHILL', 'PACKED', 'LIVE DJ', 'VIP ONLY'] as const).map((vibe) => (
              <button
                key={vibe}
                type="button"
                onClick={() => handleVibeChange(vibe)}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all tap-feedback cursor-pointer ${
                  liveVibe === vibe
                    ? 'bg-[#008751] text-white shadow-md'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {vibe}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. THE LIVE OUTING CARD (INTERACTIVE CONSUMER MIRROR) ── */}
      <section className="bg-[#121418] rounded-3xl border border-[#232732] p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232732] pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E575]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00E575]">
                THE LIVE OUTING CARD · WHAT LAGOS SQUADS SEE RIGHT NOW
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {venue.name} · {venue.category}
            </h2>
          </div>

          <span className="text-xs font-mono text-white/50 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
            💡 Tap any rule to adjust instantly
          </span>
        </div>

        {/* High-Stakes Risk Warning (Replaces generic completeness bar) */}
        {corkageFee === 0 && (
          <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3 text-amber-300">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-0.5 text-xs font-mono">
              <span className="font-bold uppercase tracking-wider block text-amber-200">
                ⚠️ High-Stakes Notice: Missing Corkage Rule
              </span>
              <p className="text-amber-300/80 leading-relaxed">
                Squads browsing your spot will assume outside bottles are permitted at ₦0 corkage fee. Tap the corkage pill below to set your weekend fee.
              </p>
            </div>
          </div>
        )}

        {/* Consumer Card Mirror Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Outing Cart Summary */}
          <div className="bg-black/50 p-5 rounded-2xl border border-white/10 space-y-2">
            <span className="text-[10px] font-mono text-white/50 uppercase block">Outing Budget / Head</span>
            <div className="text-2xl font-mono font-black text-white">₦38,500</div>
            <div className="text-[11px] font-mono text-white/60 space-y-0.5 pt-1 border-t border-white/5">
              <div className="flex justify-between"><span>Dishes:</span><span>₦24,000</span></div>
              <div className="flex justify-between"><span>Cocktails:</span><span>₦9,500</span></div>
              <div className="flex justify-between text-[#00E575]"><span>VAT &amp; Service:</span><span>₦5,000</span></div>
            </div>
          </div>

          {/* Interactive Squad Contract Pills */}
          <div className="md:col-span-2 bg-black/50 p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-white/50 uppercase block">
                Squad Contract (Tappable Quick-Updaters)
              </span>
              <Link
                href={`/business/${venue.id}/rules`}
                className="text-[11px] font-mono text-[#00E575] hover:underline"
              >
                All Rules →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Corkage Pill */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setAdjustModal({
                    field: 'corkage',
                    title: 'Adjust Weekend Corkage Fee',
                    value: corkageFee ? corkageFee.toString() : '15000',
                  });
                }}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all tap-feedback cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white/60 flex items-center gap-1.5">
                    <Wine className="w-3.5 h-3.5 text-[#00E575]" />
                    <span>House Corkage:</span>
                  </span>
                  <span className="text-[10px] text-[#00E575] group-hover:underline">TAP TO EDIT</span>
                </div>
                <div className="text-base font-mono font-black text-white mt-1">
                  {corkageFee > 0 ? `₦${corkageFee.toLocaleString()} / bottle` : 'Free / Not set'}
                </div>
              </button>

              {/* Table Min Spend Pill */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setAdjustModal({
                    field: 'min_spend',
                    title: 'Adjust Table Minimum Spend',
                    value: minSpend ? minSpend.toString() : '50000',
                  });
                }}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all tap-feedback cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white/60 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-[#00E575]" />
                    <span>Table Min Spend:</span>
                  </span>
                  <span className="text-[10px] text-[#00E575] group-hover:underline">TAP TO EDIT</span>
                </div>
                <div className="text-base font-mono font-black text-white mt-1">
                  {minSpend > 0 ? `₦${minSpend.toLocaleString()} baseline` : 'None / Open seating'}
                </div>
              </button>

              {/* Booking Deposit Pill */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setAdjustModal({
                    field: 'deposit',
                    title: 'Adjust Table Hold Deposit',
                    value: depositFee ? depositFee.toString() : '20000',
                  });
                }}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all tap-feedback cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white/60 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#00E575]" />
                    <span>Table Hold Deposit:</span>
                  </span>
                  <span className="text-[10px] text-[#00E575] group-hover:underline">TAP TO EDIT</span>
                </div>
                <div className="text-base font-mono font-black text-white mt-1">
                  {depositFee > 0 ? `₦${depositFee.toLocaleString()} (100% direct)` : 'Free Hold'}
                </div>
              </button>

              {/* Dress Code Pill */}
              <Link
                href={`/business/${venue.id}/rules`}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all tap-feedback group"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white/60">Dress Code Enforced:</span>
                  <span className="text-[10px] text-white/40 group-hover:underline">RULES →</span>
                </div>
                <div className="text-base font-mono font-black text-white mt-1">
                  {(venue.dress_code || 'Smart Casual').replace('_', ' ').toUpperCase()}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. HYPE PROMPTS & AUTO-EXPIRING FLASH PROMOS ── */}
      <section className="bg-[#121418] rounded-3xl border border-[#232732] p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00E575]" />
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Hype Prompts &amp; Flash Demand
            </h2>
          </div>

          {activePromo ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/40 text-red-400 font-mono text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>
                Promo Live: {Math.floor(activePromo.remainingSeconds / 60)}m {activePromo.remainingSeconds % 60}s
              </span>
              <button
                type="button"
                onClick={cancelPromo}
                className="ml-2 text-[10px] text-white/50 hover:text-white underline cursor-pointer"
              >
                End Now
              </button>
            </div>
          ) : (
            <span className="text-xs font-mono text-white/40">
              Auto-expiring tactical prompts to manipulate tonight&apos;s demand
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Rain Alert Promo */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-400">
                <CloudRain className="w-3.5 h-3.5" />
                <span>Rain in Victoria Island / Lekki</span>
              </div>
              <h4 className="font-bold text-white text-sm">Broadcast Covered Seating + 10% Flash Discount</h4>
              <p className="text-xs text-white/60">
                Pushes an alert to squads planning nearby that your indoor lounge is warm and dry.
              </p>
            </div>
            <button
              type="button"
              onClick={() => triggerFlashPromo('rain_discount', 'Covered Lounge 10% Off', 'Valid for bookings in the next hour')}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold border border-white/10 tap-feedback cursor-pointer"
            >
              Push Live
            </button>
          </div>

          {/* Rush Hour Free Shots Promo */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#00E575]">
                <Flame className="w-3.5 h-3.5" />
                <span>Slow Table Rush</span>
              </div>
              <h4 className="font-bold text-white text-sm">Free Round of Shots for Next 3 Squads</h4>
              <p className="text-xs text-white/60">
                Give squads on the fence an immediate dopamine hook to lock in table deposits tonight.
              </p>
            </div>
            <button
              type="button"
              onClick={() => triggerFlashPromo('shots_promo', 'Free Round of Shots', 'Next 3 squads booking in next hour')}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-xs font-mono font-bold shadow-md tap-feedback cursor-pointer"
            >
              Push Live
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. PENDING SQUAD ACTION STACK ── */}
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
            <span>View All On The Floor</span>
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
                    className="h-12 rounded-xl border border-red-500/40 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-mono font-bold text-xs uppercase tracking-wider transition-all tap-feedback cursor-pointer disabled:opacity-50 text-center"
                  >
                    DECLINE (ALTERNATE TIME)
                  </button>

                  <button
                    type="button"
                    disabled={activeActionSquadId === squad.id}
                    onClick={() => handleSquadDecision(squad, 'approve')}
                    className="h-12 rounded-xl bg-[#008751] hover:bg-[#007043] active:bg-[#005a35] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 tap-feedback cursor-pointer disabled:opacity-50 text-center"
                  >
                    {activeActionSquadId === squad.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>ACCEPT &amp; LOCK TABLE</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 5. STICKY PENDING BOOKING CARD (MOBILE ONLY) ── */}
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
                <span>Lock</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. QUICK CODE PUNCH MODAL ── */}
      <QuickCodePunchModal
        venueId={venue.id}
        venueName={venue.name}
        isOpen={showPunchModal}
        onClose={() => setShowPunchModal(false)}
        squads={demand.approvedSquads.length > 0 ? demand.approvedSquads : demand.pendingSquads}
        onSquadVerified={(planCode) => {
          showSavedIndicator(`✓ ${planCode} Seated & Verified at Door!`);
        }}
      />

      {/* ── 7. QUICK RULE ADJUSTMENT MODAL ── */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#121418] border-2 border-[#00E575]/50 rounded-3xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold">{adjustModal.title}</h3>
              <button
                type="button"
                onClick={() => setAdjustModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preset Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-white/50 uppercase block">Quick Presets:</span>
              <div className="flex flex-wrap gap-2">
                {(adjustModal.field === 'corkage'
                  ? [0, 10000, 15000, 20000, 30000]
                  : adjustModal.field === 'min_spend'
                  ? [0, 30000, 50000, 100000, 250000]
                  : [0, 10000, 20000, 50000]
                ).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSaveRuleAdjustment(preset)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#008751] hover:text-white border border-white/10 text-xs font-mono font-bold transition-all tap-feedback cursor-pointer"
                  >
                    {preset === 0 ? 'Free / None' : `₦${preset.toLocaleString()}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom input */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <label className="text-[11px] font-mono text-white/60 uppercase">
                Or Enter Custom Amount (₦)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm">₦</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={adjustModal.value}
                  onChange={(e) => setAdjustModal({ ...adjustModal, value: e.target.value.replace(/\D/g, '') })}
                  placeholder="25000"
                  className="w-full h-12 pl-8 pr-4 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm focus:border-[#00E575] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustModal(null)}
                className="h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingRule}
                onClick={() => handleSaveRuleAdjustment()}
                className="h-11 rounded-xl bg-[#008751] hover:bg-[#007043] text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer"
              >
                {savingRule ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save Rule</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
