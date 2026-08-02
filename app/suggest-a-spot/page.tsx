"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Loader2, Award, Flame, Wallet, UserCheck } from "lucide-react";
import { submitSpotSuggestion } from "@/lib/actions/submitSpotSuggestion";
import { triggerMoment } from "@/components/ui/moment-of-delight";

export default function SuggestSpotPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [formData, setFormData] = useState({
    spotName: "",
    location: "",
    estimatedPrice: "30000",
    vibe: "Chill",
    comment: "",
    whatsapp: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Record submission count in localStorage for local Scout progression
    try {
      const existingSubmissions = JSON.parse(localStorage.getItem("oyaplan_scout_submissions") || "[]");
      existingSubmissions.push({
        spotName: formData.spotName,
        location: formData.location,
        timestamp: Date.now()
      });
      localStorage.setItem("oyaplan_scout_submissions", JSON.stringify(existingSubmissions));

      // Also tag user as an active Scout
      const userProfile = JSON.parse(localStorage.getItem("oyaplan_user_profile") || "{}");
      localStorage.setItem("oyaplan_user_profile", JSON.stringify({
        ...userProfile,
        isScout: true,
        scoutBadgesCount: (existingSubmissions.length)
      }));
    } catch { /* ignore localStorage errors */ }

    const result = await submitSpotSuggestion({
      spotName: formData.spotName,
      areaName: formData.location,
      roughPricePerPerson: parseInt(formData.estimatedPrice) || 30000,
      vibeDescription: `${formData.vibe}: ${formData.comment}`,
      suggesterWhatsapp: formData.whatsapp || null
    });

    setLoading(false);
    if (result.success) {
      setSuccess(true);
      triggerMoment("venue_suggested");
    } else {
      setError(true);
    }
  };

  if (success) {
    return (
      <main className="min-h-[100dvh] bg-surface-grey flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-border-default rounded-[32px] p-8 md:p-10 text-center space-y-6 shadow-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-amber-50 border-2 border-amber-200 rounded-full flex items-center justify-center shadow-inner">
              <Award className="w-10 h-10 text-amber-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
              🏅 Official Lagos Scout
            </span>
            <h1 className="type-heading text-text-primary text-2xl font-black">You&apos;re an OyaPlan Scout!</h1>
            <p className="type-body text-text-muted max-w-sm mx-auto text-sm leading-relaxed">
              Your spot suggestion <span className="font-bold text-text-primary">&quot;{formData.spotName}&quot;</span> has been logged. We&apos;re verifying prices with their menu. You&apos;ll get notified when it goes live.
            </p>
          </div>

          <div className="p-4 bg-surface-grey rounded-2xl border border-border-default/60 text-xs text-text-secondary text-left space-y-1">
            <div className="flex items-center gap-2 font-bold text-brand-green">
              <UserCheck className="w-4 h-4" />
              <span>Scout Impact</span>
            </div>
            <p className="text-text-muted">You are helping Lagos squads know what they&apos;ll spend before leaving home. No surprises.</p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({
                  spotName: "",
                  location: "",
                  estimatedPrice: "30000",
                  vibe: "Chill",
                  comment: "",
                  whatsapp: ""
                });
              }}
              className="w-full bg-brand-green hover:bg-brand-green-70 text-white type-label h-12 rounded-[14px] tap-feedback shadow-none border-none font-bold"
            >
              Suggest Another Spot 🏅
            </button>
            <Link href="/account">
              <Button variant="outline" className="w-full h-12 rounded-[14px] border-border-default type-label text-text-primary hover:bg-surface-grey">
                View My Scout Profile
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-surface-grey p-4 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 type-label text-text-muted hover:text-brand-green mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Planner
        </Link>

        {/* Live Community Activity Banner */}
        <div className="mb-6 bg-gradient-to-r from-midnight-lagoon to-[#001D12] text-white p-4 sm:p-5 rounded-[24px] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-intent-yellow fill-intent-yellow" />
            </div>
            <div>
              <p className="text-xs font-bold text-intent-yellow uppercase tracking-wider">Community Power</p>
              <p className="text-sm font-semibold text-white">14 spots verified by Lagos Scouts this week</p>
            </div>
          </div>
          <div className="text-[11px] text-white/70 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
            📍 Lekki & Yaba high demand
          </div>
        </div>

        <div className="bg-white border border-border-default rounded-[32px] p-6 md:p-12 shadow-sm space-y-8 relative z-10">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
              <Award className="w-4 h-4 text-amber-600" />
              <span className="type-ui-label text-amber-900 text-xs font-extrabold uppercase tracking-wider">OyaPlan Scout Program</span>
            </div>
            <h1 className="type-heading text-text-primary text-2xl md:text-3xl font-black">
              Help Us Map Lagos.
            </h1>
            <p className="type-body text-text-muted max-w-lg text-sm">
              Know a hidden gem or fresh linkup spot? Tell us about it to unlock your **OyaPlan Scout Badge** 🏅.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="type-label text-text-secondary ml-1 font-bold text-xs uppercase tracking-wider">Spot Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Moist Beach Club, Buka Hut"
                  className="h-14 w-full bg-surface-grey border border-border-default rounded-[16px] px-4 type-body focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all text-sm font-semibold"
                  value={formData.spotName}
                  onChange={(e) => setFormData({ ...formData, spotName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="type-label text-text-secondary ml-1 font-bold text-xs uppercase tracking-wider">Neighborhood / Area *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Lekki Phase 1, Yaba, Ikeja GRA"
                    className="h-14 w-full bg-surface-grey border border-border-default rounded-[16px] pl-10 pr-4 type-body focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all text-sm font-semibold"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="type-label text-text-secondary ml-1 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-brand-green" /> Est. Spend per Person (₦)
                </label>
                <select
                  value={formData.estimatedPrice}
                  onChange={(e) => setFormData({ ...formData, estimatedPrice: e.target.value })}
                  className="h-14 w-full bg-surface-grey border border-border-default rounded-[16px] px-4 type-body focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all text-sm font-semibold"
                >
                  <option value="15000">Under ₦15,000 range</option>
                  <option value="30000">₦15,000 – ₦30,000 range</option>
                  <option value="50000">₦30,000 – ₦50,000 range</option>
                  <option value="100000">₦50,000 – ₦100,000 range</option>
                  <option value="250000">Over ₦100,000 premium</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="type-label text-text-secondary ml-1 font-bold text-xs uppercase tracking-wider">WhatsApp (Optional)</label>
                <input
                  type="text"
                  placeholder="+234... to get notified when live"
                  className="h-14 w-full bg-surface-grey border border-border-default rounded-[16px] px-4 type-body focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all text-sm"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="type-label text-text-secondary ml-1 font-bold text-xs uppercase tracking-wider">What&apos;s the vibe?</label>
              <div className="flex flex-wrap gap-2.5">
                {["Chill", "Date Night", "Group Party", "Foodie Chop", "Brunch Vibe", "Quick Linkup"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFormData({ ...formData, vibe: v })}
                    className={`px-4 py-2 rounded-full type-label text-xs border transition-all ${
                      formData.vibe === v 
                        ? "bg-brand-green border-brand-green text-white shadow-sm font-bold" 
                        : "bg-surface-grey border-transparent text-text-secondary hover:bg-black/5"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="type-label text-text-secondary ml-1 font-bold text-xs uppercase tracking-wider">Why should we add it?</label>
              <textarea
                placeholder="Share any menu highlights, pricing details, or why your squad loves it..."
                className="w-full bg-surface-grey border border-border-default rounded-[20px] p-4 type-body text-sm min-h-[100px] focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all resize-none"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              />
            </div>

            {error && (
              <p className="type-caption text-red-500 font-bold text-center">Something went wrong. Please try again.</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-green hover:bg-brand-green-70 text-white type-label h-[56px] rounded-[16px] shadow-md tap-feedback flex items-center justify-center gap-2 border-none font-extrabold text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying suggestion...
                </>
              ) : (
                <>
                  <span>Submit Spot & Earn Scout Badge</span>
                  <Award className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
