"use client";

import React from "react";
import {
  ShieldCheck,
  Utensils,
  Clock,
  Sparkles,
  TrendingUp,
  Wine,
  Users,
  Compass,
  CheckCircle2,
  Lock,
  Plus,
  RefreshCw,
  Eye,
  AlertCircle,
} from "lucide-react";

export function BusinessMarquee() {
  const cards = [
    // Card 1: Your Venue Profile
    {
      id: "venue-profile",
      eyebrow: "01 • VENUE PROFILE",
      title: "Your Venue Presentation",
      badge: "Verified Partner",
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Victoria Island, Lagos
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-[#EAFDF3] px-2 py-0.5 rounded-full border border-[#A3F3C6]">
              Verified Partner
            </span>
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900">Slow Lagos</h4>
            <p className="text-xs text-slate-500">Fine Dining &amp; Botanical Lounge • ₦₦₦₦</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Tonight&apos;s Hours</span>
            <span className="font-bold text-slate-900">5:00 PM – 1:00 AM</span>
          </div>
        </div>
      ),
    },

    // Card 2: Your Pricing & Menus
    {
      id: "pricing-menu",
      eyebrow: "02 • PRICING & MENUS",
      title: "Live Menu Accuracy",
      badge: "100% Up to Date",
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Mains &amp; Cocktails
            </span>
            <span className="text-slate-400 font-mono text-[10px]">Verified 2d ago</span>
          </div>
          <div className="space-y-2">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Wood-Fired Ribeye</p>
                <p className="text-[10px] text-slate-400">Truffle butter &amp; asparagus</p>
              </div>
              <span className="text-xs font-mono font-bold text-brand-green">₦28,000</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Passionfruit Mezcal</p>
                <p className="text-[10px] text-slate-400">House signature</p>
              </div>
              <span className="text-xs font-mono font-bold text-brand-green">₦9,500</span>
            </div>
          </div>
        </div>
      ),
    },

    // Card 3: Your Venue Policies
    {
      id: "venue-policies",
      eyebrow: "03 • HOUSE POLICIES",
      title: "Clear Outing Logistics",
      badge: "Zero DM Confusion",
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Rules customers check before leaving home:
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
              <span className="font-medium text-slate-700">Corkage Policy</span>
              <span className="font-bold text-slate-900">₦20,000 / wine bottle</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
              <span className="font-medium text-slate-700">Dress Code</span>
              <span className="font-bold text-slate-900">Smart Casual (No Slides)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
              <span className="font-medium text-slate-700">Valet Parking</span>
              <span className="font-bold text-emerald-700">Complimentary</span>
            </div>
          </div>
        </div>
      ),
    },

    // Card 4: Your Demand Signals
    {
      id: "demand-signals",
      eyebrow: "04 • DEMAND SIGNALS",
      title: "Active Outing Planning",
      badge: "Live Planner Data",
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE4DC] text-center">
              <p className="text-xl font-black text-slate-900">38</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                Saved to Plans
              </p>
            </div>
            <div className="bg-[#EAFDF3] p-3 rounded-xl border border-[#A3F3C6] text-center">
              <p className="text-xl font-black text-emerald-800">14</p>
              <p className="text-[10px] text-emerald-700 font-bold uppercase mt-0.5">
                Group Outings
              </p>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-green shrink-0" />
            <p className="text-[11px] text-slate-600">
              Peak planning window: <strong className="text-slate-900">Thursday 4PM – Friday 8PM</strong>
            </p>
          </div>
        </div>
      ),
    },

    // Card 5: Your Marketplace Presence
    {
      id: "marketplace-presence",
      eyebrow: "05 • MARKETPLACE PRESENCE",
      title: "Consumer Discovery Card",
      badge: "Native Placement",
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EAE4DC] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Slow Lagos</span>
              <span className="text-[10px] font-bold text-brand-green bg-white px-2 py-0.5 rounded-md border border-[#EAE4DC]">
                Top Match
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2">
              Lush greenery, exceptional culinary precision, and sophisticated cocktails.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-[#EAE4DC]">
              <span className="text-xs font-mono font-bold text-slate-800">~₦35k / person</span>
              <span className="text-[10px] font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Plus className="w-2.5 h-2.5" />
                <span>Add to Plan</span>
              </span>
            </div>
          </div>
        </div>
      ),
    },

    // Card 6: Your Emerging Insights
    {
      id: "emerging-insights",
      eyebrow: "06 • AUDIENCE INTELLIGENCE",
      title: "Confidence-Gated Insights",
      badge: "Commercially Honest",
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-slate-600">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-800">Audience Flow Dynamics</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Insights unlock once a venue reaches 5+ verified planning itineraries in a 30-day window.
            </p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-brand-green h-full w-3/4 rounded-full" />
            </div>
            <p className="text-[10px] font-mono text-slate-400 text-right">3 of 5 plans logged</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-slate-50/60 border-y border-border-default overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Control What Matters
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Everything your venue needs to show up right.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Your menu. Your prices. Your hours. Your policies. The details people usually have to DM you about — managed in one place, synchronized directly into Lagos planning decisions.
          </p>
        </div>
      </div>

      {/* ── Desktop & Large Tablet: Continuous Marquee with Hover Pause ── */}
      <div className="hidden lg:block business-marquee-container relative w-full overflow-hidden py-4 cursor-grab active:cursor-grabbing">
        {/* Subtle edge fades */}
        <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-slate-50/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-slate-50/90 to-transparent z-10 pointer-events-none" />

        <div className="business-marquee-track flex gap-6 px-4">
          {/* First sequence of 6 cards */}
          {cards.map((card) => (
            <div
              key={`track1-${card.id}`}
              className="w-[340px] shrink-0 bg-white rounded-2xl border border-border-default p-5 shadow-xs hover:shadow-md hover:border-brand-green/40 transition-all duration-200 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  {card.eyebrow}
                </span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  {card.badge}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
              {card.content}
            </div>
          ))}

          {/* Duplicated sequence for seamless infinite loop */}
          {cards.map((card) => (
            <div
              key={`track2-${card.id}`}
              className="w-[340px] shrink-0 bg-white rounded-2xl border border-border-default p-5 shadow-xs hover:shadow-md hover:border-brand-green/40 transition-all duration-200 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  {card.eyebrow}
                </span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  {card.badge}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
              {card.content}
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile & Small Tablet: Native Touch Snap Horizontal Track ── */}
      <div className="lg:hidden w-full overflow-x-auto touch-snap-x px-4 sm:px-6 py-2 flex gap-4 no-scrollbar">
        {cards.map((card) => (
          <div
            key={`mobile-${card.id}`}
            className="w-[85vw] max-w-[320px] shrink-0 snap-card bg-white rounded-2xl border border-border-default p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                {card.eyebrow}
              </span>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {card.badge}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
            {card.content}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-center sm:text-left">
        <p className="text-xs text-slate-500 font-medium">
          💡 <span className="text-slate-700 font-bold">Desktop:</span> Hover over any card to pause and inspect live interface specimens.
        </p>
      </div>
    </section>
  );
}
