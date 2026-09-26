"use client";

import React, { useState } from "react";
import { submitActualSpend, ActualSpendResult } from "@/lib/actions/submitActualSpend";
import { CheckCircle2, Loader2, Sparkles, AlertCircle, HelpCircle, ArrowRight, RotateCcw } from "lucide-react";
import { trackEvent } from "@/lib/analytics/trackClient";

interface PlanActualSpendPromptProps {
  sharedPlanId: string;
  spotId: string | null;
  estimatedTotal: number;
  spotName: string;
  plannedSquadSize?: number;
}

export function PlanActualSpendPrompt({
  sharedPlanId,
  spotId,
  estimatedTotal,
  spotName,
  plannedSquadSize = 2,
}: PlanActualSpendPromptProps) {
  // Step: 1 = Did you go?, 2 = Spend collection, 3 = Pricing accuracy & context, 4 = Success
  const [step, setStep] = useState<"check_in" | "spend_form" | "not_visited" | "submitted">("check_in");
  const [didGo, setDidGo] = useState<boolean | null>(null);
  const [notVisitedReason, setNotVisitedReason] = useState<string>("plans_changed");
  const [actualTotal, setActualTotal] = useState("");
  const [actualSquadSize, setActualSquadSize] = useState<number>(plannedSquadSize);
  const [pricesMatched, setPricesMatched] = useState<"yes" | "mostly" | "no" | "not_sure">("yes");
  const [operationalIssue, setOperationalIssue] = useState<"none" | "extra_fee" | "wrong_hours" | "closed" | "other">("none");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ActualSpendResult | null>(null);

  const handleSelectDidGo = (went: boolean) => {
    setDidGo(went);
    if (went) {
      setStep("spend_form");
      trackEvent("actual_spend_started", {
        category: "Feedback",
        plan_id: sharedPlanId,
        spot_id: spotId || "unknown",
        version: "1.0",
      });
    } else {
      setStep("not_visited");
    }
  };

  const handleNotVisitedSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await submitActualSpend({
        sharedPlanId,
        spotId,
        estimatedTotal,
        didGo: false,
        didNotGoReason: notVisitedReason,
        operationalIssue: notVisitedReason === "venue_closed" ? "closed" : "none",
      });
      setLoading(false);
      if (res.success) {
        setResult(res);
        setStep("submitted");
      } else {
        setError(res.error || "Failed to record status. Please try again.");
      }
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  };

  const handleSpendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = parseInt(actualTotal.replace(/[^0-9]/g, ""), 10);
    if (!parsed || parsed <= 0) {
      setError("Enter a valid spend amount in Naira.");
      return;
    }
    if (parsed > 10_000_000) {
      setError("Amount seems too high. Please check the digits.");
      return;
    }

    setLoading(true);
    try {
      const res = await submitActualSpend({
        sharedPlanId,
        spotId,
        estimatedTotal,
        actualTotal: parsed,
        plannedSquadSize,
        actualSquadSize,
        didGo: true,
        pricesMatched,
        operationalIssue: operationalIssue === "none" ? null : operationalIssue,
        notes: notes || undefined,
      });

      setLoading(false);
      if (res.success) {
        setResult(res);
        setStep("submitted");
        trackEvent("actual_spend_submitted", {
          category: "Feedback",
          shared_plan_id: sharedPlanId,
          spot_id: spotId || undefined,
          actual_total: parsed,
          estimated_total: estimatedTotal,
          version: "1.0",
        });
      } else {
        setError(res.error || "Something went wrong. Please try again.");
      }
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  };

  // Step 4: Submitted Confirmation State
  if (step === "submitted") {
    if (result && !result.didGo) {
      return (
        <section aria-label="Feedback received" className="bg-[#FAFAF8] border border-[#E5E7EB] rounded-2xl p-5 text-left space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#008751] shrink-0" />
            <h3 className="text-sm font-black text-midnight-lagoon">
              Got it — thanks for letting us know.
            </h3>
          </div>
          <p className="text-xs text-text-muted pl-7">
            We won&apos;t count this against accuracy metrics since the outing did not take place.
          </p>
        </section>
      );
    }

    const variance = result?.variance;
    const diff = variance?.varianceAmount || 0;
    const isOver = diff > 0;
    const absDiff = Math.abs(diff);

    return (
      <section aria-label="Spend report recorded" className="bg-[#EAFDF3] border border-[#A3F3C6] rounded-2xl p-5 text-left space-y-2.5 animate-in fade-in">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#008751] shrink-0" />
          <h3 className="text-sm font-black text-midnight-lagoon">
            Thank you! That powers the OyaPlan intelligence loop.
          </h3>
        </div>

        <div className="text-xs text-text-secondary pl-7 space-y-1">
          <p>
            OyaPlan estimated <strong>₦{estimatedTotal.toLocaleString("en-NG")}</strong>. You reported <strong>₦{parseInt(actualTotal.replace(/[^0-9]/g, ""), 10).toLocaleString("en-NG")}</strong>.
          </p>
          {absDiff > 500 && (
            <p className="text-[#0A7C3F] font-bold">
              {absDiff > 0 ? (
                <>Difference: ₦{absDiff.toLocaleString("en-NG")} {isOver ? "above estimate" : "below estimate"}.</>
              ) : (
                <>Exact match with estimate!</>
              )}
            </p>
          )}
          <p className="text-[11px] text-text-muted pt-1">
            Every real outing report calibrates future recommendations for other planners.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Actual spend comparison" className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6 shadow-xs text-left space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F3EF]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#008751]/10 text-[#008751] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-midnight-lagoon">
              How did your actual spend compare?
            </h3>
            <p className="text-[11px] text-text-muted">
              Estimated ~₦{estimatedTotal.toLocaleString("en-NG")} for {plannedSquadSize} {plannedSquadSize === 1 ? "person" : "people"}
            </p>
          </div>
        </div>

        {step !== "check_in" && (
          <button
            type="button"
            onClick={() => setStep("check_in")}
            className="text-[11px] font-bold text-text-muted hover:text-midnight-lagoon flex items-center gap-1 tap-feedback cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Back</span>
          </button>
        )}
      </div>

      {/* STEP 1: Check-in (Did you go?) */}
      {step === "check_in" && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-midnight-lagoon">
            Did you end up going to <strong>{spotName}</strong>?
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleSelectDidGo(true)}
              className="py-3 px-4 rounded-xl bg-[#008751] hover:bg-[#007043] text-white font-black text-xs uppercase tracking-wider transition-colors tap-feedback shadow-xs cursor-pointer"
            >
              Yes, we went
            </button>
            <button
              type="button"
              onClick={() => handleSelectDidGo(false)}
              className="py-3 px-4 rounded-xl bg-[#FAFAF8] hover:bg-surface-grey border border-[#E5E7EB] text-text-secondary font-bold text-xs transition-colors tap-feedback cursor-pointer"
            >
              Didn&apos;t go
            </button>
          </div>
        </div>
      )}

      {/* STEP 1b: If User Did Not Go */}
      {step === "not_visited" && (
        <div className="space-y-3 animate-in fade-in">
          <p className="text-xs font-bold text-midnight-lagoon">
            Why didn&apos;t the outing happen?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: "Changed plans", val: "plans_changed" },
              { label: "Venue was closed", val: "venue_closed" },
              { label: "Squad canceled", val: "squad_canceled" },
              { label: "Budget / Other", val: "other" },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setNotVisitedReason(opt.val)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-left transition-all tap-feedback cursor-pointer ${
                  notVisitedReason === opt.val
                    ? "bg-midnight-lagoon border-midnight-lagoon text-white shadow-xs"
                    : "bg-[#FAFAF8] border-[#E5E7EB] text-text-secondary hover:border-gray-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleNotVisitedSubmit}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-midnight-lagoon text-white font-black text-xs uppercase tracking-wider disabled:opacity-40 tap-feedback flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Status"}
          </button>
        </div>
      )}

      {/* STEP 2: Spend & Accuracy Form */}
      {step === "spend_form" && (
        <form onSubmit={handleSpendSubmit} className="space-y-4 animate-in fade-in">
          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-midnight-lagoon block">
              What was your total squad spend?
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted pointer-events-none">
                ₦
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 48,000"
                value={actualTotal}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9,]/g, "");
                  setActualTotal(raw);
                }}
                className="w-full h-11 pl-8 pr-3 bg-[#FAFAF8] border border-[#E5E7EB] rounded-xl text-sm font-bold text-midnight-lagoon focus:bg-white focus:outline-none focus:border-[#008751] transition-all"
                aria-label="Actual total spend in Naira"
                required
              />
            </div>
          </div>

          {/* Pricing Match question */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-midnight-lagoon block">
              Did menu prices match what was listed on OyaPlan?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { label: "Yes", val: "yes" },
                { label: "Mostly", val: "mostly" },
                { label: "No", val: "no" },
                { label: "Not sure", val: "not_sure" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setPricesMatched(opt.val as any)}
                  className={`py-2 px-2 rounded-lg border text-xs font-bold text-center transition-all tap-feedback cursor-pointer ${
                    pricesMatched === opt.val
                      ? "bg-[#008751] border-[#008751] text-white shadow-xs"
                      : "bg-[#FAFAF8] border-[#E5E7EB] text-text-secondary hover:border-[#008751]/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Any unexpected issues */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-midnight-lagoon block">
              Was anything unexpected or missing?
            </label>
            <select
              value={operationalIssue}
              onChange={(e) => setOperationalIssue(e.target.value as any)}
              className="w-full h-10 px-3 bg-[#FAFAF8] border border-[#E5E7EB] rounded-xl text-xs font-bold text-midnight-lagoon focus:bg-white focus:outline-none focus:border-[#008751] cursor-pointer"
            >
              <option value="none">No issues — everything matched expectations</option>
              <option value="extra_fee">Unexpected mandatory charge / service fee</option>
              <option value="wrong_hours">Listed opening hours were incorrect</option>
              <option value="closed">Venue was closed</option>
              <option value="other">Other detail needs updating</option>
            </select>
          </div>

          {/* Optional context note */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted block">
              Optional context (e.g. &ldquo;Upgraded to cocktail pitcher&rdquo;)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              placeholder="Add short note..."
              className="w-full h-9 px-3 bg-[#FAFAF8] border border-[#E5E7EB] rounded-lg text-xs text-midnight-lagoon focus:bg-white focus:outline-none focus:border-[#008751]"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !actualTotal}
            className="w-full h-11 bg-[#008751] hover:bg-[#007043] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 tap-feedback cursor-pointer shadow-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Spend Report"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      )}
    </section>
  );
}
