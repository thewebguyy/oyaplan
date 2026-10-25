"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Flame,
  Check,
  Sparkles,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { sanitizeReturnTo } from "@/lib/utils/returnTo";
import { trackEvent } from "@/lib/analytics/trackClient";
import { useAuth } from "@/components/providers/AuthProvider";

export default function BusinessAuthBridge() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();

  const rawReturnTo = searchParams?.get("returnTo") || searchParams?.get("next");
  const fallbackReturnTo = "/business";
  const returnTo = sanitizeReturnTo(rawReturnTo, fallbackReturnTo);

  // If already authenticated, redirect to business target
  useEffect(() => {
    if (session) {
      router.push(returnTo.startsWith("/business") ? returnTo : "/business");
    }
  }, [session, returnTo, router]);

  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildCallbackUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://oyaplan.com";
    const redirectUrl = new URL(`${origin}/api/auth/callback`);
    const target = returnTo.startsWith("/business") ? returnTo : "/business";
    redirectUrl.searchParams.set("next", target);
    return redirectUrl.toString();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter your venue management or operator email address.");
      return;
    }

    setLoading(true);
    setError(null);

    trackEvent("auth_initiated", {
      category: "Activation",
      source: "business_login_email",
      path: window.location.pathname,
      version: "1.0",
    });

    try {
      const redirectUrl = buildCallbackUrl();
      const { error: signInError } = await supabaseBrowser.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (signInError) {
        setError(signInError.message || "Failed to send access link. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Unable to connect right now. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter your venue management or operator email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError(null);

    trackEvent("auth_initiated", {
      category: "Activation",
      source: "business_login_password",
      path: window.location.pathname,
      version: "1.0",
    });

    try {
      const { error: signInError } = await supabaseBrowser.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        setError(signInError.message || "Invalid credentials. Please verify your email and password.");
      } else {
        const target = returnTo.startsWith("/business") ? returnTo : "/business";
        router.push(target);
        router.refresh();
      }
    } catch {
      setError("Unable to connect right now. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    trackEvent("auth_initiated", {
      category: "Activation",
      source: "business_login_google",
      path: window.location.pathname,
      version: "1.0",
    });

    try {
      const redirectUrl = buildCallbackUrl();
      const { error: oauthError } = await supabaseBrowser.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (oauthError) {
        setError(oauthError.message || "Google sign in failed. Please try email.");
        setGoogleLoading(false);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-[#0A0C10] text-[#F5F1E8] flex flex-col justify-between selection:bg-[#008751]/40 relative overflow-hidden font-sans">
      
      {/* ── AMBIENT "LIVE PULSE" BACKGROUND LIGHTING ── */}
      <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] bg-gradient-to-br from-[#008751]/20 via-[#005a35]/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-gradient-to-tl from-[#E59A28]/15 via-amber-700/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-[40%] right-[30%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] bg-[#004B8E]/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Subtle Architectural Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── TOP NAVIGATION BAR ── */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/for-business" className="flex items-center gap-2.5 tap-feedback group">
            <Image
              src="/logo.png"
              alt="OyaPlan"
              width={610}
              height={143}
              className="h-7 w-auto object-contain shrink-0 invert brightness-200"
              style={{ width: "auto", height: "26px" }}
              priority
            />
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-sans font-bold tracking-widest text-[#E59A28] bg-[#E59A28]/15 border border-[#E59A28]/30 px-2.5 py-0.5 rounded-full uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E59A28] animate-pulse" />
              THE FLOOR
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/for-business"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white transition-colors py-2 px-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 tap-feedback"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#00E575]" />
            <span>Back to For-Business</span>
          </Link>
        </div>
      </header>

      {/* ── SPLIT-SCREEN MAIN STAGE (60/40 LIVE PULSE COMMAND CENTER) ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 my-auto flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center w-full">
          
          {/* Left Column: Brand Prestige & Real-Time Telemetry (The Live Pulse) */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#008751]/15 border border-[#008751]/35 text-[#00E575] text-xs font-sans font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#00E575] animate-pulse" />
                <span>HOSPITALITY COMMAND CENTER · LIVE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.06]">
                Where Lagos decides where to <span className="text-[#00E575]">spend</span>.
              </h1>

              <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-xl font-normal">
                Manage your live menu prices, monitor squad planning volume, and welcome high-intent tables who already know their Outside Math before walking through your door.
              </p>
            </div>

            {/* Live Telemetry Card (Proof of Platform Traffic) */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-w-xl">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
                <div className="flex items-center gap-2 text-[#00E575] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#00E575] animate-ping" />
                  <span>THE FLOOR · REAL-TIME TELEMETRY</span>
                </div>
                <span className="text-white/40 font-mono text-[11px]">LAGOS METRIC PULSE</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">3,400+</span>
                  <p className="text-[11px] text-white/60 leading-tight">Squads planning outings this week</p>
                </div>
                <div className="space-y-1">
                  <span className="text-2xl sm:text-3xl font-black text-[#E59A28] tracking-tight font-mono">₦140M+</span>
                  <p className="text-[11px] text-white/60 leading-tight">Budgeted table spend calculated</p>
                </div>
                <div className="space-y-1">
                  <span className="text-2xl sm:text-3xl font-black text-[#00E575] tracking-tight font-mono">0%</span>
                  <p className="text-[11px] text-white/60 leading-tight">Bill shock disputes on verified menus</p>
                </div>
              </div>

              {/* Live Ticker Line */}
              <div className="bg-black/40 rounded-2xl p-3 border border-white/5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-white/90">
                  <Flame className="w-3.5 h-3.5 text-[#E59A28] shrink-0" />
                  <span className="truncate">4 squads actively costing a 6-person dinner in Lekki Phase 1</span>
                </div>
                <div className="flex items-center gap-2 text-white/70 text-[11px]">
                  <Check className="w-3.5 h-3.5 text-[#00E575] shrink-0" />
                  <span>100% direct deposits — zero aggregator cuts or middleman markups</span>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Sleek Frosted Login Portal */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
            <div className="bg-[#12151B]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/5">
              
              {success ? (
                /* Success State (Clean Confirmation) */
                <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-[#008751]/15 text-[#00E575] border border-[#008751]/30 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8 text-[#00E575]" />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#00E575] block">
                      ACCESS LINK SENT
                    </span>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      Check your inbox
                    </h2>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                      We sent a secure single-use access link to:
                    </p>
                    <div className="inline-block bg-black/60 font-mono font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl text-[#00E575] border border-white/10 max-w-full truncate">
                      {email}
                    </div>
                  </div>

                  <div className="p-4 bg-white/[0.04] rounded-2xl border border-white/10 text-left text-xs text-white/70 space-y-2">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#00E575]" /> 
                      <span>Open on this device</span>
                    </div>
                    <p className="leading-relaxed">Click the link inside your email to immediately access your venue dashboard on The Floor.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false);
                      setError(null);
                    }}
                    className="block w-full text-center text-xs font-semibold text-white/60 hover:text-white transition-colors py-2 cursor-pointer"
                  >
                    ← Use a different email address
                  </button>
                </div>
              ) : (
                /* Login Form State */
                <div className="space-y-6">
                  
                  {/* Form Header */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-sans font-bold text-[#00E575] uppercase tracking-widest block">
                      OPERATOR ACCESS
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Access The Floor.
                    </h2>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                      Manage your presence, review squads, and control the vibe.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-medium flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Redesigned Google SSO Button (Matches CTA Height and System Styling) */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading || loading}
                      className="w-full h-13 rounded-xl border border-white/15 hover:border-white/30 bg-white/[0.06] hover:bg-white/[0.1] text-xs sm:text-sm font-semibold text-white flex items-center justify-center gap-3 transition-all tap-feedback disabled:opacity-60 cursor-pointer shadow-sm"
                    >
                      {googleLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                      )}
                      <span>Sign in with Google</span>
                    </button>
                  </div>

                  {/* Refined Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="w-full border-t border-white/10" />
                    <span className="bg-[#12151B] px-3 text-[10px] font-sans font-bold uppercase tracking-widest text-white/50 absolute">
                      OR DIRECT ACCESS
                    </span>
                  </div>

                  {/* Auth Method Switcher Tabs */}
                  <div className="flex rounded-xl bg-black/40 border border-white/10 p-1">
                    <button
                      type="button"
                      onClick={() => { setAuthMethod('password'); setError(null); }}
                      className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                        authMethod === 'password'
                          ? 'bg-[#008751] text-white shadow-sm'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Password Access
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMethod('otp'); setError(null); }}
                      className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                        authMethod === 'otp'
                          ? 'bg-[#008751] text-white shadow-sm'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Magic Link / Code
                    </button>
                  </div>

                  {/* High-Contrast Accessible Form */}
                  <form onSubmit={authMethod === 'password' ? handlePasswordSubmit : handleEmailSubmit} className="space-y-4">
                    <div className="space-y-2 text-left">
                      <label htmlFor="business-email" className="block text-xs font-semibold text-white/90">
                        Venue Management Email
                      </label>
                      <input
                        id="business-email"
                        type="email"
                        required
                        placeholder="manager@venue.ng"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-13 rounded-xl bg-black/50 border border-white/20 focus:border-[#00E575] focus:bg-black/70 focus:ring-2 focus:ring-[#00E575]/20 text-sm text-white font-medium px-4 outline-none transition-all placeholder:text-white/60"
                      />
                    </div>

                    {authMethod === 'password' && (
                      <div className="space-y-2 text-left animate-in fade-in duration-150">
                        <label htmlFor="business-password" className="block text-xs font-semibold text-white/90">
                          Password
                        </label>
                        <input
                          id="business-password"
                          type="password"
                          required
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full h-13 rounded-xl bg-black/50 border border-white/20 focus:border-[#00E575] focus:bg-black/70 focus:ring-2 focus:ring-[#00E575]/20 text-sm text-white font-medium px-4 outline-none transition-all placeholder:text-white/60"
                        />
                      </div>
                    )}

                    {/* Primary CTA with Smooth Micro-Interaction */}
                    <button
                      type="submit"
                      disabled={loading || googleLoading}
                      className="w-full h-13 rounded-xl bg-[#008751] hover:bg-[#009E5F] active:bg-[#006e40] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 tap-feedback disabled:opacity-60 cursor-pointer group"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>{authMethod === 'password' ? 'Sign In & Enter The Floor' : 'Send Access Code'}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Direct Entry to The Floor without claim barrier */}
                  <div className="pt-3 border-t border-white/10 text-center space-y-2">
                    <Link
                      href="/business"
                      className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-[#00E575] hover:text-[#33FFA0] transition-colors flex items-center justify-center gap-1.5 tap-feedback"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Enter The Floor Directly (No Claim Needed) →</span>
                    </Link>
                    <p className="text-[11px] text-white/50">
                      Want to officially register your venue?{" "}
                      <Link href="/business/claim" className="text-white/70 hover:text-white underline">
                        Claim spot
                      </Link>
                    </p>
                  </div>

                </div>
              )}

            </div>

            {/* Switch to Consumer Link */}
            <div className="mt-5 text-center">
              <p className="text-xs text-white/50">
                Looking to plan an outing?{" "}
                <Link
                  href={`/login${rawReturnTo ? `?returnTo=${encodeURIComponent(rawReturnTo)}` : ""}`}
                  className="font-semibold text-[#00E575] hover:underline"
                >
                  Sign in as an OyaPlanner →
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50 font-sans">
        <div>© {new Date().getFullYear()} OyaPlan · Lagos Hospitality Command Infrastructure</div>
        <Link href="/for-business" className="hover:text-white transition-colors">
          How The Floor Works
        </Link>
      </footer>

    </main>
  );
}
