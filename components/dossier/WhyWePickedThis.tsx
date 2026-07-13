import { SharedPlanRow } from "@/lib/types";
import { Check } from "lucide-react";

export function WhyWePickedThis({ plan }: { plan: SharedPlanRow }) {
  if (!plan) return null;

  return (
    <div className="w-full mt-8 border border-border-default bg-surface-grey rounded-[12px] p-6">
      <h3 className="type-subheading text-text-primary mb-4">Why we picked this</h3>
      <ul className="space-y-3">
        <li className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-brand-green" strokeWidth={3} />
          </div>
          <span className="type-body text-sm text-text-secondary">Fits your ₦{plan.budget?.toLocaleString()} budget</span>
        </li>
        <li className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-brand-green" strokeWidth={3} />
          </div>
          <span className="type-body text-sm text-text-secondary">Good for groups of {plan.squad_size}</span>
        </li>
        <li className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-brand-green" strokeWidth={3} />
          </div>
          <span className="type-body text-sm text-text-secondary">Matches your "{plan.vibe}" vibe</span>
        </li>
        <li className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-brand-green" strokeWidth={3} />
          </div>
          <span className="type-body text-sm text-text-secondary">Pricing verified recently</span>
        </li>
      </ul>
    </div>
  );
}
