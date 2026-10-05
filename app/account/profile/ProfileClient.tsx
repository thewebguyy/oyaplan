"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Phone, 
  Check, 
  Loader2, 
  Lock,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserProfile } from "@/lib/services/identity/sessionResolver";
import { Avatar } from "@/components/ui/avatar";
import { updateProfile } from "@/lib/actions/profile";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useOrigin } from "@/lib/location/OriginContext";

const HUB_OPTIONS = [
  { slug: "lekki", label: "Lekki Phase 1" },
  { slug: "vi", label: "Victoria Island" },
  { slug: "ikeja", label: "Ikeja" },
  { slug: "yaba", label: "Yaba" },
  { slug: "ikoyi", label: "Ikoyi" },
];

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
  const { origin, setManualOrigin } = useOrigin();
  
  const sanitizeName = (val?: string | null) => (val && !val.includes("@") ? val.trim() : "");
  
  const initialName = sanitizeName(profile?.display_name) || sanitizeName(displayName) || "";
  const initialPhone = "";

  const [displayNameInput, setDisplayNameInput] = useState(initialName);
  const [phoneNumberInput, setPhoneNumberInput] = useState(initialPhone);
  const [selectedHub, setSelectedHub] = useState(() => {
    return origin?.planningAreaSlug || "lekki";
  });
  const [isPending, startTransition] = useTransition();

  if (!isAuthenticated || !profile || !session) {
    return (
      <main className="min-h-[100dvh] bg-[#F6F6F2] pt-24 pb-20 px-4 flex flex-col items-center justify-center font-sans">
        <div className="w-full max-w-md space-y-6 text-center bg-white rounded-3xl border border-[#E5E5DE] p-8 shadow-xs animate-in fade-in slide-in-from-bottom-4 duration-400">
          <div className="w-14 h-14 bg-[#111111] text-[#F9E828] rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#111111] text-[#F9E828] text-[10px] font-mono font-bold uppercase tracking-widest">
              Resident Pass
            </span>
            <h1 className="text-2xl font-black text-[#111111] tracking-tight font-display">
              Sign In Required
            </h1>
            <p className="text-xs sm:text-sm text-[#555555] leading-relaxed px-2">
              Sign in to your OyaPlan account to view and update your Lagos resident profile.
            </p>
          </div>
          <div className="pt-2">
            <Button 
              onClick={() => openModal("Sign in to edit your profile", "/account/profile")}
              className="w-full bg-[#111111] hover:bg-black text-[#F9E828] rounded-xl h-12 text-xs font-mono font-bold uppercase tracking-wider shadow-xs transition-all tap-feedback cursor-pointer"
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
    <main className="min-h-[100dvh] bg-[#F6F6F2] text-[#111111] pt-20 sm:pt-24 pb-28 font-sans">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6 animate-in fade-in duration-200">
        
        {/* Back Navigation & Title */}
        <div className="space-y-1.5">
          <Link 
            href="/account"
            prefetch={true}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#555555] hover:text-[#111111] transition-colors py-1 group tap-feedback"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Resident Pass</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#111111]" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#111111]">
              Resident Profile
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111111] font-display uppercase">
            Account Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#555555]">
            Your Lagos outing identity, transit preferences, and squad coordinates.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* 1. Avatar & Identity Header Section */}
          <div className="bg-white rounded-[24px] border border-[#E5E5DE] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-3.5">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#111111]" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                  Resident Identity
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#111111] text-[#F9E828]">
                Lagos Resident
              </span>
            </div>

            <div className="flex items-center gap-4 sm:gap-5">
              <Avatar 
                name={cleanDisplayName || "Planner"} 
                src={avatarUrl || profile.avatar_url} 
                size="xl"
                className="ring-2 ring-[#111111] shadow-2xs shrink-0 rounded-2xl"
              />
              <div className="space-y-1 min-w-0">
                <p className={`text-base font-black truncate font-display ${cleanDisplayName ? "text-[#111111]" : "text-[#777777] italic"}`}>
                  {cleanDisplayName || "Add your name"}
                </p>
                {effectiveEmail && (
                  <p className="text-xs text-[#555555] truncate font-mono">
                    {effectiveEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Personal Details & Outing Coordinates Form */}
          <div className="bg-white rounded-[24px] border border-[#E5E5DE] p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-[#E5E5DE] pb-3.5">
              <Sparkles className="w-4 h-4 text-[#111111]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                Outing Coordinates
              </h2>
            </div>

            <div className="space-y-4">
              {/* Display Name */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="profileDisplayName"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-[#111111]"
                >
                  Full / Display Name
                </label>
                <input 
                  id="profileDisplayName"
                  type="text"
                  required
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  placeholder="e.g. Tunde Balogun"
                  className="w-full h-12 rounded-xl bg-white border border-[#E5E5DE] focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/15 text-xs sm:text-sm font-medium px-4 outline-none transition-all shadow-2xs"
                />
                <p className="text-[11px] text-[#777777]">
                  The name your squad sees when you share a plan or Host Pass.
                </p>
              </div>

              {/* Email Address — VERIFIED BADGE OUTSIDE INPUT TO PREVENT TRUNCATION */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="profileEmail"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-[#111111]"
                  >
                    Primary Email
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#111111] bg-[#F6F6F2] border border-[#E5E5DE] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    <Check className="w-3 h-3 text-[#111111] stroke-[3]" />
                    <span>Verified</span>
                  </span>
                </div>
                <input 
                  id="profileEmail"
                  type="email"
                  disabled
                  value={effectiveEmail}
                  className="w-full h-12 rounded-xl bg-[#F6F6F2] border border-[#E5E5DE] text-xs sm:text-sm font-mono font-bold px-4 text-[#111111] cursor-not-allowed outline-none select-all"
                />
                <p className="text-[11px] text-[#777777]">
                  Linked to your resident account and outing receipts.
                </p>
              </div>

              {/* Default Starting Hub Dropdown */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="defaultStartingHub"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Default Starting Hub</span>
                </label>
                <div className="relative">
                  <select
                    id="defaultStartingHub"
                    value={selectedHub}
                    onChange={(e) => {
                      const nextHub = e.target.value;
                      setSelectedHub(nextHub);
                      setManualOrigin(nextHub);
                      const hubName = HUB_OPTIONS.find((h) => h.slug === nextHub)?.label || nextHub;
                      toast.success(`Default hub updated to ${hubName}`);
                    }}
                    className="w-full h-12 rounded-xl bg-white border border-[#E5E5DE] focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/15 text-xs sm:text-sm font-bold text-[#111111] px-4 outline-none transition-all shadow-2xs cursor-pointer font-sans appearance-none"
                  >
                    {HUB_OPTIONS.map((hub) => (
                      <option key={hub.slug} value={hub.slug}>
                        {hub.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[#555555] font-mono">
                    ▼
                  </div>
                </div>
                <p className="text-[11px] text-[#777777]">
                  Your preferred home base. Used to calculate accurate round-trip Bolt fares without re-entering your location.
                </p>
              </div>

              {/* Phone Number (Optional) */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="profilePhone"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Phone Number (Optional)</span>
                </label>
                <input 
                  id="profilePhone"
                  type="tel"
                  value={phoneNumberInput}
                  onChange={(e) => setPhoneNumberInput(e.target.value)}
                  placeholder="e.g. +234 801 234 5678"
                  className="w-full h-12 rounded-xl bg-white border border-[#E5E5DE] focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/15 text-xs sm:text-sm font-mono font-medium px-4 outline-none transition-all shadow-2xs"
                />
                <p className="text-[11px] text-[#777777]">
                  Used for WhatsApp squad invites and reservation confirmations.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons — Sticky-aware above mobile software keyboard */}
          <div className="sticky bottom-0 sm:static z-30 bg-[#F6F6F2]/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t sm:border-t-0 border-[#E5E5DE] -mx-4 px-4 sm:mx-0 sm:px-0 py-3 sm:py-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-2 transition-all">
            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="flex-1 h-12 rounded-xl border border-[#E5E5DE] bg-white hover:bg-[#F6F6F2] text-[#111111] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center transition-colors tap-feedback"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isPending || !hasChanges}
                className="flex-1 h-12 rounded-xl bg-[#111111] hover:bg-black text-[#F9E828] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all tap-feedback disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#F9E828]" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-[#F9E828] stroke-[3]" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </main>
  );
}
