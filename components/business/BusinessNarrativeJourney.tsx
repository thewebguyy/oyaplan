"use client";

import React from "react";
import { ArrowRight, Edit3, Compass, Users, Store, TrendingUp } from "lucide-react";

export function BusinessNarrativeJourney() {
  const steps = [
    {
      number: "01",
      icon: Compass,
      title: "Appear Where People Decide",
      description: "Your venue shows up right when Lagosians are budgeting and planning their weekend outings.",
    },
    {
      number: "02",
      icon: Edit3,
      title: "Clear Prices, Zero Guesswork",
      description: "Accurate menus, drink prices, and house rules help guests know what to expect before they leave home.",
    },
    {
      number: "03",
      icon: Users,
      title: "Get Table Bookings",
      description: "When a squad is ready to lock in their plans, they send a table reservation request directly to your team.",
    },
    {
      number: "04",
      icon: Store,
      title: "Host & Keep Your Deposit",
      description: "Any table deposit is paid straight to your venue account. You welcome your guests and run service your way.",
    },
    {
      number: "05",
      icon: TrendingUp,
      title: "Real Feedback Builds Trust",
      description: "Guests confirm their bills after the outing, making your venue one of the most trusted spots on OyaPlan.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#010528] text-white" id="narrative-journey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            The Outing Journey
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            From picking a spot to sitting at your table.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Guests decide what to spend long before they leave home. When your prices and rules are accurate, squads pick your venue with confidence.
          </p>
        </div>

        {/* Narrative Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 relative flex flex-col justify-between hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {step.number}
                    </span>
                    <div className="p-2 rounded-lg bg-white/10 text-emerald-400">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-6 h-6 rounded-full bg-[#010528] border border-white/20 flex items-center justify-center text-slate-400">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
