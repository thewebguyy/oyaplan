"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, Compass, Menu, X, Sparkles } from "lucide-react";

export function BusinessHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isClaimPage = pathname?.startsWith("/business/claim");

  return (
    <>
      {/* ── Floating Pill Container (Clean & Spacious) ── */}
      <header className="fixed top-3.5 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-3xl bg-white/90 backdrop-blur-xl border border-[#EAE4DC] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-4 sm:px-6 py-2 sm:py-2.5 rounded-full flex items-center justify-between transition-all">
        {/* Left: Brand + Business Tag */}
        <Link href="/for-business" className="flex items-center gap-2 tap-feedback shrink-0">
          <Image
            src="/logo.png"
            alt="OyaPlan"
            width={610}
            height={143}
            className="h-5 sm:h-5.5 w-auto object-contain shrink-0"
            priority
          />
          <span className="text-[9px] font-black text-brand-green uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAFDF3] border border-[#A3F3C6]">
            Business
          </span>
        </Link>

        {/* Center: Essential Clean Anchors (Desktop) */}
        {!isClaimPage && (
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-text-secondary">
            <a
              href="#how-it-works"
              className="hover:text-midnight-lagoon transition-colors py-1"
            >
              How It Works
            </a>
            <a
              href="#spotlight"
              className="hover:text-midnight-lagoon transition-colors py-1 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Spotlight</span>
            </a>
            <a
              href="#faq"
              className="hover:text-midnight-lagoon transition-colors py-1"
            >
              FAQ
            </a>
          </nav>
        )}

        {/* Right Actions: Minimal Sign In + Claim Venue Button */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/account?next=/business"
            className="hidden sm:inline-block text-xs font-semibold text-text-secondary hover:text-midnight-lagoon transition-colors"
          >
            Sign In
          </Link>

          {!isClaimPage && (
            <Link
              href="/business/claim"
              className="h-8 sm:h-8.5 px-3.5 sm:px-4 bg-brand-green hover:bg-[#007043] text-white text-[11px] sm:text-xs font-bold rounded-full flex items-center gap-1.5 transition-all shadow-xs tap-feedback cursor-pointer"
            >
              <span>Claim Venue</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-midnight-lagoon hover:bg-surface-grey rounded-full transition-colors tap-feedback"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── Mobile Floating Drawer ── */}
      {mobileMenuOpen && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm bg-white/95 backdrop-blur-2xl border border-[#EAE4DC] rounded-3xl p-4 shadow-xl space-y-2 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-surface-grey"
            >
              How It Works
            </a>
            <a
              href="#spotlight"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-surface-grey"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>OyaSpotlight (Premium)</span>
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-surface-grey"
            >
              FAQ
            </a>
          </div>

          <div className="pt-2 border-t border-border-default/60 space-y-1">
            <Link
              href="/account?next=/business"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-surface-grey"
            >
              Sign In to Business Portal
            </Link>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-brand-green hover:bg-[#EAFDF3]"
            >
              <Compass className="w-4 h-4 text-brand-green" />
              <span>Switch to Outing Planner</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
