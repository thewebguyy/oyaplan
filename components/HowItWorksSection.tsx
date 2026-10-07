"use client";

import RevealOnScroll from "@/components/motion/RevealOnScroll";
import { Wallet, MapPin, Sparkles, ShieldCheck, ArrowRight, Check } from "lucide-react";

export default function HowItWorksSection() {
  const scrollToPlanner = () => {
    const el = document.getElementById("planner-widget");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const steps = [
    {
      step: 1,
      icon: Wallet,
      title: "Lock damage per head",
      description: "Set your squad's pocket boundary. We calculate the real total cost beforehand so nobody is caught stranded.",
      badge: "Zero Surprises",
      cardBg: "bg-white",
      iconBg: "bg-[#F9E828] text-[#111111]",
      badgeBg: "bg-[#FFFEE5] text-[#111111]",
      numBg: "bg-[#111111] text-[#F9E828]",
    },
    {
      step: 2,
      icon: MapPin,
      title: "Island or Mainland?",
      description: "Select where the linkup kicks off — Lekki, Yaba, Ikeja, VI, or Ikoyi. Distance & transport surges are built in.",
      badge: "Zone Modeled",
      cardBg: "bg-white",
      iconBg: "bg-[#111111] text-white",
      badgeBg: "bg-[#F6F6F2] text-[#111111]",
      numBg: "bg-[#111111] text-white",
    },
    {
      step: 3,
      icon: Sparkles,
      title: "What's the frequency?",
      description: "Date night, squad linkup, birthday turn up, or quiet Sunday brunch. Tailored spots matching the exact mood.",
      badge: "Vibe Matched",
      cardBg: "bg-white",
      iconBg: "bg-[#FFFEE5] text-[#111111] border border-[#111111]",
      badgeBg: "bg-[#FFFEE5] text-[#111111]",
      numBg: "bg-[#111111] text-[#F9E828]",
    },
    {
      step: 4,
      icon: ShieldCheck,
      title: "Collect verified till slip",
      description: "Audited physical menus, estimated ride corridor, and verified damage per head before you step outside.",
      badge: "OyaPlan Verified",
      cardBg: "bg-[#008751] text-white",
      iconBg: "bg-[#F9E828] text-[#111111]",
      badgeBg: "bg-[#111111] text-[#F9E828]",
      numBg: "bg-white text-[#008751]",
      isFeatured: true,
    },
  ];

  return (
    <section 
      className="py-20 sm:py-28 bg-[#F6F6F2] border-t-2 border-[#111111] overflow-hidden selection:bg-[#F9E828] selection:text-[#111111]" 
      aria-labelledby="how-it-works-title"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider bg-[#F9E828] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
            <Sparkles className="w-3.5 h-3.5 fill-[#111111]" />
            <span>THE 4-STEP OUTING PROTOCOL</span>
          </div>
          
          <h2 id="how-it-works-title" className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] font-display uppercase tracking-tight">
            How OyaPlan Works
          </h2>
          <p className="text-[#555555] text-sm sm:text-base font-medium max-w-lg mx-auto">
            Four street-smart steps to plan your outing with total budget confidence. No guesswork. No stories.
          </p>
        </div>

        {/* 4 Step Grid with Neo-Brutalist Danfo Cards */}
        <RevealOnScroll staggerChildren={true} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left relative">
          {steps.map((s) => {
            const Icon = s.icon;
            const isFeatured = s.isFeatured;

            return (
              <button
                key={s.step}
                type="button"
                onClick={scrollToPlanner}
                className={`${s.cardBg} border-3 border-[#111111] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-[6px_6px_0px_0px_#111111] hover:shadow-[8px_8px_0px_0px_#111111] hover:-translate-y-1 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#111111] transition-all duration-200 group relative text-left cursor-pointer w-full h-full`}
              >
                <div>
                  {/* Step Badge & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl ${s.iconBg} border-2 border-[#111111] flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_0px_#111111] group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-black tracking-wider uppercase border border-[#111111] shadow-[2px_2px_0px_0px_#111111] ${s.numBg}`}>
                      STEP 0{s.step}
                    </span>
                  </div>

                  <h3 className={`text-lg sm:text-xl font-black font-display uppercase tracking-tight mb-2 leading-snug ${isFeatured ? "text-white" : "text-[#111111]"}`}>
                    {s.title}
                  </h3>
                  
                  <p className={`text-xs sm:text-sm leading-relaxed font-medium ${isFeatured ? "text-white/90" : "text-[#555555]"}`}>
                    {s.description}
                  </p>
                </div>

                <div className={`w-full mt-8 pt-4 border-t ${isFeatured ? "border-white/20" : "border-[#111111]/15"} flex items-center justify-between`}>
                  <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-md border border-[#111111] ${s.badgeBg}`}>
                    {s.badge}
                  </span>
                  
                  <span className={`w-7 h-7 rounded-lg border border-[#111111] flex items-center justify-center text-xs font-bold ${isFeatured ? "bg-white text-[#111111]" : "bg-[#F9E828] text-[#111111]"} shadow-[2px_2px_0px_0px_#111111] group-hover:translate-x-0.5 transition-transform`}>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                </div>
              </button>
            );
          })}
        </RevealOnScroll>

        {/* Bottom Fast Action Prompt */}
        <div className="text-center pt-2">
          <button
            onClick={scrollToPlanner}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono font-black uppercase tracking-wider text-[#111111] hover:text-[#008751] transition-colors cursor-pointer group"
          >
            <span>Ready to plan? Jump straight to the planner</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}
