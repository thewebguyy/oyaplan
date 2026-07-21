"use client";

import RevealOnScroll from "@/components/motion/RevealOnScroll";
import { Wallet, MapPin, Sparkles, ShieldCheck } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      step: 1,
      icon: Wallet,
      title: "Pick your budget",
      description: "Set total squad spend or per-person limit. No hidden fees or unexpected bill surprises.",
      badge: "No guesswork",
      color: "bg-[#008751]/10 text-[#008751] border-[#008751]/20",
      accent: "text-[#008751]",
    },
    {
      step: 2,
      icon: MapPin,
      title: "Choose your location",
      description: "Select your starting area in Lagos — Lekki, Yaba, Ikeja, or VI. We factor in exact transport distance.",
      badge: "Location-aware",
      color: "bg-[#FCC630]/20 text-[#9E7300] border-[#FCC630]/30",
      accent: "text-[#9E7300]",
    },
    {
      step: 3,
      icon: Sparkles,
      title: "Choose your vibe",
      description: "Date night, squad linkup, birthday turn up, or quick bites. We match spots tuned to your mood.",
      badge: "Tailored spots",
      color: "bg-[#008751]/10 text-[#008751] border-[#008751]/20",
      accent: "text-[#008751]",
    },
    {
      step: 4,
      icon: ShieldCheck,
      title: "Get a verified plan",
      description: "Venue, transport, taxes, and service buffer. We compute everything down to the last naira before you leave home.",
      badge: "100% Transparency",
      color: "bg-[#FCC630]/20 text-[#9E7300] border-[#FCC630]/30",
      accent: "text-[#9E7300]",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FAFAF8] border-t border-[#E5E7EB] text-center overflow-hidden" aria-labelledby="how-it-works-title">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#008751]/10 text-[#008751] mb-3">
            Simple 4-Step Process
          </span>
          <h2 id="how-it-works-title" className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tight">
            How OyaPlan Works
          </h2>
          <p className="text-[#6B7280] mt-3 text-base sm:text-lg">
            Four simple steps to plan your next squad outing with total budget confidence.
          </p>
        </div>

        {/* 4 Step Grid */}
        <RevealOnScroll staggerChildren={true} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group relative"
              >
                <div>
                  {/* Step Badge & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-11 h-11 rounded-xl ${s.color} border flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-[#E5E7EB] group-hover:text-[#008751]/30 transition-colors">
                      0{s.step}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#1A1A1A] mb-2.5">
                    {s.step}. {s.title}
                  </h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className={`mt-6 pt-4 border-t border-[#E5E7EB]/60 text-xs font-bold ${s.accent} uppercase tracking-wider flex items-center justify-between`}>
                  <span>{s.badge}</span>
                  <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            );
          })}
        </RevealOnScroll>
      </div>
    </section>
  );
}
