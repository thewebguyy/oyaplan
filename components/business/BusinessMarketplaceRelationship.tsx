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
  Compass,
  CreditCard,
} from "lucide-react";

export function BusinessMarketplaceRelationship() {
  const roles = [
    {
      actor: "CUSTOMERS",
      badge: "The Spenders",
      icon: Users,
      color: "border-indigo-200 bg-indigo-50/50 text-indigo-900",
      accent: "text-indigo-700",
      headline: "Use OyaPlan to plan outings without bill shock.",
      points: [
        "Discover real-world Lagos venues matching their vibe and budget",
        "Compare accurate prices, corkage fees, and house policies",
        "Understand likely total spend before leaving home",
        "Assemble squad itineraries and share links on WhatsApp",
        "Submit reservation requests when ready to lock in their spot",
      ],
    },
    {
      actor: "BUSINESSES",
      badge: "The Hosts",
      icon: Store,
      color: "border-emerald-200 bg-[#EAFDF3] text-emerald-950",
      accent: "text-brand-green",
      headline: "Be there when customers decide where to spend.",
      points: [
        "Maintain a 100% free public marketplace listing",
        "Publish accurate menus, signature dishes, bottles, and hours",
        "Capture planning demand from groups budgeting their weekend",
        "Receive structured reservation requests from ready-to-spend squads",
        "Collect required table deposits directly into your business account",
      ],
    },
    {
      actor: "OYAPLAN",
      badge: "The Marketplace Platform",
      icon: Sparkles,
      color: "border-slate-800 bg-[#010528] text-white",
      accent: "text-emerald-400",
      headline: "Delivers decision confidence and qualified demand.",
      points: [
        "Powers venue discovery, group coordination, and cost intelligence",
        "Provides verified reservation infrastructure and visit attribution",
        "Never holds customer deposits or acts as payment custodian",
        "Earns an honest commission on qualifying platform reservations",
        "Feeds post-outing spend feedback back into data accuracy",
      ],
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-t border-border-default" id="marketplace-relationship">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
            Act IV • The Two-Sided Marketplace
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Clear roles. Honest economics. <br className="hidden sm:inline" />
            <span className="text-brand-green">Zero ambiguity.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Marketplaces thrive when every participant understands what they get and how the platform earns. Here is exactly how customers, businesses, and OyaPlan work together.
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
                  {role.actor === "BUSINESSES" ? (
                    <Link
                      href="/business/claim"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green hover:underline"
                    >
                      <span>List your business for free</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : role.actor === "CUSTOMERS" ? (
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-green hover:underline"
                    >
                      <span>Explore consumer planner</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Monetizes on qualifying reservations</span>
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
