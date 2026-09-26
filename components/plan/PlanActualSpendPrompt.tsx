'use client';

import React, { useState } from 'react';
import { submitActualSpend } from '@/lib/actions/submitActualSpend';
import { CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface PlanActualSpendPromptProps {
  sharedPlanId: string;
  spotId: string | null;
  estimatedTotal: number;
  spotName: string;
}

export function PlanActualSpendPrompt({
  sharedPlanId,
  spotId,
  estimatedTotal,
  spotName,
}: PlanActualSpendPromptProps) {
  const [actualTotal, setActualTotal] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = parseInt(actualTotal.replace(/[^0-9]/g, ''), 10);
    if (!parsed || parsed <= 0) {
      setError('Enter a valid amount in Naira.');
      return;
    }
    if (parsed > 10_000_000) {
      setError('Amount seems too high. Please double check.');
      return;
    }

    setLoading(true);
    try {
      const result = await submitActualSpend({
        sharedPlanId,
        spotId,
        estimatedTotal,
        actualTotal: parsed,
      });
      setLoading(false);

      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || 'Something went wrong. Try again.');
      }
    } catch {
      setLoading(false);
      setError('Network error. Please try again.');
    }
  };

  if (submitted) {
    const parsed = parseInt(actualTotal.replace(/[^0-9]/g, ''), 10) || 0;
    const diff = parsed - estimatedTotal;
    const overUnder = diff > 0 ? 'over' : 'under';
    const absDiff = Math.abs(diff);

    return (
      <section className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-5 space-y-2 animate-slide-up">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#008751] shrink-0" />
          <h3 className="text-sm font-bold text-[#065F46]">
            Thank you! That powers the OyaPlan intelligence loop.
          </h3>
        </div>
        {absDiff > 500 && (
          <p className="text-xs text-[#047857] pl-7">
            You spent ₦{absDiff.toLocaleString('en-NG')} {overUnder} our estimate for {spotName}. We
            will factor this into future squad recommendations.
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="bg-white border border-border-default rounded-2xl p-4 sm:p-6 shadow-xs space-y-3">
      <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
        <div className="w-7 h-7 rounded-lg bg-[#008751]/10 text-[#008751] flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-black text-midnight-lagoon">
            How much did you actually spend?
          </h3>
          <p className="text-[11px] text-text-muted">
            Estimated ~₦{estimatedTotal.toLocaleString('en-NG')} · Anonymous community reporting
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">
              ₦
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 75,000"
              value={actualTotal}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9,]/g, '');
                setActualTotal(raw);
              }}
              className="w-full h-11 pl-8 pr-3 bg-surface-grey border border-border-default rounded-xl text-xs font-mono font-bold text-midnight-lagoon focus:bg-white focus:outline-none focus:border-[#008751] transition-all"
              aria-label="Actual total spend in Naira"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !actualTotal}
            className="h-11 px-5 bg-[#008751] hover:bg-[#007043] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 tap-feedback cursor-pointer shadow-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Spend'}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </p>
        )}
      </form>
    </section>
  );
}
