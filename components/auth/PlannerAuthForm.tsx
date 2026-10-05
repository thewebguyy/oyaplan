"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { sanitizeReturnTo } from "@/lib/utils/returnTo";
import { trackEvent } from "@/lib/analytics/trackClient";
import { useAuth } from "@/components/providers/AuthProvider";

export default function PlannerAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();

  const rawReturnTo = searchParams.get("returnTo") || searchParams.get("next");
  const returnTo = sanitizeReturnTo(rawReturnTo, "/");

  // If already authenticated, forward to returnTo
  useEffect(() => {
    if (session) {
      router.push(returnTo);
    }
  }, [session, returnTo, router]);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const buildCallbackUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://oyaplan.com";
    const redirectUrl = new URL(`${origin}/api/auth/callback`);
    if (returnTo && returnTo !== "/") {
      redirectUrl.searchParams.set("next", returnTo);
      const planMatch = returnTo.match(/\/plan\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
      if (planMatch) {
        redirectUrl.searchParams.set("save_plan", planMatch[1]);
      }
    }
    return redirectUrl.toString();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);

    trackEvent("auth_initiated", {
      category: "Activation",
      source: "planner_login_email",
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
        setError(signInError.message || "Failed to send login link. Please try again.");
      } else {
        setSuccess(true);
        setResendCooldown(45);
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
      source: "planner_login_google",
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
    <main className="min-h-[100dvh] bg-[#FAF7F2] text-midnight-lagoon flex flex-col justify-between selection:bg-[#008751]/20">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4 flex items-center justify-between">
        <Link
          href={returnTo && returnTo !== "/" ? returnTo : "/"}
          className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-midnight-lagoon transition-colors py-1.5 px-3 rounded-full hover:bg-white border border-[#EAE4DC] tap-feedback"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to OyaPlan</span>
        </Link>
        <Link href="/" className="flex items-center tap-feedback">
          <Image
            src="/logo.png"
            alt="OyaPlan"
            width={610}
            height={143}
            className="h-7 w-auto object-contain shrink-0"
            priority
          />
        </Link>
      </header>

      {/* Main Card */}
      <div className="w-full max-w-md mx-auto px-4 py-8 sm:py-12 my-auto">
        <div className="bg-white rounded-[28px] border border-[#EAE4DC] p-6 sm:p-8 shadow-sm">
          {success ? (
            /* Email Sent State */
            <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-[#EAFDF3] text-[#008751] border border-[#A3F3C6] rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-midnight-lagoon tracking-tight">
                  Check your inbox
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  We sent an instant sign-in link to:
                </p>
                <div className="inline-block bg-surface-grey font-mono font-bold text-xs sm:text-sm px-3 py-1.5 rounded-lg text-midnight-lagoon border border-[#EAE4DC] max-w-full truncate">
                  {email}
                </div>
              </div>

              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC] text-left text-xs text-text-secondary space-y-2">
                <div className="font-bold text-midnight-lagoon flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#008751]" /> Next steps:
                </div>
                <p>1. Open your email on this device.</p>
                <p>2. Tap the sign-in button to log in securely.</p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleEmailSubmit}
                  className="w-full h-11 rounded-xl text-xs sm:text-sm font-bold text-[#008751] bg-[#EAFDF3] hover:bg-[#d8f9e7] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 tap-feedback"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend magic link"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setError(null);
                  }}
                  className="block w-full text-center text-xs font-bold text-text-muted hover:text-midnight-lagoon transition-colors py-1"
                >
                  Use a different email address
                </button>
              </div>
            </div>
          ) : (
            /* Main Form */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#008751]/10 text-[#008751] text-[10px] font-black uppercase tracking-wider">
                  OyaPlanner
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon tracking-tight">
                  Welcome back, OyaPlanner.
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Sign in to access saved spots, run plans with friends, and view your outing passport.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Social Login */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                  className="w-full h-12 rounded-xl border border-[#EAE4DC] hover:border-text-secondary bg-white hover:bg-surface-grey text-xs sm:text-sm font-bold text-midnight-lagoon flex items-center justify-center gap-3 transition-all shadow-xs tap-feedback disabled:opacity-60 cursor-pointer"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#008751]" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-[#EAE4DC]" />
                <span className="bg-white px-3 text-[11px] font-black uppercase tracking-wider text-text-muted absolute">
                  or with email
                </span>
              </div>

              {/* Email Magic Link Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label htmlFor="email" className="block text-xs font-bold text-midnight-lagoon">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 rounded-xl bg-surface-grey border border-[#EAE4DC] focus:border-[#008751] focus:bg-white text-xs sm:text-sm text-midnight-lagoon font-medium px-4 outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full h-12 rounded-xl bg-[#008751] hover:bg-[#007043] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 tap-feedback disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>Continue with Email 🚀</span>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <p className="text-[11px] text-text-muted leading-normal">
                  By continuing, you agree to OyaPlan&apos;s{" "}
                  <Link href="/terms" className="underline hover:text-midnight-lagoon">Terms</Link> and{" "}
                  <Link href="/privacy" className="underline hover:text-midnight-lagoon">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      <footer className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 border-t border-[#EAE4DC] flex items-center justify-between text-xs text-text-muted">
        <div>© {new Date().getFullYear()} OyaPlan</div>
        <Link href="/" className="hover:text-midnight-lagoon font-bold">Back to Home</Link>
      </footer>
    </main>
  );
}
