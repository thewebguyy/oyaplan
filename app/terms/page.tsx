import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, Sparkles, Check, ShieldCheck, Scale } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service (The Serious Stuff) — OyaPlan",
  description: "Terms and conditions governing the use of OyaPlan outing planning platform in Lagos.",
};

/**
 * Custom 3D-styled Legal Scale / Shield Crest Icon
 */
function LegalEmblem() {
  return (
    <div className="relative w-14 h-14 rounded-2xl bg-[#111111] border-2 border-[#F9E828] text-[#F9E828] flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#111111]">
      <svg viewBox="0 0 48 48" className="w-8 h-8 fill-none stroke-current stroke-[2.2]" aria-hidden="true">
        {/* Scale Pillar & Base */}
        <line x1="24" y1="8" x2="24" y2="40" strokeWidth="2.5" />
        <line x1="14" y1="40" x2="34" y2="40" strokeWidth="3" />
        {/* Fulcrum & Crossbeam */}
        <circle cx="24" cy="8" r="3" fill="#F9E828" stroke="#111111" strokeWidth="1.5" />
        <line x1="10" y1="14" x2="38" y2="14" strokeWidth="2.5" />
        {/* Left Scale Pan */}
        <line x1="10" y1="14" x2="6" y2="24" />
        <line x1="10" y1="14" x2="14" y2="24" />
        <path d="M 4 24 Q 10 28 16 24 Z" fill="#F9E828" />
        {/* Right Scale Pan */}
        <line x1="38" y1="14" x2="34" y2="24" />
        <line x1="38" y1="14" x2="42" y2="24" />
        <path d="M 32 24 Q 38 28 44 24 Z" fill="#F9E828" />
      </svg>
    </div>
  );
}

