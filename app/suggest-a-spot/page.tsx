"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Loader2, Sparkles, Navigation, Check, Phone } from "lucide-react";
import { submitSpotSuggestion } from "@/lib/actions/submitSpotSuggestion";
import { triggerMoment } from "@/components/ui/moment-of-delight";

const VIBE_TAGS = [
  "Soft Life",
  "Owambe/Party",
  "Strictly Amala",
  "Aesthetic/Pictures",
  "Date Night",
  "Chill",
  "Foodie Chop",
  "Quick Linkup",
];

const PRICE_TIERS = [
  { value: "15000", label: "Under ₦15,000 (Lowkey vibe)" },
  { value: "30000", label: "₦15,000 – ₦30,000 (Standard flex)" },
  { value: "50000", label: "₦30,000 – ₦50,000 (Chop Life)" },
  { value: "100000", label: "₦50,000 – ₦100,000 (Big Boy Energy)" },
  { value: "250000", label: "Over ₦100,000 (Baller status)" },
];

/**
 * 3D-Styled Vector OyaPlan Scout Badge:
 * High-gloss golden pin shaped like a stylized Lagos Danfo crest with metallic bevels.
 */
function ScoutBadgePin({ className = "", animated = false }: { className?: string; animated?: boolean }) {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Golden Aura Glow */}
      <div className="absolute inset-0 rounded-full bg-[#F9E828]/35 blur-xl pointer-events-none" />
      
      <svg
        viewBox="0 0 100 100"
        className={`w-20 h-20 sm:w-24 sm:h-24 filter drop-shadow-[0_8px_16px_rgba(17,17,17,0.35)] ${
          animated ? "animate-[bounce_3s_ease-in-out_infinite]" : ""
        }`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF182" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <linearGradient id="badgeFace" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1C1C1E" />
            <stop offset="100%" stopColor="#0B0B0C" />
          </linearGradient>
          <linearGradient id="danfoYellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF275" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Outer Metallic Beveled Hex-Shield */}
        <polygon
          points="50,4 90,26 90,74 50,96 10,74 10,26"
          fill="url(#goldRim)"
          stroke="#111111"
          strokeWidth="3"
        />

        {/* Inner Facet Inset */}
        <polygon
          points="50,11 83,29 83,71 50,89 17,71 17,29"
          fill="url(#badgeFace)"
          stroke="#F59E0B"
          strokeWidth="1.5"
        />

        {/* Danfo Bus Silhouette Graphic */}
        {/* Bus Body */}
        <rect x="32" y="38" width="36" height="22" rx="3" fill="url(#danfoYellow)" stroke="#111111" strokeWidth="2" />
        {/* Windshield & Windows */}
        <rect x="35" y="41" width="10" height="7" rx="1" fill="#111111" />
        <rect x="48" y="41" width="8" height="7" rx="1" fill="#111111" />
        <rect x="58" y="41" width="7" height="7" rx="1" fill="#111111" />
        {/* Double Black Racing Stripes */}
        <line x1="32" y1="51" x2="68" y2="51" stroke="#111111" strokeWidth="1.5" />
        <line x1="32" y1="53.5" x2="68" y2="53.5" stroke="#111111" strokeWidth="1.5" />
        {/* Wheels */}
        <circle cx="39" cy="61" r="4.5" fill="#111111" stroke="#F59E0B" strokeWidth="1" />
        <circle cx="61" cy="61" r="4.5" fill="#111111" stroke="#F59E0B" strokeWidth="1" />

        {/* Top Scout Star */}
        <polygon points="50,18 52,24 58,24 53,28 55,34 50,30 45,34 47,28 42,24 48,24" fill="#F9E828" stroke="#111111" strokeWidth="0.8" />

        {/* Bottom Banner Pill */}
        <rect x="25" y="69" width="50" height="13" rx="4" fill="#F9E828" stroke="#111111" strokeWidth="1.5" />
        <text
          x="50"
          y="78.5"
          textAnchor="middle"
          fill="#111111"
          fontSize="7.5"
          fontWeight="900"
          fontFamily="monospace"
          letterSpacing="1"
        >
          SCOUT
        </text>
      </svg>
    </div>
  );
}

