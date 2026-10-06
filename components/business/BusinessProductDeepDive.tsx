"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, Clock, Wine, Edit3, Tag, Sparkles } from "lucide-react";

export function BusinessProductDeepDive() {
  return (
    <section className="py-20 sm:py-28 bg-white border-t border-border-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            What You Control
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            No surprises for your guests.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            When guests don&apos;t know your prices, corkage fees, or opening hours, they go somewhere else. OyaPlan lets you set the record straight so customers arrive ready to spend.
          </p>
        </div>

        {/* 3 Editorial Feature Deep Dives */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Feature 1: Menu & Price Management */}
          <div className="bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC] p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE4DC] flex items-center justify-center text-brand-green shadow-xs">
                <Tag className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Direct Pricing &amp; Menu Control
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Update signature dishes, cocktails, and bottle service pricing in seconds. Price changes reflect instantly in consumer budget estimates.
              </p>
            </div>

            <div className="bg-white rounded-xl p-3 border border-[#EAE4DC] space-y-2">
              <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-900">Live Item Editor</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-[#EAFDF3] px-1.5 py-0.5 rounded">Synced</span>
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>Grilled Jumbo Prawns</span>
                  <span className="font-mono font-bold text-brand-green">₦24,000</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Chapman Carafe</span>
                  <span className="font-mono font-bold text-brand-green">₦8,500</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: House Rules & Boundaries */}
          <div className="bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC] p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE4DC] flex items-center justify-center text-amber-700 shadow-xs">
                <Wine className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Transparent House Rules
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                State your corkage fees, celebration rules, and dress codes clearly so customers don&apos;t arrive with surprises at the door.
              </p>
            </div>

            <div className="bg-white rounded-xl p-3 border border-[#EAE4DC] space-y-2">
              <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-900">House Rules</span>
                <span className="text-[10px] text-slate-500 font-mono">Public Verified</span>
              </div>
              <div className="text-xs space-y-1 text-slate-700">
                <p>• Birthday Cakes: <strong className="text-slate-900">Allowed with ₦10k fee</strong></p>
                <p>• Dress Code: <strong className="text-slate-900">Smart Casual</strong></p>
                <p>• Valet: <strong className="text-slate-900">Dedicated lot</strong></p>
              </div>
            </div>
          </div>

          {/* Feature 3: Live Operational Updates */}
          <div className="bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC] p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE4DC] flex items-center justify-center text-indigo-700 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Special Hours &amp; Closures
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hosting a private buyout or adjusting kitchen hours for a holiday? Post temporary operational notices that alert planners immediately.
              </p>
            </div>

            <div className="bg-white rounded-xl p-3 border border-[#EAE4DC] space-y-2">
              <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-900">Operational Status</span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">Active</span>
              </div>
              <p className="text-xs text-slate-700 leading-snug">
                &ldquo;Private Event Buyout this Sunday from 2 PM to 7 PM. Regular dinner service resumes at 8 PM.&rdquo;
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
