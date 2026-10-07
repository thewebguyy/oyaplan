"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Wallet,
  Clock,
  Wine,
  Sparkles,
  Check,
  RotateCcw,
  Zap,
  Building2,
  Eye,
} from "lucide-react";
import { triggerHaptic } from "@/lib/ui/haptics";

export function BusinessHero() {
  const [simulatorMode, setSimulatorMode] = useState<"dispatch" | "mirror">("dispatch");
  const [squadState, setSquadState] = useState<"pending" | "locked" | "declined">("pending");

  const handleAccept = () => {
    triggerHaptic("success");
    setSquadState("locked");
  };

  const handleDecline = () => {
    triggerHaptic("warning");
    setSquadState("declined");
  };

  const handleReset = () => {
    triggerHaptic("success");
    setSquadState("pending");
  };

  return (
    <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-24 overflow-hidden bg-[#0C0D0E] text-[#F7F5EE]">
      {/* Subtle Architectural Road Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ── Left Column: Operator Value Proposition ── */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#008751]/20 border border-[#008751]/40 text-[#00E575]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E575] animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
                THE PULSE · LAGOS HOSPITALITY COMMAND CENTER
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] font-serif">
              Control your venue&apos;s place in{" "}
              <span className="text-[#008751]">Lagos outing decisions.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-xl">
              Drop your weekend bottle sheet. Let squads know the real price before they pull up, lock in table holds with 100% direct deposits, and eliminate door chaos before anyone leaves home.
            </p>

            {/* Structured CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-mono">
                <Link
                  href="/business/claim"
                  className="h-12 px-6 bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md tap-feedback cursor-pointer uppercase tracking-wider"
                >
                  <span>Claim Your Venue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login/business"
                  className="h-12 px-5 bg-white/5 hover:bg-white/10 text-white border border-white/20 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all tap-feedback cursor-pointer uppercase tracking-wider"
                >
                  <ShieldCheck className="w-4 h-4 text-[#00E575]" />
                  <span>Access The Floor</span>
                </Link>
              </div>

              <div>
                <Link
                  href="/login/business"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-white/50 hover:text-[#00E575] transition-colors pt-1"
                >
                  <span>Already claimed? Access The Floor →</span>
                </Link>
              </div>
            </div>

            {/* Operational Anchors */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 font-mono">
              <div>
                <p className="text-xl sm:text-2xl font-black text-white tracking-tight">₦0</p>
                <p className="text-[11px] text-white/50 uppercase mt-0.5">Platform Fee</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-[#008751] tracking-tight">100%</p>
                <p className="text-[11px] text-white/50 uppercase mt-0.5">Direct Table Deposits</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-[#00E575] tracking-tight">Real-Time</p>
                <p className="text-[11px] text-white/50 uppercase mt-0.5">Floor &amp; Squad Radar</p>
              </div>
            </div>
          </div>

          {/* ── Right Column: Interactive Friday Night Squad Dispatch Simulator ── */}
          <div className="lg:col-span-6 relative">
            <div className="space-y-3 font-sans">
              
              {/* Tactical Simulator Header & Switcher */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00E575] animate-pulse" />
                  <span className="text-[11px] font-mono font-black text-[#00E575] uppercase tracking-wider">
                    INTERACTIVE SIMULATOR · FRIDAY 9:15 PM
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 font-mono text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setSimulatorMode("dispatch");
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      simulatorMode === "dispatch"
                        ? "bg-[#008751] text-white shadow-sm"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    Floor Dispatch
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setSimulatorMode("mirror");
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      simulatorMode === "mirror"
                        ? "bg-[#008751] text-white shadow-sm"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    Squad Mirror
                  </button>
                </div>
              </div>

              {simulatorMode === "dispatch" ? (
                /* ── Instrument 1: The Live Floor Dispatch ── */
                <div className="bg-[#141517] rounded-3xl border-2 border-white/10 p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-bold text-[#00E575] uppercase tracking-widest block">
                        INCOMING SQUAD DOSSIER
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Squad of 6 · Tunde&apos;s Birthday
                      </h3>
                      <p className="text-xs text-white/60 font-mono">
                        Target: Patio Lounge Table · Friday 9:00 PM
                      </p>
                    </div>

                    <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#008751]/20 text-[#00E575] border border-[#008751]/40">
                      ⚡ HIGH INTENT
                    </span>
                  </div>

                  {/* Financial Breakdown / Direct Deposit Assurance */}
                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="bg-black/50 p-3.5 rounded-2xl border border-white/10 space-y-1">
                      <span className="text-[10px] text-white/50 uppercase block">Estimated Cart</span>
                      <span className="text-xl font-black text-white">₦240,000</span>
                      <span className="text-[10px] text-white/40 block">Menu ₦160k · Bottles ₦65k · VAT ₦15k</span>
                    </div>

                    <div className="bg-[#008751]/15 p-3.5 rounded-2xl border border-[#008751]/30 space-y-1">
                      <span className="text-[10px] text-[#00E575] font-bold uppercase block">Direct Deposit</span>
                      <span className="text-xl font-black text-[#00E575]">₦50,000</span>
                      <span className="text-[10px] text-[#00E575]/70 block">Direct to your bank account</span>
                    </div>
                  </div>

                  {/* Interactive Action Zone */}
                  {squadState === "pending" && (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={handleDecline}
                          className="h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/15 font-mono text-xs font-bold uppercase tracking-wider transition-all tap-feedback cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={handleAccept}
                          className="h-12 rounded-xl bg-[#008751] hover:bg-[#007043] active:bg-[#005a35] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 tap-feedback cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept &amp; Lock</span>
                        </button>
                      </div>
                      <p className="text-[11px] font-mono text-center text-white/40 pt-1">
                        Tap &quot;Accept &amp; Lock&quot; to test the real venue operator flow
                      </p>
                    </div>
                  )}

                  {squadState === "locked" && (
                    <div className="bg-[#008751]/20 border border-[#00E575]/50 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#00E575]" />
                          <span className="text-sm font-black text-white">TABLE LOCKED &amp; SEATED</span>
                        </div>
                        <span className="text-xs font-mono font-bold bg-black/60 text-[#00E575] px-2.5 py-1 rounded-lg border border-[#00E575]/30">
                          OYA-7K4M2P
                        </span>
                      </div>

                      <div className="text-xs font-mono text-white/80 space-y-1">
                        <p className="text-[#00E575]">
                          ✓ ₦50,000 deposit cleared straight into venue Providus / Moniepoint account.
                        </p>
                        <p className="text-white/60">
                          ✓ Velvet rope staff can verify code &quot;OYA-7K4M2P&quot; in 1 tap on the door console.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="w-full h-9 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all tap-feedback cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Simulate Another Squad ↺</span>
                      </button>
                    </div>
                  )}

                  {squadState === "declined" && (
                    <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
                      <p className="text-xs font-mono text-red-400">
                        Table request declined. The squad was instantly prompted to pick an alternate time or venue without leaving an angry review.
                      </p>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="w-full h-9 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all tap-feedback cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Simulator ↺</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Instrument 2: What Squads See (Live Consumer Mirror) ── */
                <div className="bg-[#141517] rounded-3xl border-2 border-white/10 p-5 sm:p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest block">
                        WHAT SQUADS SEE BEFORE LEAVING HOME
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Nok by Alara · Victoria Island
                      </h3>
                      <p className="text-xs text-[#00E575] font-mono">
                        ● Owner Confirmed for this Friday
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#008751]/15 text-[#008751] border border-[#008751]/30">
                      LIVE MIRROR
                    </span>
                  </div>

                  {/* Outing Total Cart Breakdown */}
                  <div className="bg-black/50 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-white/50 uppercase block">Outing Budget / Head</span>
                      <span className="text-2xl font-mono font-black text-white">₦38,500</span>
                      <span className="text-[11px] text-white/60 block mt-0.5">Average squad spend</span>
                    </div>
                    <div className="text-right text-[11px] font-mono text-white/60 space-y-0.5">
                      <div>Dishes: ₦24,000</div>
                      <div>Cocktails: ₦9,500</div>
                      <div className="text-[#00E575]">VAT + Service: ₦5,000</div>
                    </div>
                  </div>

                  {/* Visual Squad Contract Pills */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">
                      Venue Squad Contract (Zero Surprises At Door)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono font-bold flex items-center gap-1.5">
                        <Wine className="w-3.5 h-3.5 text-[#00E575]" />
                        <span>Corkage: ₦15,000</span>
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono font-bold flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-[#00E575]" />
                        <span>Min Spend: ₦50,000</span>
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono font-bold">
                        Smart Casual Only
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono font-bold">
                        21+ Strict ID
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
