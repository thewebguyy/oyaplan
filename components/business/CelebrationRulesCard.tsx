'use client';

import React, { useState } from 'react';
import { updateStructuredChargesAction } from '@/lib/actions/partnerPricingActions';
import { PolicyVerificationStatus } from '@/lib/types';
import { trackEvent } from '@/lib/analytics/trackClient';
import { Sparkles, CheckCircle2, Loader2, Cake, Wine, Camera, PartyPopper, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CelebrationRulesCardProps {
  venueId: string;
  initialCakeFee?: number | null;
  initialSpiritCorkageFee?: number | null;
  initialDecorFee?: number | null;
  initialPhotoShootFee?: number | null;
  initialCelebrationNotes?: string | null;
  status?: PolicyVerificationStatus;
  updatedAt?: string | null;
}

type FeeOption = 'not_specified' | 'free' | 'fixed';

interface FeeState {
  option: FeeOption;
  amount: number;
}

function parseInitialFee(val?: number | null): FeeState {
  if (val === null || val === undefined) {
    return { option: 'not_specified', amount: 0 };
  }
  if (val === 0) {
    return { option: 'free', amount: 0 };
  }
  return { option: 'fixed', amount: val };
}

function resolveFeeValue(state: FeeState): number | null {
  if (state.option === 'not_specified') return null;
  if (state.option === 'free') return 0;
  return Math.max(0, state.amount);
}

export function CelebrationRulesCard({
  venueId,
  initialCakeFee,
  initialSpiritCorkageFee,
  initialDecorFee,
  initialPhotoShootFee,
  initialCelebrationNotes,
  status = 'unverified',
  updatedAt,
}: CelebrationRulesCardProps) {
  const router = useRouter();

  const [cakeFee, setCakeFee] = useState<FeeState>(() => parseInitialFee(initialCakeFee));
  const [spiritCorkage, setSpiritCorkage] = useState<FeeState>(() => parseInitialFee(initialSpiritCorkageFee));
  const [decorFee, setDecorFee] = useState<FeeState>(() => parseInitialFee(initialDecorFee));
  const [photoFee, setPhotoFee] = useState<FeeState>(() => parseInitialFee(initialPhotoShootFee));
  const [notes, setNotes] = useState(initialCelebrationNotes || '');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSavedSuccess(false);

    const res = await updateStructuredChargesAction({
      venueId,
      cakeFee: resolveFeeValue(cakeFee),
      spiritCorkageFee: resolveFeeValue(spiritCorkage),
      decorFee: resolveFeeValue(decorFee),
      photoShootFee: resolveFeeValue(photoFee),
      celebrationNotes: notes.trim() || null,
    });

    setSaving(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to save celebration rules');
      return;
    }

    trackEvent('celebration_rules_updated_in_portal', {
      category: 'Operations',
      venue_id: venueId,
      has_cake_fee: cakeFee.option === 'fixed',
      has_corkage_fee: spiritCorkage.option === 'fixed',
      version: '1.0',
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
    router.refresh();
  };

  const renderFeeRow = (
    label: string,
    subtext: string,
    icon: React.ReactNode,
    state: FeeState,
    onChange: (next: FeeState) => void
  ) => {
    return (
      <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DC]/70 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#7A3E1D]">{icon}</span>
            <span className="text-xs font-bold text-midnight-lagoon">{label}</span>
          </div>
          <span className="text-[10px] text-text-muted">{subtext}</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => onChange({ ...state, option: 'not_specified' })}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border ${
              state.option === 'not_specified'
                ? 'bg-midnight-lagoon text-white border-midnight-lagoon shadow-xs'
                : 'bg-white text-text-secondary border-border-default hover:border-gray-300'
            }`}
          >
            Not Specified
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...state, option: 'free', amount: 0 })}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border ${
              state.option === 'free'
                ? 'bg-brand-green text-white border-brand-green shadow-xs'
                : 'bg-white text-text-secondary border-border-default hover:border-gray-300'
            }`}
          >
            Free / ₦0
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...state, option: 'fixed', amount: state.amount || 10000 })}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border ${
              state.option === 'fixed'
                ? 'bg-[#7A3E1D] text-white border-[#7A3E1D] shadow-xs'
                : 'bg-white text-text-secondary border-border-default hover:border-gray-300'
            }`}
          >
            Fixed Fee
          </button>
        </div>

        {state.option === 'fixed' && (
          <div className="pt-2 flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-text-muted">₦</span>
            <input
              type="number"
              min="0"
              step="1000"
              value={state.amount || ''}
              onChange={(e) => onChange({ ...state, amount: parseInt(e.target.value, 10) || 0 })}
              placeholder="Fee in Naira (e.g. 15000)"
              className="w-full h-8 px-2.5 rounded-lg border border-border-default bg-white text-xs font-mono font-bold text-midnight-lagoon focus:outline-none focus:border-brand-green"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-default pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#7A3E1D] uppercase tracking-wider flex items-center gap-1">
              <PartyPopper className="w-3.5 h-3.5" /> Celebrations &amp; Corkage Policies
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-[10px] text-text-muted">
              {status === 'verified' ? 'Verified by OyaPlan' : status === 'owner_submitted' ? 'Owner Confirmed' : 'Unconfirmed'}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-midnight-lagoon mt-0.5">
            Outside Cake, Corkage &amp; Photo Fees
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Surprise cake cutting or corkage fees ruin squad celebrations. Clearly distinguish between allowed-free, fee-based, and unconfirmed policies.
          </p>
        </div>

        {updatedAt && (
          <span className="text-[10px] text-text-muted shrink-0">
            Last updated: {new Date(updatedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {renderFeeRow(
            'Outside Cake Fee',
            'Bringing birthday/celebration cake',
            <Cake className="w-4 h-4" />,
            cakeFee,
            setCakeFee
          )}

          {renderFeeRow(
            'Spirit / Wine Corkage',
            'Bringing own bottle of spirit/wine',
            <Wine className="w-4 h-4" />,
            spiritCorkage,
            setSpiritCorkage
          )}

          {renderFeeRow(
            'Decor Setup Fee',
            'Balloons, floral backdrops, squad signs',
            <Sparkles className="w-4 h-4" />,
            decorFee,
            setDecorFee
          )}

          {renderFeeRow(
            'Professional Camera / Shoot Fee',
            'DSLR cameras or commercial photography',
            <Camera className="w-4 h-4" />,
            photoFee,
            setPhotoFee
          )}
        </div>

        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-bold text-text-secondary block">
            Celebration Notes &amp; Rules
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Sparklers not allowed indoors. Cake cutting knife provided free upon request."
            className="w-full p-2.5 rounded-xl border border-border-default bg-white text-xs text-midnight-lagoon focus:outline-none focus:border-brand-green font-medium"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[10px] text-text-muted">
            Unspecified rules display as "Inquire with venue" on squad budgets, protecting you from misquoting.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="h-9 px-4 bg-midnight-lagoon hover:bg-[#07150E] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer tap-feedback shadow-xs disabled:opacity-50 shrink-0"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : savedSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
            ) : null}
            <span>{savedSuccess ? 'Rules Saved' : 'Save Celebration Rules'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
