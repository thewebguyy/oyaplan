"use client";

import { useState, useTransition } from "react";
import { User, LogOut, Check, Pencil, Loader2, Sparkles, Share2, Bookmark, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserProfile } from "@/lib/services/identity/sessionResolver";
import { Avatar } from "@/components/ui/avatar";
import { updateProfile } from "@/lib/actions/profile";
import { toast } from "sonner";
import Link from "next/link";

interface AccountClientProps {
  isAuthenticated: boolean;
  profile: UserProfile | null;
  savedPlansCount: number;
  referralCode: string | null;
}

export default function AccountClient({
  isAuthenticated,
  profile,
  referralCode
}: AccountClientProps) {
  const { signOut, openModal } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [isPending, startTransition] = useTransition();

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
              Sign in to manage your profile, access your saved plans, and join the Scout program.
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

  const handleSave = () => {
    if (!displayName.trim()) return;
    
    startTransition(async () => {
      const res = await updateProfile({ displayName });
      if (res.success) {
        toast.success("Your profile has been updated.");
        setIsEditing(false);
      } else {
        toast.error("We couldn't load this right now. Try again.");
      }
    });
  };

  const copyReferral = () => {
    if (referralCode) {
      navigator.clipboard.writeText(`https://oyaplan.app/?ref=${referralCode}`);
      toast.success("Referral link copied!");
    }
  };

  return (
    <main className="min-h-[100dvh] bg-[#FAFAF8] pb-24">
      {/* Premium Header Background */}
      <div className="h-40 bg-gradient-to-br from-brand-green to-[#00603A] relative">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 -mt-16 space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.03] relative">
          <div className="flex flex-col items-center">
            <div className="p-1.5 bg-white rounded-full shadow-sm -mt-14 mb-4">
              <Avatar name={profile.display_name} size="xl" className="w-24 h-24 text-2xl" />
            </div>

            {!isEditing ? (
              <div className="text-center w-full space-y-1 animate-in fade-in duration-300">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-2xl font-black text-text-primary tracking-tight truncate max-w-[250px]">
                    {isEmailBasedName ? "Planner" : profile.display_name}
                  </h2>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-text-muted hover:text-brand-green bg-surface-grey hover:bg-brand-green/10 rounded-full transition-colors tap-feedback"
                    aria-label="Edit Profile"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                {profile.email && (
                  <p className="type-caption text-text-muted">{profile.email}</p>
                )}
                
                {isEmailBasedName && (
                  <div className="pt-3">
                    <span className="type-caption font-bold text-brand-green bg-brand-green/10 py-1.5 px-4 rounded-full inline-block">
                      Add your name to personalize
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full space-y-4 animate-in fade-in duration-300">
                <div>
                  <Input 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Bode Olusegun"
                    className="h-14 rounded-[16px] border-black/10 bg-surface-grey font-bold text-text-primary text-center text-lg"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => {
                      setDisplayName(profile.display_name || "");
                      setIsEditing(false);
                    }} 
                    variant="outline"
                    disabled={isPending}
                    className="flex-1 rounded-[16px] h-12 border-black/10 text-text-primary hover:bg-surface-grey font-bold tap-feedback"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={isPending || !displayName.trim() || displayName === profile.display_name}
                    className="flex-1 bg-brand-green hover:bg-brand-green-70 text-white rounded-[16px] h-12 shadow-sm font-bold tap-feedback"
                  >
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.03] p-2 flex flex-col gap-1">
          
          <Link href="/dashboard" className="flex items-center justify-between p-4 rounded-[24px] hover:bg-surface-grey transition-colors group tap-feedback">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[18px] bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">Saved Plans</h3>
                <p className="text-xs font-medium text-text-muted">Your curated itineraries</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-grey group-hover:bg-white flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </div>
          </Link>

          {(profile?.role === 'admin' || profile?.role === 'scout') && (
            <Link href="/scout" className="flex items-center justify-between p-4 rounded-[24px] hover:bg-surface-grey transition-colors group tap-feedback">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[18px] bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Scout Dashboard</h3>
                  <p className="text-xs font-medium text-text-muted">Verify prices & earn OyaScore XP</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-grey group-hover:bg-white flex items-center justify-center transition-colors">
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </div>
            </Link>
          )}

          {referralCode && (
            <div 
              onClick={copyReferral}
              className="flex items-center justify-between p-4 rounded-[24px] hover:bg-surface-grey transition-colors group tap-feedback cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[18px] bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Referral Program</h3>
                  <p className="text-xs font-medium text-text-muted">Invite friends to OyaPlan</p>
                </div>
              </div>
              <div className="bg-amber-100/50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold group-hover:bg-amber-100 transition-colors">
                Copy Link
              </div>
            </div>
          )}

        </div>

        {/* Danger Zone */}
        <div className="pt-4">
          <Button
            onClick={() => signOut()}
            variant="outline"
            className="w-full bg-white border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-[24px] type-label h-14 shadow-sm tap-feedback font-bold"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>

      </div>
    </main>
  );
}
