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
  Sparkles,
  AlertCircle,
} from "lucide-react";

export function BusinessReservationSection() {
  const steps = [
    {
      step: "01",
      icon: Users,
      title: "A customer plans",
      subtitle: "Upstream budget calculation",
      description:
        "Lagosians use OyaPlan to decide where to go and calculate likely total spend before leaving home — matching menu prices, drinks, and house policies to their squad budget.",
      badge: "Discovery & Planning",
      badgeColor: "text-amber-800 bg-amber-50 border-amber-200",
    },
    {
      step: "02",
      icon: Calendar,
      title: "They choose to reserve",
      subtitle: "Reservation request submitted",
      description:
        "When the squad is ready to lock in their outing, the customer submits a reservation request through OyaPlan detailing date, time, party size, and seating preference.",
      badge: "Reservation Request",
      badgeColor: "text-indigo-800 bg-indigo-50 border-indigo-200",
    },
    {
      step: "03",
      icon: Building2,
      title: "The venue receives and confirms",
      subtitle: "Direct deposit collection",
      description:
        "Your venue reviews the request and confirms availability. Any required table deposit is paid directly to your business account. OyaPlan does not hold your money.",
      badge: "Direct Venue Deposit",
      badgeColor: "text-emerald-800 bg-[#EAFDF3] border-[#A3F3C6]",
    },
    {
      step: "04",
      icon: Receipt,
      title: "OyaPlan earns a commission",
      subtitle: "Attributed commercial outcome",
      description:
        "Once the qualifying reservation is fulfilled, the visit is attributed to OyaPlan. OyaPlan earns a commission for delivering qualified, ready-to-spend guests.",
      badge: "Qualifying Commission",
      badgeColor: "text-slate-800 bg-slate-100 border-slate-200",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#FAF7F2] border-t border-[#EAE4DC]" id="reservations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 sm:space-y-18">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#EAE4DC] text-brand-green shadow-2xs">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-[11px] font-black uppercase tracking-wider">
              Act III • The Reservation Model
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
            What happens when someone <br className="hidden sm:inline" />
            <span className="text-brand-green">wants to reserve?</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            OyaPlan connects upstream planning intent to real-world bookings. We guide customers from calculating spend to requesting a table, while your business keeps total operational control and collects deposits directly.
          </p>
        </div>

        {/* 4-Step Reservation Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white rounded-2xl border border-[#EAE4DC] p-6 flex flex-col justify-between hover:border-brand-green/40 hover:shadow-md transition-all duration-200 space-y-6 relative"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-brand-green bg-[#EAFDF3] px-2.5 py-1 rounded-lg border border-[#A3F3C6]">
                      STEP {item.step}
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                      <Icon className="w-4 h-4 text-slate-900" />
                    </div>
                  </div>

                  <div>
                    <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${item.badgeColor} mb-2`}>
                      {item.badge}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-brand-green mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Phase {idx + 1} of 4</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Critical Trust & Custody Guardrails Callout */}
        <div className="bg-white rounded-3xl border border-[#EAE4DC] p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-green" />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Two Critical Commitments to Lagos Hospitality Operators
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                Trust is foundational to OyaPlan. We preserve strict boundaries around payments and reservation state to protect both venues and customers.
              </p>
            </div>

            <Link
              href="/business/claim"
              className="h-11 px-5 bg-brand-green hover:bg-[#007043] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs shrink-0 tap-feedback"
            >
              <span>List Your Venue Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Guardrail 1: Direct Venue Deposits */}
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-2.5">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-800" />
                <h4 className="text-sm font-bold text-slate-900">
                  Customers Pay Deposits Directly to Your Venue
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                OyaPlan is not an escrow service, digital wallet, or payment custodian. Any table commitment fee or reservation deposit required by your policy is transferred directly to your business account by the customer upon confirmation.
              </p>
            </div>

            {/* Guardrail 2: Honest Reservation State */}
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                <h4 className="text-sm font-bold text-slate-900">
                  Reservation Request ≠ Confirmed Reservation
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                We never tell a customer their table is instantly guaranteed unless your venue has confirmed it. A customer initiates a <strong>reservation request</strong>; only upon your venue&apos;s direct confirmation does it become a <strong>confirmed reservation</strong>.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
