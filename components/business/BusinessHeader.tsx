"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, Compass, Menu, X, MessageSquare } from "lucide-react";

export function BusinessHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isClaimPage = pathname?.startsWith("/business/claim");

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-border-default z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
        {/* Left: Brand + Business Identifier */}
        <div className="flex items-center gap-3">
          <Link href="/for-business" className="flex items-center gap-2.5 tap-feedback">
            <Image
              src="/logo.png"
              alt="OyaPlan"
              width={610}
              height={143}
              className="h-6 w-auto object-contain shrink-0"
              priority
            />
            <span className="text-[10px] font-black text-brand-green uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAFDF3] border border-[#A3F3C6]">
              Business
            </span>
          </Link>

          {/* Context Switcher back to User Outing Planner */}
          <span className="hidden md:inline-block text-border-default">|</span>
          <Link
            href="/"
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand-green transition-colors px-2 py-1 rounded-lg hover:bg-surface-grey tap-feedback"
            title="Switch to Outing Planner"
          >
            <Compass className="w-3.5 h-3.5 text-brand-green" />
            <span>Outing Planner</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="/for-business"
            className={`text-xs font-semibold transition-colors px-2.5 py-1.5 rounded-lg ${
              pathname === "/for-business"
                ? "text-brand-green bg-[#EAFDF3]"
                : "text-text-secondary hover:text-midnight-lagoon hover:bg-surface-grey"
            }`}
          >
            Overview
          </Link>

          <a
            href="https://wa.me/2348000000000?text=Hi%20OyaPlan%20Team%2C%20I%20have%20a%20question%20about%20listing%20my%20venue."
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-text-secondary hover:text-midnight-lagoon hover:bg-surface-grey transition-colors px-2.5 py-1.5 rounded-lg flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#008751]" />
            <span>Support</span>
          </a>

          <Link
            href="/account?next=/business"
            className="text-xs font-semibold text-text-secondary hover:text-midnight-lagoon px-3 py-2 rounded-xl transition-colors"
          >
            Sign In
          </Link>

          {!isClaimPage && (
            <Link
              href="/business/claim"
              className="h-9 px-4 bg-brand-green hover:bg-[#007043] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer tap-feedback"
            >
              <span>Claim Business</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </nav>

        {/* Mobile Actions & Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {!isClaimPage && (
            <Link
              href="/business/claim"
              className="h-8 px-3 bg-brand-green hover:bg-[#007043] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all shadow-xs tap-feedback"
            >
              <span>Claim</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-midnight-lagoon hover:bg-surface-grey rounded-lg transition-colors tap-feedback"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border-default bg-white px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <Link
              href="/for-business"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-surface-grey"
            >
              Business Overview
            </Link>
            <Link
              href="/business/claim"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-surface-grey"
            >
              Claim Your Venue
            </Link>
            <Link
              href="/account?next=/business"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-surface-grey"
            >
              Sign In to Business Portal
            </Link>
            <a
              href="https://wa.me/2348000000000?text=Hi%20OyaPlan%20Team%2C%20I%20have%20a%20question%20about%20listing%20my%20venue."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#008751] hover:bg-[#EAFDF3]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Support</span>
            </a>
          </div>

          <div className="pt-2 border-t border-border-default">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-surface-grey"
            >
              <Compass className="w-4 h-4 text-brand-green" />
              <span>Switch to Outing Planner</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
