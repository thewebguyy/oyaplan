"use client";

import { useState, useRef } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "accuracy",
    question: "How accurate is the pricing?",
    answer: "We verify every menu and check real Bolt fares daily. Pricing is exact to the naira. No markup, no hidden fees. What you see is what you'll pay.",
  },
  {
    id: "modify",
    question: "Can I modify a saved plan?",
    answer: "Yes. You can change squad size, vibe, and budget anytime. Your saved plans update instantly. No need to start over.",
  },
  {
    id: "squad-size",
    question: "How many people can I plan for?",
    answer: "You can plan for 2–8+ people. The planner adjusts transport costs and venue recommendations based on group size.",
  },
  {
    id: "venue-closes",
    question: "What if a venue closes or changes prices?",
    answer: "We monitor venue status in real-time. If a spot closes or changes prices, we alert you and suggest alternatives in your budget.",
  },
  {
    id: "invite",
    question: "Can I invite friends to a saved plan?",
    answer: "Absolutely. Share your saved plan with friends via link. They can see the full breakdown and join in with one tap.",
  },
  {
    id: "free",
    question: "Is OyaPlan free?",
    answer: "Planning is completely free. We make money later when you make reservations or book transport. For now, transparency is free.",
  },
  {
    id: "coverage",
    question: "Which areas of Lagos do you cover?",
    answer: "We currently cover Ikeja, VI, Yaba, Lekki, Surulere, and Ikoyi. More areas coming soon. Check the Explore section to see what's available near you.",
  },
  {
    id: "promos",
    question: "Do you include ladies' nights and promo prices?",
    answer: "Yes. We include verified ladies' nights, promo prices, and happy hour rates. Pricing updates daily so you always get the best deals.",
  },
];

export default function FAQSection() {
  const [activeFaq, setActiveFaq] = useState<string>("accuracy");
  const answersRef = useRef<HTMLDivElement>(null);

  const handleFaqClick = (id: string) => {
    setActiveFaq(id);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setTimeout(() => {
        answersRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  };

  return (
    <section className="faq-section" aria-labelledby="faq-title">
      <div className="faq-container">
        <div className="faq-header">
          <h2 id="faq-title">Frequently Asked.</h2>
          <p>Here are the answers.</p>
        </div>

        <div className="faq-content">
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
                  onClick={() => handleFaqClick(item.id)}
                >
                  <span className="faq-icon" aria-hidden="true">✓</span>
                  {item.question}
                </button>
              );
            })}
          </div>

          {/* Right Column: Answers */}
          <div className="faq-answers" ref={answersRef}>
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
                >
                  {/* Verified icon at the top of active answer card with AA contrast checked green */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[#10B981] font-bold text-lg" aria-hidden="true">✓</span>
                    <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                      Verified Answer
                    </span>
                  </div>
                  <p className="text-[#1A1A1A] font-medium leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
