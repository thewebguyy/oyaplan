"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";

const BUDGET_OPTIONS = [
  { label: "Under ₦20k", value: "20000" },
  { label: "₦20–40k", value: "40000" },
  { label: "₦40–80k", value: "80000" },
  { label: "₦80k+", value: "150000" },
];

const OCCASION_OPTIONS = [
  { label: "Date", value: "Date" },
  { label: "Friends", value: "Friends" },
  { label: "Solo", value: "Solo" },
  { label: "Family", value: "Family" },
  { label: "Celebration", value: "Celebration" },
  { label: "Coffee", value: "Coffee" },
];

export default function GuidedDiscoveryClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentBudget = searchParams.get("budget");
  const currentOccasion = searchParams.get("vibe");

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get(key) === value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`/explore?${params.toString()}`);
    },
    [searchParams, router]
  );

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <h2 className="type-subheading text-text-primary">What are you comfortable spending?</h2>
        <div className="flex flex-wrap gap-3">
          {BUDGET_OPTIONS.map((opt) => {
            const isSelected = currentBudget === opt.value;
            return (
              <Button
                key={opt.value}
                onClick={() => updateParams("budget", opt.value)}
                className={`rounded-full type-label h-[48px] px-6 tap-feedback border transition-all duration-200 ${
                  isSelected
                    ? "bg-text-primary text-white border-text-primary"
                    : "bg-white text-text-primary border-border-default hover:border-text-secondary"
                }`}
                variant="outline"
              >
                {opt.label}
              </Button>
            );
          })}
        </div>
      </div>

      {currentBudget && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="type-subheading text-text-primary">Perfect. What feels right today?</h2>
          <div className="flex flex-wrap gap-3">
            {OCCASION_OPTIONS.map((opt) => {
              const isSelected = currentOccasion === opt.value;
              return (
                <Button
                  key={opt.value}
                  onClick={() => updateParams("vibe", opt.value)}
                  className={`rounded-full type-label h-[48px] px-6 tap-feedback border transition-all duration-200 ${
                    isSelected
                      ? "bg-text-primary text-white border-text-primary"
                      : "bg-white text-text-primary border-border-default hover:border-text-secondary"
                  }`}
                  variant="outline"
                >
                  {opt.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
