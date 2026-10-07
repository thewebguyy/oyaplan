"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUp, Check, Mail, Sparkles } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDriving, setIsDriving] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
    }, 400);
  };

  const scrollToTop = () => {
    setIsDriving(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      setIsDriving(false);
    }, 1400);
  };

  return (
    <footer className="relative w-full bg-[#111111] text-[#F6F6F2] rounded-t-[24px] sm:rounded-t-[36px] overflow-hidden border-t-2 border-[#222222] font-sans selection:bg-[#F9E828] selection:text-[#111111]">
      {/* ── Visual Anchor: Lekki-Ikoyi Link Bridge Skyline Watermark ── */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none select-none opacity-[0.06] sm:opacity-[0.08] overflow-hidden flex justify-end"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1200 360"
          className="w-full max-w-5xl h-auto text-white stroke-current fill-none"
          preserveAspectRatio="none"
        >
          {/* Bridge Lagoon Line */}
          <line x1="0" y1="310" x2="1200" y2="310" strokeWidth="3" strokeDasharray="6 4" />
          <line x1="0" y1="316" x2="1200" y2="316" strokeWidth="1.5" opacity="0.5" />
          
          {/* Island & Mainland Skyline Silhouettes */}
          <rect x="60" y="240" width="40" height="70" fill="currentColor" opacity="0.3" stroke="none" />
          <rect x="110" y="220" width="30" height="90" fill="currentColor" opacity="0.4" stroke="none" />
          <rect x="150" y="260" width="50" height="50" fill="currentColor" opacity="0.25" stroke="none" />
          <rect x="230" y="200" width="45" height="110" fill="currentColor" opacity="0.35" stroke="none" />
          
          {/* Main Cable-Stayed Pylon (Lekki-Ikoyi Link Bridge) */}
          <polygon points="760,40 735,310 785,310" strokeWidth="4" />
          <polygon points="760,40 750,310 770,310" strokeWidth="2" opacity="0.6" />
          <circle cx="760" cy="50" r="7" strokeWidth="3" />

          {/* Stay Cables (Fan Pattern Left) */}
          <line x1="760" y1="70" x2="480" y2="310" strokeWidth="1.5" />
          <line x1="760" y1="95" x2="520" y2="310" strokeWidth="1.5" />
          <line x1="760" y1="125" x2="560" y2="310" strokeWidth="1.5" />
          <line x1="760" y1="155" x2="600" y2="310" strokeWidth="1.5" />
          <line x1="760" y1="185" x2="640" y2="310" strokeWidth="1.5" />
          <line x1="760" y1="215" x2="680" y2="310" strokeWidth="1.5" />

          {/* Stay Cables (Fan Pattern Right) */}
          <line x1="760" y1="70" x2="1040" y2="310" strokeWidth="1.5" />
          <line x1="760" y1="95" x2="1000" y2="310" strokeWidth="1.5" />
          <line x1="760" y1="125" x2="960" y2="310" strokeWidth="1.5" />
          <line x1="760" y1="155" x2="920" y2="310" strokeWidth="1.5" />
          <line x1="760" y1="185" x2="880" y2="310" strokeWidth="1.5" />
          <line x1="760" y1="215" x2="840" y2="310" strokeWidth="1.5" />

          {/* Bridge Roadway Deck */}
          <line x1="380" y1="310" x2="1140" y2="310" strokeWidth="6" />
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── TOP HALF: THE HOOK (Fat Footer Banner + Don't Dull Newsletter) ── */}
        <div className="pt-12 sm:pt-16 pb-12 border-b border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center justify-between">
            {/* Left: FOMO Newsletter CTA */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A1A] border border-[#F9E828]/30 text-[#F9E828] text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Lasgidi Dispatch</span>
              </div>
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase font-display leading-[1.05]">
                  Don&apos;t dull.
                </h2>
                <p className="text-sm sm:text-base text-[#AAAAAA] font-medium mt-2 max-w-xl leading-relaxed">
                  Get the latest spots, hidden gems, and menu updates dropped in your inbox before they cast.
                </p>
              </div>

              {/* Newsletter Form */}
              <div className="pt-1">
                {subscribed ? (
                  <div className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#008751]/20 border border-[#008751] text-[#78E2A0] text-sm font-semibold font-mono animate-in fade-in zoom-in-95 duration-200">
                    <Check className="w-4 h-4 text-[#008751] stroke-[3]" />
                    <span>You&apos;re plugged in! No dulling.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-md">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@domain.com"
                        required
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#1A1A1A] border-2 border-white/15 focus:border-[#F9E828] focus:outline-hidden text-sm text-white placeholder:text-white/40 transition-colors font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="h-12 px-6 rounded-xl bg-[#F9E828] hover:bg-[#ffe600] active:scale-95 text-[#111111] font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(249,232,40,0.3)] shrink-0 disabled:opacity-50"
                    >
                      <span>{loading ? "Plugging..." : "Update Me"}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right: Stylized Brand Anchor & Danfo-themed Social Hub */}
            <div className="lg:col-span-5 flex flex-col lg:items-end justify-between space-y-6">
              <Link href="/" className="inline-block group">
                <Image
                  src="/logo.png"
                  alt="OyaPlan"
                  width={610}
                  height={143}
                  className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                />
              </Link>
              <p className="text-xs sm:text-sm text-[#888888] font-medium lg:text-right max-w-sm">
                Lagos&apos; verified outing calculator and price breakdown engine. Know the real cost before stepping out.
              </p>

              {/* Social Media Icons (Bold Danfo Yellow & Black Hover State) */}
              <div className="flex items-center gap-3">
                {/* X (formerly Twitter) */}
                <a
                  href="https://x.com/oyaplan"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="OyaPlan on X"
                  className="w-10 h-10 rounded-xl bg-[#1A1A1A] border-2 border-white/10 text-white hover:bg-[#F9E828] hover:text-[#111111] hover:border-[#F9E828] hover:shadow-[0_4px_12px_rgba(249,232,40,0.25)] transition-all flex items-center justify-center tap-feedback cursor-pointer group"
                >
                  <svg className="w-4 h-4 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com/oyaplan"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="OyaPlan on Instagram"
                  className="w-10 h-10 rounded-xl bg-[#1A1A1A] border-2 border-white/10 text-white hover:bg-[#F9E828] hover:text-[#111111] hover:border-[#F9E828] hover:shadow-[0_4px_12px_rgba(249,232,40,0.25)] transition-all flex items-center justify-center tap-feedback cursor-pointer group"
                >
                  <svg className="w-4 h-4 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://tiktok.com/@oyaplan"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="OyaPlan on TikTok"
                  className="w-10 h-10 rounded-xl bg-[#1A1A1A] border-2 border-white/10 text-white hover:bg-[#F9E828] hover:text-[#111111] hover:border-[#F9E828] hover:shadow-[0_4px_12px_rgba(249,232,40,0.25)] transition-all flex items-center justify-center tap-feedback cursor-pointer group"
                >
                  <svg className="w-4 h-4 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── MIDDLE HALF: THE LINKS (Lagos Microcopy Navigation Grid) ── */}
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Column 1: Lasgidi Reality */}
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F9E828]" />
                <h3 className="font-display font-black text-xs uppercase tracking-widest text-white">
                  OyaPlan
                </h3>
              </div>
              <p className="text-xs text-[#888888] leading-relaxed font-medium">
                The only outing intelligence platform built specifically for how Lagosians actually spend, move, and flex.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1C1C1E] border border-white/10 text-[10px] font-mono font-bold text-[#F9E828] uppercase tracking-wider">
                  Verified Outing Engine
                </span>
              </div>
            </div>

            {/* Column 2: Set the Vibe */}
            <div>
              <h3 className="font-display font-black text-xs uppercase tracking-widest text-white mb-5 flex items-center gap-2">
                <span>Set the Vibe</span>
              </h3>
              <ul className="flex flex-col gap-3 font-medium text-xs sm:text-sm">
                <li>
                  <Link
                    href="/guides"
                    className="text-[#999999] hover:text-[#F9E828] hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#F9E828] transition-colors" />
                    <span>Romantic Settings</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guides"
                    className="text-[#999999] hover:text-[#F9E828] hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#F9E828] transition-colors" />
                    <span>Squad Linkups</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guides"
                    className="text-[#999999] hover:text-[#F9E828] hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#F9E828] transition-colors" />
                    <span>Birthday Turn Up</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guides"
                    className="text-[#999999] hover:text-[#F9E828] hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#F9E828] transition-colors" />
                    <span>Just Me (Solo Waka)</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Island or Mainland? */}
            <div>
              <h3 className="font-display font-black text-xs uppercase tracking-widest text-white mb-5 flex items-center gap-2">
                <span>Island or Mainland?</span>
              </h3>
              <ul className="flex flex-col gap-3 font-medium text-xs sm:text-sm">
                <li>
                  <Link
                    href="/explore/ikeja"
                    className="text-[#999999] hover:text-[#F9E828] hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#F9E828] transition-colors" />
                    <span>Ikeja &amp; Environs</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/explore/lekki-phase-1"
                    className="text-[#999999] hover:text-[#F9E828] hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#F9E828] transition-colors" />
                    <span>Lekki / Ikate</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/explore/vi"
                    className="text-[#999999] hover:text-[#F9E828] hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#F9E828] transition-colors" />
                    <span>VI / Ikoyi</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/explore/yaba"
                    className="text-[#999999] hover:text-[#F9E828] hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#F9E828] transition-colors" />
                    <span>Yaba / Surulere</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: The Movement */}
            <div>
              <h3 className="font-display font-black text-xs uppercase tracking-widest text-white mb-5 flex items-center gap-2">
                <span>The Movement</span>
              </h3>
              <ul className="flex flex-col gap-3 font-medium text-xs sm:text-sm">
                <li>
                  <Link
                    href="/suggest-a-spot"
                    className="text-[#999999] hover:text-[#F9E828] hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#F9E828] transition-colors" />
                    <span>Plug a Spot</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/explore"
                    className="text-[#999999] hover:text-[#F9E828] hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#F9E828] transition-colors" />
                    <span>The Full Directory</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/feedback"
                    className="text-[#999999] hover:text-[#F9E828] hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#F9E828] transition-colors" />
                    <span>Tell Us Your Mind</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-[#999999] hover:text-[#F9E828] hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#F9E828] transition-colors" />
                    <span>Our Story</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR: THE LEGAL & DANFO SCROLL TO TOP ── */}
        <div className="pt-8 pb-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Culturally Grounded "Made In" Badge */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#777777] font-medium text-center md:text-left">
            <span>Built with 💛 and Traffic in Lagos, Nigeria. © {new Date().getFullYear()} OyaPlan.</span>
          </div>

          {/* Legal Links & Interactive Danfo Scroll to Top */}
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-[#777777] hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-[#777777] hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/beta"
              className="text-xs text-[#F9E828] hover:underline font-bold font-mono transition-colors"
            >
              Beta Program
            </Link>

            {/* Playful Micro-Interaction: Danfo "Back to Top" Bus Button */}
            <button
              type="button"
              onClick={scrollToTop}
              title="Drive to top of page"
              aria-label="Back to top"
              className={`relative flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-full bg-[#1A1A1A] hover:bg-[#252525] border border-white/15 hover:border-[#F9E828] text-xs font-mono font-bold text-white transition-all cursor-pointer tap-feedback group ${
                isDriving ? "-translate-y-3 opacity-90 transition-transform duration-500 ease-out" : ""
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider text-[#AAAAAA] group-hover:text-white">
                Top
              </span>

              {/* Minimal Flat-Design Yellow Danfo Bus SVG */}
              <div className="relative w-7 h-4 bg-[#F9E828] rounded-xs border border-[#111111] overflow-hidden flex flex-col justify-between shadow-xs">
                {/* Windshield / Windows */}
                <div className="flex items-center gap-0.5 pt-0.5 px-0.5">
                  <div className="h-1 w-2 bg-[#111111]/70 rounded-[1px]" />
                  <div className="h-1 w-1.5 bg-[#111111]/70 rounded-[1px]" />
                  <div className="h-1 w-1.5 bg-[#111111]/70 rounded-[1px]" />
                </div>
                {/* Iconic Danfo Black Double Stripes */}
                <div className="w-full flex flex-col gap-[0.5px]">
                  <div className="w-full h-[1px] bg-[#111111]" />
                  <div className="w-full h-[1px] bg-[#111111]" />
                </div>
                {/* Wheels */}
                <div className="absolute -bottom-1 left-0.5 w-1.5 h-1.5 bg-[#111111] rounded-full border border-white/40" />
                <div className="absolute -bottom-1 right-0.5 w-1.5 h-1.5 bg-[#111111] rounded-full border border-white/40" />
              </div>

              {/* Tiny upward arrow */}
              <ArrowUp className="w-3.5 h-3.5 text-[#F9E828] group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
