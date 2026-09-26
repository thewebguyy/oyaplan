"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  User, 
  ExternalLink, 
  LogOut, 
  Building2, 
  Check, 
  Loader2, 
  Lock, 
  Mail, 
  FileText, 
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Avatar } from "@/components/ui/avatar";
import { updateProfile } from "@/lib/actions/profile";
import { toast } from "sonner";

export default function SettingsClient() {
  const router = useRouter();
  const { session, user, avatarUrl, displayName, isLoading, signOut } = useAuth();
  
  const [nameInput, setNameInput] = useState(displayName || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isPending, startTransition] = useTransition();

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
          <div className="w-12 h-12 bg-[#008751]/10 text-[#008751] rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-midnight-lagoon">Sign In Required</h1>
          <p className="text-xs text-text-secondary">
            Sign in to your OyaPlan account to access personal preferences and security settings.
          </p>
          <Link
            href="/login/planner?returnTo=/settings"
            className="block w-full py-3 bg-[#008751] hover:bg-[#007043] text-white rounded-xl font-bold text-xs transition-colors"
          >
            Sign In to Settings
          </Link>
        </div>
      </main>
    );
  }

  const effectiveDisplayName = displayName || user.email?.split("@")[0] || "Planner";
  const authProvider = user.app_metadata.provider || "email";

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    startTransition(async () => {
      const res = await updateProfile({ displayName: nameInput.trim() });
      if (res.success) {
        toast.success("Display name updated!");
        setIsEditingName(false);
      } else {
        toast.error(res.error || "Failed to update display name.");
      }
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    toast.success("Signed out successfully.");
  };

  return (
    <main className="min-h-[100dvh] bg-[#FAF7F2] text-midnight-lagoon pb-24 pt-20 sm:pt-24 selection:bg-[#008751]/20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <Link 
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-[#008751] transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-midnight-lagoon">
            Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage your personal profile, authentication methods, and privacy.
          </p>
        </div>

        {/* Section 1: Profile Details */}
        <section className="bg-white rounded-[24px] border border-[#EAE4DC] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#008751]" />
              <h2 className="text-sm font-black uppercase tracking-wider text-midnight-lagoon">
                Profile Information
              </h2>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Avatar name={effectiveDisplayName} src={avatarUrl} size="lg" />
              <div>
                <p className="text-sm font-bold text-midnight-lagoon">{effectiveDisplayName}</p>
                <p className="text-xs text-text-muted">{user.email}</p>
              </div>
            </div>

            {!isEditingName ? (
              <button
                type="button"
                onClick={() => {
                  setNameInput(effectiveDisplayName);
                  setIsEditingName(true);
                }}
                className="text-xs font-bold text-[#008751] hover:underline px-3 py-1.5 rounded-lg hover:bg-[#EAFDF3] transition-colors"
              >
                Edit Name
              </button>
            ) : null}
          </div>

          {isEditingName && (
            <form onSubmit={handleSaveName} className="space-y-3 pt-2 border-t border-[#EAE4DC] animate-in fade-in duration-150">
              <label htmlFor="displayName" className="block text-xs font-bold text-midnight-lagoon">
                Display Name
              </label>
              <div className="flex gap-2">
                <input
                  id="displayName"
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="flex-1 h-11 rounded-xl bg-surface-grey border border-[#EAE4DC] focus:border-[#008751] focus:bg-white text-xs sm:text-sm font-medium px-4 outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={isPending || !nameInput.trim()}
                  className="h-11 px-4 bg-[#008751] hover:bg-[#007043] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="h-11 px-3 border border-[#EAE4DC] text-xs font-bold text-text-muted hover:text-midnight-lagoon rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Section 2: Login & Security */}
        <section className="bg-white rounded-[24px] border border-[#EAE4DC] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#EAE4DC] pb-4">
            <Shield className="w-4 h-4 text-[#008751]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-midnight-lagoon">
              Login & Security
            </h2>
          </div>

          <div className="space-y-3 divide-y divide-[#EAE4DC]">
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs font-bold text-midnight-lagoon">Primary Email</p>
                <p className="text-xs text-text-muted">{user.email}</p>
              </div>
              <span className="text-[10px] font-bold text-[#008751] bg-[#EAFDF3] px-2 py-0.5 rounded-full uppercase">
                Verified
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-bold text-midnight-lagoon">Authentication Method</p>
                <p className="text-xs text-text-muted capitalize">
                  {authProvider === "google" ? "Google OAuth" : "Email Magic Link / OTP"}
                </p>
              </div>
              <span className="text-[10px] font-bold text-text-muted bg-surface-grey px-2 py-0.5 rounded-full uppercase">
                Active
              </span>
            </div>
          </div>
        </section>

        {/* Section 3: Legal & Privacy */}
        <section className="bg-white rounded-[24px] border border-[#EAE4DC] p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[#EAE4DC] pb-4">
            <FileText className="w-4 h-4 text-[#008751]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-midnight-lagoon">
              Legal & Privacy
            </h2>
          </div>

          <div className="space-y-2">
            <Link
              href="/privacy"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-grey text-xs font-bold text-midnight-lagoon transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#008751]" />
                <span>Privacy Policy</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
            </Link>

            <Link
              href="/terms"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-grey text-xs font-bold text-midnight-lagoon transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#008751]" />
                <span>Terms of Service</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
            </Link>
          </div>
        </section>

        {/* Section 4: Business Transition */}
        <section className="bg-[#FAF7F2] rounded-[24px] border border-[#EAE4DC] p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-midnight-lagoon text-white flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-midnight-lagoon">Own or manage a venue?</p>
              <p className="text-[11px] text-text-secondary">Switch to OyaPlan for Business workspace</p>
            </div>
          </div>
          <Link
            href="/for-business"
            className="text-xs font-bold text-midnight-lagoon hover:text-[#008751] px-3 py-1.5 rounded-lg border border-[#EAE4DC] bg-white hover:bg-[#FAF7F2] transition-colors shrink-0"
          >
            For Businesses ↗
          </Link>
        </section>

        {/* Section 5: Log Out */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full h-12 rounded-xl border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors tap-feedback cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out of this device</span>
          </button>
        </div>

      </div>
    </main>
  );
}
