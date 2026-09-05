"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  color: string;
}

const PRODUCT_COLORS = [
  "var(--pastel-cream)",
  "var(--pastel-yellow)",
  "var(--pastel-cream)",
  "var(--pastel-yellow)",
];

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "accuracy",
    question: "How accurate is the pricing?",
    answer: "We audit venue menus directly and estimate real-time ride-hailing corridors with zone modeling. Verified menu baseline + estimated transport corridor. Zero markup, zero hidden fees.",
    color: PRODUCT_COLORS[0],
  },
  {
    id: "modify",
    question: "Can I modify a saved plan?",
    answer: "Yes. You can change squad size, vibe, and budget anytime. Your saved plans update instantly. No need to start over.",
    color: PRODUCT_COLORS[1],
  },
  {
    id: "squad-size",
    question: "How many people can I plan for?",
    answer: "You can plan for 2–8+ people. The planner adjusts transport costs and venue recommendations based on group size.",
    color: PRODUCT_COLORS[2],
  },
  {
    id: "venue-closes",
    question: "What if a venue closes or changes prices?",
    answer: "We monitor venue status in real-time. If a spot closes or changes prices, we alert you and suggest alternatives in your budget.",
    color: PRODUCT_COLORS[3],
  },
  {
    id: "invite",
    question: "Can I invite friends to a saved plan?",
    answer: "Absolutely. Share your saved plan with friends via link. They can see the full breakdown and join in with one tap.",
    color: PRODUCT_COLORS[0],
  },
  {
    id: "free",
    question: "Is OyaPlan free?",
    answer: "Planning is completely free. We make money later when you make reservations or book transport. For now, transparency is free.",
    color: PRODUCT_COLORS[1],
  },
  {
    id: "coverage",
    question: "Which areas of Lagos do you cover?",
    answer: "We currently cover Ikeja, VI, Yaba, Lekki, Surulere, and Ikoyi. More areas coming soon. Check the Explore section to see what's available near you.",
    color: PRODUCT_COLORS[2],
  },
  {
    id: "promos",
    question: "Do you include ladies' nights and promo prices?",
    answer: "Yes. We include verified ladies' nights, promo prices, and happy hour rates. Pricing updates daily so you always get the best deals.",
    color: PRODUCT_COLORS[3],
  },
];

export default function FAQSection() {
  const [activeFaq, setActiveFaq] = useState<string>("accuracy");

  const handleFaqClick = (id: string) => {
    setActiveFaq((prev) => (prev === id ? "" : id));
  };

  return (
    <section className="faq-section" aria-labelledby="faq-title">
      <div className="faq-container">
        <div className="faq-header">
          <h2 id="faq-title">Frequently Asked.</h2>
          <p>Here are the answers.</p>
        </div>

        {/* ── DESKTOP VIEW (≥768px) ── */}
        <div className="hidden md:grid faq-content">
          {/* Left Column: Questions */}
          <div className="faq-questions" role="tablist" aria-label="Frequently Asked Questions">
            {FAQ_ITEMS.map((item) => {
              const isActive = activeFaq === item.id;
              return (
                <button
                  key={item.id}
                  role="tab"
                  id={`faq-tab-${item.id}`}
                  aria-selected={isActive}
                  aria-expanded={isActive}
                  aria-controls={`faq-answer-${item.id}`}
                  className={`faq-item ${isActive ? "active" : ""}`}
                  onClick={() => setActiveFaq(item.id)}
                >
                  <span className="faq-icon" aria-hidden="true">✓</span>
                  {item.question}
                </button>
              );
            })}
          </div>

          {/* Right Column: Answers */}
          <div className="faq-answers">
            {FAQ_ITEMS.map((item) => {
              const isActive = activeFaq === item.id;
              return (
                <div
                  key={item.id}
                  id={`faq-answer-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-tab-${item.id}`}
                  aria-live="polite"
                  className={`faq-answer ${isActive ? "active" : ""}`}
                  style={{ backgroundColor: item.color }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-brand-green font-bold text-lg" aria-hidden="true">✓</span>
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                      Verified Answer
                    </span>
                  </div>
                  <p className="text-text-secondary font-medium leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MOBILE VIEW (<768px) ── */}
        <div className="block md:hidden space-y-3">
          {FAQ_ITEMS.map((item) => {
            const isActive = activeFaq === item.id;
            return (
              <div
                key={item.id}
                className="border border-border-default rounded-xl overflow-hidden bg-white"
              >
                <button
                  onClick={() => handleFaqClick(item.id)}
                  aria-expanded={isActive}
                  aria-controls={`faq-mob-answer-${item.id}`}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-text-secondary bg-surface-grey hover:bg-black/5 active:bg-black/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-brand-green font-bold" aria-hidden="true">✓</span>
                    <span>{item.question}</span>
                  </div>
                  <span className="text-xs transition-transform duration-200 font-bold ml-2">
                    {isActive ? "−" : "+"}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      id={`faq-mob-answer-${item.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="p-4 border-t border-border-default" style={{ backgroundColor: item.color }}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-brand-green font-bold text-base" aria-hidden="true">✓</span>
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            Verified Answer
                          </span>
                        </div>
                        <p className="text-text-secondary text-sm font-medium leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
