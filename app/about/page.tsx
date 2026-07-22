import Link from "next/link";
import { ArrowLeft, Sparkles, ShieldCheck, Compass } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why OyaPlan Exists — Right Place, Right Price, Right Occasion",
  description: "I got tired of spending hours scrolling through Instagram and TikTok just to figure out where to go. That's why we built OyaPlan.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] py-12 px-4 sm:px-6 antialiased">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#008751] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Planning
        </Link>

        {/* Hero Title */}
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#008751]/10 text-[#008751]">
            <Sparkles className="w-3.5 h-3.5" /> Why OyaPlan Exists
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tight leading-tight">
            I got tired of spending hours scrolling through social media just to figure out where to go.
          </h1>
          <p className="text-[#6B7280] text-base sm:text-lg leading-relaxed">
            Just the right place, at the right price, for the right occasion.
          </p>
        </div>

        {/* Story Content Block */}
        <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 sm:p-10 space-y-6 shadow-sm">
          <div className="space-y-4 text-base text-[#374151] leading-relaxed">
            <p>
              I got tired of spending hours scrolling through Instagram and TikTok just to figure out where to go.
            </p>
            <p>
              I&apos;d finally find a place that looked nice, only to get there and realize it wasn&apos;t what I expected. The food was more expensive than I planned for, transport cost more than I thought, or the vibe just wasn&apos;t right.
            </p>
            <h2 className="text-xl font-bold text-[#1A1A1A] pt-4">That&apos;s when I asked myself:</h2>
            <p className="font-semibold text-[#1A1A1A] bg-[#FAFAF8] p-4 rounded-xl border border-[#E5E7EB] italic">
              &ldquo;Why isn&apos;t there an app where I can simply enter my location, budget, and vibe, and instantly get recommendations that actually fit?&rdquo;
            </p>
            <h2 className="text-xl font-bold text-[#1A1A1A] pt-4">That&apos;s why we built OyaPlan.</h2>
            <div className="p-5 rounded-2xl bg-[#008751]/5 border border-[#008751]/15 space-y-2 text-[#008751] font-bold text-lg">
              <p>No endless scrolling. No guessing. No budget surprises.</p>
              <p className="text-[#1A1A1A]">Just the right place, at the right price, for the right occasion.</p>
            </div>
          </div>

          {/* Core Values / Features Tie-In */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#E5E7EB]">
            <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E7EB] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#1A1A1A] text-sm">
                <ShieldCheck className="w-4 h-4 text-[#008751]" /> 100% Verified Menus
              </div>
              <p className="text-xs text-[#6B7280]">We personally audit menu prices. Zero markups or fantasy estimates.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E7EB] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#1A1A1A] text-sm">
                <Compass className="w-4 h-4 text-[#008751]" /> Distance-Based Transport
              </div>
              <p className="text-xs text-[#6B7280]">Calculated using real distance and Lagos traffic peak-hour multipliers.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link href="/" className="inline-flex items-center justify-center h-12 px-8 bg-[#008751] text-white font-bold text-base rounded-[12px] hover:brightness-90 transition-all">
            Start Planning Your Outing
          </Link>
        </div>

      </div>
    </main>
  );
}
