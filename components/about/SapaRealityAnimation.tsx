"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Clock, MapPin, CheckCircle2, ShieldCheck, Car, Heart, Sparkles } from "lucide-react";

export function SapaRealityAnimation() {
  const [activeTab, setActiveTab] = useState<"sapa" | "softlife">("sapa");

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev === "sapa" ? "softlife" : "sapa"));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-[340px] mx-auto select-none font-sans">
      
      {/* Interactive Mode Pills */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setActiveTab("sapa")}
          className={`px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "sapa"
              ? "bg-[#EF4444] text-white border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111]"
              : "bg-white text-[#777777] border border-[#E5E5DE] hover:text-[#111111]"
          }`}
        >
          Lagos Reality 😩
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("softlife")}
          className={`px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "softlife"
              ? "bg-[#008751] text-white border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111]"
              : "bg-white text-[#777777] border border-[#E5E5DE] hover:text-[#111111]"
          }`}
        >
          OyaPlan Hack 🌴
        </button>
      </div>

      {/* Stylized Smartphone Frame (Neo-Brutalist) */}
      <div className="relative rounded-[32px] bg-white border-3 border-[#111111] p-4 shadow-[8px_8px_0px_0px_#111111] overflow-hidden">
        
        {/* Phone Notch & Status */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DE] text-[10px] font-mono font-bold text-[#888888]">
          <span>{activeTab === "sapa" ? "8:45 PM • Friday" : "2:15 PM • Friday"}</span>
          <div className="w-14 h-3.5 bg-[#111111] rounded-full mx-auto" />
          <span>5G • 89%</span>
        </div>

        {/* Dynamic State View */}
        {activeTab === "sapa" ? (
          /* STATE 1: THE LAGOS BILLING TRAP */
          <div className="pt-3 space-y-3 animate-in fade-in duration-300">
            {/* Header Alert */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2.5 flex items-center justify-between text-xs font-bold text-red-700">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Surprise Billing Alert</span>
              </span>
              <span className="text-[10px] bg-red-200 px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                Unplanned
              </span>
            </div>

            {/* Restaurant Menu Mystery */}
            <div className="bg-[#FAF9F5] border border-[#E5E5DE] rounded-xl p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#111111]">VI Rooftop Lounge</span>
                <span className="text-[10px] text-red-600 font-bold font-mono">No Prices on IG</span>
              </div>
              <div className="space-y-1 text-[#444444] text-[11px]">
                <div className="flex justify-between">
                  <span>Grilled Platter for 2</span>
                  <span className="font-bold text-[#111111]">₦38,000</span>
                </div>
                <div className="flex justify-between">
                  <span>2x Cocktails</span>
                  <span className="font-bold text-[#111111]">₦24,000</span>
                </div>
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Service + VAT (17.5%)</span>
                  <span>₦10,850</span>
                </div>
              </div>
            </div>

            {/* Ride Hail Delay on Third Mainland */}
            <div className="bg-[#111111] text-white rounded-xl p-3 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1 text-[#F9E828]">
                  <Car className="w-3.5 h-3.5" /> Bolt Driver
                </span>
                <span className="text-red-400 font-bold">Surge 2.2x</span>
              </div>
              <p className="text-[11px] text-white/80">
                Driver is <strong className="text-[#F9E828]">25 mins away</strong> stuck at Obalende traffic. Fare: ₦7,200.
              </p>
            </div>

            {/* Final Sapa Damage */}
            <div className="p-2.5 rounded-xl bg-red-100 border border-red-300 text-center">
              <span className="text-[10px] font-mono uppercase font-bold text-red-800 block">Total Unplanned Damage:</span>
              <span className="text-xl font-black text-red-700 font-mono">₦80,050</span>
            </div>
          </div>
        ) : (
          /* STATE 2: THE OYAPLAN SOFT LIFE */
          <div className="pt-3 space-y-3 animate-in fade-in duration-300">
            {/* Header Success Badge */}
            <div className="bg-[#008751]/10 border-2 border-[#008751]/30 rounded-xl p-2.5 flex items-center justify-between text-xs font-bold text-[#008751]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#008751]" />
                <span>Planned With OyaPlan</span>
              </span>
              <span className="text-[10px] bg-[#008751] text-white px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                Locked
              </span>
            </div>

            {/* Audited Plan Details */}
            <div className="bg-[#FAF9F5] border border-[#E5E5DE] rounded-xl p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#111111]">Lagos Island Bistro</span>
                <span className="text-[10px] text-[#008751] font-bold font-mono">Audited Menu</span>
              </div>
              <div className="space-y-1 text-[#444444] text-[11px]">
                <div className="flex justify-between">
                  <span>Selected Dining Items</span>
                  <span className="font-bold text-[#111111]">₦32,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Pre-Factored Taxes &amp; Tip</span>
                  <span className="font-bold text-[#111111]">₦5,600</span>
                </div>
                <div className="flex justify-between text-[#008751] font-semibold">
                  <span>Planned Return Transit</span>
                  <span>₦4,400</span>
                </div>
              </div>
            </div>

            {/* Squad Shared Splitting */}
            <div className="bg-[#111111] text-white rounded-xl p-3 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#F9E828] font-bold">Squad of 2</span>
                <span className="text-[#008751] bg-[#008751]/20 px-2 py-0.5 rounded-md font-bold">50/50 Split</span>
              </div>
              <p className="text-[11px] text-white/80">
                Exact damage per head: <strong className="text-[#F9E828]">₦21,000</strong>. Left home with 100% peace of mind.
              </p>
            </div>

            {/* Final Soft Life State */}
            <div className="p-2.5 rounded-xl bg-[#F9E828] border-2 border-[#111111] text-center">
              <span className="text-[10px] font-mono uppercase font-black text-[#111111] block">Total Pocket Confidence:</span>
              <span className="text-xl font-black text-[#111111] font-mono">₦42,000 Flat</span>
            </div>
          </div>
        )}

        {/* Footer Indicator Bar */}
        <div className="pt-3 border-t border-[#E5E5DE] flex items-center justify-between text-[10px] font-mono text-[#777777]">
          <span>Lagos Island Linkup</span>
          <span className="font-bold text-[#111111]">OyaPlan Vetted</span>
        </div>
      </div>
    </div>
  );
}
