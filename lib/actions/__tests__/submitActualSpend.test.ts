import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
vi.mock("../../supabase", () => {
  const insertMock = vi.fn().mockResolvedValue({ error: null });
  const fromMock = vi.fn((table: string) => ({
    insert: insertMock,
  }));
  return {
    supabase: {
      from: fromMock,
    },
  };
});

import { submitActualSpend } from "../submitActualSpend";
import { supabase } from "../../supabase";

describe("submitActualSpend Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Scenario G: handles didGo = false without inserting ₦0 into actual_spend_reports", async () => {
    const result = await submitActualSpend({
      sharedPlanId: "11111111-1111-1111-1111-111111111111",
      spotId: "22222222-2222-2222-2222-222222222222",
      estimatedTotal: 50000,
      didGo: false,
      didNotGoReason: "plans_changed",
    });

    expect(result.success).toBe(true);
    expect(result.didGo).toBe(false);
    expect(supabase.from).not.toHaveBeenCalledWith("actual_spend_reports");
  });

  it("Scenario H: handles closure report when didGo = false by creating a venue_change_request", async () => {
    const result = await submitActualSpend({
      sharedPlanId: "11111111-1111-1111-1111-111111111111",
      spotId: "22222222-2222-2222-2222-222222222222",
      estimatedTotal: 50000,
      didGo: false,
      didNotGoReason: "venue_closed",
      operationalIssue: "closed",
    });

    expect(result.success).toBe(true);
    expect(result.didGo).toBe(false);
    expect(supabase.from).toHaveBeenCalledWith("venue_change_requests");
  });

  it("records actual spend and computes variance when user visited", async () => {
    const result = await submitActualSpend({
      sharedPlanId: "11111111-1111-1111-1111-111111111111",
      spotId: "22222222-2222-2222-2222-222222222222",
      estimatedTotal: 50000,
      actualTotal: 55000,
      didGo: true,
      pricesMatched: "yes",
    });

    expect(result.success).toBe(true);
    expect(result.didGo).toBe(true);
    expect(result.variance).toBeDefined();
    expect(result.variance?.varianceAmount).toBe(5000);
    expect(result.variance?.variancePercentage).toBe(10);
    expect(supabase.from).toHaveBeenCalledWith("actual_spend_reports");
  });

  it("Scenario I: flags price mismatch into venue_change_requests for ops review", async () => {
    const result = await submitActualSpend({
      sharedPlanId: "11111111-1111-1111-1111-111111111111",
      spotId: "22222222-2222-2222-2222-222222222222",
      estimatedTotal: 50000,
      actualTotal: 65000,
      didGo: true,
      pricesMatched: "no",
      notes: "Main dishes were ₦2k higher than listed",
    });

    expect(result.success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith("actual_spend_reports");
    expect(supabase.from).toHaveBeenCalledWith("venue_change_requests");
  });

  it("rejects invalid or negative spend amounts", async () => {
    const result = await submitActualSpend({
      sharedPlanId: "11111111-1111-1111-1111-111111111111",
      spotId: "22222222-2222-2222-2222-222222222222",
      estimatedTotal: 50000,
      actualTotal: -500,
      didGo: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("valid total spend");
  });
});
