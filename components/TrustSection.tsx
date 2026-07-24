"use client";

import RevealOnScroll from "@/components/motion/RevealOnScroll";

export default function TrustSection() {
  return (
    <section className="trust-section">
      <h2 className="trust-headline">
        Here&apos;s exactly what you&apos;ll spend.
      </h2>
      
      <RevealOnScroll staggerChildren={true} className="trust-cards-container">
        {/* Card 1: Verified Menus */}
        <div className="trust-card card-verified">
          <div className="trust-icon" aria-hidden="true">✓</div>
          <h3>Verified Menus</h3>
          <p>We check actual menu prices. Zero markup.</p>
        </div>
        
        {/* Card 2: No Hidden Fees */}
        <div className="trust-card card-no-fees">
          <div className="trust-icon" aria-hidden="true">✓</div>
          <h3>No Hidden Fees</h3>
          <p>VAT &amp; service baked in. What you see is what you pay.</p>
        </div>
        
        {/* Card 3: Transport Included */}
        <div className="trust-card card-transport">
          <div className="trust-icon" aria-hidden="true">✓</div>
          <h3>Transport Included</h3>
          <p>Uber rates for your squad size. No surprises. Ever.</p>
        </div>
      </RevealOnScroll>
    </section>
  );
}
