"use client";

import { useState, useEffect, useTransition } from "react";
import { User, ChevronRight, Share2, Bookmark, Sparkles, Pencil, LogOut } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserProfile } from "@/lib/services/identity/sessionResolver";
import { getReferralCode } from "@/lib/actions/getReferralCode";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BetaBadge } from "@/components/ui/BetaBadge";

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
  referralCode
}: AccountClientProps) {
  const { signOut, openModal } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayNameState, setDisplayNameState] = useState(profile?.display_name || "");
  const [codeState, setCodeState] = useState<string | null>(referralCode);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!codeState && isAuthenticated) {
      getReferralCode().then((code) => {
        if (code) setCodeState(code);
      });
    }
  }, [codeState, isAuthenticated]);

  const handleSave = () => {
    if (!displayNameState.trim()) return;
    
    startTransition(async () => {
      try {
        const { updateProfile } = await import('@/lib/actions/profile');
        const res = await updateProfile({ displayName: displayNameState });
        if (res.success) {
          toast.success("Your profile has been updated.");
          setIsEditing(false);
        } else {
          toast.error("We couldn't update this right now. Try again.");
        }
      } catch(e) {
        toast.error("An error occurred.");
      }
    });
  };

  if (!isAuthenticated || !profile) {
    return (
      <main className="min-h-[100dvh] bg-[#FAFAF8] pt-24 pb-16 px-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-20 h-20 bg-brand-green/10 text-brand-green rounded-[24px] flex items-center justify-center mx-auto shadow-sm">
            <User className="w-10 h-10" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-midnight-lagoon tracking-tight">Your OyaPlan</h1>
            <p className="type-body text-text-muted px-4">
              Sign in to manage your profile and view your passport.
            </p>
          </div>
          <Button 
            onClick={() => openModal()}
            className="w-full bg-brand-green hover:bg-brand-green-70 text-white rounded-[16px] type-label h-14 shadow-md border-none tap-feedback text-lg transition-all"
          >
            Sign In
          </Button>
        </div>
      </main>
    );
  }

  const isEmailBasedName = profile.display_name === profile.email || profile.display_name?.includes("@");
  const displayName = isEmailBasedName ? "Planner" : profile.display_name;

  const joinedDateText = profile.beta_joined_at
    ? new Date(profile.beta_joined_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "August 2026";

  return (
    <main className="min-h-[100dvh] bg-[#FAFAF8] pb-24">
      {/* 1. The Header — Solid Chowdeck-Style Brand Green (#008751) */}
      <div className="w-full bg-[#008751] rounded-b-[28px] pt-14 pb-10 px-6 flex flex-col items-center text-center shadow-md relative animate-in fade-in duration-150">
        <div className="relative mb-3">
          <Avatar 
            name={profile.display_name} 
            size="xl"
            className="ring-4 ring-white/30 shadow-md"
          />
        </div>
        
        <h1 className="text-2xl font-black text-white tracking-tight mb-0.5">
          {displayName}
        </h1>
        
        {profile.email && (
          <p 
            onClick={() => {
              if (profile.email) {
                navigator.clipboard.writeText(profile.email);
                toast.success("Email copied!");
              }
            }}
            className="text-xs font-bold text-white/80 truncate max-w-[220px] mb-3 cursor-pointer tap-feedback"
          >
            {profile.email}
          </p>
        )}

        <div className="flex flex-col items-center gap-1.5 mt-1">
          {profile.profile_badge && (
            <BetaBadge badgeType={profile.profile_badge} size="md" />
          )}
          <span className="text-xs font-bold text-white/90 tracking-wide mt-0.5">
            Joined {joinedDateText}
          </span>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 mt-6 space-y-6">
        
        {/* 2. User History Summary Strip */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#E5E7EB] grid grid-cols-4 gap-2 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200 fill-mode-both relative z-10">
          <div className="text-center">
            <div className="text-xl font-black text-[#008751]">{savedPlansCount}</div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Outings</div>
          </div>
          <div className="text-center border-l border-border-default">
            <div className="text-xl font-black text-[#008751]">{savedPlansCount}</div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Saved</div>
          </div>
          <div className="text-center border-l border-border-default">
            <div className="text-xl font-black text-[#008751]">
              {(profile.role === 'admin' || profile.role === 'scout') ? '1' : '0'}
            </div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Verified</div>
          </div>
          <div className="text-center border-l border-border-default">
            <div className="text-xl font-black text-[#008751]">0</div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Invited</div>
          </div>
        </div>

        {/* 3. Section Rhythm */}
        <div className="space-y-4 pt-2 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300 fill-mode-both">
          
          <Link href="/dashboard" prefetch={true} className="block bg-white rounded-[20px] p-5 border border-[#E5E7EB] tap-feedback transition-colors active:bg-surface-grey">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FFF9C4] text-[#008751] flex items-center justify-center shrink-0">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Saved Plans</h3>
                  <p className="text-sm text-text-muted mt-0.5">{savedPlansCount} outings planned</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted" />
            </div>
          </Link>

          <Link href="/scout" prefetch={true} className="block bg-white rounded-[20px] p-5 border border-[#E5E7EB] tap-feedback transition-colors active:bg-surface-grey">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FFF9C4] text-[#008751] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">OyaScout Dashboard</h3>
                  <p className="text-sm text-text-muted mt-0.5">Verify prices & earn status</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted" />
            </div>
          </Link>
          
          {!isEditing ? (
            <div 
              onClick={() => setIsEditing(true)}
              className="block bg-white rounded-[20px] p-5 border border-[#E5E7EB] tap-feedback transition-colors active:bg-surface-grey cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FFF9C4] text-[#008751] flex items-center justify-center shrink-0">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text-primary">Edit Profile</h3>
                    <p className="text-sm text-text-muted mt-0.5">Change your display name</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[20px] p-5 border border-[#E5E7EB] animate-in fade-in duration-200">
              <div className="space-y-4">
                <input 
                  value={displayNameState}
                  onChange={(e) => setDisplayNameState(e.target.value)}
                  placeholder="e.g. Bode Olusegun"
                  className="w-full h-14 rounded-[12px] border border-[#E5E7EB] bg-surface-grey font-bold text-text-primary px-4 outline-none focus:border-[#008751] text-lg"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setDisplayNameState(profile.display_name || "");
                      setIsEditing(false);
                    }} 
                    disabled={isPending}
                    className="flex-1 rounded-[12px] h-12 border border-[#E5E7EB] text-text-primary hover:bg-surface-grey font-bold tap-feedback"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={isPending || !displayNameState.trim() || displayNameState === profile.display_name}
                    className="flex-1 bg-[#008751] text-white rounded-[12px] h-12 shadow-sm font-bold tap-feedback disabled:opacity-50 flex items-center justify-center"
                  >
                    {isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 4. Invite Squad Ticket */}
        <div className="bg-[#FFF9C4] rounded-[24px] p-6 shadow-sm mt-8 space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-400 fill-mode-both border border-amber-200/60">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-white text-[#008751] flex items-center justify-center shrink-0 shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#00603A]">Invite your squad</h2>
              <p className="text-xs text-[#00603A]/80 mt-0.5">Everyone gets better planning together.</p>
            </div>
          </div>

          <div className="bg-white/90 rounded-[16px] border border-[#008751]/20 p-3.5 flex items-center justify-between gap-2 shadow-xs">
            <span className="font-mono font-bold text-[#008751] text-base tracking-wider truncate">
              {codeState ? `https://oyaplan.com/?ref=${codeState}` : "GENERATING..."}
            </span>
            <button 
              onClick={() => {
                if (codeState) {
                  const origin = typeof window !== "undefined" ? window.location.origin : "https://oyaplan.com";
                  navigator.clipboard.writeText(`${origin}/?ref=${codeState}`);
                  toast.success("Referral link copied!");
                }
              }}
              className="text-xs font-black text-[#008751] uppercase tracking-wider tap-feedback bg-[#FFF9C4] hover:bg-amber-200 px-3.5 py-2 rounded-xl shrink-0 transition-colors"
            >
              Copy
            </button>
          </div>

          <button 
            onClick={() => {
              if (codeState) {
                const origin = typeof window !== "undefined" ? window.location.origin : "https://oyaplan.com";
                const shareText = `Find out exactly what your Lagos outing will cost before you leave home. Use my link: ${origin}/?ref=${codeState}`;
                const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
                window.open(waUrl, "_blank");
              }
            }}
            className="w-full h-13 bg-[#008751] hover:bg-[#006b41] text-white rounded-[16px] font-bold text-sm flex items-center justify-center gap-2 tap-feedback shadow-xs transition-colors"
          >
            Share on WhatsApp <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 5. Sign Out — Quiet, Not Alarming */}
        <div className="pt-10 pb-6 animate-in fade-in duration-500 delay-500">
          <button
            onClick={() => signOut()}
            className="w-full text-center text-sm font-bold text-text-muted hover:text-text-primary transition-colors tap-feedback"
          >
            Sign out
          </button>
        </div>

      </div>
    </main>
  );
}
