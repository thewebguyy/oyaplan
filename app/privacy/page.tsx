import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, Check, ShieldCheck, Lock, ShieldAlert, FileText, Ban } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy (Your Privacy) — OyaPlan",
  description: "How OyaPlan Technologies Limited protects your data under the Nigeria Data Protection Act (NDPA) 2023.",
};

/**
 * Custom 3D-styled Privacy Shield & Padlock Pin Emblem
 */
function PrivacyEmblem() {
  return (
    <div className="relative w-14 h-14 rounded-2xl bg-[#111111] border-2 border-[#F9E828] text-[#F9E828] flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#111111]">
      <svg viewBox="0 0 48 48" className="w-8 h-8 fill-none stroke-current stroke-[2.2]" aria-hidden="true">
        {/* Shield Outer Outline */}
        <path d="M 24 6 L 38 12 C 38 28 24 40 24 40 C 24 40 10 28 10 12 Z" strokeWidth="2.5" />
        {/* Inner Padlock Shackle */}
        <path d="M 19 22 V 17 C 19 14.5 21 12.5 24 12.5 C 27 12.5 29 14.5 29 17 V 22" strokeWidth="2.2" strokeLinecap="round" />
        {/* Padlock Body */}
        <rect x="17" y="22" width="14" height="11" rx="2.5" fill="#F9E828" stroke="#111111" strokeWidth="1.5" />
        {/* Keyhole */}
        <circle cx="24" cy="26" r="1.5" fill="#111111" />
        <line x1="24" y1="27.5" x2="24" y2="30" stroke="#111111" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export default function PrivacyPolicyPage() {
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
            <PrivacyEmblem />
            <div>
              {/* Vibrant Danfo Yellow Eyebrow */}
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-widest bg-[#F9E828] text-[#111111] border border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
                THE SERIOUS STUFF (YOUR PRIVACY)
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] font-display uppercase tracking-tight mt-1.5">
                Privacy Policy
              </h1>
            </div>
          </div>

          <p className="text-xs font-mono font-bold text-[#777777] uppercase tracking-wider">
            Last Updated: August 2026 • Nigeria Data Protection Act (NDPA) 2023 Compliant • Lagos, Nigeria
          </p>
        </div>

        {/* ── 1. "THE GIST (NO LONG TALK)" TL;DR BOX ── */}
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
            Privacy policies are notoriously long. Here is the straight-to-the-point summary of how we handle your information:
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-[#111111]">
            <li className="flex items-start gap-2.5 bg-white p-3.5 rounded-2xl border-2 border-[#111111]">
              <span className="w-5 h-5 rounded-lg bg-[#008751] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <span>We only collect what we need to plan your outings and keep your account safe.</span>
            </li>

            <li className="flex items-start gap-2.5 bg-white p-3.5 rounded-2xl border-2 border-[#111111]">
              <span className="w-5 h-5 rounded-lg bg-[#008751] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <span>We do not sell your personal data or your location history to anyone. Period.</span>
            </li>

            <li className="flex items-start gap-2.5 bg-white p-3.5 rounded-2xl border-2 border-[#111111]">
              <span className="w-5 h-5 rounded-lg bg-[#008751] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <span>You have full control. If you want to delete your account and data, we do it in 30 days.</span>
            </li>

            <li className="flex items-start gap-2.5 bg-white p-3.5 rounded-2xl border-2 border-[#111111]">
              <span className="w-5 h-5 rounded-lg bg-[#008751] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <span>The full legal details (for the lawyers) are laid out below.</span>
            </li>
          </ul>
        </div>

        {/* ── 3. ELEVATED "ZERO DATA SELLING" CALLOUT BLOCK ── */}
        <div className="bg-[#008751] text-white border-2 border-[#111111] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#111111] flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white text-[#008751] border-2 border-[#111111] flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#111111]">
            <Ban className="w-7 h-7 stroke-[2.5]" />
          </div>

          <div className="space-y-1 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#111111] text-[#F9E828] text-[10px] font-mono font-black uppercase tracking-wider">
              <span>PROMISE LOCKED</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black font-display uppercase tracking-tight text-white">
              Zero Data Selling (We Don&apos;t Sell Your Gist)
            </h3>
            <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
              We never sell, rent, or trade your personal information or squad outing plans to third parties or advertising networks. Your business stays your business.
            </p>
          </div>
        </div>

        {/* ── 2 & 4. PRIVACY BODY: SIDE-BY-SIDE LAGOS BREAKDOWN & LEGAL SOUND CLAUSES ── */}
        <div className="bg-white border-2 border-[#111111] rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0px_0px_#111111] space-y-10 text-[#222222]">
          
          {/* Section 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start border-b border-[#E5E5DE] pb-8">
            <div className="lg:col-span-4 bg-[#F6F6F2] border-2 border-[#111111] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#008751]">Lagos Breakdown</span>
              <p className="text-xs font-bold text-[#111111] leading-relaxed">
                We comply fully with the Nigeria Data Protection Act (NDPA) 2023. We protect your data like our own.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-lg font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] text-xs font-mono font-black flex items-center justify-center">1</span>
                <span>1. The Promise (NDPA Compliance)</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-medium">
                At <strong>OyaPlan Technologies Limited</strong> (&quot;OyaPlan&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we respect your privacy and are committed to protecting your personal data in accordance with the <strong>Nigeria Data Protection Act (NDPA) 2023</strong> and international data privacy principles. This policy explains how we collect, use, and protect your information across <strong>oyaplan.com</strong> and our beta services.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start border-b border-[#E5E5DE] pb-8">
            <div className="lg:col-span-4 bg-[#F6F6F2] border-2 border-[#111111] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#008751]">Lagos Breakdown</span>
              <p className="text-xs font-bold text-[#111111] leading-relaxed">
                Only what is needed to generate accurate outing budgets, keep your login secure, and verify actual spend math.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-lg font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] text-xs font-mono font-black flex items-center justify-center">2</span>
                <span>2. The Details We Keep (And Why)</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] font-medium">We collect only data necessary to deliver verified outing plans and secure account access:</p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[#4B5563] leading-relaxed font-medium">
                <li>
                  <strong>Account Identity Data:</strong> Email address and display name created during sign-in via Supabase Authentication.
                </li>
                <li>
                  <strong>Planning Inputs:</strong> Anonymous criteria entered into the planner, including starting location, squad size, budget range, and vibe selections.
                </li>
                <li>
                  <strong>Beta Feedback &amp; Spend Intelligence:</strong> Voluntary actual spend submissions and venue reviews submitted to calibrate transport and menu pricing accuracy.
                </li>
                <li>
                  <strong>Technical Logs:</strong> IP address, device type, browser user-agent, and request timestamps to prevent abuse, enforce rate limits, and secure our network.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start border-b border-[#E5E5DE] pb-8">
            <div className="lg:col-span-4 bg-[#FFFEE5] border-2 border-[#111111] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#B45309]">Lagos Breakdown</span>
              <p className="text-xs font-bold text-[#111111] leading-relaxed">
                Standard web session cookies to remember your outing selections and keep you logged in—not the Cabin Biscuit kind.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-lg font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] text-xs font-mono font-black flex items-center justify-center">3</span>
                <span>3. Cookies (Not the Cabin Biscuit Kind)</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-medium">
                We use essential HTTP cookies and browser session storage strictly to maintain authenticated sessions, preserve planning selections between screens, and protect forms against cross-site request forgery.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start border-b border-[#E5E5DE] pb-8">
            <div className="lg:col-span-4 bg-[#F6F6F2] border-2 border-[#111111] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#008751]">Lagos Breakdown</span>
              <p className="text-xs font-bold text-[#111111] leading-relaxed">
                Your data is stored and encrypted with world-class cloud providers. Never on sketchy servers.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-lg font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] text-xs font-mono font-black flex items-center justify-center">4</span>
                <span>4. Third-Party Infrastructure (Where Data Lives)</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] font-medium">Your data is processed using secure cloud service providers:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#4B5563] font-medium">
                <li><strong>Supabase Inc.:</strong> Encrypted cloud database and authentication provider.</li>
                <li><strong>Vercel Inc.:</strong> Hosting infrastructure and global edge network.</li>
                <li><strong>Sentry:</strong> Anonymous runtime error reporting.</li>
              </ul>
            </div>
          </div>

          {/* Section 5 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start border-b border-[#E5E5DE] pb-8">
            <div className="lg:col-span-4 bg-[#F6F6F2] border-2 border-[#111111] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#008751]">Lagos Breakdown</span>
              <p className="text-xs font-bold text-[#111111] leading-relaxed">
                You own your account. You can request all your data or ask us to delete everything within 30 days. No wahala.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-lg font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] text-xs font-mono font-black flex items-center justify-center">5</span>
                <span>5. Your Data, Your Call (NDPA Rights)</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] font-medium">Under the Nigeria Data Protection Act, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#4B5563] leading-relaxed font-medium">
                <li>Access all personal data stored under your account.</li>
                <li>Request correction of inaccurate information.</li>
                <li>Request complete erasure of your account and associated profile data.</li>
                <li>Object to processing or request data portability.</li>
              </ul>
              <p className="text-xs sm:text-sm text-[#4B5563] pt-1 font-medium">
                Account deletion requests are processed within 30 days of email verification.
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-4 bg-[#F6F6F2] border-2 border-[#111111] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#008751]">Lagos Breakdown</span>
              <p className="text-xs font-bold text-[#111111] leading-relaxed">
                Got questions or want your data erased? Holla at hello@oyaplan.com. We answer promptly.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-lg font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] text-xs font-mono font-black flex items-center justify-center">6</span>
                <span>6. Holla At The Privacy Team</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-medium">
                For privacy inquiries or data rights requests, contact our compliance team:
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

        {/* ── FOOTER CTA: BACK TO THE SOFT LIFE ── */}
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
            <Link href="/terms" className="hover:text-[#111111] transition-colors">
              Terms of Service
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
