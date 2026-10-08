import { describe, it, expect, vi, beforeEach } from "vitest";
import { SquadService } from "./squadService";
import { getSharedPlanWithSpot } from "@/lib/queries/plans";
import { SessionResolver } from "./identity/sessionResolver";

// Mock dependencies
vi.mock("@/lib/queries/plans", () => ({
  getSharedPlanWithSpot: vi.fn(),
}));

vi.mock("./identity/sessionResolver", () => ({
  SessionResolver: {
    resolveIdentity: vi.fn(),
  },
}));

vi.mock("@/lib/sentry", () => ({
  captureServerException: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((key: string) => (key === "oya_participant_token" ? { value: "test-token-123" } : undefined)),
    set: vi.fn(),
    getAll: vi.fn(() => []),
  })),
}));

const mockFrom = vi.fn();
const mockRpc = vi.fn();
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    from: mockFrom,
    rpc: mockRpc,
  })),
}));


describe("SquadService (OyaSquad Collaborative Decision Engine & Tier 1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SessionResolver.resolveIdentity).mockResolvedValue({
      type: "anonymous",
      sessionId: "anon-session-123",
      profile: null,
    });
  });

  describe("getSquadRoomData", () => {
    it("returns notFound: true when plan does not exist", async () => {
      vi.mocked(getSharedPlanWithSpot).mockResolvedValue({
        data: null,
        notFound: true,
        error: null,
      });

      const res = await SquadService.getSquadRoomData("non-existent-plan");
      expect(res.notFound).toBe(true);
      expect(res.data).toBeNull();
    });

    it("recalculates live per-person spend accurately for confirmed headcount", async () => {
      vi.mocked(getSharedPlanWithSpot).mockResolvedValue({
        data: {
          id: "plan-123",
          start_area: "ikeja",
          squad_size: 4,
          budget: 80000,
          vibe: "Dinner",
          food_cost: 60000,
          transport_cost: 12000,
          total_cost: 72000,
          why_it_fits: "Great vibe in VI",
          spot: {
            id: "spot-123",
            name: "The House Lagos",
            category: "Dining",
            address_slug: "victoria-island",
            price_per_person: 15000,
          },
        },
        notFound: false,
        error: null,
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === "plan_squad_participants") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [
                    { id: "p1", plan_id: "plan-123", participant_token: "token-1", display_name: "Bode", status: "in", is_creator: true, created_at: "2026-09-26T20:00:00Z" },
                    { id: "p2", plan_id: "plan-123", participant_token: "token-2", display_name: "Tobi", status: "in", is_creator: false, created_at: "2026-09-26T20:05:00Z" },
                    { id: "p3", plan_id: "plan-123", participant_token: "token-3", display_name: "Amaka", status: "in", is_creator: false, created_at: "2026-09-26T20:10:00Z" },
                  ],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "plan_settlements") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: "settle-1",
                    plan_id: "plan-123",
                    bank_name: "GTBank",
                    account_number: "0123456789",
                    account_name: "Bode Olusegun",
                    note: null,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "squad_options") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "squad_option_votes") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          };
        }
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [] }) }) };
      });

      const res = await SquadService.getSquadRoomData("plan-123");
      expect(res.notFound).toBe(false);
      expect(res.data).toBeDefined();

      const data = res.data!;
      expect(data.confirmedCount).toBe(3);
      expect(data.liveEconomics.headcount).toBe(3);
      // Food spend = 15,000 * 3 = 45,000
      expect(data.liveEconomics.foodSpend).toBe(45000);
      expect(data.liveEconomics.vehiclesRequired).toBe(1);
      expect(data.liveEconomics.transportNote).toContain("1 ride-hailing vehicle");
      // Total = 45,000 (food) + 10,000 (canonical temporary Island transport) = 55,000. 55000 / 3 = 18333.33 -> Math.ceil = 18334
      expect(data.liveEconomics.totalSpend).toBe(55000);
      expect(data.liveEconomics.perPersonSpend).toBe(18334);
      // Settlement info present
      expect(data.settlement?.account_name).toBe("Bode Olusegun");
    });
  });

  describe("Tier 1: Non-Custodial Bank Settlement", () => {
    it("validates NUBAN account number length before saving", async () => {
      const res = await SquadService.saveSettlementDetails("plan-123", {
        bankName: "GTBank",
        accountNumber: "123", // Too short
        accountName: "Bode",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("Please enter valid bank details");
    });

    it("saves valid host bank details and returns success", async () => {
      const mockSettlement = {
        id: "settle-123",
        plan_id: "plan-123",
        bank_name: "Guaranty Trust Bank (GTBank)",
        account_number: "0123456789",
        account_name: "Bode Olusegun",
        note: "Send before 11pm",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRpc.mockResolvedValue({
        data: { success: true },
        error: null,
      });


      const res = await SquadService.saveSettlementDetails("plan-123", {
        bankName: "Guaranty Trust Bank (GTBank)",
        accountNumber: "0123456789",
        accountName: "Bode Olusegun",
        note: "Send before 11pm",
      });

      expect(res.success).toBe(true);
      expect(res.data?.account_number).toBe("0123456789");
    });
  });

  describe("Tier 1: Multi-Option Showdown Voting", () => {
    it("records a 1-tap blind vote for a squad option", async () => {
      mockFrom.mockReturnValue({
        upsert: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      const res = await SquadService.voteSquadOption("plan-123", "option-abc");
      expect(res.success).toBe(true);
    });
  });

  describe("joinSquad", () => {
    it("rejects empty guest display names", async () => {
      const res = await SquadService.joinSquad("plan-123", "   ");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Please enter your name");
    });

    it("upserts valid participant name and returns success", async () => {
      const mockUpsertResult = {
        id: "p-new",
        plan_id: "plan-123",
        participant_token: "test-token-123",
        display_name: "Bode",
        status: "in",
        is_creator: false,
        created_at: new Date().toISOString(),
      };

      mockFrom.mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUpsertResult,
              error: null,
            }),
          }),
        }),
      });

      const res = await SquadService.joinSquad("plan-123", "Bode");
      expect(res.success).toBe(true);
      expect(res.data?.display_name).toBe("Bode");
    });
  });
});