export default function SuggestSpotPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [formData, setFormData] = useState({
    spotName: "",
    location: "",
    estimatedPrice: "30000",
    vibe: "Soft Life",
    comment: "",
    whatsapp: ""
  });

  const handleDetectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setFormData(prev => ({ ...prev, location: prev.location || "Lekki, Lagos" }));
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingLocation(false);
        const { latitude, longitude } = pos.coords;
        let areaGuess = "Lagos Central";
        if (longitude > 3.45 && latitude < 6.5) {
          areaGuess = "Lekki / Victoria Island";
        } else if (latitude >= 6.55) {
          areaGuess = "Ikeja & Environs";
        } else if (latitude >= 6.5) {
          areaGuess = "Yaba / Surulere";
        }
        setFormData(prev => ({ ...prev, location: areaGuess }));
      },
      () => {
        setDetectingLocation(false);
        setFormData(prev => ({ ...prev, location: prev.location || "Lagos, Nigeria" }));
      },
      { timeout: 7000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const existingSubmissions = JSON.parse(localStorage.getItem("oyaplan_scout_submissions") || "[]");
      existingSubmissions.push({
        spotName: formData.spotName,
        location: formData.location,
        timestamp: Date.now()
      });
      localStorage.setItem("oyaplan_scout_submissions", JSON.stringify(existingSubmissions));

      const userProfile = JSON.parse(localStorage.getItem("oyaplan_user_profile") || "{}");
      localStorage.setItem("oyaplan_user_profile", JSON.stringify({
        ...userProfile,
        isScout: true,
        scoutBadgesCount: existingSubmissions.length
      }));
    } catch {
      /* ignore storage errors */
    }

    const result = await submitSpotSuggestion({
      spotName: formData.spotName,
      areaName: formData.location,
      roughPricePerPerson: parseInt(formData.estimatedPrice) || 30000,
      vibeDescription: `${formData.vibe}: ${formData.comment}`,
      suggesterWhatsapp: formData.whatsapp || null
    });

    setLoading(false);
    if (result.success) {
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      triggerMoment("venue_suggested");
    } else {
      setError(true);
    }
  };

  // ── 5. THE SUCCESS STATE: ANIMATED 3D SCOUT BADGE + NIGERIAN GREEN & WHITE CONFETTI ──
  if (success) {
    return (
      <main className="relative min-h-[100dvh] bg-[#F6F6F2] flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans">
        
        {/* Animated Green & White Confetti Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
          {[...Array(26)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-sm animate-bounce"
              style={{
                top: `${(i * 19) % 90}%`,
                left: `${(i * 37) % 94}%`,
                backgroundColor: i % 3 === 0 ? "#008751" : i % 3 === 1 ? "#F9E828" : "#FFFFFF",
                border: "1.5px solid #111111",
                transform: `rotate(${i * 24}deg) scale(${0.8 + (i % 5) * 0.15})`,
                animationDuration: `${1.8 + (i % 4) * 0.5}s`,
                animationDelay: `${(i % 5) * 0.15}s`,
              }}
            />
          ))}
        </div>

        {/* Scout Crown Card (Neo-Brutalist) */}
        <div className="relative max-w-md w-full bg-white border-2 border-[#111111] rounded-3xl p-7 sm:p-10 text-center space-y-6 shadow-[8px_8px_0px_0px_#111111] animate-in fade-in zoom-in-90 duration-300 z-10">
          
          {/* Unlocked Spinning Scout Badge */}
          <div className="flex justify-center -mt-2">
            <div className="animate-[spin_0.8s_cubic-bezier(0.16,1,0.3,1)_1]">
              <ScoutBadgePin className="scale-110" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-block transform -rotate-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-black uppercase tracking-widest bg-[#F9E828] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
                <span>⭐ OFFICIAL LAGOS PLUG</span>
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-[#111111] font-display uppercase tracking-tight">
              Oshey! The spot is under review.
            </h1>
            
            <p className="text-xs sm:text-sm text-[#555555] max-w-sm mx-auto leading-relaxed font-medium">
              We&apos;ll drop you a WhatsApp message once <strong className="text-[#111111]">&quot;{formData.spotName}&quot;</strong> is verified and live on OyaPlan.
            </p>
          </div>

          {/* Scout Impact Box */}
          <div className="p-4 bg-[#FFFEE5] rounded-2xl border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] text-xs text-left space-y-1">
            <div className="flex items-center gap-2 font-mono font-bold text-[#111111] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#008751]" />
              <span>Scout Impact Logged</span>
            </div>
            <p className="text-[#444444] font-medium text-[11px]">
              You just saved Lagos squads from mystery billing. Your Scout Badge points have been minted to your device.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({
                  spotName: "",
                  location: "",
                  estimatedPrice: "30000",
                  vibe: "Soft Life",
                  comment: "",
                  whatsapp: ""
                });
              }}
              className="w-full h-13 rounded-2xl bg-[#F9E828] hover:bg-[#ffe710] text-[#111111] font-display font-black text-xs uppercase tracking-wider border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] transition-all flex items-center justify-center gap-2 cursor-pointer tap-feedback"
            >
              <span>Plug Another Spot 🚀</span>
            </button>

            <Link href="/account" className="block">
              <button
                type="button"
                className="w-full h-12 rounded-2xl bg-white hover:bg-[#F6F6F2] text-[#111111] font-display font-bold text-xs uppercase tracking-wider border-2 border-[#111111] transition-colors cursor-pointer"
              >
                View My Scout Profile
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── MAIN FORM: MISSION TO CROWN THE ULTIMATE LAGOS PLUG ──
  return (
    <main className="min-h-[100dvh] bg-[#F6F6F2] p-4 sm:p-6 md:p-12 flex flex-col items-center font-sans selection:bg-[#F9E828] selection:text-[#111111]">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#555555] hover:text-[#111111] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Planner</span>
        </Link>

        {/* ── 1. COMMUNITY POWER BANNER (ASPHALT BLACK + LED TICKER + GLOWING HIGH DEMAND PILL) ── */}
        <div className="relative bg-[#0B130E] text-white p-5 rounded-3xl border-2 border-[#111111] shadow-[6px_6px_0px_0px_#111111] overflow-hidden">
          
          {/* Subtle Glowing Neon Grid & Skyline Line Drawing */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `linear-gradient(#F9E828 1px, transparent 1px), linear-gradient(90deg, #F9E828 1px, transparent 1px)`,
              backgroundSize: "32px 32px"
            }}
            aria-hidden="true"
          />

          {/* Lekki-Ikoyi Link Bridge Silhouette Line in Banner */}
          <svg
            className="absolute right-0 bottom-0 h-full w-64 pointer-events-none opacity-15 stroke-white fill-none stroke-[2]"
            viewBox="0 0 200 80"
            aria-hidden="true"
          >
            <path d="M 140 10 L 130 80 L 150 80 Z" />
            <line x1="140" y1="20" x2="90" y2="80" strokeDasharray="3 3" />
            <line x1="140" y1="35" x2="105" y2="80" strokeDasharray="3 3" />
            <line x1="140" y1="20" x2="190" y2="80" strokeDasharray="3 3" />
            <line x1="140" y1="35" x2="175" y2="80" strokeDasharray="3 3" />
            <line x1="30" y1="80" x2="200" y2="80" strokeWidth="3" />
          </svg>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Live Ticker Style Activity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#111111] border border-[#F9E828]/40 flex items-center justify-center shrink-0 shadow-inner">
                <span className="w-3 h-3 rounded-full bg-[#F9E828] animate-ping" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black text-[#F9E828] uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E575]" />
                    <span>Live Dispatch</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-white font-mono">
                  14 spots verified by Lagos Scouts this week
                </p>
              </div>
            </div>

            {/* Glowing High Demand Pill */}
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-200 bg-amber-950/80 px-3 py-1.5 rounded-full border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse shrink-0">
              <span>📍 Lekki &amp; Yaba high demand</span>
            </div>
          </div>
        </div>

        {/* ── 2. NEO-BRUTALIST FORM CARD WITH 3D SCOUT BADGE ── */}
        <div className="bg-white border-2 border-[#111111] rounded-3xl p-6 sm:p-10 md:p-12 shadow-[8px_8px_0px_0px_#111111] space-y-8 relative z-10">
          
          {/* Header & 3D Badge */}
          <div className="flex flex-col items-center text-center space-y-3">
            <ScoutBadgePin animated={true} />

            <div className="space-y-1.5 pt-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111111] font-display uppercase tracking-tight">
                Be the Ultimate Lagos Plug.
              </h1>
              <p className="text-xs sm:text-sm text-[#555555] max-w-lg mx-auto font-medium leading-relaxed">
                Put your favorite spot on the map. Drop the details below to unlock your official Scout Badge and earn bragging rights.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Field 1 & 2: Spot Name & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Spot Name */}
              <div className="space-y-2">
                <label 
                  htmlFor="spotName"
                  className="block text-xs font-mono font-black uppercase tracking-wider text-[#111111]"
                >
                  What’s the name of the spot? <span className="text-red-500">*</span>
                </label>
                <input
                  id="spotName"
                  required
                  type="text"
                  placeholder="e.g. Moist Beach Club, Buka Hut"
                  className="h-14 w-full bg-[#FCFBF9] focus:bg-white border-2 border-[#111111] rounded-2xl px-4 text-sm font-semibold text-[#111111] focus:ring-4 focus:ring-[#F9E828]/50 outline-hidden transition-all shadow-xs"
                  value={formData.spotName}
                  onChange={(e) => setFormData({ ...formData, spotName: e.target.value })}
                />
              </div>
              
              {/* Neighborhood / Area with Auto-Detect */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="location"
                    className="block text-xs font-mono font-black uppercase tracking-wider text-[#111111]"
                  >
                    Where is it located? <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Location Auto-Detect Button */}
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#008751] hover:text-[#005a36] cursor-pointer"
                  >
                    <Navigation className={`w-3 h-3 ${detectingLocation ? "animate-spin" : ""}`} />
                    <span>{detectingLocation ? "Locating..." : "Use my current location"}</span>
                  </button>
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111111]/60" />
                  <input
                    id="location"
                    required
                    type="text"
                    placeholder="e.g. Lekki Phase 1, Yaba, Ikeja GRA"
                    className="h-14 w-full bg-[#FCFBF9] focus:bg-white border-2 border-[#111111] rounded-2xl pl-11 pr-4 text-sm font-semibold text-[#111111] focus:ring-4 focus:ring-[#F9E828]/50 outline-hidden transition-all shadow-xs"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Field 3 & 4: Damage per Head & WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Damage per head? (Budget) */}
              <div className="space-y-2">
                <label 
                  htmlFor="estimatedPrice"
                  className="block text-xs font-mono font-black uppercase tracking-wider text-[#111111]"
                >
                  Damage per head? (Budget)
                </label>
                <select
                  id="estimatedPrice"
                  value={formData.estimatedPrice}
                  onChange={(e) => setFormData({ ...formData, estimatedPrice: e.target.value })}
                  className="h-14 w-full bg-[#FCFBF9] focus:bg-white border-2 border-[#111111] rounded-2xl px-4 text-sm font-semibold text-[#111111] focus:ring-4 focus:ring-[#F9E828]/50 outline-hidden transition-all shadow-xs cursor-pointer"
                >
                  {PRICE_TIERS.map((tier) => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* WhatsApp Input */}
              <div className="space-y-2">
                <label 
                  htmlFor="whatsapp"
                  className="block text-xs font-mono font-black uppercase tracking-wider text-[#111111] flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#111111]" />
                  <span>WhatsApp (Optional)</span>
                </label>
                <input
                  id="whatsapp"
                  type="text"
                  placeholder="+234... to get Scout ping when live"
                  className="h-14 w-full bg-[#FCFBF9] focus:bg-white border-2 border-[#111111] rounded-2xl px-4 text-sm font-semibold text-[#111111] focus:ring-4 focus:ring-[#F9E828]/50 outline-hidden transition-all shadow-xs"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
            </div>

            {/* Field 5: What's the vibe? (Interactive Pill Toggles) */}
            <div className="space-y-2.5">
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-[#111111]">
                What&apos;s the vibe? (Pick tags)
              </label>
              
              <div className="flex flex-wrap gap-2.5">
                {VIBE_TAGS.map((vibeOption) => {
                  const isSelected = formData.vibe === vibeOption;
                  return (
                    <button
                      key={vibeOption}
                      type="button"
                      onClick={() => setFormData({ ...formData, vibe: vibeOption })}
                      className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer tap-feedback active:scale-95 ${
                        isSelected
                          ? "bg-[#F9E828] border-2 border-[#111111] text-[#111111] shadow-[2px_2px_0px_0px_#111111] scale-102 font-black"
                          : "bg-white border-2 border-[#E5E5DE] text-[#555555] hover:border-[#111111] hover:text-[#111111]"
                      }`}
                    >
                      {vibeOption}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field 6: Give us the gist. */}
            <div className="space-y-2">
              <label 
                htmlFor="comment"
                className="block text-xs font-mono font-black uppercase tracking-wider text-[#111111]"
              >
                Give us the gist.
              </label>
              <textarea
                id="comment"
                placeholder="Why does your squad love it? (e.g., The cocktails are strong, the DJ doesn't miss, best pasta on the mainland...)"
                rows={3}
                className="w-full bg-[#FCFBF9] focus:bg-white border-2 border-[#111111] rounded-2xl p-4 text-sm font-semibold text-[#111111] focus:ring-4 focus:ring-[#F9E828]/50 outline-hidden transition-all resize-none shadow-xs"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 font-bold text-xs text-center animate-in fade-in">
                Something went wrong. Please check your inputs and network connection.
              </p>
            )}

            {/* Submit Button: Lock It In & Claim Badge 🚀 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-15 rounded-2xl bg-[#F9E828] hover:bg-[#ffe710] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0px_0px_#111111] text-[#111111] font-display font-black text-sm sm:text-base uppercase tracking-wider border-2 border-[#111111] shadow-[6px_6px_0px_0px_#111111] transition-all flex items-center justify-center gap-3 cursor-pointer tap-feedback disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Locking In Spot...</span>
                </>
              ) : (
                <>
                  <span>Lock It In &amp; Claim Badge 🚀</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
