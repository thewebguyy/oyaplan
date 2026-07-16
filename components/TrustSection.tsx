import { ShieldCheck, Car, Wallet } from "lucide-react";
import RevealOnScroll from "@/components/motion/RevealOnScroll";

export default function TrustSection() {
  return (
    <RevealOnScroll>
      <section className="w-full bg-white rounded-[32px] p-6 sm:p-10 shadow-[0px_24px_48px_-12px_rgba(1,5,40,0.07)]">
        <div className="flex flex-col text-center sm:text-left mb-10">
          <h2 className="type-heading text-midnight-lagoon text-xl sm:text-2xl">Why Trust OyaPlan</h2>
          <p className="type-body text-text-muted mt-2">
            We believe in budget confidence. No surprises, no hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 stagger-children">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="w-12 h-12 bg-lasgidi-yellow/10 rounded-full flex items-center justify-center mb-4 shadow-warm text-midnight-lagoon">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="type-ui-label font-bold text-midnight-lagoon mb-2">Verified Pricing</h3>
            <p className="type-body text-text-muted text-sm">
              We manually verify spot prices so your budget estimates are actually accurate.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="w-12 h-12 bg-atlantic-blue/8 rounded-full flex items-center justify-center mb-4 shadow-cool text-atlantic-blue">
              <Car className="w-5 h-5" />
            </div>
            <h3 className="type-ui-label font-bold text-midnight-lagoon mb-2">Transport Included</h3>
            <p className="type-body text-text-muted text-sm">
              Every plan calculates an estimated round-trip transport cost for your squad.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="w-12 h-12 bg-palm-green/10 rounded-full flex items-center justify-center mb-4 shadow-green text-palm-green">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="type-ui-label font-bold text-midnight-lagoon mb-2">No Hidden Fees</h3>
            <p className="type-body text-text-muted text-sm">
              Taxes, tips, and access fees are baked into the final estimate.
            </p>
          </div>
        </div>
      </section>
    </RevealOnScroll>
  );
}
