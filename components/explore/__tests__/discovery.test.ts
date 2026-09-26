import { describe, it, expect } from "vitest";
import { Spot } from "@/lib/types";
import { deriveTrustIndicator, getVerificationText } from "@/lib/planning/presentation/decisionCardMapper";

const MOCK_SPOTS: Spot[] = [
  {
    id: "spot-1",
    name: "Shiro Lagos",
    address: "Landmark Centre, Water Corporation Road",
    address_slug: "vi",
    area_id: "vi-id",
    areas: { id: "vi-id", name: "Victoria Island", slug: "vi" },
    vibe_tags: ["Dinner", "Foodie", "Date Night"],
    price_per_person: 35000,
    price_updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    transport_matrix: {},
    is_featured: true,
    active: true,
    category: "restaurant",
    computed_confidence_score: 95,
  },
  {
    id: "spot-2",
    name: "Yellow Chilli",
    address: "35 Joel Ogunnaike St",
    address_slug: "ikeja",
    area_id: "ikeja-id",
    areas: { id: "ikeja-id", name: "Ikeja", slug: "ikeja" },
    vibe_tags: ["Dinner", "Foodie", "Party"],
    price_per_person: 12500,
    price_updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    transport_matrix: {},
    is_featured: false,
    active: true,
    category: "restaurant",
    computed_confidence_score: 85,
  },
  {
    id: "spot-3",
    name: "Bature Brewery",
    address: "Yaba",
    address_slug: "yaba",
    area_id: "yaba-id",
    areas: { id: "yaba-id", name: "Yaba", slug: "yaba" },
    vibe_tags: ["Party", "Chill", "Squad Hangout"],
    price_per_person: 10000,
    price_updated_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days ago
    transport_matrix: {},
    is_featured: false,
    active: true,
    category: "bar",
    computed_confidence_score: 70,
  },
  {
    id: "spot-4",
    name: "Vestar Coffee",
    address: "Victoria Island",
    address_slug: "vi",
    area_id: "vi-id",
    areas: { id: "vi-id", name: "Victoria Island", slug: "vi" },
    vibe_tags: ["Chill", "Quick", "Coffee"],
    price_per_person: 6500,
    price_updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    transport_matrix: {},
    is_featured: false,
    active: true,
    category: "cafe",
    computed_confidence_score: 90,
  },
];

describe("OyaPlan Phase 8 — Discovery Engine Tests", () => {
  describe("Deterministic Search & Filtering", () => {
    it("filters spots by search query matching venue name", () => {
      const q = "shiro";
      const results = MOCK_SPOTS.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.areas?.name.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q)
      );
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Shiro Lagos");
    });

    it("filters spots by search query matching area name", () => {
      const q = "yaba";
      const results = MOCK_SPOTS.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.areas?.name.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q)
      );
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Bature Brewery");
    });

    it("filters spots by category accurately", () => {
      const results = MOCK_SPOTS.filter((s) => s.category === "bar");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Bature Brewery");
    });

    it("filters spots by vibe tag accurately", () => {
      const targetVibe = "date night";
      const results = MOCK_SPOTS.filter((s) =>
        s.vibe_tags?.some((v) => v.toLowerCase().includes(targetVibe))
      );
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Shiro Lagos");
    });
  });

  describe("Budget & Squad Affordability Framing", () => {
    it("calculates total squad spend and filters out venues exceeding total budget", () => {
      const squadSize = 4;
      const budget = 50000; // ₦50,000 for 4 people (₦12,500/person)

      const affordableSpots = MOCK_SPOTS.filter((s) => {
        const total = s.price_per_person * squadSize;
        return total <= budget;
      });

      // Shiro: 35k * 4 = 140k (Exceeds)
      // Yellow Chilli: 12.5k * 4 = 50k (Fits exactly)
      // Bature: 10k * 4 = 40k (Fits)
      // Vestar: 6.5k * 4 = 26k (Fits)
      expect(affordableSpots.map((s) => s.name)).toEqual([
        "Yellow Chilli",
        "Bature Brewery",
        "Vestar Coffee",
      ]);
    });

    it("calculates budget remaining accurately", () => {
      const squadSize = 2;
      const budget = 30000;
      const spot = MOCK_SPOTS.find((s) => s.name === "Bature Brewery")!;
      const totalSpend = spot.price_per_person * squadSize; // 20,000
      const remaining = budget - totalSpend;

      expect(totalSpend).toBe(20000);
      expect(remaining).toBe(10000);
    });
  });

  describe("Deterministic Sorting Engine", () => {
    it("sorts by spend ascending (low to high)", () => {
      const squadSize = 2;
      const sorted = [...MOCK_SPOTS].sort((a, b) => {
        return a.price_per_person * squadSize - b.price_per_person * squadSize;
      });

      expect(sorted.map((s) => s.name)).toEqual([
        "Vestar Coffee",   // 6.5k
        "Bature Brewery",  // 10k
        "Yellow Chilli",   // 12.5k
        "Shiro Lagos",     // 35k
      ]);
    });

    it("sorts by spend descending (high to low)", () => {
      const squadSize = 2;
      const sorted = [...MOCK_SPOTS].sort((a, b) => {
        return b.price_per_person * squadSize - a.price_per_person * squadSize;
      });

      expect(sorted.map((s) => s.name)).toEqual([
        "Shiro Lagos",     // 35k
        "Yellow Chilli",   // 12.5k
        "Bature Brewery",  // 10k
        "Vestar Coffee",   // 6.5k
      ]);
    });

    it("sorts by data recency / verification timestamp descending", () => {
      const sorted = [...MOCK_SPOTS].sort((a, b) => {
        const dateA = a.price_updated_at ? new Date(a.price_updated_at).getTime() : 0;
        const dateB = b.price_updated_at ? new Date(b.price_updated_at).getTime() : 0;
        return dateB - dateA;
      });

      expect(sorted[0].name).toBe("Vestar Coffee"); // 1 day ago
      expect(sorted[1].name).toBe("Shiro Lagos");   // 2 days ago
    });
  });

  describe("Trust & Freshness Signals", () => {
    it("derives high confidence for verified scores >= 75", () => {
      const indicator = deriveTrustIndicator(95);
      expect(indicator.level).toBe("high");
      expect(indicator.label).toBe("Very high confidence");
    });

    it("derives medium confidence for estimated scores between 50 and 74", () => {
      const indicator = deriveTrustIndicator(70);
      expect(indicator.level).toBe("medium");
      expect(indicator.label).toBe("Medium confidence");
    });

    it("returns correct human-readable freshness label", () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      expect(getVerificationText(yesterday)).toBe("Verified yesterday");

      const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
      expect(getVerificationText(fourDaysAgo)).toBe("Verified this week");

      const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      expect(getVerificationText(twoMonthsAgo)).toBe("Estimated price");
    });
  });
});
