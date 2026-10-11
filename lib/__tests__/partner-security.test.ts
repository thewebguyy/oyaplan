import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkVenueAuthorization, getPartnerVenuesForUser } from '@/lib/queries/partner';
import { getSpendSummaryForSpot } from '@/lib/queries/actualSpend';

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase-server', () => ({
  createServerClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

describe('Partner & Spend Queries — Server Context & Authorization Hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkVenueAuthorization', () => {
    it('authorizes admin users via admin_users table check', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'admin@oyaplan.ng' } },
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'admin_users') {
          return {
            select: vi.fn().mockReturnThis(),
            ilike: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'admin-1' } }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null }),
        };
      });

      const res = await checkVenueAuthorization('venue-1', 'admin-1');
      expect(res.authorized).toBe(true);
      expect(res.isAdmin).toBe(true);
      expect(res.role).toBe('admin');
    });

    it('authorizes manager/owner via venue_roles table check', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-mgr', email: 'manager@spot.ng' } },
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'admin_users') {
          return {
            select: vi.fn().mockReturnThis(),
            ilike: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null }),
          };
        }
        if (table === 'venue_roles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockImplementation((col: string, val: string) => {
              return {
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'manager' } }),
              };
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null }),
        };
      });

      const res = await checkVenueAuthorization('venue-1', 'user-mgr');
      expect(res.authorized).toBe(true);
      expect(res.role).toBe('manager');
    });

    it('authorizes direct owner via venues claimed_by column', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'owner-1', email: 'owner@spot.ng' } },
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'admin_users') {
          return {
            select: vi.fn().mockReturnThis(),
            ilike: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null }),
          };
        }
        if (table === 'venue_roles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockImplementation(() => ({
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({ data: null }),
            })),
          };
        }
        if (table === 'venues') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: { claimed_by: 'owner-1' } }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null }),
        };
      });

      const res = await checkVenueAuthorization('venue-1', 'owner-1');
      expect(res.authorized).toBe(true);
      expect(res.role).toBe('owner');
    });

    it('rejects unauthorized users with no matching role or ownership', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'stranger-1', email: 'stranger@example.com' } },
      });

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      }));

      const res = await checkVenueAuthorization('venue-1', 'stranger-1');
      expect(res.authorized).toBe(false);
      expect(res.role).toBeUndefined();
    });
  });

  describe('getPartnerVenuesForUser', () => {
    it('returns venues from venue_roles with correct roles', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'venue_roles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: [
                {
                  venue_id: 'v-1',
                  role: 'manager',
                  venues: { id: 'v-1', name: 'Lagos Spot' },
                },
              ],
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      });

      const list = await getPartnerVenuesForUser('user-1');
      expect(list).toHaveLength(1);
      expect(list[0].venue.name).toBe('Lagos Spot');
      expect(list[0].role).toBe('manager');
    });

    it('falls back to claimed_by when venue_roles has no rows', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'venue_roles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          };
        }
        if (table === 'venues') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: [{ id: 'v-2', name: 'Claimed Spot' }],
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      });

      const list = await getPartnerVenuesForUser('owner-2');
      expect(list).toHaveLength(1);
      expect(list[0].venue.name).toBe('Claimed Spot');
      expect(list[0].role).toBe('owner');
    });
  });

  describe('getSpendSummaryForSpot', () => {
    it('returns null when fewer than 5 actual spend reports exist', async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [
            { actual_total: 25000, estimated_total: 20000, submitted_at: '2026-10-01' },
            { actual_total: 30000, estimated_total: 28000, submitted_at: '2026-10-02' },
          ],
          error: null,
        }),
      }));

      const summary = await getSpendSummaryForSpot('spot-1');
      expect(summary).toBeNull();
    });

    it('calculates median and variance when 5 or more reports exist', async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [
            { actual_total: 20000, estimated_total: 20000, submitted_at: '2026-10-01' },
            { actual_total: 22000, estimated_total: 20000, submitted_at: '2026-10-02' },
            { actual_total: 24000, estimated_total: 20000, submitted_at: '2026-10-03' },
            { actual_total: 25000, estimated_total: 20000, submitted_at: '2026-10-04' },
            { actual_total: 28000, estimated_total: 20000, submitted_at: '2026-10-05' },
          ],
          error: null,
        }),
      }));

      const summary = await getSpendSummaryForSpot('spot-1');
      expect(summary).not.toBeNull();
      expect(summary?.count).toBe(5);
      expect(summary?.medianActual).toBe(24000);
      expect(summary?.medianEstimated).toBe(20000);
      expect(summary?.variancePct).toBe(20);
    });
  });
});
