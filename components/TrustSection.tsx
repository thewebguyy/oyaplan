import RevealOnScroll from "@/components/motion/RevealOnScroll";

export default function TrustSection() {
  return (
    <RevealOnScroll>
      <section className="w-full bg-[#FAFAF8] border border-border-default/80 rounded-[32px] p-6 sm:p-10 shadow-[0px_24px_48px_-12px_rgba(1,5,40,0.03)]">
        <div className="flex flex-col text-center sm:text-left mb-10 border-b border-border-default/40 pb-6">
          <h2 className="type-heading text-midnight-lagoon text-xl sm:text-2xl uppercase tracking-tight font-black">Audit Ledger</h2>
          <p className="type-body text-text-muted mt-2 font-mono text-xs uppercase tracking-wider">
            Vetted pricing and transportation audits · Updated regularly
          </p>
        </div>

        <div className="flex flex-col divide-y divide-border-default/60 font-mono text-xs text-text-secondary">
          {/* Row 1: Verified Spot Pricing */}
          <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Custom two-tone block indicator */}
              <div className="w-10 h-10 rounded-lg bg-lasgidi-yellow/15 flex items-center justify-center shrink-0 border border-lasgidi-yellow/30">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" fill="#F6C642" fillOpacity="0.2"/>
                  <path d="M12 8V16M8 12H16" stroke="#B0860A" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="type-ui-label font-bold text-midnight-lagoon font-sans text-sm">Verified Spot Pricing</h3>
                <p className="type-body text-text-muted font-sans text-xs">Direct menu audits of food & drinks. No stale online estimates.</p>
              </div>
            </div>
            <div className="bg-white border border-border-default/60 rounded-xl px-4 py-2.5 md:text-right shrink-0">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Calculation System</span>
              <p className="font-semibold text-text-primary mt-0.5 text-[11px]">[Menu Price] + 10% [VAT & Service] = ₦ Vetted Price</p>
            </div>
          </div>

          {/* Row 2: Transport Coverage */}
          <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-atlantic-blue/10 flex items-center justify-center shrink-0 border border-atlantic-blue/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" fill="#2E75D3" fillOpacity="0.15"/>
                  <circle cx="12" cy="12" r="4" stroke="#255EB0" strokeWidth="2.5"/>
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="type-ui-label font-bold text-midnight-lagoon font-sans text-sm">Transport Coverage</h3>
                <p className="type-body text-text-muted font-sans text-xs">Calculates real-time squad transit rates based on zone mapping.</p>
              </div>
            </div>
            <div className="bg-white border border-border-default/60 rounded-xl px-4 py-2.5 md:text-right shrink-0">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Calculation System</span>
              <p className="font-semibold text-text-primary mt-0.5 text-[11px]">[Bolt Fare VI ⇋ Lekki] × 2 = ₦ Round-trip Fare</p>
            </div>
          </div>

          {/* Row 3: Total Transparency Buffer */}
          <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-palm-green/15 flex items-center justify-center shrink-0 border border-palm-green/30">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" fill="#008751" fillOpacity="0.2"/>
                  <path d="M7 12H17" stroke="#00663C" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="type-ui-label font-bold text-midnight-lagoon font-sans text-sm">No Hidden splits</h3>
                <p className="type-body text-text-muted font-sans text-xs">Total buffer fees are included directly to safeguard group budgets.</p>
              </div>
            </div>
            <div className="bg-white border border-border-default/60 rounded-xl px-4 py-2.5 md:text-right shrink-0">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Calculation System</span>
              <p className="font-semibold text-text-primary mt-0.5 text-[11px]">[Spot Spend] + [Ride Share] + [Buffer] = ₦ Expected Cost</p>
            </div>
          </div>
        </div>
      </section>
    </RevealOnScroll>
  );
}
