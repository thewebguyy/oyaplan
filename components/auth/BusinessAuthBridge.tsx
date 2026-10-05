"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Building2, ShieldCheck, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { sanitizeReturnTo } from "@/lib/utils/returnTo";
import { trackEvent } from "@/lib/analytics/trackClient";
import { useAuth } from "@/components/providers/AuthProvider";

export default function BusinessAuthBridge() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();

  const rawReturnTo = searchParams.get("returnTo") || searchParams.get("next");
  const fallbackReturnTo = "/business";
  const returnTo = sanitizeReturnTo(rawReturnTo, fallbackReturnTo);

  // If already authenticated, redirect to business target
  useEffect(() => {
    if (session) {
      router.push(returnTo.startsWith("/business") ? returnTo : "/business");
    }
  }, [session, returnTo, router]);

  const [email, setEmail] = useState("");
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
      setError("Please enter your business or operator email address.");
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
        setError(signInError.message || "Failed to send login link. Please try again.");
      } else {
        setSuccess(true);
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
    <main className="min-h-[100dvh] bg-[#FAF7F2] text-midnight-lagoon flex flex-col justify-between selection:bg-[#008751]/20">
      {/* Top Bar */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4 flex items-center justify-between">
        <Link
          href="/for-business"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-midnight-lagoon transition-colors py-1.5 px-3 rounded-full hover:bg-white border border-[#EAE4DC] tap-feedback"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Business</span>
        </Link>
        <Link href="/for-business" className="flex items-center gap-2 tap-feedback">
          <Image
            src="/logo.png"
            alt="OyaPlan"
            width={610}
            height={143}
            className="h-7 w-auto object-contain shrink-0"
            priority
          />
          <span className="text-xs font-black text-white bg-midnight-lagoon px-2 py-0.5 rounded-full uppercase tracking-wider">
            Business
          </span>
        </Link>
      </header>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto px-4 py-8 sm:py-12 my-auto">
        <div className="bg-white rounded-[28px] border border-[#EAE4DC] p-6 sm:p-8 shadow-sm">
          {success ? (
            <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-midnight-lagoon/10 text-midnight-lagoon border border-[#EAE4DC] rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-[#008751]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-midnight-lagoon tracking-tight">
                  Check your business inbox
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  We sent a secure operator login link to:
                </p>
                <div className="inline-block bg-surface-grey font-mono font-bold text-xs sm:text-sm px-3 py-1.5 rounded-lg text-midnight-lagoon border border-[#EAE4DC] max-w-full truncate">
                  {email}
                </div>
              </div>

              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC] text-left text-xs text-text-secondary space-y-2">
                <div className="font-bold text-midnight-lagoon flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#008751]" /> Open on this device
                </div>
                <p>Click the link in your email to enter your venue management workspace.</p>
              </div>

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
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-midnight-lagoon/10 text-midnight-lagoon text-[10px] font-black uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>OyaPlan for Business</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon tracking-tight">
                  Operator Sign In
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Manage your venue pricing, table policies, operating updates, and planning signals.
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
                  className="w-full h-12 rounded-xl border border-[#EAE4DC] hover:border-midnight-lagoon bg-white hover:bg-surface-grey text-xs sm:text-sm font-bold text-midnight-lagoon flex items-center justify-center gap-3 transition-all shadow-xs tap-feedback disabled:opacity-60 cursor-pointer"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-midnight-lagoon" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  <span>Sign in with Google</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-[#EAE4DC]" />
                <span className="bg-white px-3 text-[11px] font-black uppercase tracking-wider text-text-muted absolute">
                  or with work email
                </span>
              </div>

              {/* Email Magic Link */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label htmlFor="business-email" className="block text-xs font-bold text-midnight-lagoon">
                    Work or venue email
                  </label>
                  <input
                    id="business-email"
                    type="email"
                    required
                    placeholder="operator@yourvenue.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 rounded-xl bg-surface-grey border border-[#EAE4DC] focus:border-midnight-lagoon focus:bg-white text-xs sm:text-sm text-midnight-lagoon font-medium px-4 outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full h-12 rounded-xl bg-midnight-lagoon hover:bg-[#0a0f3d] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 tap-feedback disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>Sign in to Business Portal →</span>
                  )}
                </button>
              </form>

              <div className="pt-2 border-t border-[#EAE4DC]/60 text-center space-y-2">
                <p className="text-xs text-text-secondary">
                  Haven&apos;t claimed your venue yet?
                </p>
                <Link
                  href="/business/claim"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008751] hover:underline"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Claim your Lagos venue here</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-text-secondary">
            Looking to plan an outing?{" "}
            <Link
              href={`/login${rawReturnTo ? `?returnTo=${encodeURIComponent(rawReturnTo)}` : ""}`}
              className="font-bold text-[#008751] hover:underline"
            >
              Sign in as an OyaPlanner →
            </Link>
          </p>
        </div>
      </div>

      <footer className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 border-t border-[#EAE4DC] flex items-center justify-between text-xs text-text-muted">
        <div>© {new Date().getFullYear()} OyaPlan for Business</div>
        <Link href="/for-business" className="hover:text-midnight-lagoon font-bold">About OyaPlan Business</Link>
      </footer>
    </main>
  );
}
