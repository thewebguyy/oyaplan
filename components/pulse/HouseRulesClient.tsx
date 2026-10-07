'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Venue, VenuePhoto } from '@/lib/types';
import { updateVenueHouseRulesAction, updateVenueVibeAction } from '@/lib/actions/pulseActions';
import { triggerHaptic } from '@/lib/ui/haptics';
import {
  SlidersHorizontal,
  Wine,
  Shirt,
  Cake,
  CreditCard,
  Camera,
  Check,
  Sparkles,
  MapPin,
  Loader2,
  DollarSign,
  Info,
  AlertCircle,
} from 'lucide-react';

interface HouseRulesClientProps {
  venue: Venue;
  photos: VenuePhoto[];
}

export function HouseRulesClient({ venue, photos }: HouseRulesClientProps) {
  // Corkage State
  const [corkageEnabled, setCorkageEnabled] = useState<boolean>((venue.corkage_fee || 0) > 0);
  const [corkageFee, setCorkageFee] = useState<string>(venue.corkage_fee?.toString() || '10000');

  // Dress Code State
  const [dressCode, setDressCode] = useState<'casual' | 'smart_casual' | 'formal' | 'nightlife'>(
    venue.dress_code || 'smart_casual'
  );

  // Cake Fee State
  const [cakeFeeEnabled, setCakeFeeEnabled] = useState<boolean>((venue.cake_fee || 0) > 0);
  const [cakeFee, setCakeFee] = useState<string>(venue.cake_fee?.toString() || '15000');

  // Minimum Spend State
  const [minSpendEnabled, setMinSpendEnabled] = useState<boolean>((venue.minimum_spend || 0) > 0);
  const [minSpend, setMinSpend] = useState<string>(venue.minimum_spend?.toString() || '50000');

  // Reservation Deposit State
  const [depositEnabled, setDepositEnabled] = useState<boolean>((venue.reservation_fee || 0) > 0);
  const [reservationFee, setReservationFee] = useState<string>(venue.reservation_fee?.toString() || '20000');

  // The Vibe (Inline Editing)
  const [coverUrl, setCoverUrl] = useState<string>(
    venue.cover_url || (venue.gallery_urls && venue.gallery_urls[0]) || '/images/default-venue.jpg'
  );
  const [description, setDescription] = useState<string>(
    venue.description || 'Premium dining and nightlife experience in Lagos.'
  );
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [vibeTags, setVibeTags] = useState<string[]>(venue.vibe_tags || ['Dinner', 'Cocktails']);

  // Auto-save feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showSaved = (msg: string = 'Saved') => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  const VIBE_CHECKS_LIST = [
    { id: 'No Slippers', label: 'No Slippers / Slides', icon: '🚫', desc: 'Strict footwear at the door' },
    { id: 'RSVP Only', label: 'RSVP / Guestlist Only', icon: '🍾', desc: 'Velvet rope enforced, table holds only' },
    { id: 'Shisha Available', label: 'Shisha Available', icon: '💨', desc: 'Lounge hookah service active' },
    { id: '21+ Only', label: '21+ Strict Door Policy', icon: '🔞', desc: 'Age verification at the door' },
    { id: 'Valet Parking', label: 'Valet Parking Available', icon: '🚗', desc: 'Attended car drop on arrival' },
    { id: 'Live DJ Tonight', label: 'Live DJ Tonight', icon: '🎧', desc: 'Resident / guest DJ set on floor' },
    { id: 'Cashless Only', label: 'Cashless Only (POS / Transfer)', icon: '💳', desc: 'Cards and bank transfers accepted' },
    { id: 'Outdoor Terrace', label: 'Outdoor Terrace / Rooftop', icon: '🏖️', desc: 'Open-air seating available' },
  ];

  const handleToggleVibeCheck = (tag: string) => {
    triggerHaptic('success');
    const isPresent = vibeTags.includes(tag);
    const updated = isPresent ? vibeTags.filter((t) => t !== tag) : [...vibeTags, tag];
    setVibeTags(updated);
    updateVenueVibeAction(venue.id, { vibeTags: updated })
      .then((res) => {
        if (res.success) {
          showSaved(`Vibe Check: ${tag} ${isPresent ? 'turned off' : 'live'}`);
        }
      })
      .catch(() => alert('Failed to sync vibe check.'));
  };

  // --- HOUSE RULES AUTO-SAVE MUTATIONS ---
  const persistHouseRules = async (partialRules: Parameters<typeof updateVenueHouseRulesAction>[1], successMsg: string) => {
    triggerHaptic('success');
    try {
      const res = await updateVenueHouseRulesAction(venue.id, partialRules);
      if (res.success) {
        showSaved(successMsg);
      } else {
        alert(res.error || 'Failed to save rule change.');
      }
    } catch {
      alert('Unable to persist rule change. Check your network.');
    }
  };

  // Corkage Toggle
  const handleCorkageToggle = () => {
    const nextState = !corkageEnabled;
    setCorkageEnabled(nextState);
    const amount = nextState ? (parseInt(corkageFee, 10) || 10000) : 0;
    persistHouseRules({ corkageFee: amount }, nextState ? 'Corkage Rule Enabled' : 'Corkage Rule Disabled');
  };

  const handleCorkageBlur = () => {
    const amount = parseInt(corkageFee, 10) || 0;
    persistHouseRules({ corkageFee: amount }, `Corkage fee set to ₦${amount.toLocaleString()}`);
  };

  // Dress Code
  const handleDressCodeChange = (code: 'casual' | 'smart_casual' | 'formal' | 'nightlife') => {
    setDressCode(code);
    persistHouseRules({ dressCode: code }, `Dress Code set to ${code.replace('_', ' ').toUpperCase()}`);
  };

  // Cake Fee Toggle
  const handleCakeToggle = () => {
    const nextState = !cakeFeeEnabled;
    setCakeFeeEnabled(nextState);
    const amount = nextState ? (parseInt(cakeFee, 10) || 15000) : 0;
    persistHouseRules({ cakeFee: amount }, nextState ? 'Cake Fee Rule Enabled' : 'Cake Fee Rule Disabled');
  };

  const handleCakeBlur = () => {
    const amount = parseInt(cakeFee, 10) || 0;
    persistHouseRules({ cakeFee: amount }, `Cake fee set to ₦${amount.toLocaleString()}`);
  };

  // Min Spend Toggle
  const handleMinSpendToggle = () => {
    const nextState = !minSpendEnabled;
    setMinSpendEnabled(nextState);
    const amount = nextState ? (parseInt(minSpend, 10) || 50000) : 0;
    persistHouseRules({ minimumSpend: amount }, nextState ? 'Minimum Spend Enabled' : 'Minimum Spend Disabled');
  };

  const handleMinSpendBlur = () => {
    const amount = parseInt(minSpend, 10) || 0;
    persistHouseRules({ minimumSpend: amount }, `Minimum spend set to ₦${amount.toLocaleString()}`);
  };

  const handleSelectPresetCorkage = (amount: number) => {
    setCorkageFee(amount.toString());
    setCorkageEnabled(amount > 0);
    persistHouseRules({ corkageFee: amount }, amount > 0 ? `Corkage set to ₦${amount.toLocaleString()}` : 'Corkage is Free');
  };

  const handleSelectPresetCake = (amount: number) => {
    setCakeFee(amount.toString());
    setCakeFeeEnabled(amount > 0);
    persistHouseRules({ cakeFee: amount }, amount > 0 ? `Cake cutting fee set to ₦${amount.toLocaleString()}` : 'Cake cutting is Free');
  };

  const handleSelectPresetMinSpend = (amount: number) => {
    setMinSpend(amount.toString());
    setMinSpendEnabled(amount > 0);
    persistHouseRules({ minimumSpend: amount }, amount > 0 ? `Minimum spend set to ₦${amount.toLocaleString()}` : 'No Minimum Spend');
  };

  const handleSelectPresetDeposit = (amount: number) => {
    setReservationFee(amount.toString());
    setDepositEnabled(amount > 0);
    persistHouseRules({ reservationFee: amount }, amount > 0 ? `Table deposit set to ₦${amount.toLocaleString()}` : 'No Deposit Required');
  };

  const handleDepositToggle = () => {
    const nextState = !depositEnabled;
    setDepositEnabled(nextState);
    const amount = nextState ? (parseInt(reservationFee, 10) || 20000) : 0;
    persistHouseRules({ reservationFee: amount }, nextState ? 'Table Deposit Required' : 'No Deposit Required');
  };

  const handleDepositBlur = () => {
    const amount = parseInt(reservationFee, 10) || 0;
    persistHouseRules({ reservationFee: amount }, `Table deposit set to ₦${amount.toLocaleString()}`);
  };

  // --- VIBE INLINE MUTATIONS ---
  const handleDescriptionBlur = async () => {
    setIsEditingDesc(false);
    triggerHaptic('success');
    try {
      const res = await updateVenueVibeAction(venue.id, { description });
      if (res.success) {
        showSaved('Description auto-saved');
      }
    } catch {
      alert('Failed to save description.');
    }
  };

  const handleVibeTagToggle = async (tag: string) => {
    triggerHaptic('selection');
    const nextTags = vibeTags.includes(tag)
      ? vibeTags.filter((t) => t !== tag)
      : [...vibeTags, tag];
    setVibeTags(nextTags);

    try {
      const res = await updateVenueVibeAction(venue.id, { vibeTags: nextTags });
      if (res.success) {
        showSaved('Vibe tags updated');
      }
    } catch {
      alert('Failed to save vibe tags.');
    }
  };

  const handleCoverPhotoChange = async () => {
    const promptUrl = window.prompt('Enter image URL for your live cover photo:', coverUrl);
    if (!promptUrl || promptUrl === coverUrl) return;

    setCoverUrl(promptUrl);
    triggerHaptic('success');
    try {
      const res = await updateVenueVibeAction(venue.id, { coverUrl: promptUrl });
      if (res.success) {
        showSaved('Cover photo updated');
      }
    } catch {
      alert('Failed to update cover photo.');
    }
  };

  const AVAILABLE_VIBES = [
    'Dinner',
    'Cocktails',
    'Late night',
    'Rooftop vibe',
    'Date night',
    'Lounge',
    'Live DJ',
    'Brunch',
    'Fine dining',
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-[#121418] border border-[#00E575]/50 text-white text-xs font-mono font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E575] animate-ping" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ── Section Header ── */}
      <div className="bg-[#121418] text-[#F8F9FA] rounded-3xl border border-[#232732] p-6 sm:p-8 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#00E575] uppercase px-2.5 py-0.5 rounded-full bg-[#008751]/15 border border-[#008751]/30">
              VIBE CHECKS &amp; HOUSE RULES
            </span>
            <span className="text-white/20 font-mono">/</span>
            <span className="text-xs font-mono text-white/50">{venue.name}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Vibe Checks &amp; House Rules
          </h1>

          <p className="text-xs sm:text-sm text-white/60 max-w-xl leading-relaxed">
            Instant door policies and venue boundaries. Flip switches to broadcast what squads can expect tonight — auto-saved live without forms.
          </p>
        </div>
      </div>

      {/* ── 0. VIBE CHECKS (DOOR RULES & AMENITIES VISUAL SWITCHES) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00E575]" />
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Tonight&apos;s Vibe Checks
            </h2>
          </div>
          <span className="text-xs font-mono text-white/40">1-Tap Door Enforcement</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {VIBE_CHECKS_LIST.map((vc) => {
            const isToggled = vibeTags.includes(vc.id);
            return (
              <div
                key={vc.id}
                onClick={() => handleToggleVibeCheck(vc.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer tap-feedback space-y-2 select-none ${
                  isToggled
                    ? 'bg-[#008751]/15 border-[#00E575] text-white shadow-md'
                    : 'bg-[#121418] border-[#232732] text-white/70 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{vc.icon}</span>
                  <div
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 ${
                      isToggled ? 'bg-[#008751]' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        isToggled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{vc.label}</h3>
                  <p className="text-[11px] text-white/50 leading-tight mt-0.5">{vc.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HIGH-STAKES RULES INTEGRITY ALERT (REPLACES GENERIC COMPLETENESS) ── */}
      {(!corkageEnabled || parseInt(corkageFee, 10) === 0) && (
        <div className="bg-amber-950/30 border-2 border-amber-500/50 rounded-2xl p-4 flex items-start gap-3 text-amber-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-0.5 text-xs font-mono">
            <span className="font-bold uppercase tracking-wider block text-amber-200">
              ⚠️ HIGH-STAKES DOOR RISK: Missing Corkage Rule
            </span>
            <p className="text-amber-300/80 leading-relaxed">
              Squads browsing your spot will assume outside bottles and Hennessy are permitted at ₦0 corkage. Tap a preset chip below to lock your policy.
            </p>
          </div>
        </div>
      )}

      {/* ── SQUAD CONTRACT LIVE PREVIEW (SOCIAL-CARD PILLS) ── */}
      <div className="bg-[#121418] rounded-3xl border-2 border-white/10 p-5 sm:p-6 shadow-2xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E575]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00E575]">
              LIVE SQUAD CONTRACT (WHAT GUESTS SEE ON WHATSAPP &amp; OYAPLAN)
            </span>
          </div>
          <span className="text-[10px] font-mono text-white/40">Zero Surprises At Door</span>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono font-bold flex items-center gap-1.5">
            <Wine className="w-3.5 h-3.5 text-[#00E575]" />
            <span>
              Corkage: {corkageEnabled && parseInt(corkageFee, 10) > 0 ? `₦${parseInt(corkageFee, 10).toLocaleString()}` : 'Free / Allowed'}
            </span>
          </span>

          <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono font-bold flex items-center gap-1.5">
            <Cake className="w-3.5 h-3.5 text-[#00E575]" />
            <span>
              Cake Fee: {cakeFeeEnabled && parseInt(cakeFee, 10) > 0 ? `₦${parseInt(cakeFee, 10).toLocaleString()}` : 'Free / Allowed'}
            </span>
          </span>

          <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono font-bold flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#00E575]" />
            <span>
              Min Spend: {minSpendEnabled && parseInt(minSpend, 10) > 0 ? `₦${parseInt(minSpend, 10).toLocaleString()}` : 'No Minimum'}
            </span>
          </span>

          <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono font-bold flex items-center gap-1.5">
            <Shirt className="w-3.5 h-3.5 text-[#00E575]" />
            <span>{dressCode.replace('_', ' ').toUpperCase()}</span>
          </span>

          {vibeTags.includes('21+ Only') && (
            <span className="px-3 py-1.5 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs font-mono font-bold">
              🔞 21+ Strict ID
            </span>
          )}

          {vibeTags.includes('No Slippers') && (
            <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/80 text-xs font-mono font-bold">
              🚫 No Slippers / Slides
            </span>
          )}
        </div>
      </div>

      {/* ── 1. HOUSE RULES (PHYSICAL SWITCH TOGGLE CARDS) ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#00E575]" />
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Fee &amp; Deposit Boundaries
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Corkage Card */}
          <div className="bg-[#121418] rounded-3xl border border-[#232732] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#008751]/15 text-[#00E575] border border-[#008751]/30 flex items-center justify-center shrink-0">
                  <Wine className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Corkage Policy</h3>
                  <p className="text-xs text-white/50">Allow guests to bring outside wine/spirits</p>
                </div>
              </div>

              {/* Physical Toggle Switch */}
              <button
                type="button"
                onClick={handleCorkageToggle}
                className={`w-16 h-9 rounded-full transition-colors p-1 tap-feedback cursor-pointer ${
                  corkageEnabled ? 'bg-[#008751]' : 'bg-white/10'
                }`}
                aria-label="Toggle corkage policy"
              >
                <div
                  className={`w-7 h-7 rounded-full bg-white shadow-md transition-transform ${
                    corkageEnabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Conditional Expansion */}
            {corkageEnabled ? (
              <div className="space-y-3 pt-2 border-t border-[#232732] animate-in fade-in duration-150">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-white/50 uppercase block">Quick Preset Chips:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Free', val: 0 },
                      { label: '₦10,000', val: 10000 },
                      { label: '₦15,000', val: 15000 },
                      { label: '₦20,000', val: 20000 },
                      { label: '₦30,000', val: 30000 },
                    ].map((chip) => {
                      const isActive = corkageEnabled && parseInt(corkageFee, 10) === chip.val;
                      return (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => handleSelectPresetCorkage(chip.val)}
                          className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all tap-feedback cursor-pointer ${
                            isActive
                              ? 'bg-[#008751] text-white shadow-sm'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                          }`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-1 space-y-1.5">
                  <label className="text-[11px] font-mono text-white/70 uppercase">
                    Custom Corkage Fee in Naira (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm">₦</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={corkageFee}
                      onChange={(e) => setCorkageFee(e.target.value.replace(/\D/g, ''))}
                      onBlur={handleCorkageBlur}
                      placeholder="10000"
                      className="w-full h-12 pl-8 pr-4 rounded-xl bg-black/40 border border-[#232732] text-sm text-white font-mono focus:border-[#00E575] focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-white/40">Auto-saves on blur</span>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#232732] flex items-center justify-between text-xs font-mono text-white/40">
                <span>Outside bottles not permitted (or Free).</span>
                <span className="text-white/30 uppercase text-[10px]">Switch Off</span>
              </div>
            )}
          </div>

          {/* Cake Fee Card */}
          <div className="bg-[#121418] rounded-3xl border border-[#232732] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#008751]/15 text-[#00E575] border border-[#008751]/30 flex items-center justify-center shrink-0">
                  <Cake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Birthday Cake Fee</h3>
                  <p className="text-xs text-white/50">Fee for outside celebration cakes</p>
                </div>
              </div>

              {/* Physical Switch */}
              <button
                type="button"
                onClick={handleCakeToggle}
                className={`w-16 h-9 rounded-full transition-colors p-1 tap-feedback cursor-pointer ${
                  cakeFeeEnabled ? 'bg-[#008751]' : 'bg-white/10'
                }`}
                aria-label="Toggle cake fee"
              >
                <div
                  className={`w-7 h-7 rounded-full bg-white shadow-md transition-transform ${
                    cakeFeeEnabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Conditional Expansion */}
            {cakeFeeEnabled ? (
              <div className="space-y-3 pt-2 border-t border-[#232732] animate-in fade-in duration-150">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-white/50 uppercase block">Quick Preset Chips:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Free', val: 0 },
                      { label: '₦5,000', val: 5000 },
                      { label: '₦10,000', val: 10000 },
                      { label: '₦15,000', val: 15000 },
                      { label: '₦25,000', val: 25000 },
                    ].map((chip) => {
                      const isActive = cakeFeeEnabled && parseInt(cakeFee, 10) === chip.val;
                      return (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => handleSelectPresetCake(chip.val)}
                          className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all tap-feedback cursor-pointer ${
                            isActive
                              ? 'bg-[#008751] text-white shadow-sm'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                          }`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-1 space-y-1.5">
                  <label className="text-[11px] font-mono text-white/70 uppercase">
                    Custom Cake Cutting Fee in Naira (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm">₦</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={cakeFee}
                      onChange={(e) => setCakeFee(e.target.value.replace(/\D/g, ''))}
                      onBlur={handleCakeBlur}
                      placeholder="15000"
                      className="w-full h-12 pl-8 pr-4 rounded-xl bg-black/40 border border-[#232732] text-sm text-white font-mono focus:border-[#00E575] focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-white/40">Auto-saves on blur</span>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#232732] flex items-center justify-between text-xs font-mono text-white/40">
                <span>Outside cakes allowed free (₦0).</span>
                <span className="text-white/30 uppercase text-[10px]">Switch Off</span>
              </div>
            )}
          </div>

          {/* Table Minimum Spend Card */}
          <div className="bg-[#121418] rounded-3xl border border-[#232732] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#008751]/15 text-[#00E575] border border-[#008751]/30 flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Table Minimum Spend</h3>
                  <p className="text-xs text-white/50">Required baseline spend for seating</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleMinSpendToggle}
                className={`w-16 h-9 rounded-full transition-colors p-1 tap-feedback cursor-pointer ${
                  minSpendEnabled ? 'bg-[#008751]' : 'bg-white/10'
                }`}
                aria-label="Toggle minimum spend"
              >
                <div
                  className={`w-7 h-7 rounded-full bg-white shadow-md transition-transform ${
                    minSpendEnabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Conditional Expansion */}
            {minSpendEnabled ? (
              <div className="space-y-3 pt-2 border-t border-[#232732] animate-in fade-in duration-150">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-white/50 uppercase block">Quick Preset Chips:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'None', val: 0 },
                      { label: '₦30,000', val: 30000 },
                      { label: '₦50,000', val: 50000 },
                      { label: '₦100,000', val: 100000 },
                      { label: '₦250,000 VIP', val: 250000 },
                    ].map((chip) => {
                      const isActive = minSpendEnabled && parseInt(minSpend, 10) === chip.val;
                      return (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => handleSelectPresetMinSpend(chip.val)}
                          className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all tap-feedback cursor-pointer ${
                            isActive
                              ? 'bg-[#008751] text-white shadow-sm'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                          }`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-1 space-y-1.5">
                  <label className="text-[11px] font-mono text-white/70 uppercase">
                    Custom Minimum Spend in Naira (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm">₦</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={minSpend}
                      onChange={(e) => setMinSpend(e.target.value.replace(/\D/g, ''))}
                      onBlur={handleMinSpendBlur}
                      placeholder="50000"
                      className="w-full h-12 pl-8 pr-4 rounded-xl bg-black/40 border border-[#232732] text-sm text-white font-mono focus:border-[#00E575] focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-white/40">Auto-saves on blur</span>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#232732] flex items-center justify-between text-xs font-mono text-white/40">
                <span>Open seating without minimum table spend.</span>
                <span className="text-white/30 uppercase text-[10px]">Switch Off</span>
              </div>
            )}
          </div>

          {/* Table Deposit Fee Card */}
          <div className="bg-[#121418] rounded-3xl border border-[#232732] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#008751]/15 text-[#00E575] border border-[#008751]/30 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Table Booking Deposit</h3>
                  <p className="text-xs text-white/50">Direct deposit required to lock table</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDepositToggle}
                className={`w-16 h-9 rounded-full transition-colors p-1 tap-feedback cursor-pointer ${
                  depositEnabled ? 'bg-[#008751]' : 'bg-white/10'
                }`}
                aria-label="Toggle reservation deposit"
              >
                <div
                  className={`w-7 h-7 rounded-full bg-white shadow-md transition-transform ${
                    depositEnabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Conditional Expansion */}
            {depositEnabled ? (
              <div className="space-y-3 pt-2 border-t border-[#232732] animate-in fade-in duration-150">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-white/50 uppercase block">Quick Preset Chips:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Free', val: 0 },
                      { label: '₦10,000', val: 10000 },
                      { label: '₦20,000', val: 20000 },
                      { label: '₦50,000', val: 50000 },
                    ].map((chip) => {
                      const isActive = depositEnabled && parseInt(reservationFee, 10) === chip.val;
                      return (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => handleSelectPresetDeposit(chip.val)}
                          className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all tap-feedback cursor-pointer ${
                            isActive
                              ? 'bg-[#008751] text-white shadow-sm'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                          }`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-1 space-y-1.5">
                  <label className="text-[11px] font-mono text-white/70 uppercase">
                    Custom Deposit Amount in Naira (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm">₦</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={reservationFee}
                      onChange={(e) => setReservationFee(e.target.value.replace(/\D/g, ''))}
                      onBlur={handleDepositBlur}
                      placeholder="20000"
                      className="w-full h-12 pl-8 pr-4 rounded-xl bg-black/40 border border-[#232732] text-sm text-white font-mono focus:border-[#00E575] focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-white/40">100% paid directly to venue account</span>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#232732] flex items-center justify-between text-xs font-mono text-white/40">
                <span>Free reservations without hold deposit.</span>
                <span className="text-white/30 uppercase text-[10px]">Switch Off</span>
              </div>
            )}
          </div>
        </div>

        {/* Dress Code Physical Selector (Full Width) */}
        <div className="bg-[#121418] rounded-3xl border border-[#232732] p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#008751]/15 text-[#00E575] border border-[#008751]/30 flex items-center justify-center shrink-0">
              <Shirt className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Dress Code Boundary</h3>
              <p className="text-xs text-white/50">What customer attire is enforced at the door</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { id: 'casual', label: 'Casual', desc: 'No strict dress enforcement' },
              { id: 'smart_casual', label: 'Smart Casual', desc: 'Collared shirts, no slippers' },
              { id: 'nightlife', label: 'Nightlife Chic', desc: 'High energy, elevated evening' },
              { id: 'formal', label: 'Black Tie / Formal', desc: 'Strict dress policy' },
            ].map((option) => {
              const isSelected = dressCode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleDressCodeChange(option.id as any)}
                  className={`p-4 rounded-2xl border text-left transition-all tap-feedback cursor-pointer ${
                    isSelected
                      ? 'bg-[#008751]/20 border-[#00E575] ring-1 ring-[#00E575] text-white shadow-lg'
                      : 'bg-white/5 border-[#232732] text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold uppercase">{option.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#00E575]" />}
                  </div>
                  <p className="text-[11px] text-white/40 leading-tight">{option.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 2. THE VIBE / LIVE PRESENTATION (DIRECT INLINE EDITING) ── */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00E575]" />
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              The Live Vibe (Customer View)
            </h2>
          </div>
          <span className="text-xs font-mono text-white/40">Tap elements directly to edit</span>
        </div>

        {/* Live Presentation Preview Card */}
        <div className="bg-[#121418] rounded-3xl border border-[#232732] overflow-hidden shadow-2xl">
          {/* Cover Photo: Tap to change */}
          <div
            onClick={handleCoverPhotoChange}
            className="relative w-full h-64 sm:h-80 bg-black/60 cursor-pointer group overflow-hidden"
            title="Tap to change cover photo"
          >
            <Image
              src={coverUrl}
              alt={venue.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 1024px) 100vw, 800px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121418] via-black/40 to-transparent" />

            <div className="absolute bottom-4 right-4 px-3.5 py-2 rounded-xl bg-black/80 backdrop-blur-md text-white font-mono text-xs font-bold border border-white/20 flex items-center gap-2 group-hover:bg-[#008751] transition-colors">
              <Camera className="w-4 h-4 text-[#00E575] group-hover:text-white" />
              <span>Tap to Change Cover</span>
            </div>

            <div className="absolute bottom-4 left-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00E575] bg-[#008751]/20 px-3 py-1 rounded-full border border-[#008751]/40">
                {venue.category}
              </span>
            </div>
          </div>

          {/* Presentation Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {venue.name}
              </h3>
              <p className="text-xs sm:text-sm text-white/60 font-mono mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#00E575]" />
                <span>{venue.address || 'Lagos, Nigeria'}</span>
              </p>
            </div>

            {/* Description: Tap text to edit */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">
                Venue Description (Tap to edit)
              </span>

              {isEditingDesc ? (
                <textarea
                  autoFocus
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleDescriptionBlur}
                  className="w-full p-4 rounded-xl bg-black/60 border border-[#00E575] text-white text-sm leading-relaxed focus:outline-none"
                />
              ) : (
                <p
                  onClick={() => setIsEditingDesc(true)}
                  className="text-sm sm:text-base text-white/80 leading-relaxed cursor-pointer p-3 -ml-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                >
                  {description}
                </p>
              )}
            </div>

            {/* Vibe Tags: Tap to toggle */}
            <div className="space-y-2 pt-2 border-t border-[#232732]">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">
                Experience Tags (Tap to toggle)
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {AVAILABLE_VIBES.map((tag) => {
                  const isTagged = vibeTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleVibeTagToggle(tag)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all tap-feedback cursor-pointer ${
                        isTagged
                          ? 'bg-[#008751] text-white shadow-sm'
                          : 'bg-white/5 text-white/50 hover:text-white border border-[#232732]'
                      }`}
                    >
                      {isTagged ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
