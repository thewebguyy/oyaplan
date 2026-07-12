"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function InteractiveForge() {
  const [step, setStep] = useState<"inputs" | "generating" | "result">("inputs");

  const [budget, setBudget] = useState<string | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [groupSize, setGroupSize] = useState<string | null>(null);
  const [vibe, setVibe] = useState<string | null>(null);

  const budgets = ["₦10k - ₦25k", "₦25k - ₦50k", "₦50k+"];
  const areas = ["Ikeja", "Victoria Island", "Lekki", "Yaba"];
  const sizes = ["Just me", "Couple", "3-5 friends", "Big group"];
  const vibes = ["Chill & Quiet", "Loud & Energetic", "Romantic", "Aesthetic"];

  const handleGenerate = () => {
    if (!budget || !area || !groupSize || !vibe) return;
    setStep("generating");
    setTimeout(() => {
      setStep("result");
    }, 1800);
  };

  const reset = () => {
    setBudget(null);
    setArea(null);
    setGroupSize(null);
    setVibe(null);
    setStep("inputs");
  };

  return (
    <section id="product" className="w-full py-24 bg-surface-grey border-b border-border-default">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="type-heading text-text-primary mb-4">
            Try the Decision Engine
          </h2>
          <p className="type-body text-text-secondary">
            Tell us what you want. We'll crunch the numbers and give you a realistic plan you can trust.
          </p>
        </div>

        <div className="bg-background border border-border-default rounded-3xl p-6 md:p-10 shadow-sm max-w-3xl mx-auto relative overflow-hidden min-h-[500px] flex flex-col justify-center transition-all duration-500">
          
          {step === "inputs" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="space-y-3">
                <label className="type-label text-text-muted">1. What's the budget?</label>
                <div className="flex flex-wrap gap-3">
                  {budgets.map((b) => (
                    <button
                      key={b}
                      onClick={() => setBudget(b)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        budget === b 
                          ? "bg-brand-green text-text-on-green shadow-sm" 
                          : "bg-surface-grey text-text-secondary hover:bg-border-default"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="type-label text-text-muted">2. Where to?</label>
                <div className="flex flex-wrap gap-3">
                  {areas.map((a) => (
                    <button
                      key={a}
                      onClick={() => setArea(a)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        area === a 
                          ? "bg-brand-green text-text-on-green shadow-sm" 
                          : "bg-surface-grey text-text-secondary hover:bg-border-default"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="type-label text-text-muted">3. How many people?</label>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setGroupSize(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        groupSize === s 
                          ? "bg-brand-green text-text-on-green shadow-sm" 
                          : "bg-surface-grey text-text-secondary hover:bg-border-default"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="type-label text-text-muted">4. What's the vibe?</label>
                <div className="flex flex-wrap gap-3">
                  {vibes.map((v) => (
                    <button
                      key={v}
                      onClick={() => setVibe(v)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        vibe === v 
                          ? "bg-brand-green text-text-on-green shadow-sm" 
                          : "bg-surface-grey text-text-secondary hover:bg-border-default"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  size="xl" 
                  onClick={handleGenerate}
                  disabled={!budget || !area || !groupSize || !vibe}
                  className="w-full bg-text-primary text-background hover:bg-text-secondary font-bold rounded-xl h-14"
                >
                  Get My Plan
                </Button>
              </div>
            </div>
          )}

          {step === "generating" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 animate-in fade-in zoom-in-95 duration-300">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-surface-grey rounded-full"></div>
                <div className="absolute inset-0 border-4 border-brand-green rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 className="type-subheading text-text-primary mb-2">Analyzing venues in {area}...</h3>
              <p className="type-body text-text-muted">Cross-checking prices against {budget} budget</p>
            </div>
          )}

          {step === "result" && (
            <div className="animate-in slide-in-from-bottom-8 fade-in duration-700">
              <div className="bg-surface-grey rounded-2xl p-6 border border-border-default mb-8 card-lift">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-xl text-text-primary mb-1">Your Perfect Plan</h3>
                    <p className="text-sm text-text-secondary">{area} • {vibe} • {groupSize}</p>
                  </div>
                  <div className="bg-brand-green-15 text-brand-green px-2 py-1 rounded text-xs font-bold tracking-wider flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    MATCH
                  </div>
                </div>
                
                <div className="space-y-4 bg-background rounded-xl p-4 border border-border-default">
                  <div className="flex justify-between items-center pb-4 border-b border-border-default">
                    <div>
                      <p className="font-semibold text-text-primary">Kuti's Bistro</p>
                      <p className="text-sm text-text-muted">Main Event (Food & Drinks)</p>
                    </div>
                    <p className="font-bold text-text-primary">₦12,500/pp</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-text-primary">Logistics</p>
                      <p className="text-sm text-text-muted">Estimated Transport & Buffer</p>
                    </div>
                    <p className="font-bold text-text-primary">₦4,000/pp</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center px-2">
                  <span className="font-medium text-text-secondary">Estimated Total</span>
                  <span className="text-2xl font-black text-brand-green">₦16,500/pp</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="flex-1 bg-brand-green text-text-on-green hover:bg-brand-green-70 h-12 rounded-xl font-bold">
                  Download to save plan
                </Button>
                <Button size="lg" variant="outline" onClick={reset} className="sm:w-32 h-12 rounded-xl text-text-secondary">
                  Start Over
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