export default function TermsOfServicePage() {
  return (
    <main className="min-h-[100dvh] bg-[#F6F6F2] text-[#111111] pt-10 pb-24 px-4 sm:px-6 md:px-8 font-sans selection:bg-[#F9E828] selection:text-[#111111]">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* ── TOP NAVIGATION & HEADER ── */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#555555] hover:text-[#111111] transition-colors tap-feedback"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to OyaPlan</span>
          </Link>

          <div className="flex items-start sm:items-center gap-4">
            <LegalEmblem />
            <div>
              {/* Vibrant Danfo Yellow Pill Eyebrow */}
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-widest bg-[#F9E828] text-[#111111] border border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
                THE SERIOUS STUFF
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] font-display uppercase tracking-tight mt-1.5">
                Terms of Service
              </h1>
            </div>
          </div>

          <p className="text-xs font-mono font-bold text-[#777777] uppercase tracking-wider">
            Last Updated: August 2026 • OyaPlan Technologies Limited • Lagos, Nigeria
          </p>
        </div>

        {/* ── 1. "THE GIST (NO LONG TALK)" SUMMARY BOX ── */}
        <div className="bg-[#FFFEE5] border-2 border-[#111111] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#111111] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#111111]" />
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#111111] font-display">
                The Gist (No Long Talk)
              </h2>
            </div>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-[#111111] text-[#F9E828] px-2.5 py-0.5 rounded-full">
              TL;DR
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#444444] font-medium leading-relaxed">
            We know nobody likes reading pages of legal jargon. Here are the 4 ground rules you need to know:
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-[#111111]">
            <li className="flex items-start gap-2.5 bg-white p-3.5 rounded-2xl border-2 border-[#111111]">
              <span className="w-5 h-5 rounded-lg bg-[#008751] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <span>We give you the real cost of outings so you don&apos;t suffer unexpected billing (but prices can still change at the venue).</span>
            </li>

            <li className="flex items-start gap-2.5 bg-white p-3.5 rounded-2xl border-2 border-[#111111]">
              <span className="w-5 h-5 rounded-lg bg-[#008751] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <span>Don&apos;t scrape our data or do any funny business on the app.</span>
            </li>

            <li className="flex items-start gap-2.5 bg-white p-3.5 rounded-2xl border-2 border-[#111111]">
              <span className="w-5 h-5 rounded-lg bg-[#008751] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <span>You must be 18+ to use OyaPlan.</span>
            </li>

            <li className="flex items-start gap-2.5 bg-white p-3.5 rounded-2xl border-2 border-[#111111]">
              <span className="w-5 h-5 rounded-lg bg-[#008751] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <span>If there&apos;s a serious issue, Lagos State laws apply.</span>
            </li>
          </ul>
        </div>

        {/* ── 2 & 3. TERMS BODY: SIDE-BY-SIDE LAGOS TRANSLATION & LEGAL SOUND TEXT ── */}
        <div className="bg-white border-2 border-[#111111] rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0px_0px_#111111] space-y-10 text-[#222222]">
          
          {/* Section 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start border-b border-[#E5E5DE] pb-8">
            <div className="lg:col-span-4 bg-[#F6F6F2] border-2 border-[#111111] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#008751]">Lagos Breakdown</span>
              <p className="text-xs font-bold text-[#111111] leading-relaxed">
                By using OyaPlan to check prices or organize outings, you agree to these ground rules. Standard procedure.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-lg font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] text-xs font-mono font-black flex items-center justify-center">1</span>
                <span>1. Agreement to Terms</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-medium">
                These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and <strong>OyaPlan Technologies Limited</strong> (&quot;OyaPlan&quot;, &quot;we&quot;, &quot;us&quot;). By accessing or using <strong>oyaplan.com</strong>, generating outing plans, or creating an account, you agree to be bound by these Terms and our <Link href="/privacy" className="text-[#008751] font-bold hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start border-b border-[#E5E5DE] pb-8">
            <div className="lg:col-span-4 bg-[#F6F6F2] border-2 border-[#111111] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#008751]">Lagos Breakdown</span>
              <p className="text-xs font-bold text-[#111111] leading-relaxed">
                You must be an adult (18+) to run linkups on OyaPlan. Keep your account login safe, and don&apos;t impersonate anybody.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-lg font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] text-xs font-mono font-black flex items-center justify-center">2</span>
                <span>2. Who Can Use OyaPlan (18+ Only)</span>
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[#4B5563] leading-relaxed font-medium">
                <li>You must be at least 18 years of age to participate in the OyaPlan platform or beta programs.</li>
                <li>You are responsible for maintaining the confidentiality of your authentication details and for all activities associated with your account.</li>
                <li>You agree to provide accurate information and refrain from impersonating any person or entity.</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start border-b border-[#E5E5DE] pb-8">
            <div className="lg:col-span-4 bg-[#FFFEE5] border-2 border-[#111111] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#B45309]">Lagos Breakdown</span>
              <p className="text-xs font-bold text-[#111111] leading-relaxed">
                Basically, we try our best to get the exact menu prices, but if the club suddenly increases the price of Moët by 12 AM or a holiday surge kicks in, that&apos;s on them, not us. Our calculations are guidance, not a bank guarantee.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-lg font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] text-xs font-mono font-black flex items-center justify-center">3</span>
                <span>3. The &ldquo;No Surprise Billing&rdquo; Disclaimer</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-medium">
                OyaPlan provides venue cost calculations and transport fare estimates based on verified menus, typical prices, and historical transport rates. However, actual costs at third-party venues may vary due to menu updates, holiday surges, service fees, or ride-hailing demand fluctuations.
              </p>
              <p className="text-xs font-bold text-[#B45309] uppercase tracking-wider font-mono">
                Estimates are provided for planning guidance and do not constitute a financial guarantee.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start border-b border-[#E5E5DE] pb-8">
            <div className="lg:col-span-4 bg-[#F6F6F2] border-2 border-[#111111] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#008751]">Lagos Breakdown</span>
              <p className="text-xs font-bold text-[#111111] leading-relaxed">
                No bot attacks, no scraping our verified numbers, and don&apos;t submit fake bills to mislead other Lagosians. Play clean.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-lg font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] text-xs font-mono font-black flex items-center justify-center">4</span>
                <span>4. No Funny Business (Acceptable Use)</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] font-medium">You agree not to use OyaPlan to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#4B5563] font-medium">
                <li>Probe, scan, or test the vulnerability of our systems or bypass rate-limiting defenses.</li>
                <li>Scrape, crawl, or harvest venue prices or software assets without written permission.</li>
                <li>Submit false pricing evidence, spam reviews, or fraudulent venue recommendations.</li>
                <li>Violate any local, state, or national laws of the Federal Republic of Nigeria.</li>
              </ul>
            </div>
          </div>

          {/* Section 5 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start border-b border-[#E5E5DE] pb-8">
            <div className="lg:col-span-4 bg-[#F6F6F2] border-2 border-[#111111] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#008751]">Lagos Breakdown</span>
              <p className="text-xs font-bold text-[#111111] leading-relaxed">
                The formulas, design, brand, and code belong to OyaPlan Technologies. Please don&apos;t copy our homework.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-lg font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] text-xs font-mono font-black flex items-center justify-center">5</span>
                <span>5. Intellectual Property</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-medium">
                The OyaPlan platform, algorithmic matching formulas, software design, copy, logos, and visual elements are the exclusive intellectual property of OyaPlan Technologies Limited. Nothing in these Terms grants you ownership of any OyaPlan assets or trademarks.
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start border-b border-[#E5E5DE] pb-8">
            <div className="lg:col-span-4 bg-[#F6F6F2] border-2 border-[#111111] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#008751]">Lagos Breakdown</span>
              <p className="text-xs font-bold text-[#111111] leading-relaxed">
                We give you the sharpest data to plan with, but we aren&apos;t liable if your squad orders extra bottles or the venue runs out of lamb chops.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-lg font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] text-xs font-mono font-black flex items-center justify-center">6</span>
                <span>6. Limitation of Liability</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-medium">
                To the maximum extent permitted by law, OyaPlan Technologies Limited shall not be liable for any indirect, incidental, special, or consequential damages arising out of your reliance on venue information, transport estimates, third-party service availability, or outing decisions made during app usage.
              </p>
            </div>
          </div>

          {/* Section 7 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start border-b border-[#E5E5DE] pb-8">
            <div className="lg:col-span-4 bg-[#F6F6F2] border-2 border-[#111111] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#EF4444]">Lagos Breakdown</span>
              <p className="text-xs font-bold text-[#111111] leading-relaxed">
                If someone violates these terms, spams the community, or tries funny business, the bouncers will show them the exit door immediately.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-lg font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] text-xs font-mono font-black flex items-center justify-center">7</span>
                <span>7. Getting Bounced (Account Termination)</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-medium">
                We reserve the right to modify, suspend, or discontinue any aspect of the service at any time without prior notice. We reserve the right to suspend or terminate account access for users who violate these Terms.
              </p>
            </div>
          </div>

          {/* Section 8 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start border-b border-[#E5E5DE] pb-8">
            <div className="lg:col-span-4 bg-[#F6F6F2] border-2 border-[#111111] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#008751]">Lagos Breakdown</span>
              <p className="text-xs font-bold text-[#111111] leading-relaxed">
                If push comes to shove and matter reaches court, the laws of the Federal Republic of Nigeria and the courts in Lagos State have final say.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-lg font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] text-xs font-mono font-black flex items-center justify-center">8</span>
                <span>8. Lagos is Our Judge (Governing Law)</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-medium">
                These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to conflict of law principles. Any legal proceedings shall be subject to the exclusive jurisdiction of courts located in Lagos State, Nigeria.
              </p>
            </div>
          </div>

          {/* Section 9 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-4 bg-[#F6F6F2] border-2 border-[#111111] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#008751]">Lagos Breakdown</span>
              <p className="text-xs font-bold text-[#111111] leading-relaxed">
                Any confusion or clarification? Send us an email at hello@oyaplan.com. No long talk.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-lg font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] text-xs font-mono font-black flex items-center justify-center">9</span>
                <span>9. Contact Us (Holla at Us)</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-medium">
                For questions regarding these Terms of Service, please contact our team:
              </p>
              <div className="pt-2">
                <a
                  href="mailto:hello@oyaplan.com"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#008751] hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  hello@oyaplan.com
                </a>
                <p className="text-xs text-[#777777] mt-1 font-medium">
                  OyaPlan Technologies Limited • Lagos, Nigeria
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ── 4. THE FOOTER CTA: BACK TO THE SOFT LIFE ── */}
        <div className="bg-[#0B130E] text-white border-2 border-[#111111] rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_0px_#111111] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-black font-display uppercase tracking-tight text-white">
              Alright, that&apos;s enough reading for today.
            </h3>
            <p className="text-xs sm:text-sm text-white/70 font-medium">
              Time to actually go enjoy yourself with zero budget stress.
            </p>
          </div>

          <Link
            href="/"
            className="h-13 px-8 rounded-2xl bg-[#F9E828] hover:bg-[#ffe710] text-[#111111] font-display font-black text-xs uppercase tracking-wider border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#111111] transition-all flex items-center justify-center gap-2.5 cursor-pointer tap-feedback shrink-0"
          >
            <span>Take me back to the Soft Life 🌴</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>
        </div>

        {/* Footer Navigation Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E5DE] pt-6 text-xs font-bold text-[#777777]">
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[#111111] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/beta" className="text-[#008751] hover:underline transition-colors">
              Founding Beta Terms
            </Link>
          </div>
          <span>&copy; {new Date().getFullYear()} OyaPlan Technologies Limited</span>
        </div>

      </div>
    </main>
  );
}
