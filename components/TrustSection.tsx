import { ShieldCheck, Car, Wallet } from "lucide-react";

export default function TrustSection() {
  return (
    <section className="w-full bg-surface-grey border border-border-default rounded-[24px] p-6 sm:p-8">
      <div className="flex flex-col text-center sm:text-left mb-8">
        <h2 className="type-heading text-xl sm:text-2xl">Why Trust OyaPlan</h2>
        <p className="type-body text-text-muted mt-2">
          We believe in budget confidence. No surprises, no hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-brand-green">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="type-ui-label font-bold text-text-primary mb-2">Verified Pricing</h3>
          <p className="type-body text-text-muted text-sm">
            We manually verify spot prices so your budget estimates are actually accurate.
          </p>
        </div>

        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-brand-green">
            <Car className="w-6 h-6" />
          </div>
          <h3 className="type-ui-label font-bold text-text-primary mb-2">Transport Included</h3>
          <p className="type-body text-text-muted text-sm">
            Every plan calculates an estimated round-trip transport cost for your squad.
          </p>
        </div>

        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-brand-green">
            <Wallet className="w-6 h-6" />
          </div>
          <h3 className="type-ui-label font-bold text-text-primary mb-2">No Hidden Fees</h3>
          <p className="type-body text-text-muted text-sm">
            Taxes, tips, and access fees are baked into the final estimate.
          </p>
        </div>
      </div>
    </section>
  );
}
