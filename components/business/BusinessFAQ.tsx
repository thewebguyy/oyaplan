"use client";

import React, { useState } from "react";
import { ChevronDown, MessageSquare } from "lucide-react";
import { getBusinessWhatsAppUrl } from "@/lib/config/businessWhatsApp";

export function BusinessFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "What exactly is OyaPlan for Business?",
      a: "OyaPlan for Business is the official portal for venue owners and managers in Lagos to control their public profile, menus, pricing, operating hours, and house policies across the OyaPlan consumer planning app.",
    },
    {
      q: "How does OyaPlan help my venue attract customers?",
      a: "Lagos consumers use OyaPlan before they leave home to calculate squad budgets and pick venues that match their vibe. When your prices, dress code, and corkage rules are clear, groups can confidently lock your spot into their outing itineraries.",
    },
    {
      q: "Does OyaPlan charge commissions on walk-ins or bills?",
      a: "No. OyaPlan does not take a percentage of your food and drink sales, POS settlement, or walk-in customer revenue. You maintain 100% of your earnings.",
    },
    {
      q: "Does OyaPlan replace my POS or table booking system?",
      a: "No. OyaPlan is an outing planning and decision engine, not an internal POS or table management software. We bridge consumer planning decisions to your physical venue.",
    },
    {
      q: "How do I claim my venue?",
      a: "Search for your venue in our claim directory. If your venue is already indexed, you can request ownership with basic verification. If it is not listed yet, you can add your venue in under 3 minutes.",
    },
    {
      q: "What if my menu or prices change frequently?",
      a: "You can update prices, seasonal specials, and signature dishes directly in your Business dashboard in real-time. Changes immediately update across all consumer budget calculations.",
    },
  ];

  const waUrl = getBusinessWhatsAppUrl("general_support");

  return (
    <section className="py-20 sm:py-28 bg-white border-t border-border-default" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#008751]">
            Act VI • Common Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-midnight-lagoon tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-text-secondary">
            Transparent answers about how OyaPlan works with Lagos hospitality operators.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className={`rounded-2xl border transition-all ${
                  isOpen
                    ? "border-[#008751]/40 bg-white shadow-sm ring-1 ring-[#008751]/10"
                    : "border-[#EAE4DC] bg-[#FAFAF8] hover:border-text-secondary"
                }`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-midnight-lagoon text-sm sm:text-base tap-feedback cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#008751]" : "text-text-secondary"
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-[#EAE4DC] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Concierge Link */}
        <div className="bg-[#FAF7F2] border border-[#EAE4DC] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-midnight-lagoon">Have a specific question for your venue?</h3>
            <p className="text-xs text-text-secondary">Our Lagos hospitality team responds directly on WhatsApp.</p>
          </div>
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-5 bg-white border border-[#EAE4DC] hover:border-midnight-lagoon text-midnight-lagoon text-xs font-bold rounded-xl flex items-center gap-2 transition-all shrink-0 shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-[#008751]" />
              <span>Chat on WhatsApp</span>
            </a>
          ) : (
            <span className="text-xs font-bold text-text-muted">Direct operator concierge available on dashboard</span>
          )}
        </div>

      </div>
    </section>
  );
}
