"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Building2,
  Receipt,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Lock,
  Clock,
} from "lucide-react";

export function BusinessReservationSection() {
  const steps = [
    {
      step: "01",
      icon: Users,
      title: "Squad Outing Budget",
      subtitle: "Agreed in WhatsApp first",
      description:
        "Lagos squads assemble outing budgets before leaving home—locking in dish choices, drinks, and corkage so there are zero surprises or split-bill arguments at your door.",
      badge: "Pre-Budgeted",
      badgeColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    },
    {
      step: "02",
      icon: Calendar,
      title: "Table Booking Request",
      subtitle: "Party size & spend locked",
      description:
        "When the squad commits, the lead sends a table booking request with party size, preferred zone, and arrival window. You see expected spend before saying yes.",
      badge: "High Intent",
      badgeColor: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
    },
    {
      step: "03",
      icon: Building2,
      title: "1-Tap Accept & Direct Deposit",
      subtitle: "100% direct to your bank",
      description:
        "Managers accept the table in one tap. Any table deposit goes directly into your Providus, Moniepoint, or Zenith account. OyaPlan never touches or holds your funds.",
      badge: "Direct Payout",
      badgeColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    },
    {
      step: "04",
      icon: Receipt,
      title: "1-Second Door Check-in",
      subtitle: "Fast pass verification",
      description:
        "Guests arrive with their OyaPlan booking pass (e.g. OYA-7K4M). Floor staff or door hosts punch in the 4-digit code to seat verified tables instantly without POS hassles.",
      badge: "Zero Door Drama",
      badgeColor: "text-slate-300 bg-white/10 border-white/15",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#0A0B0E] text-[#F5F2EA] border-t border-[#232733]" id="reservations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#10B981]">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
              HOW TABLE RESERVATIONS WORK
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] font-serif">
            What happens when someone <br className="hidden sm:inline" />
            <span className="text-[#E59A28]">wants to book your spot?</span>
          </h2>

          <p className="text-sm sm:text-base text-[#9EA3B0] leading-relaxed">
            We help guests calculate their outing budget and request a table. Your team stays in complete control of confirmations, and all deposits go straight to your bank.
          </p>
        </div>

        {/* 4-Step Reservation Architecture Grid (Stacks on mobile, 2x2 tablet, 4x1 desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-[#14161C] rounded-2xl border border-[#232733] p-5 sm:p-6 flex flex-col justify-between hover:border-[#E59A28]/40 transition-all duration-200 space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-lg border border-[#10B981]/25">
                      STEP {item.step}
                    </span>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white">
                      <Icon className="w-4 h-4 text-[#E59A28]" />
                    </div>
                  </div>

                  <div>
                    <span className={`inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${item.badgeColor} mb-2`}>
                      {item.badge}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#E59A28] mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-[#9EA3B0] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#8A90A0]">
                  <Clock className="w-3 h-3 text-[#10B981]" />
                  <span>Phase 0{idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Critical Trust & Direct Custody Guardrails Callout */}
        <div className="bg-[#14161C] rounded-3xl border border-[#232733] p-6 sm:p-8 lg:p-10 shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                <h3 className="text-lg sm:text-xl font-bold text-white font-serif">
                  Two Direct Guarantees to Every Venue Owner
                </h3>
              </div>
              <p className="text-xs text-[#9EA3B0] max-w-2xl leading-relaxed">
                Clear and non-negotiable rules so you always have 100% control over your reservations and revenue.
              </p>
            </div>

            <Link
              href="/business/claim"
              className="h-11 px-5 bg-[#E59A28] hover:bg-[#D48B1B] text-[#0D0E11] text-xs font-mono font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 tap-feedback cursor-pointer"
            >
              <span>Claim Your Venue Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Guardrail 1: Direct Venue Deposits */}
            <div className="p-5 rounded-2xl bg-[#1A1D24] border border-[#272B35] space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#10B981]" />
                <h4 className="text-sm font-bold text-white">
                  Guests Pay Deposits Directly to You
                </h4>
              </div>
              <p className="text-xs text-[#9EA3B0] leading-relaxed">
                OyaPlan never holds your money or operates an escrow wallet. Any table commitment fee or minimum deposit is sent straight into your business account.
              </p>
              
              {/* Bank Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-[10px] font-mono text-[#9EA3B0]">
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-bold text-white">
                  Providus Bank
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-bold text-white">
                  Moniepoint
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-bold text-white">
                  Zenith Bank
                </span>
                <span className="text-[#10B981] font-bold">✓ Direct Settlement</span>
              </div>
            </div>

            {/* Guardrail 2: Honest Reservation State */}
            <div className="p-5 rounded-2xl bg-[#1A1D24] border border-[#272B35] space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <h4 className="text-sm font-bold text-white">
                  A Request is Only Confirmed When You Say Yes
                </h4>
              </div>
              <p className="text-xs text-[#9EA3B0] leading-relaxed">
                We never tell a guest their table is guaranteed until your team reviews and confirms it. Customers submit a <strong>booking request</strong>; it only becomes a <strong>confirmed table</strong> once you click accept.
              </p>
              
              <div className="pt-2 text-[10px] font-mono text-[#E59A28] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E59A28]" />
                <span>Zero double-booking · You set seat availability</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
