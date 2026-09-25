"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Sparkles, CheckCircle2, MessageSquare } from "lucide-react";

export function BusinessFoundingPartner() {
  const perks = [
    {
      title: "Direct WhatsApp Concierge",
      desc: "Instant line to our product team for menu updates, corrections, and custom asset assistance.",
    },
    {
      title: "Verified Founding Badge",
      desc: "Distinguish your venue as an authentic, verified spot in Lagos planning searches.",
    },
    {
      title: "Demand Feedback Loop",
      desc: "Influence the features, reporting metrics, and planning tools we build for operators next.",
    },
    {
      title: "Zero Setup or Subscription Fees",
      desc: "Claiming and managing your venue profile is completely free for founding partners.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#FAF7F2] border-t border-[#EAE4DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#EAE4DC] p-8 sm:p-12 lg:p-16 shadow-xs relative overflow-hidden">
          
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAFDF3] border border-[#A3F3C6] text-brand-green">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] font-black uppercase tracking-wider">
                Act V • Founding Partner Cohort
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Help shape how Lagos businesses show up on OyaPlan.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              We are starting with a focused group of Lagos venues to make the platform genuinely indispensable for operators and the people deciding where to spend. No fabricated numbers, no hidden fees — just accurate representation.
            </p>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {perks.map((perk) => (
                <div
                  key={perk.title}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                    <h3 className="text-xs font-bold text-slate-900">{perk.title}</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                    {perk.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-6">
              <Link
                href="/business/claim"
                className="h-12 px-6 bg-brand-green hover:bg-[#007043] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm tap-feedback cursor-pointer"
              >
                <span>Become a founding venue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/2348000000000?text=Hi%20OyaPlan%20Team%2C%20I%20would%20like%20to%20learn%20more%20about%20the%20Founding%20Partner%20Cohort"
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 px-6 bg-white hover:bg-slate-50 text-slate-800 border border-[#EAE4DC] text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all tap-feedback"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Talk to product team on WhatsApp</span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
