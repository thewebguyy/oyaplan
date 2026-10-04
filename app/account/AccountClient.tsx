"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
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
  LogOut,
  MapPin,
  Sparkles,
  Lock,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
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

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
      router.push("/");
      toast.success("Signed out successfully.");
    });
  };

  // 1. Unauthenticated State
  if (!isAuthenticated || !profile) {
    return (
      <main className="min-h-[100dvh] bg-[#F6F6F2] pt-24 pb-20 px-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-6 text-center bg-white rounded-2xl border border-[#E5E5DE] p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-400">
          <div className="w-16 h-16 bg-[#111111] text-[#F9E828] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#111111] text-[#F9E828] text-[10px] font-black uppercase tracking-widest font-mono">
              Resident Pass
            </span>
            <h1 className="text-2xl font-black text-obsidian tracking-tight font-display">
              Access Your OyaPlan
            </h1>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed px-2">
              Sign in to manage your Lagos outing shortlist, review saved squad plans, and track your outing preferences.
            </p>
          </div>
          <div className="pt-2">
            <Button 
              onClick={() => openModal("Sign in to access your Resident Pass")}
              className="w-full bg-[#111111] hover:bg-black text-[#F9E828] rounded-xl h-12 text-xs font-black uppercase tracking-wider transition-all tap-feedback cursor-pointer shadow-sm"
            >
              <span>Sign In / Create Account</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
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
    <main className="min-h-[100dvh] bg-[#F6F6F2] text-obsidian pt-20 sm:pt-24 pb-28">
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
                <p className="text-xs text-text-muted truncate mt-0.5 font-medium break-all" title={displayEmail}>
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

          {/* Stat Pillars */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Link
              href="/saved"
              className="bg-white hover:bg-[#F6F6F2] p-3 rounded-xl border border-[#E5E5DE] transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted font-mono block">
                  The Shortlist
                </span>
                <span className="text-base font-black text-obsidian font-mono">
                  {savedSpots.length} {savedSpots.length === 1 ? 'spot' : 'spots'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/saved?tab=plans"
              className="bg-white hover:bg-[#F6F6F2] p-3 rounded-xl border border-[#E5E5DE] transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted font-mono block">
                  Saved Plans
                </span>
                <span className="text-base font-black text-obsidian font-mono">
                  {savedPlansCount} {savedPlansCount === 1 ? 'plan' : 'plans'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* SECTION: NAVIGATION ITEMS */}
        <div className="space-y-2">
          <div className="px-2 text-[11px] font-black uppercase tracking-wider text-text-muted font-mono">
            Navigation
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E5DE] overflow-hidden shadow-xs divide-y divide-[#E5E5DE]">
            
            {/* The Shortlist */}
            <Link 
              href="/saved" 
              prefetch={true} 
              className="flex items-center justify-between p-4 hover:bg-[#F6F6F2] transition-colors tap-feedback min-h-[56px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F6F6F2] text-obsidian border border-[#E5E5DE] flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-obsidian">The Shortlist</h2>
                  <p className="text-[11px] text-text-muted">Bookmarked Lagos spots &amp; favorites</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>

            {/* Saved Plans */}
            <Link 
              href="/saved?tab=plans" 
              prefetch={true} 
              className="flex items-center justify-between p-4 hover:bg-[#F6F6F2] transition-colors tap-feedback min-h-[56px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F6F6F2] text-obsidian border border-[#E5E5DE] flex items-center justify-center shrink-0">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-obsidian">Saved Plans</h2>
                  <p className="text-[11px] text-text-muted">Outing itineraries &amp; squad calculations</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>

            {/* Account Profile */}
            <Link 
              href="/account/profile" 
              prefetch={true} 
              className="flex items-center justify-between p-4 hover:bg-[#F6F6F2] transition-colors tap-feedback min-h-[56px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F6F6F2] text-obsidian border border-[#E5E5DE] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-obsidian">Profile Settings</h2>
                  <p className="text-[11px] text-text-muted">Display name &amp; photo</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>

            {/* Settings */}
            <Link 
              href="/settings" 
              prefetch={true} 
              className="flex items-center justify-between p-4 hover:bg-[#F6F6F2] transition-colors tap-feedback min-h-[56px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F6F6F2] text-obsidian border border-[#E5E5DE] flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-obsidian">Settings</h2>
                  <p className="text-[11px] text-text-muted">Security &amp; preferences</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>

          </div>
        </div>

        {/* SECTION: COMPANY & TRUST */}
        <div className="space-y-2">
          <div className="px-2 text-[11px] font-black uppercase tracking-wider text-text-muted font-mono">
            Trust &amp; Information
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E5DE] overflow-hidden shadow-xs divide-y divide-[#E5E5DE]">
            
            <Link 
              href="/feedback" 
              prefetch={true} 
              className="flex items-center justify-between p-4 hover:bg-[#F6F6F2] transition-colors tap-feedback min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#F6F6F2] text-text-muted flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-obsidian">Help / Feedback</h2>
                  <p className="text-[11px] text-text-muted">Report price mismatch or share ideas</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>

            <Link 
              href="/about" 
              prefetch={true} 
              className="flex items-center justify-between p-4 hover:bg-[#F6F6F2] transition-colors tap-feedback min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#F6F6F2] text-text-muted flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-obsidian">About OyaPlan</h2>
                  <p className="text-[11px] text-text-muted">Our mission &amp; budget confidence thesis</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>

            <Link 
              href="/privacy" 
              prefetch={true} 
              className="flex items-center justify-between p-4 hover:bg-[#F6F6F2] transition-colors tap-feedback min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#F6F6F2] text-text-muted flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-obsidian">Privacy Policy</h2>
                  <p className="text-[11px] text-text-muted">How your data stays protected</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>

            <Link 
              href="/terms" 
              prefetch={true} 
              className="flex items-center justify-between p-4 hover:bg-[#F6F6F2] transition-colors tap-feedback min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#F6F6F2] text-text-muted flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-obsidian">Terms of Service</h2>
                  <p className="text-[11px] text-text-muted">Consumer guidelines</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>

          </div>
        </div>

        {/* LOGOUT */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-red-200 bg-white text-xs font-bold text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors tap-feedback cursor-pointer min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out of OyaPlan</span>
          </button>
        </div>

      </div>
    </main>
  );
}
