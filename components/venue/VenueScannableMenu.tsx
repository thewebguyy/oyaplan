"use client";

import React, { useState } from "react";
import { MenuItem, Venue } from "@/lib/types";
import { Utensils, ShieldCheck, Tag, Info } from "lucide-react";

interface VenueScannableMenuProps {
  venue: Venue;
  menuItems: MenuItem[];
}

type MenuCategoryFilter = "all" | "food" | "drinks" | "sides" | "activities";

export function VenueScannableMenu({ venue, menuItems = [] }: VenueScannableMenuProps) {
  const [activeCategory, setActiveCategory] = useState<MenuCategoryFilter>("all");

  const isPartnerVerified = venue.partner_state === "verified_partner";

  // Classify items
  const foodItems = menuItems.filter((i) => ["main", "starter", "dessert"].includes(i.category));
  const drinkItems = menuItems.filter((i) => ["cocktail", "wine", "beer", "spirits", "soft_drink"].includes(i.category));
  const sideItems = menuItems.filter((i) => i.category === "side");
  const activityItems = menuItems.filter((i) => i.category === "activity_fee");

  const filteredItems = menuItems.filter((item) => {
    if (activeCategory === "food") return foodItems.includes(item);
    if (activeCategory === "drinks") return drinkItems.includes(item);
    if (activeCategory === "sides") return sideItems.includes(item);
    if (activeCategory === "activities") return activityItems.includes(item);
    return true;
  });

  const categories: { id: MenuCategoryFilter; label: string; count: number }[] = [
    { id: "all", label: "All Items", count: menuItems.length },
    ...(foodItems.length > 0 ? [{ id: "food" as MenuCategoryFilter, label: "Food & Dining", count: foodItems.length }] : []),
    ...(drinkItems.length > 0 ? [{ id: "drinks" as MenuCategoryFilter, label: "Drinks & Cocktails", count: drinkItems.length }] : []),
    ...(sideItems.length > 0 ? [{ id: "sides" as MenuCategoryFilter, label: "Sides & Bites", count: sideItems.length }] : []),
    ...(activityItems.length > 0 ? [{ id: "activities" as MenuCategoryFilter, label: "Activities", count: activityItems.length }] : []),
  ];

  return (
    <section id="menu" className="scroll-mt-32">
      <div className="bg-white rounded-[28px] border border-[#EAE4DC] p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE4DC] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#008751]/10 text-[#008751] text-[10px] font-black uppercase tracking-wider mb-1">
              <Utensils className="w-3 h-3" />
              <span>Verified Menu &amp; Pricing</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-midnight-lagoon uppercase tracking-tight">
              What You Can Order
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Verified item prices for realistic outing cost calculation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isPartnerVerified && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EAFDF3] border border-[#A3F3C6] rounded-full text-xs font-bold text-[#0A7C3F]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Partner Verified</span>
              </span>
            )}
            <span className="text-xs font-bold text-text-muted">
              {menuItems.length} items listed
            </span>
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 tap-feedback cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-midnight-lagoon text-white shadow-xs"
                      : "bg-surface-grey border border-[#EAE4DC] text-text-secondary hover:text-midnight-lagoon"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="ml-1.5 opacity-70 text-[10px]">({cat.count})</span>
                </button>
              ))}
            </div>

            {/* Menu List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] flex items-center justify-between gap-3 hover:border-[#008751]/40 transition-colors"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-midnight-lagoon truncate">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-[11px] text-text-muted line-clamp-1">
                        {item.description}
                      </p>
                    )}
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-text-muted bg-white px-2 py-0.5 rounded border border-[#EAE4DC]">
                      {item.category.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black text-[#008751] tabular-nums">
                      ₦{item.price.toLocaleString("en-NG")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Limited Menu State */
          <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[#EAE4DC] flex items-center justify-center mx-auto text-text-muted">
              <Info className="w-5 h-5 text-[#008751]" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-midnight-lagoon">Menu indexing in progress</p>
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
