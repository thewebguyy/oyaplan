"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Check, 
  Loader2, 
  Lock
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserProfile } from "@/lib/services/identity/sessionResolver";
import { Avatar } from "@/components/ui/avatar";
import { updateProfile } from "@/lib/actions/profile";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ProfileClientProps {
  isAuthenticated: boolean;
  profile: UserProfile | null;
}

export default function ProfileClient({
  isAuthenticated,
  profile,
}: ProfileClientProps) {
  const router = useRouter();
  const { session, user, avatarUrl, displayName, openModal } = useAuth();
  
  const sanitizeName = (val?: string | null) => (val && !val.includes("@") ? val.trim() : "");
  
  const initialName = sanitizeName(profile?.display_name) || sanitizeName(displayName) || "";
  const initialPhone = "";

  const [displayNameInput, setDisplayNameInput] = useState(initialName);
  const [phoneNumberInput, setPhoneNumberInput] = useState(initialPhone);
  const [isPending, startTransition] = useTransition();

  if (!isAuthenticated || !profile || !session) {
    return (
      <main className="min-h-[100dvh] bg-[#FAF7F2] pt-24 pb-20 px-4 flex flex-col items-center justify-center selection:bg-[#008751]/20">
        <div className="w-full max-w-md space-y-6 text-center bg-white rounded-3xl border border-[#EAE4DC] p-8 shadow-xs animate-in fade-in slide-in-from-bottom-4 duration-400">
          <div className="w-14 h-14 bg-[#EAFDF3] text-[#008751] rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-midnight-lagoon tracking-tight">
              Sign In Required
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed px-2">
              Sign in to your OyaPlan account to view and edit your personal profile details.
            </p>
          </div>
          <div className="pt-2">
            <Button 
              onClick={() => openModal("Sign in to edit your profile", "/account/profile")}
              className="w-full bg-[#008751] hover:bg-[#007043] text-white rounded-xl h-12 text-sm font-bold shadow-xs transition-all tap-feedback"
            >
              Sign In to Profile
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const effectiveEmail = user?.email || profile.email || "";
  const cleanDisplayName = sanitizeName(displayNameInput) || sanitizeName(profile.display_name);
  const authProvider = user?.app_metadata?.provider || "email";

  const hasChanges = displayNameInput.trim() !== (sanitizeName(profile.display_name)) || phoneNumberInput.trim() !== "";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayNameInput.trim();
    if (!trimmed) {
      toast.error("Please enter a valid display name.");
      return;
    }
    if (trimmed.includes("@")) {
      toast.error("Display name cannot be an email address.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateProfile({
          displayName: trimmed,
          ...(phoneNumberInput.trim() ? { phoneNumber: phoneNumberInput.trim() } : {}),
        });

        if (res.success) {
          toast.success("Profile details updated successfully.");
          router.refresh();
        } else {
          toast.error(res.error || "Failed to update profile.");
        }
      } catch {
        toast.error("An unexpected error occurred while saving.");
      }
    });
  };

  return (
    <main className="min-h-[100dvh] bg-[#FAF7F2] text-midnight-lagoon pt-20 sm:pt-24 pb-28 selection:bg-[#008751]/20">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6 animate-in fade-in duration-200">
        
        {/* Back Navigation & Title */}
        <div className="space-y-1.5">
          <Link 
            href="/account"
            prefetch={true}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-[#008751] transition-colors py-1 group tap-feedback"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Account</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-midnight-lagoon">
            Account Profile
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Your personal information, photo, and identity on OyaPlan.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* 1. Avatar & Identity Header Section */}
          <div className="bg-white rounded-[24px] border border-[#EAE4DC] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#EAE4DC] pb-3.5">
              <User className="w-4 h-4 text-[#008751]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-midnight-lagoon">
                Profile Identity
              </h2>
            </div>

            <div className="flex items-center gap-4 sm:gap-5">
              <Avatar 
                name={cleanDisplayName || "Planner"} 
                src={avatarUrl || profile.avatar_url} 
                size="xl"
                className="ring-4 ring-[#EAFDF3] shadow-2xs shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <p className={`text-base font-black truncate ${cleanDisplayName ? "text-midnight-lagoon" : "text-text-muted italic"}`}>
                  {cleanDisplayName || "Add your name"}
                </p>
                {effectiveEmail && (
                  <p className="text-xs text-text-secondary truncate font-medium">
                    {effectiveEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Personal Details Form */}
          <div className="bg-white rounded-[24px] border border-[#EAE4DC] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#EAE4DC] pb-3.5">
              <User className="w-4 h-4 text-[#008751]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-midnight-lagoon">
                Personal Information
              </h2>
            </div>

            <div className="space-y-4">
              {/* Display Name */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="profileDisplayName"
                  className="block text-xs font-bold text-midnight-lagoon"
                >
                  Full / Display Name
                </label>
                <div className="relative">
                  <input 
                    id="profileDisplayName"
                    type="text"
                    required
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    placeholder="e.g. Bode Olusegun"
                    className="w-full h-12 rounded-xl bg-[#FCFBF9] hover:bg-white focus:bg-white border border-[#EAE4DC] focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/15 text-xs sm:text-sm font-medium px-4 outline-none transition-all shadow-2xs"
                  />
                </div>
                <p className="text-[11px] text-text-muted">
                  This is the name friends see when you share an outing plan.
                </p>
              </div>

              {/* Email Address (Read-only / Verified) */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="profileEmail"
                  className="block text-xs font-bold text-midnight-lagoon"
                >
                  Primary Email
                </label>
                <div className="relative flex items-center">
                  <input 
                    id="profileEmail"
                    type="email"
                    disabled
                    value={effectiveEmail}
                    className="w-full h-12 rounded-xl bg-surface-grey/80 border border-[#EAE4DC] text-xs sm:text-sm font-medium px-4 text-text-secondary cursor-not-allowed pr-24 outline-none"
                  />
                  <div className="absolute right-3 flex items-center gap-1 text-[10px] font-bold text-[#008751] bg-[#EAFDF3] px-2 py-1 rounded-full uppercase tracking-wider">
                    <Check className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>

              {/* Phone Number (Optional) */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="profilePhone"
                  className="block text-xs font-bold text-midnight-lagoon"
                >
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <input 
                    id="profilePhone"
                    type="tel"
                    value={phoneNumberInput}
                    onChange={(e) => setPhoneNumberInput(e.target.value)}
                    placeholder="e.g. +234 801 234 5678"
                    className="w-full h-12 rounded-xl bg-[#FCFBF9] hover:bg-white focus:bg-white border border-[#EAE4DC] focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/15 text-xs sm:text-sm font-medium px-4 outline-none transition-all shadow-2xs"
                  />
                </div>
                <p className="text-[11px] text-text-muted">
                  Used for WhatsApp plan notifications if enabled.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Account & Security Metadata */}
          <div className="bg-white rounded-[24px] border border-[#EAE4DC] p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-[#EAE4DC] pb-3.5">
              <Shield className="w-4 h-4 text-[#008751]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-midnight-lagoon">
                Account Information
              </h2>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-text-secondary">Authentication Method</span>
                <span className="font-bold text-midnight-lagoon capitalize">
                  {authProvider === "google" ? "Google OAuth" : "Email Magic Link"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-[#EAE4DC]/60">
                <span className="text-text-secondary">Account Status</span>
                <span className="font-bold text-[#008751] bg-[#EAFDF3] px-2 py-0.5 rounded-full text-[10px] uppercase">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-[#EAE4DC]/60">
                <span className="text-text-secondary">Role</span>
                <span className="font-bold text-midnight-lagoon capitalize">
                  {profile.role || "Planner"}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/account"
              className="flex-1 h-12 rounded-xl border border-[#EAE4DC] bg-white hover:bg-surface-grey text-midnight-lagoon text-xs font-bold flex items-center justify-center transition-colors tap-feedback"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending || !hasChanges}
              className="flex-1 h-12 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all tap-feedback disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </main>
  );
}
