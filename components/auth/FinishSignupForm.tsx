"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Sparkles, Check, Globe } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Avatar } from "@/components/ui/avatar";
import { sanitizeReturnTo } from "@/lib/utils/returnTo";
import { updateProfile } from "@/lib/actions/profile";
import { toast } from "sonner";

const COUNTRY_CODES = [
  { name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { name: "Ghana", code: "+233", flag: "🇬🇭" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "South Africa", code: "+27", flag: "🇿🇦" },
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
  { name: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
];

export default function FinishSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, user, avatarUrl, displayName, isLoading } = useAuth();
  const [isPending, startTransition] = useTransition();

  const rawReturnTo = searchParams.get("returnTo") || searchParams.get("next");
  const returnTo = sanitizeReturnTo(rawReturnTo, "/");

  // Pre-fill names if available from Google
  const initialParts = (displayName || user?.user_metadata?.full_name || "").split(" ");
  const [firstName, setFirstName] = useState(initialParts[0] || "");
  const [lastName, setLastName] = useState(initialParts.slice(1).join(" ") || "");
  const [countryCode, setCountryCode] = useState("+234");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#FAF7F2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#008751]" />
      </div>
    );
  }

  if (!session || !user) {
    return (
      <main className="min-h-[100dvh] bg-[#FAF7F2] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 text-center border border-[#EAE4DC] shadow-sm space-y-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Globe className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-midnight-lagoon">Please sign in first</h1>
          <p className="text-xs text-text-secondary">
            You must have an active session to finish setting up your OyaPlan profile.
          </p>
          <Link
            href={`/login${returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
            className="block w-full py-3 bg-[#008751] hover:bg-[#007043] text-white rounded-xl font-bold text-xs transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </main>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please provide your first and last name.");
      return;
    }

    if (!agreed) {
      setError("Please accept the Terms & Privacy Policy to continue.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const fullDisplayName = `${firstName.trim()} ${lastName.trim()}`;
      const fullPhone = phoneNumber.trim() ? `${countryCode} ${phoneNumber.trim()}` : undefined;

      const res = await updateProfile({
        displayName: fullDisplayName,
        avatarUrl: avatarUrl || undefined,
        phoneNumber: fullPhone,
        country: country.trim(),
      });

      if (res.success) {
        toast.success("Welcome to OyaPlan!");
        router.push(returnTo);
      } else {
        setError(res.error || "Failed to save profile. Please try again.");
      }
    });
  };

  return (
    <main className="min-h-[100dvh] bg-[#FAF7F2] text-midnight-lagoon flex flex-col justify-between selection:bg-[#008751]/20">
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4 flex items-center justify-between">
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

      <div className="w-full max-w-lg mx-auto px-4 py-8 my-auto">
        <div className="bg-white rounded-[28px] border border-[#EAE4DC] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#008751]/10 text-[#008751] text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 2 of 2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon tracking-tight">
              Finish Setting Up Your Profile
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Tell us a bit about you so your plans and saved spots are attached to your identity.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Avatar name={`${firstName} ${lastName}`} src={avatarUrl} size="lg" />
            <div className="text-left">
              <div className="text-xs font-bold text-midnight-lagoon truncate max-w-[200px]">
                {user.email}
              </div>
              <div className="text-[11px] text-[#008751] font-semibold">
                ✓ Verified via {user.app_metadata.provider || "Sign-in"}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-midnight-lagoon">
                  First name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bode"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-12 rounded-xl bg-surface-grey border border-[#EAE4DC] focus:border-[#008751] focus:bg-white text-xs sm:text-sm text-midnight-lagoon font-medium px-4 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-midnight-lagoon">
                  Last name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Olusegun"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-12 rounded-xl bg-surface-grey border border-[#EAE4DC] focus:border-[#008751] focus:bg-white text-xs sm:text-sm text-midnight-lagoon font-medium px-4 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-midnight-lagoon">
                Mobile number (optional)
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  aria-label="Country Code"
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="h-12 rounded-xl bg-surface-grey border border-[#EAE4DC] text-xs font-bold px-3 outline-none focus:border-[#008751] transition-colors"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.name} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="801 234 5678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 h-12 rounded-xl bg-surface-grey border border-[#EAE4DC] focus:border-[#008751] focus:bg-white text-xs sm:text-sm text-midnight-lagoon font-medium px-4 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-midnight-lagoon">
                Country
              </label>
              <select
                value={country}
                aria-label="Country"
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-12 rounded-xl bg-surface-grey border border-[#EAE4DC] text-xs sm:text-sm font-medium px-4 outline-none focus:border-[#008751] transition-colors"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-[#EAE4DC] text-[#008751] focus:ring-[#008751] mt-0.5"
              />
              <span className="text-[11px] text-text-secondary leading-tight">
                By continuing, you agree to OyaPlan&apos;s{" "}
                <Link href="/terms" target="_blank" className="underline font-bold text-midnight-lagoon">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="underline font-bold text-midnight-lagoon">
                  Privacy Policy
                </Link>.
              </span>
            </label>

            <button
              type="submit"
              disabled={isPending || !agreed || !firstName.trim() || !lastName.trim()}
              className="w-full h-12 rounded-xl bg-[#008751] hover:bg-[#007043] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 tap-feedback disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Save & Continue</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <footer className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 border-t border-[#EAE4DC] flex items-center justify-between text-xs text-text-muted">
        <div>© {new Date().getFullYear()} OyaPlan</div>
      </footer>
    </main>
  );
}
