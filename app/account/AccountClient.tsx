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
        toast.success("Profile updated!");
        setIsEditing(false);
      } else {
        toast.error(res.error || "Failed to update profile.");
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

          <div className="border-t border-border-default pt-6 space-y-2">
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="w-full border-border-default text-text-primary hover:bg-surface-grey rounded-xl type-label h-12"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Name
              </Button>
            )}
            
            <Link href="/dashboard" className="block">
              <Button
                variant="outline"
                className="w-full border-border-default text-text-primary hover:bg-surface-grey rounded-xl type-label h-12"
              >
                Saved Plans
              </Button>
            </Link>

            <Button
              onClick={() => signOut()}
              variant="outline"
              className="w-full border-red-100 text-red-600 hover:bg-red-50 rounded-xl type-label h-12"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

      </div>
    </main>
  );
}
