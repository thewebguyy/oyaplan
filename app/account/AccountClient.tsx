"use client";

import { useState, useTransition } from "react";
import { User, LogOut, Check, Pencil, Loader2 } from "lucide-react";
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
}: AccountClientProps) {
  const { signOut, openModal } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [isPending, startTransition] = useTransition();

  if (!isAuthenticated || !profile) {
    return (
      <main className="min-h-[100dvh] bg-[#FAFAF8] pt-24 pb-16 px-4">
        <div className="max-w-md mx-auto space-y-8 text-center">
          <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-midnight-lagoon">Account</h1>
            <p className="type-body text-text-muted">
              Sign in to manage your profile and access saved plans.
            </p>
          </div>
          <Button 
            onClick={() => openModal()}
            className="w-full bg-brand-green hover:bg-brand-green-70 text-white rounded-xl type-label h-12 shadow-md border-none"
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

  return (
    <main className="min-h-[100dvh] bg-[#FAFAF8] pt-24 pb-16 px-4">
      <div className="max-w-md mx-auto space-y-8">
        
        {/* Profile Card */}
        <div className="bg-white border border-border-default rounded-[24px] p-8 text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <Avatar name={profile.display_name} size="xl" />
          </div>

          {!isEditing ? (
            <div className="space-y-1 mb-8">
              <h2 className="text-2xl font-black text-text-primary break-all">
                {isEmailBasedName ? "Planner" : profile.display_name}
              </h2>
              {profile.email && (
                <p className="type-body text-text-muted">{profile.email}</p>
              )}
              
              {isEmailBasedName && (
                <p className="type-caption text-brand-green font-bold mt-3 bg-brand-green/5 py-1.5 px-3 rounded-full inline-block">
                  Add your name to personalize your account.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4 mb-8 text-left">
              <div>
                <label className="type-caption font-bold text-text-muted mb-1.5 block">Display Name</label>
                <Input 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Bode Olusegun"
                  className="h-12 rounded-xl border-border-default bg-surface-grey font-bold text-text-primary"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave} 
                  disabled={isPending || !displayName.trim() || displayName === profile.display_name}
                  className="flex-1 bg-brand-green hover:bg-brand-green-70 text-white rounded-xl h-11"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </Button>
                <Button 
                  onClick={() => {
                    setDisplayName(profile.display_name || "");
                    setIsEditing(false);
                  }} 
                  variant="outline"
                  disabled={isPending}
                  className="flex-1 rounded-xl h-11 border-border-default text-text-primary hover:bg-surface-grey"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

        </div>

        {/* Support & Safety Net */}
        <div className="bg-white border border-border-default rounded-[20px] p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="text-sm font-bold">🎧</span>
            </div>
            <div>
              <h2 className="type-label text-text-primary">Support & Safety Net</h2>
            </div>
          </div>
          <a
            href="mailto:support@oyaplan.app?subject=OyaPlan%20Support%20Request"
            className="px-4 py-2 bg-brand-green/10 border border-brand-green/30 text-brand-green rounded-lg type-caption font-bold flex items-center gap-2 hover:bg-brand-green/20 transition-colors tap-feedback"
          >
            Email Support
          </a>
        </div>

        {/* Referral Link & Squad Rewards */}
        <div className="bg-white border border-border-default rounded-[24px] p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <span className="text-lg">🤝</span>
            </div>
            <div>
              <h2 className="type-heading text-text-primary">Referral Program</h2>
              <p className="type-caption text-text-muted">Invite friends to OyaPlan & share verified price confidence</p>
            </div>
          </div>

          {referralCode ? (
            <div className="space-y-4 pt-2">
              <div className="p-3.5 bg-surface-grey border border-border-default rounded-xl flex items-center justify-between gap-3">
                <span className="type-body text-text-primary font-mono text-sm truncate">oyaplan.app/?ref={referralCode}</span>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://oyaplan.app/?ref=${referralCode}`);
                    toast.success("Copied!");
                  }}
                  size="sm"
                  className="bg-brand-green hover:bg-brand-green-70 text-white rounded-lg type-caption font-bold h-9 px-4 shrink-0 shadow-none tap-feedback"
                >
                  Copy
                </Button>
              </div>
            </div>
          ) : (
            <p className="type-body text-text-muted">Your referral code is being generated...</p>
          )}
        </div>

        {/* Quick Nav Links */}
        <div className="bg-white border border-border-default rounded-[24px] overflow-hidden shadow-sm divide-y divide-border-default">
          <Link href="/dashboard" className="p-5 flex items-center justify-between hover:bg-surface-grey transition-colors group tap-feedback">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center">
                <span className="text-lg">🔖</span>
              </div>
              <div>
                <h3 className="type-label text-text-primary group-hover:text-brand-green transition-colors">Saved Outing Plans</h3>
                <p className="type-caption text-text-muted">View all your saved itineraries</p>
              </div>
            </div>
          </Link>

          {(profile?.role === 'admin' || profile?.role === 'scout') && (
            <Link href="/scout" className="p-5 flex items-center justify-between hover:bg-surface-grey transition-colors group tap-feedback">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <span className="text-lg">✨</span>
                </div>
                <div>
                  <h3 className="type-label text-text-primary group-hover:text-purple-600 transition-colors">Scout Dashboard</h3>
                  <p className="type-caption text-text-muted">Verify menu prices & earn OyaScore XP</p>
                </div>
              </div>
            </Link>
          )}
          
          <div className="p-5 flex items-center justify-between hover:bg-surface-grey transition-colors group cursor-pointer tap-feedback" onClick={() => signOut()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="type-label text-red-600">Sign Out</h3>
                <p className="type-caption text-text-muted">Disconnect session</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Privacy & Security Statement */}
        <div className="p-5 bg-surface-grey border border-border-default rounded-[20px] space-y-2">
          <div className="flex items-center gap-2 text-text-primary font-bold type-label">
            <span className="text-brand-green">🔒</span> Data Privacy Guarantee
          </div>
          <p className="type-caption text-text-muted leading-relaxed">
            Your email and saved plans are strictly private. We never share your contact details with third parties or venues.
          </p>
        </div>

      </div>
    </main>
  );
}
