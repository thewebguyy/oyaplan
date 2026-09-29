"use client";

import React, { useState } from "react";
import { ChevronDown, MessageSquare } from "lucide-react";
import { getBusinessWhatsAppUrl } from "@/lib/config/businessWhatsApp";

export function BusinessFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is it free to list my business on OyaPlan?",
      a: "Yes. Listing your venue on OyaPlan is 100% free. There are no registration fees, monthly SaaS subscriptions, or paywalls just to be discoverable by Lagos outing planners.",
    },
    {
      q: "How does OyaPlan make money?",
      a: "OyaPlan earns a commission when a qualifying reservation or booked outing is generated through the platform. We monetize when we deliver real, qualified customer bookings to your business.",
    },
    {
      q: "Does OyaPlan hold customer deposits?",
      a: "No. Required reservation deposits and table fees are paid directly to your venue's account. OyaPlan never holds your money, acts as payment custodian, or runs an escrow wallet.",
    },
    {
      q: "Do I need to be fully verified to be listed?",
      a: "No. Hundreds of businesses are listed across Lagos with available public information. OyaPlan transparently distinguishes verified partner information from estimated or community-reported data so planners always know what is verified.",
    },
    {
      q: "Can customers reserve through OyaPlan?",
      a: "Where your business supports reservations, customers can submit structured reservation requests through OyaPlan detailing date, time, party size, and seating preference.",
    },
    {
      q: "Does OyaPlan guarantee a reservation?",
      a: "No. A reservation is only represented as confirmed after your venue directly reviews and confirms it. We never mislead customers into thinking a table is booked without your explicit acceptance.",
    },
    {
      q: "What happens if my prices change?",
      a: "You can update prices, seasonal dishes, and bottle minimums directly in your Business portal in seconds. Changes immediately update across all consumer budget estimates while preserving verification provenance.",
    },
    {
      q: "Does OyaPlan charge commissions on walk-ins or food bills?",
      a: "No. OyaPlan does not take a percentage of your food and drink sales, walk-in customer revenue, or POS settlement. Commission applies strictly to qualifying reservations made through OyaPlan.",
    },
  ];

  const waUrl = getBusinessWhatsAppUrl("general_support");

  return (
    <section className="py-20 sm:py-28 bg-white border-t border-border-default" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#008751]">
            Common Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-midnight-lagoon tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-text-secondary">
            Everything you need to know about listing your venue and taking reservations on OyaPlan.
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
