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
    <main className="min-h-[100dvh] bg-[#FAF7F2] text-midnight-lagoon flex flex-col justify-between selection:bg-[#008751]/20">
      {/* Top Brand Bar */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 tap-feedback focus-visible:outline-2 focus-visible:outline-[#008751] rounded-lg">
          <Image
            src="/logo.png"
            alt="OyaPlan"
            width={610}
            height={143}
            className="h-7 sm:h-8 w-auto object-contain shrink-0"
            priority
          />
        </Link>
        <Link
          href="/"
          className="text-xs font-bold text-text-secondary hover:text-[#008751] transition-colors py-1 px-3 rounded-full hover:bg-white border border-transparent hover:border-[#EAE4DC]"
        >
          Explore anonymously →
        </Link>
      </header>

      {/* Main Container */}
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 my-auto">
        <div className="text-center space-y-3 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#008751]/10 text-[#008751] text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Choose Your Experience</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-midnight-lagoon tracking-tight">
            How are you using OyaPlan?
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            Select how you want to sign in. Consumers and venue partners use dedicated spaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Option 1: OyaPlanner (Consumer) */}
          <Link
            href={plannerHref}
            className="group relative bg-white rounded-[24px] p-6 sm:p-7 border-2 border-[#EAE4DC] hover:border-[#008751] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between tap-feedback focus-visible:outline-2 focus-visible:outline-[#008751]"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EAFDF3] text-[#008751] border border-[#A3F3C6] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded-md">
                  Consumer
                </div>
                <h2 className="text-lg sm:text-xl font-black text-midnight-lagoon group-hover:text-[#008751] transition-colors">
                  For OyaPlanners
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Discover Lagos venues, know what you&apos;ll spend before leaving home, save spots, and lock in group plans.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-border-default/60 flex items-center justify-between text-xs sm:text-sm font-bold text-[#008751]">
              <span>Continue as an OyaPlanner</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Option 2: Business (Operator) */}
          <Link
            href={businessHref}
            className="group relative bg-white rounded-[24px] p-6 sm:p-7 border-2 border-[#EAE4DC] hover:border-midnight-lagoon shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between tap-feedback focus-visible:outline-2 focus-visible:outline-midnight-lagoon"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#010528]/5 text-midnight-lagoon border border-[#EAE4DC] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-midnight-lagoon bg-midnight-lagoon/10 px-2 py-0.5 rounded-md">
                  Venue Operator
                </div>
                <h2 className="text-lg sm:text-xl font-black text-midnight-lagoon transition-colors">
                  For Businesses
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Manage your venue profile, sync live pricing, update hours and policies, and review planning demand.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-border-default/60 flex items-center justify-between text-xs sm:text-sm font-bold text-midnight-lagoon">
              <span>Continue as a Business</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Reassurance Footer */}
        <div className="mt-8 text-center flex items-center justify-center gap-2 text-xs font-medium text-text-muted">
          <ShieldCheck className="w-4 h-4 text-[#008751]" />
          <span>Anonymous first. You can always plan without signing in.</span>
        </div>
      </div>

      {/* Simple Footer Links */}
      <footer className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 border-t border-[#EAE4DC] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
        <div>© {new Date().getFullYear()} OyaPlan. Built for Lagos.</div>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-text-primary transition-colors">Terms</Link>
          <span>•</span>
          <Link href="/for-business" className="hover:text-[#008751] transition-colors font-bold">For Businesses</Link>
        </div>
      </footer>
    </main>
  );
}
