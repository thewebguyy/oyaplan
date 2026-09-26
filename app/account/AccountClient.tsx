"use client";

import { useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, 
  ChevronRight, 
  Heart, 
  Bookmark, 
  Settings, 
  HelpCircle, 
  Layers, 
  Shield, 
  FileText, 
  Building2, 
  LogOut,
  ArrowRight,
  Lock
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserProfile } from "@/lib/services/identity/sessionResolver";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AccountClientProps {
  isAuthenticated: boolean;
  profile: UserProfile | null;
  savedPlansCount: number;
  referralCode: string | null;
}

export default function AccountClient({
  isAuthenticated,
  profile,
}: AccountClientProps) {
  const { signOut, openModal, avatarUrl } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const nextParam = searchParams.get("next");
  const isBusinessContext = searchParams.get("context") === "business" || nextParam?.startsWith("/business");

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
      router.push("/");
      toast.success("Signed out successfully.");
    });
  };

  // 1. Unauthenticated State
  if (!isAuthenticated || !profile) {
    if (isBusinessContext) {
      return (
        <main className="min-h-[100dvh] bg-[#FAF7F2] pt-24 pb-20 px-4 flex flex-col items-center justify-center selection:bg-[#008751]/20">
          <div className="w-full max-w-md space-y-6 text-center bg-white rounded-3xl border border-[#EAE4DC] p-8 shadow-xs animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="w-14 h-14 bg-[#EAFDF3] text-[#008751] border border-[#A3F3C6] rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#EAFDF3] text-[#008751] text-[10px] font-black uppercase tracking-wider">
                Partner Portal
              </span>
              <h1 className="text-2xl font-black text-midnight-lagoon tracking-tight">
                OyaPlan for Business
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed px-2">
                Sign in with your operator credentials to manage venue pricing, menu updates, and real-world planner visibility.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <Button 
                onClick={() => openModal("Sign in to Business Portal", nextParam || "/business")}
                className="w-full bg-[#008751] hover:bg-[#007043] text-white rounded-xl h-12 text-xs font-bold transition-all tap-feedback"
              >
                <span>Sign In to Business Portal</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
              <Link
                href="/for-business"
                className="block text-xs font-bold text-text-muted hover:text-midnight-lagoon transition-colors pt-1"
              >
                Back to Business Overview
              </Link>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-[100dvh] bg-[#FAF7F2] pt-24 pb-20 px-4 flex flex-col items-center justify-center selection:bg-[#008751]/20">
        <div className="w-full max-w-md space-y-6 text-center bg-white rounded-3xl border border-[#EAE4DC] p-8 shadow-xs animate-in fade-in slide-in-from-bottom-4 duration-400">
          <div className="w-16 h-16 bg-[#EAFDF3] text-[#008751] rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-midnight-lagoon tracking-tight">
              Your OyaPlan
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed px-2">
              Sign in to manage your personal profile, access saved spots and plans, and customize outing preferences.
            </p>
          </div>
          <div className="pt-2">
            <Button 
              onClick={() => openModal("Sign in to access your account")}
              className="w-full bg-[#008751] hover:bg-[#007043] text-white rounded-xl h-12 text-sm font-bold shadow-xs transition-all tap-feedback"
            >
              Sign In / Create Account
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // 2. Authenticated State
  const isEmailBasedName = profile.display_name === profile.email || profile.display_name?.includes("@");
  const displayName = isEmailBasedName 
    ? (profile.email?.split("@")[0] || "Planner")
    : (profile.display_name || "Planner");
  const displayEmail = profile.email || "";

  return (
    <main className="min-h-[100dvh] bg-[#FAF7F2] text-midnight-lagoon pt-20 sm:pt-24 pb-28 selection:bg-[#008751]/20">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6 animate-in fade-in duration-200">
        
        {/* 1. PROFILE HEADER — Restrained, Polished, Consumer Grade */}
        <Link 
          href="/account/profile"
          prefetch={true}
          className="group block bg-white rounded-[24px] border border-[#EAE4DC] p-5 shadow-xs tap-feedback transition-all hover:border-[#008751]/40"
          aria-label="Edit your account profile"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Avatar 
                name={displayName} 
                src={avatarUrl || profile.avatar_url} 
                size="lg"
                className="ring-2 ring-[#008751]/20 group-hover:ring-[#008751] transition-all shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-black text-midnight-lagoon truncate group-hover:text-[#008751] transition-colors">
                  {displayName}
                </h1>
                {displayEmail && (
                  <p className="text-xs text-text-muted truncate mt-0.5 font-medium">
                    {displayEmail}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted group-hover:text-[#008751] shrink-0 transition-colors">
              <span className="hidden sm:inline">Profile</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </Link>

        {/* 2. SECTION: YOUR OYAPLAN */}
        <div className="space-y-2">
          <div className="px-2 text-[11px] font-black uppercase tracking-wider text-text-muted">
            Your OyaPlan
          </div>
          <div className="bg-white rounded-[24px] border border-[#EAE4DC] overflow-hidden shadow-xs divide-y divide-[#EAE4DC]">
            
            {/* Account Profile */}
            <Link 
              href="/account/profile" 
              prefetch={true} 
              className="flex items-center justify-between p-4 sm:p-4.5 hover:bg-[#FAF7F2] transition-colors tap-feedback min-h-[56px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAFDF3] text-[#008751] flex items-center justify-center shrink-0">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-midnight-lagoon">Account Profile</h2>
                  <p className="text-[11px] text-text-muted">Personal info, display name &amp; photo</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>

            {/* Saved Spots */}
            <Link 
              href="/saved" 
              prefetch={true} 
              className="flex items-center justify-between p-4 sm:p-4.5 hover:bg-[#FAF7F2] transition-colors tap-feedback min-h-[56px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAFDF3] text-[#008751] flex items-center justify-center shrink-0">
                  <Heart className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-midnight-lagoon">Saved Spots</h2>
                  <p className="text-[11px] text-text-muted">Bookmarked venues &amp; destinations</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>

            {/* Saved Plans */}
            <Link 
              href="/saved?tab=plans" 
              prefetch={true} 
              className="flex items-center justify-between p-4 sm:p-4.5 hover:bg-[#FAF7F2] transition-colors tap-feedback min-h-[56px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAFDF3] text-[#008751] flex items-center justify-center shrink-0">
                  <Bookmark className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-midnight-lagoon">Saved Plans</h2>
                  <p className="text-[11px] text-text-muted">Outing itineraries &amp; squad plans</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>

            {/* Settings */}
            <Link 
              href="/settings" 
              prefetch={true} 
              className="flex items-center justify-between p-4 sm:p-4.5 hover:bg-[#FAF7F2] transition-colors tap-feedback min-h-[56px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAFDF3] text-[#008751] flex items-center justify-center shrink-0">
                  <Settings className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-midnight-lagoon">Settings</h2>
                  <p className="text-[11px] text-text-muted">Security, logins &amp; preferences</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>

          </div>
        </div>

        {/* 3. SECTION: COMPANY & SUPPORT */}
        <div className="space-y-2">
          <div className="px-2 text-[11px] font-black uppercase tracking-wider text-text-muted">
            Company &amp; Support
          </div>
          <div className="bg-white rounded-[24px] border border-[#EAE4DC] overflow-hidden shadow-xs divide-y divide-[#EAE4DC]">
            
            <Link 
              href="/feedback" 
              prefetch={true} 
              className="flex items-center justify-between p-4 sm:p-4.5 hover:bg-[#FAF7F2] transition-colors tap-feedback min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-surface-grey text-text-secondary flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-midnight-lagoon">Help / Feedback</h2>
                  <p className="text-[11px] text-text-muted">Report an issue or suggest a feature</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>

            <Link 
              href="/about" 
              prefetch={true} 
              className="flex items-center justify-between p-4 sm:p-4.5 hover:bg-[#FAF7F2] transition-colors tap-feedback min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-surface-grey text-text-secondary flex items-center justify-center shrink-0">
                  <Layers className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-midnight-lagoon">About OyaPlan</h2>
                  <p className="text-[11px] text-text-muted">Our story, mission &amp; budget confidence thesis</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>

            <Link 
              href="/privacy" 
              prefetch={true} 
              className="flex items-center justify-between p-4 sm:p-4.5 hover:bg-[#FAF7F2] transition-colors tap-feedback min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-surface-grey text-text-secondary flex items-center justify-center shrink-0">
                  <Shield className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-midnight-lagoon">Privacy Policy</h2>
                  <p className="text-[11px] text-text-muted">How we protect your identity &amp; data</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>

            <Link 
              href="/terms" 
              prefetch={true} 
              className="flex items-center justify-between p-4 sm:p-4.5 hover:bg-[#FAF7F2] transition-colors tap-feedback min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-surface-grey text-text-secondary flex items-center justify-center shrink-0">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-midnight-lagoon">Terms of Service</h2>
                  <p className="text-[11px] text-text-muted">Consumer terms &amp; guidelines</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>

          </div>
        </div>

        {/* 4. SECTION: FOR BUSINESS (Restrained Bridge) */}
        <div className="bg-white rounded-[24px] border border-[#EAE4DC] p-4.5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-midnight-lagoon text-white flex items-center justify-center shrink-0">
              <Building2 className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-midnight-lagoon">OyaPlan for Business</h2>
              <p className="text-[11px] text-text-muted truncate">Venue verification &amp; partner tools</p>
            </div>
          </div>
          <Link
            href="/for-business"
            prefetch={true}
            className="text-xs font-bold text-midnight-lagoon hover:text-[#008751] px-3.5 py-2 rounded-xl border border-[#EAE4DC] bg-[#FAF7F2] hover:bg-white transition-colors shrink-0 tap-feedback"
          >
            Explore ↗
          </Link>
        </div>

        {/* 5. LOGOUT — Quiet, Restrained, Non-Alarming */}
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors tap-feedback cursor-pointer min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out of OyaPlan</span>
          </button>
        </div>

      </div>
    </main>
  );
}
