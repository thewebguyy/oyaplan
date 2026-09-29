"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Store,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Receipt,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

export function BusinessMarketplaceRelationship() {
  const roles = [
    {
      actor: "GUESTS & SQUADS",
      badge: "People Going Out",
      icon: Users,
      color: "border-indigo-200 bg-indigo-50/50 text-indigo-900",
      accent: "text-indigo-700",
      headline: "Find great spots that fit their budget and vibe.",
      points: [
        "Discover real Lagos spots with verified prices and menus",
        "Know what the bill will look like before leaving home",
        "Agree on food, drinks, and corkage rules in squad group chats",
        "Send a reservation request when they are ready to book",
        "Pay required table deposits directly to the venue",
      ],
    },
    {
      actor: "YOUR VENUE",
      badge: "Host & Management",
      icon: Store,
      color: "border-emerald-200 bg-[#EAFDF3] text-emerald-950",
      accent: "text-brand-green",
      headline: "Welcome guests who are ready to spend.",
      points: [
        "List your venue 100% free with complete control of your details",
        "Publish your real menus, signature bottles, and kitchen hours",
        "Receive table booking requests from groups planning ahead",
        "Collect table deposits straight into your own bank account",
        "Confirm bookings on your own terms — you stay in control",
      ],
    },
    {
      actor: "OYAPLAN",
      badge: "Discovery & Planning",
      icon: Sparkles,
      color: "border-slate-800 bg-[#010528] text-white",
      accent: "text-emerald-400",
      headline: "Make planning easy and bring you real customers.",
      points: [
        "Helps groups agree on where to go and what they will spend",
        "Sends structured table booking requests directly to your team",
        "Never touches your table deposits — guests pay you directly",
        "Only earns a commission when a customer reserves through OyaPlan",
        "Collects honest bill feedback so squad budget estimates stay accurate",
      ],
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-t border-border-default" id="marketplace-relationship">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
            How It Works Together
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Simple rules. Direct deposits. <br className="hidden sm:inline" />
            <span className="text-brand-green">Everyone wins.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Guests find places they love, you get confirmed bookings and keep the deposit, and OyaPlan only makes money when you get real customers.
          </p>
        </div>

        {/* 3 Pillars Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isDark = role.actor === "OYAPLAN";
            return (
              <div
                key={role.actor}
                className={`rounded-2xl border p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 shadow-xs ${
                  isDark
                    ? "bg-[#010528] border-slate-800 text-white"
                    : "bg-[#FAF7F2] border-[#EAE4DC] text-slate-900"
                }`}
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {role.actor}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-white/10 text-emerald-400 border border-white/15" : "bg-white text-slate-700 border border-[#EAE4DC]"}`}>
                      {role.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-white/10 text-emerald-400" : "bg-white border border-[#EAE4DC] text-brand-green shadow-xs"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className={`text-base sm:text-lg font-bold ${isDark ? "text-white" : "text-slate-900"} leading-snug`}>
                      {role.headline}
                    </h3>
                  </div>

                  <ul className="space-y-2.5 pt-2 border-t border-slate-200/40">
                    {role.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2 text-xs leading-relaxed">
                        <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isDark ? "text-emerald-400" : "text-brand-green"}`} />
                        <span className={isDark ? "text-slate-300" : "text-slate-600"}>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  {role.actor === "YOUR VENUE" ? (
                    <Link
                      href="/business/claim"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green hover:underline"
                    >
                      <span>List your venue for free</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : role.actor === "GUESTS & SQUADS" ? (
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-green hover:underline"
                    >
                      <span>See what planners see</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                      <Receipt className="w-3.5 h-3.5" />
                      <span>We only earn when you get bookings</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
