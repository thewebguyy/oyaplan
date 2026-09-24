"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, Compass, Menu, X, MessageSquare, Sparkles } from "lucide-react";

export function BusinessHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isClaimPage = pathname?.startsWith("/business/claim");

  return (
    <>
      {/* ── Floating Pill Container ── */}
      <header className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-4xl bg-white/90 backdrop-blur-xl border border-[#EAE4DC] shadow-[0_10px_35px_rgba(0,0,0,0.08)] px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full flex items-center justify-between transition-all">
        {/* Left: Brand + Business Capsule */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link href="/for-business" className="flex items-center gap-2 tap-feedback">
            <Image
              src="/logo.png"
              alt="OyaPlan"
              width={610}
              height={143}
              className="h-5 sm:h-6 w-auto object-contain shrink-0"
              priority
            />
            <span className="text-[9px] sm:text-[10px] font-black text-brand-green uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAFDF3] border border-[#A3F3C6]">
              Business
            </span>
          </Link>
        </div>

        {/* Center: Playbook Navigation Anchors (Desktop) */}
        {!isClaimPage && (
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-text-secondary">
            <a
              href="#why-oyaplan"
              className="px-3 py-1.5 rounded-full hover:text-midnight-lagoon hover:bg-[#FAF7F2] transition-colors"
            >
              Why OyaPlan
            </a>
            <a
              href="#how-it-works"
              className="px-3 py-1.5 rounded-full hover:text-midnight-lagoon hover:bg-[#FAF7F2] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#spotlight"
              className="px-3 py-1.5 rounded-full hover:text-midnight-lagoon hover:bg-[#FAF7F2] transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Spotlight</span>
            </a>
            <a
              href="#faq"
              className="px-3 py-1.5 rounded-full hover:text-midnight-lagoon hover:bg-[#FAF7F2] transition-colors"
            >
              FAQ
            </a>
          </nav>
        )}

        {/* Right Actions: Switch to Planner + Login + Claim Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand-green px-2.5 py-1.5 rounded-full hover:bg-[#FAF7F2] transition-colors tap-feedback"
            title="Switch to Outing Planner"
          >
            <Compass className="w-3.5 h-3.5 text-brand-green" />
            <span className="hidden md:inline">Planner</span>
          </Link>

          <Link
            href="/account?next=/business"
            className="hidden sm:inline-block text-xs font-semibold text-text-secondary hover:text-midnight-lagoon px-2.5 py-1.5 rounded-full transition-colors"
          >
            Partner Login
          </Link>

          {!isClaimPage && (
            <Link
              href="/business/claim"
              className="h-8 sm:h-9 px-3.5 sm:px-4 bg-brand-green hover:bg-[#007043] text-white text-[11px] sm:text-xs font-bold rounded-full flex items-center gap-1.5 transition-all shadow-xs cursor-pointer tap-feedback"
            >
              <span>Claim Venue</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 text-midnight-lagoon hover:bg-surface-grey rounded-full transition-colors tap-feedback"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile Floating Drawer ── */}
      {mobileMenuOpen && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md bg-white/95 backdrop-blur-2xl border border-[#EAE4DC] rounded-3xl p-4 shadow-xl space-y-2 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            <a
              href="#why-oyaplan"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-surface-grey"
            >
              Why OyaPlan
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-surface-grey"
            >
              How It Works
            </a>
            <a
              href="#spotlight"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-surface-grey"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>OyaSpotlight (Premium)</span>
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-surface-grey"
            >
              Frequently Asked Questions
            </a>
          </div>

          <div className="pt-2 border-t border-border-default/60 space-y-1">
            <Link
              href="/account?next=/business"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-surface-grey"
            >
              Partner Login
            </Link>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-green hover:bg-[#EAFDF3]"
            >
              <Compass className="w-4 h-4 text-brand-green" />
              <span>Switch to Outing Planner</span>
            </Link>
            <a
              href="https://wa.me/2348000000000?text=Hi%20OyaPlan%20Team%2C%20I%20have%20a%20question%20about%20listing%20my%20venue."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#008751] hover:bg-[#EAFDF3]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
