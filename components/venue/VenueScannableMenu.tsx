"use client";

import React, { useState } from "react";
import { MenuItem, Venue } from "@/lib/types";
import { Utensils, ShieldCheck, Tag, Info, CheckCircle2 } from "lucide-react";
import { getVerificationText } from "@/lib/planning/presentation/decisionCardMapper";

interface VenueScannableMenuProps {
  venue: Venue;
  menuItems: MenuItem[];
}

type MenuCategoryFilter = "all" | "food" | "drinks" | "dessert" | "activities";

export function VenueScannableMenu({ venue, menuItems = [] }: VenueScannableMenuProps) {
  const [activeCategory, setActiveCategory] = useState<MenuCategoryFilter>("all");

  const isPartnerVerified = venue.partner_state === "verified_partner";
  const freshnessText = getVerificationText(venue.last_price_updated_at);

  // Classify items
  const foodItems = menuItems.filter((i) => ["main", "starter"].includes(i.category));
  const drinkItems = menuItems.filter((i) => ["cocktail", "wine", "beer", "spirits", "soft_drink"].includes(i.category));
  const dessertItems = menuItems.filter((i) => i.category === "dessert");
  const activityItems = menuItems.filter((i) => i.category === "activity_fee");

  const filteredItems = menuItems.filter((item) => {
    if (activeCategory === "food") return foodItems.includes(item);
    if (activeCategory === "drinks") return drinkItems.includes(item);
    if (activeCategory === "dessert") return dessertItems.includes(item);
    if (activeCategory === "activities") return activityItems.includes(item);
    return true;
  });

  const categories: { id: MenuCategoryFilter; label: string; count: number }[] = [
    { id: "all", label: "All Items", count: menuItems.length },
    ...(foodItems.length > 0 ? [{ id: "food" as MenuCategoryFilter, label: "Food & Dining", count: foodItems.length }] : []),
    ...(drinkItems.length > 0 ? [{ id: "drinks" as MenuCategoryFilter, label: "Drinks & Cocktails", count: drinkItems.length }] : []),
    ...(dessertItems.length > 0 ? [{ id: "dessert" as MenuCategoryFilter, label: "Desserts", count: dessertItems.length }] : []),
    ...(activityItems.length > 0 ? [{ id: "activities" as MenuCategoryFilter, label: "Activities", count: activityItems.length }] : []),
  ];

  return (
    <section id="menu" className="scroll-mt-32">
      <div className="bg-white rounded-[24px] border-3 border-[#111111] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#111111] space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#111111] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#F9E828] border border-[#111111] text-[10px] font-black uppercase tracking-wider text-[#111111]">
                <Utensils className="w-3 h-3" />
                <span>Verified Menu Peek</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#008751] bg-[#EAFDF3] border border-[#008751]/30 px-2 py-0.5 rounded">
                {freshnessText}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#111111] uppercase tracking-tight">
              What You Can Order
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              {menuItems.length > 0
                ? "Direct dining room prices with zero third-party markups."
                : "Standard spend benchmarks available while itemized menu indexing is verified."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isPartnerVerified && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EAFDF3] border-2 border-[#008751] rounded-full text-xs font-black text-[#008751]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Partner Verified</span>
              </span>
            )}
            <span className="text-xs font-black text-[#111111] bg-[#F6F6F2] border border-[#111111] px-2.5 py-1 rounded-lg">
              {menuItems.length > 0 ? `${menuItems.length} items listed` : "Benchmarked"}
            </span>
          </div>
        </div>

        {/* Zero-Markup Guarantee Banner */}
        <div className="p-3.5 rounded-xl bg-[#FAF7F2] border-2 border-[#111111] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#008751] shrink-0" />
            <p className="text-xs font-bold text-[#111111]">
              <strong>Zero-Markup Guarantee:</strong> These prices reflect physical in-venue menu audits. No inflated app delivery rates.
            </p>
          </div>
        </div>

        {/* Category Pills */}
        {menuItems.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 tap-feedback cursor-pointer border-2 border-[#111111] ${
                    activeCategory === cat.id
                      ? "bg-[#111111] text-[#F9E828] shadow-[2px_2px_0px_0px_#111111]"
                      : "bg-white text-[#111111] hover:bg-[#F9E828]"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="ml-1.5 opacity-80 text-[10px]">({cat.count})</span>
                </button>
              ))}
            </div>

            {/* Menu List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#FAF7F2] border-2 border-[#111111] flex items-center justify-between gap-3 hover:bg-white transition-colors shadow-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs sm:text-sm font-black text-[#111111] truncate">
                      {item.name}
                    </p>
                    <span className="inline-block text-[9px] font-black uppercase tracking-wider text-text-muted bg-white px-2 py-0.5 rounded border border-[#111111]">
                      {item.category.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black text-[#008751] font-mono tabular-nums">
                      ₦{item.price.toLocaleString("en-NG")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Limited Menu State */
          <div className="p-6 rounded-2xl bg-[#FAF7F2] border-2 border-[#111111] text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-[#111111] flex items-center justify-center mx-auto text-text-muted shadow-xs">
              <Info className="w-5 h-5 text-[#008751]" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-[#111111]">Menu indexing in progress</p>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                We are actively gathering verified itemized menu pricing for {venue.name}. You can still simulate budget scenarios based on typical spend ranges.
              </p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
