"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Utensils,
  CreditCard,
  Building,
  Vote,
  Radio,
  CheckCircle2
} from "lucide-react";
import { SquadRoomData } from "@/lib/services/squadService";
import { OwambeSuccessVisual } from "@/components/cultural/OwambeSuccessVisual";
import { 
  joinSquadAction, 
  updateSquadAttendanceAction, 
  saveSquadSettlementAction,
  voteSquadOptionAction 
} from "@/lib/actions/squad";
import { supabaseBrowser } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics/trackClient";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers/AuthProvider";

const NIGERIAN_BANKS = [
  "Guaranty Trust Bank (GTBank)",
  "Kuda Bank",
  "Access Bank",
  "Zenith Bank",
  "Moniepoint MFB",
  "OPay",
  "Palmpay",
  "First Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Stanbic IBTC Bank",
  "Sterling Bank",
  "Wema Bank (ALAT)",
  "Fidelity Bank",
  "FCMB",
];

interface SquadRoomClientProps {
  initialData: SquadRoomData;
}

export default function SquadRoomClient({ initialData }: SquadRoomClientProps) {
  const router = useRouter();
  const { displayName: authDisplayName } = useAuth();
  const [data, setData] = useState<SquadRoomData>(initialData);
  
  const [guestNameInput, setGuestNameInput] = useState(
    data.currentUserParticipant?.display_name || authDisplayName || ""
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Settlement Form State
  const [isAddingSettlement, setIsAddingSettlement] = useState(false);
  const [bankNameInput, setBankNameInput] = useState(data.settlement?.bank_name || NIGERIAN_BANKS[0]);
  const [accountNumberInput, setAccountNumberInput] = useState(data.settlement?.account_number || "");
  const [accountNameInput, setAccountNameInput] = useState(data.settlement?.account_name || "");
  const [settlementNoteInput, setSettlementNoteInput] = useState(data.settlement?.note || "");

  // Realtime Presence Channel
  useEffect(() => {
    const channel = supabaseBrowser
      .channel(`squad_room_${data.planId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "plan_squad_participants",
          filter: `plan_id=eq.${data.planId}`,
        },
        () => {
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "squad_option_votes",
          filter: `plan_id=eq.${data.planId}`,
        },
        () => {
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "plan_settlements",
          filter: `plan_id=eq.${data.planId}`,
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [data.planId, router]);

  // Keep state updated when server revalidates
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const isUserIn = data.currentUserParticipant?.status === "in";
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
    const confirmedCount = data.confirmedCount > 0 ? data.confirmedCount : data.plan.squad_size;

    return (
      `Found the spot.\n\n` +
      `*${spotName}*\n\n` +
      `The Outside Math:\n` +
      `₦${totalSpend.toLocaleString("en-NG")} total\n` +
      `₦${perPersonSpend.toLocaleString("en-NG")} each\n\n` +
      `Venue + transport + applicable charges included.\n\n` +
      `${shareUrl}\n\n` +
      `We running this?`
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
          category: "Engagement",
          plan_id: data.planId,
          display_name: guestNameInput.trim(),
        });
        router.refresh();
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
        router.refresh();
      } else {
        toast.error("Could not update status");
      }
    });
  };

  const handleSaveSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankNameInput || !accountNumberInput.trim() || !accountNameInput.trim()) {
      toast.error("Please fill in bank name, account number, and account name");
      return;
    }

    startTransition(async () => {
      const res = await saveSquadSettlementAction(data.planId, {
        bankName: bankNameInput,
        accountNumber: accountNumberInput.trim(),
        accountName: accountNameInput.trim(),
        note: settlementNoteInput.trim(),
      });

      if (res.success) {
        toast.success("Host bank details saved for split & settle!");
        setIsAddingSettlement(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to save bank details");
      }
    });
  };

  const handleCopyBankDetails = async () => {
    if (!data.settlement) return;
    const { bank_name, account_number, account_name } = data.settlement;
    const textToCopy = `${account_number} (${bank_name} - ${account_name})`;

    try {
      await navigator.clipboard.writeText(account_number);
      setCopiedAccount(true);
      toast.success(`Copied ${account_number} (${bank_name})! Send ~₦${perPersonSpend.toLocaleString("en-NG")} to ${account_name}`);
      setTimeout(() => setCopiedAccount(false), 3000);
    } catch {
      toast.error("Could not copy account number");
    }
  };

  const handleVoteOption = (optionId: string) => {
    startTransition(async () => {
      const res = await voteSquadOptionAction(data.planId, optionId);
      if (res.success) {
        toast.success("Vote recorded for showdown option!");
        router.refresh();
      } else {
        toast.error(res.error || "Could not record vote");
      }
    });
  };

  return (
    <main className="min-h-[100dvh] bg-[#FAF7F2] text-midnight-lagoon pt-20 sm:pt-24 pb-32 selection:bg-[#008751]/20">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6 animate-in fade-in duration-200">
        
        {/* 1. OUTING TITLE & REALTIME SYNC STATUS */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#008751]/10 text-[#008751] text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#FCC630]" />
                <span>Squad Decision Room</span>
              </span>
              <span className="text-[11px] font-bold text-text-muted capitalize">
                {data.plan.vibe} Vibe
              </span>
            </div>

            {/* Realtime Pulse Indicator */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#008751] bg-[#EAFDF3] px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#008751] animate-pulse" />
              <span>Live Sync</span>
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-midnight-lagoon">
            Outing at {spotName}
          </h1>
          
          <p className="flex items-center gap-1 text-xs sm:text-sm text-text-secondary">
            <MapPin className="w-3.5 h-3.5 text-[#008751] shrink-0" />
            <span>{spotAddress}</span>
          </p>
        </div>

        {/* High-Joy Squad Assembly Milestone */}
        {data.confirmedCount >= data.plan.squad_size && data.confirmedCount > 1 && (
          <OwambeSuccessVisual
            squadCount={data.confirmedCount}
            message="Squad Ready &amp; Accounted For"
          />
        )}

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

        {/* 3. MULTI-OPTION SHOWDOWN (If Options Available) */}
        {data.options.length > 0 && (
          <div className="bg-white rounded-[28px] border border-[#EAE4DC] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3.5">
              <div className="flex items-center gap-2">
                <Vote className="w-4 h-4 text-[#008751]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-midnight-lagoon">
                  Squad Showdown (Vote on Options)
                </h2>
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase">
                1-Tap Blind Vote
              </span>
            </div>

            <div className="space-y-3">
              {data.options.map((opt) => {
                const isUserVoted = data.userVotedOptionId === opt.id;

                return (
                  <div 
                    key={opt.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isUserVoted 
                        ? "bg-[#EAFDF3] border-[#008751] ring-1 ring-[#008751]" 
                        : "bg-[#FAF7F2] border-[#EAE4DC] hover:border-[#008751]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#008751]">
                          {opt.option_label}
                        </span>
                        <h3 className="text-sm font-bold text-midnight-lagoon">
                          {opt.title}
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">
                          ~₦{opt.estimated_per_person.toLocaleString("en-NG")} per person
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-midnight-lagoon bg-white px-2.5 py-1 rounded-lg border border-[#EAE4DC]">
                          {opt.votes_count} {opt.votes_count === 1 ? "vote" : "votes"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleVoteOption(opt.id)}
                          disabled={isPending}
                          className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all tap-feedback ${
                            isUserVoted
                              ? "bg-[#008751] text-white"
                              : "bg-white border border-[#EAE4DC] text-midnight-lagoon hover:bg-[#EAFDF3] hover:text-[#008751]"
                          }`}
                        >
                          {isUserVoted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Radio className="w-3.5 h-3.5" />}
                          <span>{isUserVoted ? "Voted" : "Vote"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

        {/* 5. SPLIT & SETTLE (Non-Custodial Bank Account Details) */}
        <div className="bg-white rounded-[28px] border border-[#EAE4DC] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3.5">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#008751]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-midnight-lagoon">
                Split &amp; Settle (Host Bank Account)
              </h2>
            </div>
            <span className="text-[10px] font-bold text-text-muted uppercase">
              1-Tap Copy
            </span>
          </div>

          {data.settlement ? (
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-text-muted uppercase">Bank Name</p>
                  <p className="text-sm font-bold text-midnight-lagoon">{data.settlement.bank_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-text-muted uppercase">Account Name</p>
                  <p className="text-sm font-bold text-midnight-lagoon">{data.settlement.account_name}</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#EAE4DC] flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase">Account Number</p>
                  <p className="text-base font-black text-[#008751] font-mono tracking-wider">
                    {data.settlement.account_number}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyBankDetails}
                  className="h-10 px-4 bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all tap-feedback shadow-xs cursor-pointer"
                >
                  {copiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAccount ? "Copied!" : "Copy Account"}</span>
                </button>
              </div>

              {data.settlement.note && (
                <p className="text-xs text-text-secondary italic">
                  &ldquo;{data.settlement.note}&rdquo;
                </p>
              )}

              {data.isCreator && (
                <button
                  type="button"
                  onClick={() => setIsAddingSettlement(true)}
                  className="text-xs font-bold text-[#008751] hover:underline"
                >
                  Edit Bank Details
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {!isAddingSettlement ? (
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] text-center space-y-2">
                  <p className="text-xs font-bold text-midnight-lagoon">
                    No bank account added yet
                  </p>
                  <p className="text-xs text-text-muted">
                    {data.isCreator 
                      ? "Add your Nigerian bank account so friends can copy your details and send their exact share with 1 tap."
                      : "The host has not added bank details yet. They can add it to make splitting easier."
                    }
                  </p>
                  {data.isCreator && (
                    <button
                      type="button"
                      onClick={() => setIsAddingSettlement(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold transition-all tap-feedback mt-1"
                    >
                      <Building className="w-3.5 h-3.5" />
                      <span>Add Host Bank Account</span>
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSaveSettlement} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-midnight-lagoon">
                      Select Bank
                    </label>
                    <select
                      value={bankNameInput}
                      onChange={(e) => setBankNameInput(e.target.value)}
                      className="w-full h-11 rounded-xl bg-white border border-[#EAE4DC] text-xs font-medium px-3 outline-none focus:border-[#008751]"
                    >
                      {NIGERIAN_BANKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-midnight-lagoon">
                      Account Number (10 digits)
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      required
                      value={accountNumberInput}
                      onChange={(e) => setAccountNumberInput(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 0123456789"
                      className="w-full h-11 rounded-xl bg-white border border-[#EAE4DC] text-xs font-mono font-bold px-3 outline-none focus:border-[#008751]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-midnight-lagoon">
                      Account Name
                    </label>
                    <input
                      type="text"
                      required
                      value={accountNameInput}
                      onChange={(e) => setAccountNameInput(e.target.value)}
                      placeholder="e.g. Bode Olusegun"
                      className="w-full h-11 rounded-xl bg-white border border-[#EAE4DC] text-xs font-medium px-3 outline-none focus:border-[#008751]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-midnight-lagoon">
                      Note / Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={settlementNoteInput}
                      onChange={(e) => setSettlementNoteInput(e.target.value)}
                      placeholder="e.g. Transfer your ~₦17k share before 11pm"
                      className="w-full h-11 rounded-xl bg-white border border-[#EAE4DC] text-xs font-medium px-3 outline-none focus:border-[#008751]"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingSettlement(false)}
                      className="flex-1 h-11 rounded-xl border border-[#EAE4DC] bg-white text-xs font-bold text-text-muted hover:text-midnight-lagoon"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex-1 h-11 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold flex items-center justify-center gap-1.5 tap-feedback disabled:opacity-50"
                    >
                      {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Save Details</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* 6. PROGRESSIVE DISCLOSURE: WHAT WE'RE GETTING & FULL PLAN LINK */}
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

        {/* 7. WHATSAPP & SHARE BUTTONS */}
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

      {/* 8. MOBILE STICKY BOTTOM ACTION BAR */}
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
