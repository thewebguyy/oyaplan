"use client";

import RevealOnScroll from "@/components/motion/RevealOnScroll";
import { Wallet, MapPin, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      step: 1,
      icon: Wallet,
      emoji: "💳",
      title: "Pick your budget",
      description: "Set total squad spend or per-person limit. Zero hidden fees or surprise bills.",
      badge: "No Guesswork",
      cardBg: "bg-[#F0FDF4]",
      borderColor: "border-[#008751]/30",
      iconBg: "bg-[#008751] text-white",
      badgeStyle: "bg-[#008751]/15 text-[#008751]",
      numberStyle: "bg-[#008751] text-white",
      textColor: "text-[#1A1A1A]",
      subtextColor: "text-[#4B5563]",
    },
    {
      step: 2,
      icon: MapPin,
      emoji: "📍",
      title: "Choose location",
      description: "Select your Lagos starting area — Lekki, Yaba, Ikeja, or VI. Distance is factored in.",
      badge: "Location-aware",
      cardBg: "bg-[#FEFCE8]",
      borderColor: "border-[#FCC630]",
      iconBg: "bg-[#FCC630] text-[#1A1A1A]",
      badgeStyle: "bg-[#FCC630]/30 text-[#854D0E]",
      numberStyle: "bg-[#FCC630] text-[#1A1A1A]",
      textColor: "text-[#1A1A1A]",
      subtextColor: "text-[#4B5563]",
    },
    {
      step: 3,
      icon: Sparkles,
      emoji: "✨",
      title: "Choose your vibe",
      description: "Date night, squad linkup, birthday turn up, or quick bites tuned to your mood.",
      badge: "Tailored spots",
      cardBg: "bg-[#FAF5FF]",
      borderColor: "border-[#A855F7]/40",
      iconBg: "bg-[#9333EA] text-white",
      badgeStyle: "bg-[#9333EA]/15 text-[#7E22CE]",
      numberStyle: "bg-[#9333EA] text-white",
      textColor: "text-[#1A1A1A]",
      subtextColor: "text-[#4B5563]",
    },
    {
      step: 4,
      icon: ShieldCheck,
      emoji: "🛡️",
      title: "Get verified plan",
      description: "Venue, Bolt transport, taxes, and service buffer calculated to the last naira.",
      badge: "100% Verified",
      cardBg: "bg-[#008751]",
      borderColor: "border-[#008751]",
      iconBg: "bg-[#FCC630] text-[#1A1A1A]",
      badgeStyle: "bg-[#FCC630] text-[#1A1A1A] font-black",
      numberStyle: "bg-white text-[#008751]",
      textColor: "text-white",
      subtextColor: "text-white/80",
      isFeatured: true,
    },
  ];

  return (
    <section 
      className="py-16 sm:py-24 bg-[#FAFAF8] border-t border-[#E5E7EB] overflow-hidden" 
      aria-labelledby="how-it-works-title"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Section Header */}
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#008751]/10 text-[#008751] border border-[#008751]/20 mb-3">
            ✨ Simple 4-Step Magic
          </span>
          <h2 id="how-it-works-title" className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tight">
            How OyaPlan Works
          </h2>
          <p className="text-[#6B7280] mt-3 text-base sm:text-lg font-medium">
            Four tactile steps to plan your Lagos outing with 100% budget confidence.
          </p>
        </div>

        {/* 4 Step Grid with Chowdeck-Style Tactile Cards */}
        <RevealOnScroll staggerChildren={true} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className={`${s.cardBg} border-2 ${s.borderColor} rounded-[28px] p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 hover:rotate-[0.5deg] active:scale-98 transition-all duration-300 group relative overflow-hidden`}
              >
                <div>
                  {/* Step Sticker Badge & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl ${s.iconBg} flex items-center justify-center font-black text-xl shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-sm ${s.numberStyle}`}>
                      STEP 0{s.step}
                    </span>
                  </div>

                  <h3 className={`text-xl sm:text-2xl font-black ${s.textColor} mb-2.5 leading-tight flex items-center gap-2`}>
                    <span>{s.title}</span>
                  </h3>
                  <p className={`${s.subtextColor} text-sm leading-relaxed font-medium`}>
                    {s.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-black/10 flex items-center justify-between">
                  <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${s.badgeStyle}`}>
                    {s.badge}
                  </span>
                  <span className={`text-base font-bold ${s.textColor} group-hover:translate-x-1 transition-transform`}>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </RevealOnScroll>

      </div>
    </section>
  );
}
