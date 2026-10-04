"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Compass, Building2, ShieldCheck, Sparkles } from "lucide-react";
import { sanitizeReturnTo } from "@/lib/utils/returnTo";

export default function LoginWorldSelector() {
  const searchParams = useSearchParams();
  const rawReturnTo = searchParams.get("returnTo") || searchParams.get("next");
  const returnTo = sanitizeReturnTo(rawReturnTo, "/");

  const plannerHref = `/login/planner${returnTo && returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;
  const businessHref = `/login/business${returnTo && returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;

  return (
    <main className="min-h-[100dvh] bg-[#F6F6F2] text-[#111111] flex flex-col justify-between selection:bg-[#F9E828]/40 font-sans">
      {/* Top Brand Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 tap-feedback focus-visible:outline-2 focus-visible:outline-[#111111] rounded-lg">
          <Image
            src="/logo.png"
            alt="OyaPlan"
            width={610}
            height={143}
            className="h-7 sm:h-8 w-auto object-contain shrink-0"
            priority
          />
        </Link>

        {/* Elevate Anonymous CTA: Meaningful primary-style action, not a tiny footnote */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#111111] bg-white hover:bg-[#111111] hover:text-[#F9E828] border border-[#111111] px-4 py-2 rounded-full transition-all duration-200 shadow-xs tap-feedback"
        >
          <span>Skip the line. Explore anonymously</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Container */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 my-auto flex flex-col gap-6 sm:gap-8">
        <div className="text-center space-y-2.5 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111111] text-[#F9E828] text-[10px] font-mono font-bold uppercase tracking-widest shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F9E828] animate-pulse" />
            <span>PORTAL SELECTION</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight font-display uppercase">
            Enter the City.
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] font-medium leading-relaxed">
            Select your portal. Lagos leisure seekers and venue operators enter dedicated spaces.
          </p>
        </div>

        {/* The Split Reality: 50/50 Desktop Split, Stacked on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
          {/* World 1: Consumer (Nightlife / Atmospheric) */}
          <Link
            href={plannerHref}
            className="group relative bg-[#111111] text-white rounded-[24px] p-6 sm:p-8 border border-black shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden tap-feedback min-h-[300px]"
          >
            {/* Contextual Nightlife Atmosphere Glow */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-500"
              style={{
                background: "radial-gradient(ellipse at 80% 20%, rgba(249, 232, 40, 0.18), transparent 70%), radial-gradient(ellipse at 20% 80%, rgba(229, 77, 46, 0.12), transparent 60%)"
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#111111] bg-[#F9E828] px-2.5 py-1 rounded-md">
                  OyaPlanner
                </span>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                  Consumer World
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display uppercase group-hover:text-[#F9E828] transition-colors">
                  For OyaPlanners
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                  Discover curated Lagos spots, know the exact landed damage, and lock in group plans before stepping out.
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-[#F9E828]">
              <span>Enter as an OyaPlanner</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* World 2: Operator's Desk (Architectural / Dark Mode) */}
          <Link
            href={businessHref}
            className="group relative bg-[#1A1A1A] text-[#F6F6F2] rounded-[24px] p-6 sm:p-8 border border-[#2D2D2D] hover:border-[#F9E828]/50 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden tap-feedback min-h-[300px]"
          >
            {/* Architectural Grid Glow */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.12), transparent 70%)"
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#F9E828] bg-white/10 px-2.5 py-1 rounded-md border border-white/10">
                  Operator&apos;s Desk
                </span>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                  Business World
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-serif group-hover:text-white transition-colors">
                  For Venue Operators
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                  Claim your pre-indexed venue plaque, verify live pricing, update house policies, and inspect customer demand.
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-white group-hover:text-[#F9E828] transition-colors">
              <span>Enter the Operator&apos;s Desk</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Reassurance Footer */}
        <div className="text-center flex items-center justify-center gap-2 text-xs font-mono font-medium text-[#555555]">
          <ShieldCheck className="w-4 h-4 text-[#111111]" />
          <span>Anonymous first. You can always plan and calculate damage without signing in.</span>
        </div>
      </div>

      {/* Simple Footer Links */}
      <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 border-t border-[#E5E5DE] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#777777]">
        <div>© {new Date().getFullYear()} OyaPlan. Built for Lagos.</div>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-[#111111] transition-colors">Privacy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-[#111111] transition-colors">Terms</Link>
          <span>•</span>
          <Link href="/for-business" className="hover:text-[#111111] transition-colors font-bold">For Businesses</Link>
        </div>
      </footer>
    </main>
  );
}
