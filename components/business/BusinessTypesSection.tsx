"use client";

import React from "react";
import Link from "next/link";
import { Utensils, Moon, Sparkles, Compass, ArrowRight } from "lucide-react";

export function BusinessTypesSection() {
  const categories = [
    {
      id: "dining",
      group: "DINING",
      icon: Utensils,
      title: "Restaurants & Cafés",
      description: "From fine dining bistros in Victoria Island to brunch spots in Lekki Phase 1 and casual grills in Ikeja.",
      examples: ["Full-service dining", "Bistros & grills", "Specialty coffee & brunch"],
      color: "border-amber-200 bg-amber-50/50 text-amber-900",
      accent: "text-amber-700",
    },
    {
      id: "nightlife",
      group: "NIGHTLIFE",
      icon: Moon,
      title: "Lounges, Bars & Rooftops",
      description: "High-energy evening venues where Lagosians celebrate birthdays, meet squads, and unwind late into the night.",
      examples: ["Cocktail lounges", "Rooftop terraces", "Late-night clubs"],
      color: "border-indigo-200 bg-indigo-50/50 text-indigo-900",
      accent: "text-indigo-700",
    },
    {
      id: "experiences",
      group: "EXPERIENCES",
      icon: Sparkles,
      title: "Activities, Spas & Entertainment",
      description: "Daytime and weekend experiences — arcades, wellness retreats, arts spaces, and recreation centers.",
      examples: ["Paint & sip / Arcades", "Day spas & wellness", "Cinema & live arts"],
      color: "border-emerald-200 bg-emerald-50/50 text-emerald-900",
      accent: "text-emerald-700",
    },
    {
      id: "outdoor",
      group: "OUTDOOR",
      icon: Compass,
      title: "Beaches & Waterfront Spaces",
      description: "Private beach houses, coastal resorts, and serene nature reserves where groups coordinate day trips.",
      examples: ["Private beach clubs", "Waterfront dining", "Nature reserves & parks"],
      color: "border-sky-200 bg-sky-50/50 text-sky-900",
      accent: "text-sky-700",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white" id="business-types">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Act II • Built For Your Venue
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Built for the places Lagosians actually go.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Whether you run an intimate chef&apos;s table in Ikoyi or a bustling rooftop lounge on the Mainland, OyaPlan is designed to accurately represent your experience.
          </p>
        </div>

        {/* 4 Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                id={cat.id}
                className="bg-[#FAF7F2] border border-[#EAE4DC] rounded-2xl p-6 flex flex-col justify-between hover:border-brand-green/40 hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border ${cat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {cat.group}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <ul className="space-y-1.5 pt-2 border-t border-[#EAE4DC]/60">
                    {cat.examples.map((item) => (
                      <li key={item} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Link
                    href="/business/claim"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green hover:underline"
                  >
                    <span>Claim a {cat.group.toLowerCase()} venue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
