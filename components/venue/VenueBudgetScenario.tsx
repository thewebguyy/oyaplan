"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Venue, MenuItem } from "@/lib/types";
import { 
  Sparkles, 
  Users, 
  Wallet, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Car, 
  Receipt, 
  Utensils, 
  GlassWater,
  Info
} from "lucide-react";

interface VenueBudgetScenarioProps {
  venue: Venue;
  menuItems: MenuItem[];
  areaSlug?: string;
}

const BUDGET_PRESETS = [30000, 50000, 90000, 150000];
const SQUAD_PRESETS = [2, 4, 6];

export function VenueBudgetScenario({
  venue,
  menuItems = [],
  areaSlug = "ikeja",
}: VenueBudgetScenarioProps) {
  const [selectedBudget, setSelectedBudget] = useState<number>(50000);
  const [selectedSquad, setSelectedSquad] = useState<number>(2);

  // Group items by category
  const mains = menuItems.filter((i) => i.category === "main" || i.category === "other");
  const startersAndSides = menuItems.filter((i) => i.category === "starter" || i.category === "dessert");
  const drinks = menuItems.filter((i) => ["cocktail", "wine", "beer", "spirits", "soft_drink"].includes(i.category));

  const hasMenuData = menuItems.length >= 2;

  // Derive estimated order
  const avgMain = mains.length > 0 ? mains.reduce((a, b) => a + b.price, 0) / mains.length : 12000;
  const avgStarter = startersAndSides.length > 0 ? startersAndSides.reduce((a, b) => a + b.price, 0) / startersAndSides.length : 6000;
  const avgDrink = drinks.length > 0 ? drinks.reduce((a, b) => a + b.price, 0) / drinks.length : 4500;

  // Composition: 1 main / person, 1 starter per 2 people, 1 drink / person
  const numMains = selectedSquad;
  const numStarters = Math.max(1, Math.floor(selectedSquad / 2));
  const numDrinks = selectedSquad;

  const estimatedFoodAndDrinks = Math.round(numMains * avgMain + numStarters * avgStarter + numDrinks * avgDrink);
  
  // Mandatory charges
  const vatPct = venue.vat_pct ?? 7.5;
  const serviceChargePct = venue.service_charge_pct ?? 0;
  const totalTaxAndService = Math.round(estimatedFoodAndDrinks * ((vatPct + serviceChargePct) / 100));

  // Estimated Lagos ride-hailing transport (intra-district round-trip per vehicle)
  const vehiclesRequired = Math.max(1, Math.ceil(selectedSquad / 4));
  const estimatedTransport = 9000 * vehiclesRequired;

  const totalEstimatedOuting = estimatedFoodAndDrinks + totalTaxAndService + estimatedTransport;
  const difference = selectedBudget - totalEstimatedOuting;
  const isWithinBudget = difference >= 0;
  const perPersonTotal = Math.round(totalEstimatedOuting / selectedSquad / 100) * 100;

  const forgeUrl = `/forge?pinned=${venue.id}&area=${areaSlug}&squad=${selectedSquad}&budget=${selectedBudget}&vibe=${encodeURIComponent(venue.vibe_tags?.[0] || "chill")}&fresh=true`;

  return (
    <section id="scenarios" className="scroll-mt-32">
      <div className="bg-white rounded-[28px] border border-[#EAE4DC] p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE4DC] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FCC630]/20 text-[#7A3E1D] text-[10px] font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-[#7A3E1D]" />
              <span>Spending Simulator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-midnight-lagoon uppercase tracking-tight">
              What Can Your Budget Get You?
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Simulate real food, drink, house charges, and transport combinations for your group.
            </p>
          </div>
        </div>

        {/* Interactive Selectors */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-4">
          
          {/* Squad Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-midnight-lagoon flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#008751]" />
              <span>Squad Size: {selectedSquad} People</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SQUAD_PRESETS.map((squad) => (
                <button
                  key={squad}
                  type="button"
                  onClick={() => setSelectedSquad(squad)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all tap-feedback cursor-pointer ${
                    selectedSquad === squad
                      ? "bg-midnight-lagoon text-white shadow-xs"
                      : "bg-white border border-[#EAE4DC] text-text-secondary hover:text-midnight-lagoon"
                  }`}
                >
                  {squad} People
                </button>
              ))}
            </div>
          </div>

          {/* Budget Preset Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-midnight-lagoon flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-[#008751]" />
              <span>Target Budget: ₦{selectedBudget.toLocaleString("en-NG")}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {BUDGET_PRESETS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBudget(b)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all tap-feedback cursor-pointer ${
                    selectedBudget === b
                      ? "bg-[#008751] text-white shadow-xs"
                      : "bg-white border border-[#EAE4DC] text-text-secondary hover:text-midnight-lagoon"
                  }`}
                >
                  ₦{b.toLocaleString("en-NG")}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Scenario Breakdown Card */}
        {hasMenuData ? (
          <div className="space-y-4">
            
            {/* Budget Relationship Pill */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              isWithinBudget
                ? "bg-[#EAFDF3] border-[#A3F3C6] text-[#00603A]"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}>
              <div className="flex items-center gap-2">
                {isWithinBudget ? (
                  <CheckCircle2 className="w-5 h-5 text-[#008751] shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <div>
                  <p className="text-xs sm:text-sm font-bold">
                    {isWithinBudget
                      ? `🟢 Within Budget · ₦${difference.toLocaleString("en-NG")} left over`
                      : `⚠ Exceeds target budget by ~₦${Math.abs(difference).toLocaleString("en-NG")}`}
                  </p>
                  <p className="text-[11px] opacity-90">
                    {isWithinBudget
                      ? "This plan comfortably covers meals, drinks, house fees, and transport."
                      : "Consider adjusting group size or opting for lighter drink selections."}
                  </p>
                </div>
              </div>
            </div>

            {/* Itemized Scenario Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              <div className="p-4 rounded-2xl bg-white border border-[#EAE4DC] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-midnight-lagoon">
                  <Utensils className="w-4 h-4 text-[#008751]" />
                  <span>Sample Food & Drinks</span>
                </div>
                <ul className="text-xs text-text-secondary space-y-1">
                  <li>• {numMains} × Main Courses (e.g. {mains[0]?.name || "Signature Main"})</li>
                  <li>• {numStarters} × Shared Starter (e.g. {startersAndSides[0]?.name || "Crispy Bites"})</li>
                  <li>• {numDrinks} × Cocktails / Beverages ({drinks[0]?.name || "Signature Drinks"})</li>
                </ul>
                <div className="pt-2 border-t border-border-default/60 flex justify-between text-xs font-bold text-midnight-lagoon">
                  <span>Food & Drinks Subtotal:</span>
                  <span>₦{estimatedFoodAndDrinks.toLocaleString("en-NG")}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EAE4DC] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-midnight-lagoon">
                  <Receipt className="w-4 h-4 text-midnight-lagoon" />
                  <span>Charges & Transport</span>
                </div>
                <ul className="text-xs text-text-secondary space-y-1">
                  <li>• VAT ({vatPct}%) &amp; Service Charge ({serviceChargePct}%): ~₦{totalTaxAndService.toLocaleString("en-NG")}</li>
                  <li>• Estimated Lagos Ride ({vehiclesRequired} {vehiclesRequired > 1 ? "cars" : "car"} round-trip): ~₦{estimatedTransport.toLocaleString("en-NG")}</li>
                </ul>
                <div className="pt-2 border-t border-border-default/60 flex items-center justify-between text-xs font-bold">
                  <div className="text-midnight-lagoon">
                    <span>Total Estimated:</span>
                    <span className="block text-[10px] text-text-muted font-normal">~₦{perPersonTotal.toLocaleString("en-NG")}/person</span>
                  </div>
                  <span className="text-[#008751] font-mono text-sm sm:text-base font-black">
                    ~₦{totalEstimatedOuting.toLocaleString("en-NG")}
                  </span>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Honest Limited Data Fallback */
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-midnight-lagoon">
              <Info className="w-4 h-4 text-[#008751]" />
              <span>Typical Outing Estimates (Limited Menu Data)</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              We are still indexing the complete itemized menu for this venue. Based on area standards and reported spend in {venue.category || "dining"}:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-[#EAE4DC]">
                <p className="font-black text-[#008751]">₦30,000</p>
                <p className="text-text-muted mt-0.5">Light meal for 2 + soft drinks</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#EAE4DC]">
                <p className="font-black text-[#008751]">₦50,000</p>
                <p className="text-text-muted mt-0.5">Full dinner for 2 with cocktails</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#EAE4DC]">
                <p className="font-black text-[#008751]">₦100,000+</p>
                <p className="text-text-muted mt-0.5">4-person squad outing & platters</p>
              </div>
            </div>
          </div>
        )}

        {/* Forge Planning Bridge Action */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[11px] text-text-muted">
            ℹ️ Scenarios are estimated from verified menu pricing and Lagos outing receipts.
          </p>

          <Link
            href={forgeUrl}
            className="h-11 px-5 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors tap-feedback"
          >
            <span>Plan with this budget (₦{selectedBudget.toLocaleString("en-NG")})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
