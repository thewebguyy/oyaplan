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
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

describe("SquadService (OyaSquad Collaborative Decision Engine)", () => {
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

      // Mock 3 confirmed participants in DB
      mockFrom.mockReturnValue({
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
      });

      const res = await SquadService.getSquadRoomData("plan-123");
      expect(res.notFound).toBe(false);
      expect(res.data).toBeDefined();

      const data = res.data!;
      expect(data.confirmedCount).toBe(3);
      expect(data.liveEconomics.headcount).toBe(3);
      // Food spend = 15,000 * 3 = 45,000
      expect(data.liveEconomics.foodSpend).toBe(45000);
      // Transport for 3 people (1 car) between Ikeja and VI is roundtrip 13,000 (6500 * 2)
      expect(data.liveEconomics.vehiclesRequired).toBe(1);
      expect(data.liveEconomics.transportNote).toContain("1 ride-hailing vehicle");
      // Total = 45,000 + 13,000 = 58,000
      expect(data.liveEconomics.totalSpend).toBe(58000);
      // Per person = ceil(58,000 / 3) = 19,334
      expect(data.liveEconomics.perPersonSpend).toBe(19334);
    });

    it("scales vehicles required when squad headcount exceeds 4 people", async () => {
      vi.mocked(getSharedPlanWithSpot).mockResolvedValue({
        data: {
          id: "plan-456",
          start_area: "ikeja",
          squad_size: 6,
          budget: 150000,
          vibe: "Party",
          food_cost: 90000,
          transport_cost: 26000,
          total_cost: 116000,
          why_it_fits: "Party squad",
          spot: {
            id: "spot-456",
            name: "Zaza Lounge",
            category: "Lounge",
            address_slug: "victoria-island",
            price_per_person: 15000,
          },
        },
        notFound: false,
        error: null,
      });

      // Mock 6 confirmed participants
      const sixParticipants = Array.from({ length: 6 }).map((_, i) => ({
        id: `p-${i}`,
        plan_id: "plan-456",
        participant_token: `token-${i}`,
        display_name: `Member ${i + 1}`,
        status: "in",
        is_creator: i === 0,
        created_at: new Date().toISOString(),
      }));

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: sixParticipants,
              error: null,
            }),
          }),
        }),
      });

      const res = await SquadService.getSquadRoomData("plan-456");
      expect(res.data).toBeDefined();
      const data = res.data!;
      expect(data.confirmedCount).toBe(6);
      expect(data.liveEconomics.vehiclesRequired).toBe(2);
      expect(data.liveEconomics.transportNote).toContain("2 vehicles calculated for 6 people");
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
