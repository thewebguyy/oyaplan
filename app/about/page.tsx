import Link from "next/link";
import { ArrowLeft, Sparkles, ShieldCheck, Compass } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why OyaPlan Exists — Our Origin Story",
  description: "The story behind OyaPlan: Built by Lagos planners who were tired of menu price shocks and influencer fantasy budgets.",
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
            <Sparkles className="w-3.5 h-3.5" /> Our Origin Story
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tight leading-tight">
            I Was Tired of Getting Shocked at Lagos Venues.
          </h1>
          <p className="text-[#6B7280] text-base sm:text-lg leading-relaxed">
            The story behind OyaPlan: why we built a budget confidence engine for Lagos squads.
          </p>
        </div>

        {/* Story Content Block */}
        <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 sm:p-10 space-y-6 shadow-sm">
          <div className="space-y-4 text-base text-[#374151] leading-relaxed">
            <h2 className="text-xl font-bold text-[#1A1A1A] pt-2">The Moment</h2>
            <p>
              It was a Saturday. I wanted to go out with friends. I opened Instagram, scrolling through venue aesthetics—pretty pictures, zero pricing info. Opened TikTok for a &ldquo;viral&rdquo; brunch spot, only to find comments warning it was overcrowded and wildly overpriced.
            </p>
            <p>
              I called my squad: <em>&ldquo;Where should we go?&rdquo;</em> ... <em>&ldquo;I don&apos;t know, what&apos;s your budget?&rdquo;</em> ... <em>&ldquo;Around ₦50k per person.&rdquo;</em> ... <em>&ldquo;Cool, but how much is transport to the island?&rdquo;</em> ... <em>&ldquo;No idea.&rdquo;</em>
            </p>

            <h2 className="text-xl font-bold text-[#1A1A1A] pt-4">The Shock</h2>
            <p>
              We finally picked a venue and showed up. The menu was nothing like what influencers posted. Prices were <strong>nearly double</strong> what we expected, service charge and VAT were added on top, and Bolt rides from home cost an unbudgeted ₦6,000.
            </p>
            <p>
              We were stuck with three bad options: spend way more than planned, leave awkwardly and waste the night, or compromise on the entire experience.
            </p>

            <h2 className="text-xl font-bold text-[#1A1A1A] pt-4 border-t border-[#E5E7EB] pt-6">The Solution</h2>
            <p className="font-semibold text-[#1A1A1A]">
              That&apos;s when I thought: What if there was an app where I could just input my location, tell it my vibe and my budget, and it would actually give me accurate recommendations that fit?
            </p>
            <p>
              No influencer fantasy menus. No hidden fees. No transport cost shocks. <strong>Just real numbers before you leave home.</strong>
            </p>
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
