"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Sparkles, MapPin, Loader2 } from "lucide-react";
import { submitSpotSuggestion } from "@/lib/actions/submitSpotSuggestion";

export default function SuggestSpotPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [formData, setFormData] = useState({
    spotName: "",
    location: "",
    vibe: "Chill",
    comment: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const result = await submitSpotSuggestion({
      spotName: formData.spotName,
      areaName: formData.location,
      vibeDescription: `${formData.vibe}: ${formData.comment}`,
    });

    setLoading(false);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(true);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-surface-grey flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-border-default rounded-[32px] p-10 text-center space-y-6 shadow-sm">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-brand-green-5 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-brand-green" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="type-heading text-text-primary">Thanks for the plug!</h1>
            <p className="type-body text-text-muted">
              We&apos;ll verify {formData.spotName} and add it to the engine if it fits the vibes.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/">
              <Button className="w-full bg-brand-green text-white type-label h-12 rounded-[12px] tap-feedback shadow-none">
                Back to Planning
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-grey p-6 md:p-12 lg:p-24 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 type-label text-text-muted hover:text-brand-green mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Link>

        <div className="bg-white border border-border-default rounded-[32px] p-8 md:p-12 shadow-sm space-y-10 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-yellow/10 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-brand-yellow fill-brand-yellow" />
              <span className="text-[11px] font-[700] uppercase tracking-wider text-text-secondary">Community Growth</span>
            </div>
            <h1 className="type-heading text-text-primary">
              Suggest a spot.
            </h1>
            <p className="type-body text-text-muted max-w-lg">
              Know a hidden gem in Lagos? Help other squads find their next favorite link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="type-label text-text-secondary ml-1">Spot Name</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    placeholder="e.g. Moist Beach Club"
                    className="h-14 w-full bg-surface-grey border border-border-default rounded-[16px] px-4 type-body focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
                    value={formData.spotName}
                    onChange={(e) => setFormData({ ...formData, spotName: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="type-label text-text-secondary ml-1">Location / Area</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Oniru, Victoria Island"
                    className="h-14 w-full bg-surface-grey border border-border-default rounded-[16px] pl-10 pr-4 type-body focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="type-label text-text-secondary ml-1">What&apos;s the vibe?</label>
              <div className="flex flex-wrap gap-3">
                {["Chill", "High Energy", "Date Night", "Work Friendly", "Group Party"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFormData({ ...formData, vibe: v })}
                    className={`px-5 py-2.5 rounded-full type-label border transition-all ${
                      formData.vibe === v 
                        ? "bg-brand-green border-brand-green text-white shadow-md shadow-brand-green/10" 
                        : "bg-white border-border-default text-text-secondary hover:border-text-muted"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="type-label text-text-secondary ml-1">Why should we add it?</label>
              <textarea
                placeholder="Share anything about the prices, menu, or overall experience..."
                className="w-full bg-surface-grey border border-border-default rounded-[20px] p-4 type-body min-h-[120px] focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all resize-none"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              />
            </div>

            {error && (
              <p className="type-caption text-red-500">Something went wrong. Please try again.</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-green hover:bg-brand-green-70 text-white type-label h-[60px] rounded-[18px] shadow-lg shadow-brand-green/10 tap-feedback flex items-center justify-center gap-2 border-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : "Submit Suggestion"}
            </Button>
          </form>
          <div className="h-24 md:hidden" aria-hidden="true" />
        </div>
      </div>
    </main>
  );
}
