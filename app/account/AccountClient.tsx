"use client";

import { useState, useTransition } from "react";
import { User, ChevronRight, Share2, Bookmark, Sparkles, Pencil, LogOut } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserProfile } from "@/lib/services/identity/sessionResolver";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  const [isPending, startTransition] = useTransition();

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

  return (
    <main className="min-h-[100dvh] bg-[#FAFAF8] pb-24">
      {/* 1. The Header — Solid Brand Green */}
      <div className="w-full bg-[#008751] rounded-b-[24px] pt-16 pb-12 px-6 flex flex-col items-center text-center shadow-sm relative animate-in fade-in duration-300">
        <div className="relative mb-3">
          <Avatar 
            name={profile.display_name} 
            className="w-20 h-20 text-2xl font-bold bg-[#FFF9C4] text-[#00603A] shadow-sm ring-4 ring-white/10" 
          />
        </div>
        
        <h1 className="text-2xl font-black text-white tracking-tight mb-1">
          {displayName}
        </h1>
        
        {profile.email && (
          <p 
            onClick={() => toast(profile.email)}
            className="text-sm text-white/80 truncate max-w-[200px] mb-4 cursor-pointer active:scale-95 transition-transform"
          >
            {profile.email}
          </p>
        )}

        <div className="bg-[#FFF9C4] text-[#00603A] px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm">
          Beta Member
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 -mt-4 space-y-6">
        
        {/* Value Statement */}
        <div className="text-center pt-6 pb-2 animate-in fade-in duration-500 delay-100">
          <p className="text-lg text-text-primary font-medium">
            {savedPlansCount > 0 
              ? `You've planned ${savedPlansCount} ${savedPlansCount === 1 ? 'outing' : 'outings'}.` 
              : "Ready to plan your first outing."}
          </p>
        </div>

        {/* 2. The Stat Strip — Numbers as Passport Stamps */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#E5E7EB] flex items-center justify-between animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200 fill-mode-both relative z-10">
          <div className="flex-1 text-center">
            <div className="text-2xl font-black text-[#008751]">{savedPlansCount}</div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Plans</div>
          </div>
          <div className="w-px h-10 bg-border-default"></div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-black text-[#008751]">
              {(profile.role === 'admin' || profile.role === 'scout') ? '1+' : '0'}
            </div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Suggestions</div>
          </div>
          <div className="w-px h-10 bg-border-default"></div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-black text-[#008751]">Lagos</div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">City</div>
          </div>
        </div>

        {/* 3. Section Rhythm — Cards That Breathe */}
        <div className="space-y-4 pt-2 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300 fill-mode-both">
          
          <Link href="/dashboard" className="block bg-white rounded-[20px] p-5 border border-[#E5E7EB] tap-feedback transition-colors active:bg-surface-grey">
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

          <Link href="/scout" className="block bg-white rounded-[20px] p-5 border border-[#E5E7EB] tap-feedback transition-colors active:bg-surface-grey">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FFF9C4] text-[#008751] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">OyaScout Dashboard</h3>
                  <p className="text-sm text-text-muted mt-0.5">Verify prices & earn points</p>
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

        {/* 4. Referral — Make It Feel Like a Gift */}
        <div className="bg-[#FFF9C4] rounded-[24px] p-7 shadow-sm mt-8 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-400 fill-mode-both">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-full bg-white text-[#008751] flex items-center justify-center shrink-0 shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#00603A]">Invite Friends</h2>
              <p className="text-sm text-[#00603A]/80 mt-0.5">Share your verified price confidence</p>
            </div>
          </div>

          <div className="bg-white/60 rounded-[16px] border-2 border-dashed border-[#008751]/30 p-4 mb-5 flex items-center justify-between">
            <span className="font-mono font-bold text-[#008751] text-lg tracking-wider">
              {referralCode || "GENERATING..."}
            </span>
            <button 
              onClick={() => {
                if(referralCode) {
                  navigator.clipboard.writeText(`https://oyaplan.app/?ref=${referralCode}`);
                  toast.success("Code copied!");
                }
              }}
              className="text-sm font-black text-[#008751] uppercase tracking-wider tap-feedback bg-white px-4 py-2 rounded-full shadow-sm"
            >
              Copy
            </button>
          </div>

          <button 
            onClick={() => {
              if (referralCode) {
                const waUrl = `https://wa.me/?text=${encodeURIComponent(`Find out exactly what your Lagos outing will cost before you leave home. Use my code: https://oyaplan.app/?ref=${referralCode}`)}`;
                window.open(waUrl, "_blank");
              }
            }}
            className="w-full bg-[#008751] text-white rounded-[16px] h-14 font-bold text-base flex items-center justify-center gap-2 tap-feedback shadow-sm"
          >
            Share on WhatsApp <ChevronRight className="w-5 h-5" />
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
