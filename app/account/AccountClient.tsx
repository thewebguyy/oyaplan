"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, 
  Heart, 
  Bookmark, 
  Settings, 
  HelpCircle, 
  Layers, 
  Shield, 
  FileText, 
  LogOut,
  MapPin,
  Sparkles,
  Lock,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabaseBrowser } from "@/lib/supabase";
import { UserProfile } from "@/lib/services/identity/sessionResolver";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSavedSpots } from "@/hooks/useSavedSpots";
import { useOrigin } from "@/lib/location/OriginContext";
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
  savedPlansCount,
}: AccountClientProps) {
  const { signOut, openModal, avatarUrl } = useAuth();
  const { savedSpots } = useSavedSpots();
  const { origin } = useOrigin();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
      router.push("/");
      toast.success("Signed out successfully.");
    });
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent("/account")}`;
      await supabaseBrowser.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
    } catch {
      toast.error("Google sign in failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  // 1. Unauthenticated State — 1-Tap Social Auth + Honest States
  if (!isAuthenticated || !profile) {
    return (
      <main className="min-h-[100dvh] bg-[#F6F6F2] pt-24 pb-20 px-4 flex flex-col items-center justify-center font-sans">
        <div className="w-full max-w-md space-y-6 text-center bg-white rounded-2xl border-2 border-[#111111] p-8 shadow-[0_8px_24px_rgba(17,17,17,0.06),0_3px_0_0_#111111] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-16 h-16 bg-[#111111] text-[#F9E828] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#111111] text-[#F9E828] text-[10px] font-black uppercase tracking-widest font-mono">
              Resident Pass
            </span>
            <h1 className="text-2xl font-black text-[#111111] tracking-tight font-display uppercase">
              Access Your OyaPlan
            </h1>
            <p className="text-xs sm:text-sm text-[#555555] leading-relaxed px-2 font-medium">
              Sign in to manage your Lagos outing shortlist, review saved squad plans, and lock in your default starting hub.
            </p>
          </div>

          {/* 1-Tap Social Auth Section */}
          <div className="space-y-3 pt-2">
            {/* Google 1-Tap Auth */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full h-12 rounded-xl bg-white hover:bg-[#F6F6F2] border-2 border-[#111111] text-[#111111] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all tap-feedback cursor-pointer shadow-xs disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? "Connecting..." : "Continue with Google"}</span>
            </button>

            {/* Apple Auth — Honest Data-Gated State */}
            <button
              type="button"
              disabled
              className="w-full h-12 rounded-xl bg-[#F6F6F2] border border-[#E5E5DE] text-[#999999] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
              title="Apple Sign-In is coming soon"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.79-11.97-14.25-6.74-10.22-12.04-21.75-15.9-34.58-3.86-12.83-5.79-25.13-5.79-36.9 0-14.57 3.86-26.65 11.58-36.23 7.72-9.58 17.29-14.48 28.71-14.7 4.9 0 10.45 1.33 16.65 4 6.2 2.67 10.15 4.06 11.86 4.17 1.52-.11 5.75-1.57 12.69-4.38 6.94-2.81 12.76-4.08 17.47-3.8 13.06.65 23.49 5.89 31.3 15.72-11.54 6.96-17.19 16.54-16.96 28.74.22 9.79 3.96 17.9 11.22 24.33 7.27 6.43 15.75 10.05 25.44 10.86-2.17 6.74-4.89 13.68-8.15 20.82zM119.22 33.15c0-7.39 2.66-14.26 7.98-20.61 5.32-6.35 11.83-10.28 19.53-11.79.87 7.61-1.63 14.65-7.51 21.12-5.88 6.47-12.54 10.23-19.99 11.28-.01-.76-.01-1.39-.01-2z" />
              </svg>
              <span>Continue with Apple (Coming Soon)</span>
            </button>

            {/* Email Magic Link fallback */}
            <div className="pt-2">
              <Button 
                onClick={() => openModal("Sign in to access your Resident Pass")}
                className="w-full bg-[#111111] hover:bg-black text-[#F9E828] rounded-xl h-12 text-xs font-mono font-bold uppercase tracking-wider transition-all tap-feedback cursor-pointer shadow-xs"
              >
                <span>Sign In with Email</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 2. Authenticated State — Resident Pass Direction
  const hasValidName = Boolean(profile.display_name && !profile.display_name.includes("@") && profile.display_name.trim() !== "");
  const displayName = hasValidName ? profile.display_name!.trim() : "Lagos Planner";
  const displayEmail = profile.email || "";

  return (
    <main className="min-h-[100dvh] bg-[#F6F6F2] text-obsidian pt-20 sm:pt-24 pb-28 font-sans">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6 animate-in fade-in duration-200">
        
        {/* RESIDENT PASS CARD */}
        <div className="relative bg-white rounded-2xl border-2 border-[#111111] p-6 shadow-[0_8px_24px_rgba(17,17,17,0.06),0_3px_0_0_#111111] overflow-hidden">
          {/* Card Accent Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#F9E828]" />

          {/* Pass Header */}
          <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-4 mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#111111]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-obsidian font-mono">
                Lagos Resident Pass
              </span>
            </div>
            <span className="text-[10px] font-bold text-text-muted font-mono uppercase tracking-wider">
              OyaPlan ID
            </span>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <Avatar 
              name={displayName} 
              src={avatarUrl} 
              size="lg" 
              className="w-14 h-14 rounded-xl ring-2 ring-[#111111] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-black text-obsidian truncate font-display">
                {displayName}
              </h1>
              {displayEmail && (
                <p className="text-xs text-text-muted truncate mt-0.5 font-medium break-all font-mono" title={displayEmail}>
                  {displayEmail}
                </p>
              )}
            </div>
          </div>

          {/* Resident Details Grid */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-dashed border-[#E5E5DE]">
            <div className="bg-[#F6F6F2] p-3 rounded-xl border border-[#E5E5DE] min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted font-mono block">
                Outing Archetype
              </span>
              <span className="text-xs font-bold text-obsidian flex items-center gap-1.5 mt-1 truncate">
                <Sparkles className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                <span className="truncate">Squad Strategist</span>
              </span>
            </div>

            <div className="bg-[#F6F6F2] p-3 rounded-xl border border-[#E5E5DE] min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted font-mono block">
                Default Hub
              </span>
              <span className="text-xs font-bold text-obsidian flex items-center gap-1.5 mt-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                <span className="truncate">{origin?.displayArea.name || "Lagos Central"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* PROMINENT TOP DASHBOARD CARDS: THE SHORTLIST & SAVED PLANS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* The Shortlist Dashboard Tile */}
          <Link
            href="/saved"
            prefetch={true}
            className="bg-white hover:bg-[#F6F6F2] p-5 rounded-2xl border-2 border-[#111111] shadow-[0_4px_12px_rgba(17,17,17,0.04)] transition-all tap-feedback flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#111111] text-[#F9E828] flex items-center justify-center">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280] bg-[#F6F6F2] border border-[#E5E5DE] px-2.5 py-0.5 rounded-full">
                Personal Roster
              </span>
            </div>
            <div>
              <span className="text-3xl font-black text-[#111111] font-mono tabular-nums block">
                {savedSpots.length}
              </span>
              <h2 className="text-sm font-black uppercase tracking-wider text-[#111111] font-display mt-0.5">
                The Shortlist
              </h2>
              <p className="text-[11px] text-[#6B7280] mt-1 font-medium">
                Vetted spots bookmarked for your next Lagos outing
              </p>
            </div>
          </Link>

          {/* Saved Plans Dashboard Tile */}
          <Link
            href="/saved?tab=plans"
            prefetch={true}
            className="bg-white hover:bg-[#F6F6F2] p-5 rounded-2xl border-2 border-[#111111] shadow-[0_4px_12px_rgba(17,17,17,0.04)] transition-all tap-feedback flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#111111] text-[#F9E828] flex items-center justify-center">
                <Bookmark className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280] bg-[#F6F6F2] border border-[#E5E5DE] px-2.5 py-0.5 rounded-full">
                Locked Budgets
              </span>
            </div>
            <div>
              <span className="text-3xl font-black text-[#111111] font-mono tabular-nums block">
                {savedPlansCount}
              </span>
              <h2 className="text-sm font-black uppercase tracking-wider text-[#111111] font-display mt-0.5">
                Saved Plans
              </h2>
              <p className="text-[11px] text-[#6B7280] mt-1 font-medium">
                Calculated damage slips and squad outing itineraries
              </p>
            </div>
          </Link>
        </div>

        {/* SECTION: RESIDENT SETTINGS & PREFERENCES */}
        <div className="space-y-2">
          <div className="px-1 text-[11px] font-black uppercase tracking-wider text-text-muted font-mono">
            Account Preferences
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E5DE] overflow-hidden shadow-xs divide-y divide-[#E5E5DE]">
            
            {/* Account Profile */}
            <Link 
              href="/account/profile" 
              prefetch={true} 
              className="flex items-center justify-between p-4 hover:bg-[#F6F6F2] transition-colors tap-feedback min-h-[52px] group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F6F6F2] text-[#111111] border border-[#E5E5DE] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-[#111111]">Profile &amp; Starting Hub</h2>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#6B7280] group-hover:text-[#111111] uppercase tracking-wider">
                Edit ▾
              </span>
            </Link>

            {/* Settings */}
            <Link 
              href="/settings" 
              prefetch={true} 
              className="flex items-center justify-between p-4 hover:bg-[#F6F6F2] transition-colors tap-feedback min-h-[52px] group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F6F6F2] text-[#111111] border border-[#E5E5DE] flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-[#111111]">Security &amp; Preferences</h2>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#6B7280] group-hover:text-[#111111] uppercase tracking-wider">
                Manage ▾
              </span>
            </Link>

          </div>
        </div>

        {/* SECTION: COMPANY & TRUST */}
        <div className="space-y-2">
          <div className="px-1 text-[11px] font-black uppercase tracking-wider text-text-muted font-mono">
            Trust &amp; Information
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E5DE] overflow-hidden shadow-xs divide-y divide-[#E5E5DE]">
            
            <Link 
              href="/feedback" 
              prefetch={true} 
              className="flex items-center justify-between p-4 hover:bg-[#F6F6F2] transition-colors tap-feedback min-h-[48px] group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#F6F6F2] text-[#6B7280] flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-[#111111]">Help / Report Price Mismatch</h2>
              </div>
              <span className="text-[10px] font-mono text-[#6B7280] uppercase">Feedback</span>
            </Link>

            <Link 
              href="/about" 
              prefetch={true} 
              className="flex items-center justify-between p-4 hover:bg-[#F6F6F2] transition-colors tap-feedback min-h-[48px] group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#F6F6F2] text-[#6B7280] flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-[#111111]">About OyaPlan</h2>
              </div>
              <span className="text-[10px] font-mono text-[#6B7280] uppercase">Thesis</span>
            </Link>

            <Link 
              href="/privacy" 
              prefetch={true} 
              className="flex items-center justify-between p-4 hover:bg-[#F6F6F2] transition-colors tap-feedback min-h-[48px] group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#F6F6F2] text-[#6B7280] flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-[#111111]">Privacy Policy</h2>
              </div>
              <span className="text-[10px] font-mono text-[#6B7280] uppercase">Privacy</span>
            </Link>

            <Link 
              href="/terms" 
              prefetch={true} 
              className="flex items-center justify-between p-4 hover:bg-[#F6F6F2] transition-colors tap-feedback min-h-[48px] group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#F6F6F2] text-[#6B7280] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-[#111111]">Terms of Service</h2>
              </div>
              <span className="text-[10px] font-mono text-[#6B7280] uppercase">Terms</span>
            </Link>

          </div>
        </div>

        {/* LOGOUT */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-red-200 bg-white text-xs font-mono font-bold text-[#E54D2E] hover:bg-red-50 active:bg-red-100 transition-colors tap-feedback cursor-pointer min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out of Resident Pass</span>
          </button>
        </div>

      </div>
    </main>
  );
}
