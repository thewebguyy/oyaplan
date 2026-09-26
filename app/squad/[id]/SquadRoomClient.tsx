"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { 
  Users, 
  Check, 
  MapPin, 
  ArrowRight, 
  Share2, 
  Car, 
  Sparkles, 
  X, 
  Copy, 
  MessageSquare, 
  Loader2, 
  ExternalLink,
  Utensils
} from "lucide-react";
import { SquadRoomData } from "@/lib/services/squadService";
import { joinSquadAction, updateSquadAttendanceAction } from "@/lib/actions/squad";
import { trackEvent } from "@/lib/analytics/trackClient";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers/AuthProvider";

interface SquadRoomClientProps {
  initialData: SquadRoomData;
}

export default function SquadRoomClient({ initialData }: SquadRoomClientProps) {
  const { displayName: authDisplayName } = useAuth();
  const [data, setData] = useState<SquadRoomData>(initialData);
  const [guestNameInput, setGuestNameInput] = useState(
    data.currentUserParticipant?.display_name || authDisplayName || ""
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isUserIn = data.currentUserParticipant?.status === "in";
  const isUserDeclined = data.currentUserParticipant?.status === "declined";
  const hasJoined = !!data.currentUserParticipant;

  const currentHeadcount = data.liveEconomics.headcount;
  const perPersonSpend = data.liveEconomics.perPersonSpend;
  const totalSpend = data.liveEconomics.totalSpend;
  const spotName = data.spot.name;
  const spotAddress = data.spot.address || "Lagos, Nigeria";

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/squad/${data.planId}`;
    }
    return `https://oyaplan.vercel.app/squad/${data.planId}`;
  };

  const generateWhatsAppMessage = () => {
    const shareUrl = getShareUrl();
    const confirmedText = data.confirmedCount > 0 ? `${data.confirmedCount} confirmed` : `${data.plan.squad_size} planned`;

    return (
      `*OyaPlan Squad Outing: ${spotName}*\n\n` +
      `• *Squad:* ${confirmedText} (~₦${perPersonSpend.toLocaleString("en-NG")} each)\n` +
      `• *Estimated Outing Total:* ~₦${totalSpend.toLocaleString("en-NG")}\n` +
      `• *Location:* ${spotAddress}\n\n` +
      `Tap the link to check the plan and say "I'm in":\n${shareUrl}`
    );
  };

  const handleWhatsAppShare = () => {
    trackEvent("squad_shared", {
      category: "Sharing",
      plan_id: data.planId,
      share_method: "whatsapp",
      confirmed_count: data.confirmedCount,
    });
    const message = encodeURIComponent(generateWhatsAppMessage());
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopiedLink(true);
      trackEvent("squad_shared", {
        category: "Sharing",
        plan_id: data.planId,
        share_method: "copy_link",
        confirmed_count: data.confirmedCount,
      });
      toast.success("Squad room link copied!");
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestNameInput.trim()) {
      toast.error("Please enter your name");
      return;
    }

    startTransition(async () => {
      const res = await joinSquadAction(data.planId, guestNameInput.trim());
      if (res.success && res.data) {
        toast.success(`You're in, ${guestNameInput.trim()}! 🎉`);
        setIsEditingName(false);
        trackEvent("squad_member_joined", {
          category: "Squad",
          plan_id: data.planId,
          display_name: guestNameInput.trim(),
        });
        // Optimistic refresh
        window.location.reload();
      } else {
        toast.error(res.error || "Could not join right now");
      }
    });
  };

  const handleToggleDecline = () => {
    startTransition(async () => {
      const newStatus = isUserIn ? "declined" : "in";
      const res = await updateSquadAttendanceAction(data.planId, newStatus);
      if (res.success) {
        toast.info(newStatus === "in" ? "You're back in!" : "Status updated to Can't make it");
        window.location.reload();
      } else {
        toast.error("Could not update status");
      }
    });
  };

  return (
    <main className="min-h-[100dvh] bg-[#FAF7F2] text-midnight-lagoon pt-20 sm:pt-24 pb-32 selection:bg-[#008751]/20">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6 animate-in fade-in duration-200">
        
        {/* 1. OUTING TITLE & VENUE IDENTITY */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#008751]/10 text-[#008751] text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#FCC630]" />
              <span>Squad Decision Room</span>
            </span>
            <span className="text-[11px] font-bold text-text-muted capitalize">
              {data.plan.vibe} Vibe
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-midnight-lagoon">
            Outing at {spotName}
          </h1>
          
          <p className="flex items-center gap-1 text-xs sm:text-sm text-text-secondary">
            <MapPin className="w-3.5 h-3.5 text-[#008751] shrink-0" />
            <span>{spotAddress}</span>
          </p>
        </div>

        {/* 2. LIVE ECONOMIC SCORECARD (Decision Header) */}
        <div className="bg-white rounded-[28px] border border-[#EAE4DC] p-5 sm:p-6 shadow-xs space-y-5 relative overflow-hidden">
          
          {/* Top Subheader: Confirmed Count */}
          <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#EAFDF3] text-[#008751] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-midnight-lagoon">
                  Headcount Status
                </p>
                <p className="text-[11px] text-text-muted">
                  {data.confirmedCount > 0 
                    ? `${data.confirmedCount} confirmed (${data.plan.squad_size} target)`
                    : `Planning for ${data.plan.squad_size} people`
                  }
                </p>
              </div>
            </div>

            <span className="text-xs font-black text-[#008751] bg-[#EAFDF3] px-3 py-1 rounded-full">
              {data.confirmedCount} In
            </span>
          </div>

          {/* Large Financial Typography */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Your Share (Estimated)
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-[#008751] tracking-tight">
                ~₦{perPersonSpend.toLocaleString("en-NG")}
              </span>
              <span className="text-xs font-bold text-text-muted">
                per person
              </span>
            </div>
            <p className="text-xs text-text-secondary pt-0.5">
              Based on ~₦{totalSpend.toLocaleString("en-NG")} total estimated spend for {currentHeadcount} {currentHeadcount === 1 ? "person" : "people"}.
            </p>
          </div>

          {/* Transport & Vehicle Batching Disclaimer */}
          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EAE4DC] flex items-center gap-2.5 text-xs text-text-secondary">
            <Car className="w-4 h-4 text-[#008751] shrink-0" />
            <span className="leading-snug">{data.liveEconomics.transportNote}</span>
          </div>

          {/* 3. PRIMARY ACTION: Join Flow */}
          {!hasJoined || isEditingName ? (
            <form onSubmit={handleJoin} className="space-y-3 pt-2 border-t border-[#EAE4DC]">
              <label 
                htmlFor="guestName"
                className="block text-xs font-bold text-midnight-lagoon"
              >
                Enter your name to join the squad:
              </label>
              <div className="flex gap-2">
                <input 
                  id="guestName"
                  type="text"
                  required
                  value={guestNameInput}
                  onChange={(e) => setGuestNameInput(e.target.value)}
                  placeholder="e.g. Bode"
                  className="flex-1 h-12 rounded-xl bg-surface-grey border border-[#EAE4DC] focus:border-[#008751] focus:bg-white text-xs sm:text-sm font-medium px-4 outline-none transition-colors"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isPending || !guestNameInput.trim()}
                  className="h-12 px-5 bg-[#008751] hover:bg-[#007043] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all tap-feedback disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>I&apos;m in</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 pt-2 border-t border-[#EAE4DC]">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EAFDF3] border border-[#A3F3C6]">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#008751] text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#00603A]">
                      {isUserIn ? `You're in as ${data.currentUserParticipant?.display_name}` : `Marked as Can't make it`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleDecline}
                  disabled={isPending}
                  className="text-[11px] font-bold text-[#00603A] hover:underline tap-feedback"
                >
                  {isUserIn ? "Change to Can't make it" : "Change to I'm in"}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* 4. WHO'S COMING (Member List) */}
        <div className="bg-white rounded-[28px] border border-[#EAE4DC] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#008751]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-midnight-lagoon">
                Who&apos;s Coming ({data.confirmedCount} In)
              </h2>
            </div>
          </div>

          {data.participants.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <p className="text-xs font-bold text-midnight-lagoon">
                You&apos;re the first one here!
              </p>
              <p className="text-xs text-text-muted">
                Tap &ldquo;I&apos;m in&rdquo; above and share the squad link on WhatsApp to get the group moving.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EAE4DC]">
              {data.participants.map((p) => {
                const isCurrentUser = p.participant_token === data.currentUserToken;
                const isConfirmed = p.status === "in";

                return (
                  <div 
                    key={p.id}
                    className="flex items-center justify-between py-3 first:pt-1 last:pb-1"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={p.display_name} size="sm" />
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-midnight-lagoon">
                          {p.display_name} {isCurrentUser && <span className="text-[11px] text-text-muted">(You)</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#008751] bg-[#EAFDF3] px-2.5 py-1 rounded-full">
                          <Check className="w-3 h-3" />
                          <span>In</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-text-muted bg-surface-grey px-2.5 py-1 rounded-full">
                          <X className="w-3 h-3" />
                          <span>Can&apos;t make it</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. PROGRESSIVE DISCLOSURE: WHAT WE'RE GETTING & FULL PLAN LINK */}
        <div className="bg-white rounded-[28px] border border-[#EAE4DC] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3.5">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#008751]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-midnight-lagoon">
                Outing Details
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
            <p>
              {data.plan.why_it_fits || `Curated outing fitting your ${data.plan.vibe.toLowerCase()} squad vibe in ${spotAddress}.`}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE4DC]">
                <p className="font-bold text-midnight-lagoon">Food &amp; Drinks</p>
                <p className="text-text-muted mt-0.5 font-mono">~₦{data.liveEconomics.foodSpend.toLocaleString("en-NG")}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE4DC]">
                <p className="font-bold text-midnight-lagoon">Round-Trip Rides</p>
                <p className="text-text-muted mt-0.5 font-mono">~₦{data.liveEconomics.transportSpend.toLocaleString("en-NG")}</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/plan/${data.planId}`}
                className="w-full h-11 rounded-xl border border-[#EAE4DC] bg-[#FAF7F2] hover:bg-white text-midnight-lagoon text-xs font-bold flex items-center justify-center gap-1.5 transition-colors tap-feedback"
              >
                <span>View Full Itinerary &amp; Menu</span>
                <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
              </Link>
            </div>
          </div>
        </div>

        {/* 6. WHATSAPP & SHARE BUTTONS */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full h-13 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all tap-feedback shadow-xs cursor-pointer"
          >
            <MessageSquare className="w-4.5 h-4.5 fill-white" />
            <span>Share Squad on WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full h-12 rounded-2xl border border-[#EAE4DC] bg-white hover:bg-surface-grey text-midnight-lagoon text-xs font-bold flex items-center justify-center gap-2 transition-colors tap-feedback"
          >
            {copiedLink ? <Check className="w-4 h-4 text-[#008751]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? "Link Copied!" : "Copy Squad Link"}</span>
          </button>
        </div>

      </div>

      {/* 7. MOBILE STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE4DC] p-3 px-4 md:hidden pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase">Your Share</p>
            <p className="text-base font-black text-[#008751]">~₦{perPersonSpend.toLocaleString("en-NG")}</p>
          </div>

          {!hasJoined ? (
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("guestName");
                if (el) el.focus();
                else window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-11 px-5 bg-[#008751] hover:bg-[#007043] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs tap-feedback"
            >
              <span>Tap I&apos;m In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="h-11 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs tap-feedback"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Share Squad</span>
            </button>
          )}
        </div>
      </div>

    </main>
  );
}
