'use client';

import React, { useState } from 'react';
import { verifyVenueVisitAction, VerifyVisitResult } from '@/lib/actions/venueAttributionActions';
import { normalizePlanCode } from '@/lib/utils/planCodeUtils';
import { trackEvent } from '@/lib/analytics/trackClient';
import { Users, CheckCircle2, AlertCircle, Loader2, QrCode, ShieldCheck, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AttributionVerifyCardProps {
  venueId: string;
}

export function AttributionVerifyCard({ venueId }: AttributionVerifyCardProps) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerifyVisitResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setVerifying(true);
    setResult(null);

    const normalized = normalizePlanCode(code);
    trackEvent('visit_confirmation_attempted', {
      category: 'Operations',
      venue_id: venueId,
      plan_code: normalized,
      version: '1.0',
    });

    const res = await verifyVenueVisitAction(venueId, code);
    setVerifying(false);
    setResult(res);

    if (res.success) {
      trackEvent('visit_confirmation_succeeded', {
        category: 'Operations',
        venue_id: venueId,
        plan_code: normalized,
        already_confirmed: Boolean(res.alreadyConfirmed),
        version: '1.0',
      });
      router.refresh();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase();
    setCode(raw);
    if (result) setResult(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-default pb-3.5">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-green uppercase tracking-wider">
            <QrCode className="w-3.5 h-3.5" />
            <span>Squad Visit Verification</span>
          </div>
          <h3 className="text-base font-extrabold text-midnight-lagoon mt-0.5">
            Confirm Guest Plan Code
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            When guests arrive with an OyaPlan code on their phone, confirm it below to connect planning intent to real visits.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] rounded-xl border border-[#EAE4DC] text-[11px] text-text-secondary font-medium shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
          <span>Visit Confirmation · Not A Payment</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={code}
            onChange={handleInputChange}
            placeholder="e.g. OYA-7K4M2P"
            maxLength={10}
            className="w-full h-11 px-3.5 rounded-xl border-2 border-border-default bg-[#FAF7F2] text-sm font-mono font-bold tracking-wider text-midnight-lagoon focus:bg-white focus:outline-none focus:border-brand-green uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:tracking-normal"
          />
        </div>

        <button
          type="submit"
          disabled={verifying || !code.trim()}
          className="h-11 px-5 bg-midnight-lagoon hover:bg-[#07150E] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer tap-feedback shadow-xs disabled:opacity-50 shrink-0"
        >
          {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>Confirm Squad Visit</span>
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div
          className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-150 ${
            result.success
              ? 'bg-[#EAFDF3] border-[#A3F3C6] text-[#0A7C3F]'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {result.success ? (
              <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{result.message || result.error}</span>
          </div>

          {result.success && result.visit && (
            <div className="pt-2 border-t border-[#A3F3C6]/60 text-midnight-lagoon space-y-1.5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2 bg-white/80 rounded-lg">
                  <span className="text-[10px] text-text-muted block">Plan Code</span>
                  <span className="font-mono font-bold text-xs">{result.visit.plan_code}</span>
                </div>
                <div className="p-2 bg-white/80 rounded-lg">
                  <span className="text-[10px] text-text-muted block">Squad Size</span>
                  <span className="font-bold text-xs flex items-center gap-1">
                    <Users className="w-3 h-3 text-text-muted" />
                    {result.visit.squad_size} guests
                  </span>
                </div>
                {result.visit.estimated_total_cost && (
                  <div className="p-2 bg-white/80 rounded-lg col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-text-muted block">Planned Budget</span>
                    <span className="font-mono font-bold text-xs">
                      ₦{result.visit.estimated_total_cost.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Strict Fact Separation Notice */}
              <p className="text-[10px] text-text-muted leading-relaxed pt-1">
                A venue operator confirmed that this OyaPlan plan was presented and the squad visited. This records confirmed visit intent, not captured revenue or table holding.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
