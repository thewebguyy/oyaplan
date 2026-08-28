import { describe, it, expect, vi } from "vitest";
import { QualityService } from "./qualityService";

// Mock Supabase Server Client
vi.mock("@/lib/supabase-server", () => ({
  createServerClient: vi.fn(),
}));

import { createServerClient } from "@/lib/supabase-server";

describe("QualityService - Trust Operations Risk Detection", () => {
  it("detects NO_PRICE_EVIDENCE (Critical) when venue has 0 approved evidence records", async () => {
    const mockSpots = [
      {
        id: "venue-1",
        name: "Test Unverified Restaurant",
        address_slug: "vi",
        price_per_person: 25000,
        price_source: "manual",
        verified_by: "seed",
        cover_url: "/images/venues/01_slow_lagos_hero.jpg",
        transport_matrix: { ikeja: 16000 },
        areas: { name: "Victoria Island", slug: "vi", active: true },
      },
    ];

    const mockEvidence: unknown[] = [];
    const mockSpendReports: unknown[] = [];

    (createServerClient as any).mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === "spots") {
          return {
            select: vi.fn().mockResolvedValue({ data: mockSpots, error: null }),
          };
        }
        if (table === "price_evidence") {
          return {
            select: vi.fn().mockResolvedValue({ data: mockEvidence, error: null }),
          };
        }
        if (table === "actual_spend_reports") {
          return {
            select: vi.fn().mockResolvedValue({ data: mockSpendReports, error: null }),
          };
        }
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
      }),
    });

    const issues = await QualityService.getChecklist();
    const criticalPriceIssue = issues.find((i) => i.venue_id === "venue-1" && i.issue_type === "NO_PRICE_EVIDENCE");

    expect(criticalPriceIssue).toBeDefined();
    expect(criticalPriceIssue?.severity).toBe("critical");
    expect(criticalPriceIssue?.action_label).toBe("Add Evidence");
    expect(criticalPriceIssue?.impact_description).toContain("25,000");
  });

  it("issue naturally disappears when approved price_evidence is attached to venue", async () => {
    const mockSpots = [
      {
        id: "venue-1",
        name: "Test Verified Restaurant",
        address_slug: "vi",
        price_per_person: 25000,
        price_source: "menu_photo",
        verified_by: "scout",
        cover_url: "/images/venues/01_slow_lagos_hero.jpg",
        transport_matrix: { ikeja: 16000 },
        areas: { name: "Victoria Island", slug: "vi", active: true },
      },
    ];

    // Approved evidence record present
    const mockEvidence = [
      {
        id: "evidence-1",
        venue_id: "venue-1",
        verification_status: "approved",
      },
    ];

    (createServerClient as any).mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === "spots") {
          return {
            select: vi.fn().mockResolvedValue({ data: mockSpots, error: null }),
          };
        }
        if (table === "price_evidence") {
          return {
            select: vi.fn().mockResolvedValue({ data: mockEvidence, error: null }),
          };
        }
        if (table === "actual_spend_reports") {
          return {
            select: vi.fn().mockResolvedValue({ data: [], error: null }),
          };
        }
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
      }),
    });

    const issues = await QualityService.getChecklist();
    const criticalPriceIssue = issues.find((i) => i.venue_id === "venue-1" && i.issue_type === "NO_PRICE_EVIDENCE");

    // The issue has disappeared!
    expect(criticalPriceIssue).toBeUndefined();
  });

  it("detects TRANSPORT_GAP (High) when transport matrix is missing", async () => {
    const mockSpots = [
      {
        id: "venue-2",
        name: "Venue Without Transport",
        address_slug: "yaba",
        price_per_person: 10000,
        verified_by: "owner_verified",
        cover_url: "/images/venues/02_rsvp_lagos_hero.jpg",
        transport_matrix: null, // missing matrix
        areas: { name: "Yaba", slug: "yaba", active: true },
      },
    ];

    (createServerClient as any).mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === "spots") {
          return {
            select: vi.fn().mockResolvedValue({ data: mockSpots, error: null }),
          };
        }
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
      }),
    });

    const issues = await QualityService.getChecklist();
    const transportIssue = issues.find((i) => i.venue_id === "venue-2" && i.issue_type === "TRANSPORT_GAP");

    expect(transportIssue).toBeDefined();
    expect(transportIssue?.severity).toBe("high");
    expect(transportIssue?.action_label).toBe("Fix Transport");
  });

  it("detects ACTUAL_SPEND_MISMATCH when reports differ by > 20% from estimate", async () => {
    const mockSpots = [
      {
        id: "venue-3",
        name: "Venue With Spend Discrepancy",
        address_slug: "ikeja",
        price_per_person: 15000,
        verified_by: "owner_verified",
        cover_url: "/images/venues/03_noir_lagos_hero.jpg",
        transport_matrix: { yaba: 8000 },
        areas: { name: "Ikeja", slug: "ikeja", active: true },
      },
    ];

    const mockSpendReports = [
      {
        id: "spend-1",
        spot_id: "venue-3",
        estimated_total: 20000,
        actual_total: 30000, // 50% discrepancy
      },
    ];

    (createServerClient as any).mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === "spots") {
          return {
            select: vi.fn().mockResolvedValue({ data: mockSpots, error: null }),
          };
        }
        if (table === "actual_spend_reports") {
          return {
            select: vi.fn().mockResolvedValue({ data: mockSpendReports, error: null }),
          };
        }
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
      }),
    });

    const issues = await QualityService.getChecklist();
    const spendIssue = issues.find((i) => i.venue_id === "venue-3" && i.issue_type === "ACTUAL_SPEND_MISMATCH");

    expect(spendIssue).toBeDefined();
    expect(spendIssue?.severity).toBe("high");
    expect(spendIssue?.impact_description).toContain("50%");
    expect(spendIssue?.action_label).toBe("Investigate");
  });
});
