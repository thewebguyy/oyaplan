import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroupService, MAX_GROUPS_PER_USER, MAX_MEMBERS_PER_GROUP } from './groupService';
import { SessionResolver } from './sessionResolver';

// Mock SessionResolver
vi.mock('./sessionResolver', () => ({
  SessionResolver: {
    resolveIdentity: vi.fn(),
  },
}));

// Mock Sentry
vi.mock('../../sentry', () => ({
  captureServerException: vi.fn(),
}));

// Mock Supabase Server Client
const mockFrom = vi.fn();
vi.mock('../../supabase-server', () => ({
  createServerClient: vi.fn(() => Promise.resolve({
    from: mockFrom,
  })),
}));

describe('GroupService (OyaSquad Domain Service)', () => {
  const mockUser = {
    id: 'user-123-abc',
    role: 'planner',
    email: 'user@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createGroup', () => {
    it('rejects unauthenticated user', async () => {
      (SessionResolver.resolveIdentity as any).mockResolvedValue({
        type: 'anonymous',
        sessionId: 'anon-123',
        profile: null,
      });

      const res = await GroupService.createGroup('Friday Night Squad');
      expect(res.success).toBe(false);
      expect(res.error).toBe('unauthorized');
    });

    it('rejects empty or whitespace-only group name', async () => {
      (SessionResolver.resolveIdentity as any).mockResolvedValue({
        type: 'authenticated',
        sessionId: 'session-123',
        profile: mockUser,
      });

      const res = await GroupService.createGroup('   ');
      expect(res.success).toBe(false);
      expect(res.error).toBe('invalid_name');
    });

    it('rejects group name exceeding 60 characters', async () => {
      (SessionResolver.resolveIdentity as any).mockResolvedValue({
        type: 'authenticated',
        sessionId: 'session-123',
        profile: mockUser,
      });

      const longName = 'A'.repeat(61);
      const res = await GroupService.createGroup(longName);
      expect(res.success).toBe(false);
      expect(res.error).toBe('invalid_name');
    });

    it('enforces maximum 10 OyaSquads per user limit', async () => {
      (SessionResolver.resolveIdentity as any).mockResolvedValue({
        type: 'authenticated',
        sessionId: 'session-123',
        profile: mockUser,
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({ count: MAX_GROUPS_PER_USER, error: null }),
        }),
      });

      const res = await GroupService.createGroup('Eleventh Squad');
      expect(res.success).toBe(false);
      expect(res.error).toBe('group_limit_reached');
    });

    it('successfully creates an OyaSquad and inserts initial members', async () => {
      (SessionResolver.resolveIdentity as any).mockResolvedValue({
        type: 'authenticated',
        sessionId: 'session-123',
        profile: mockUser,
      });

      const mockCreatedGroup = {
        id: 'group-uuid-1',
        owner_id: mockUser.id,
        name: 'Friday Foodies',
        emoji: '🍲',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 1. count check -> returns 2
      const mockCountQuery = {
        eq: vi.fn().mockResolvedValueOnce({ count: 2, error: null }),
      };
      // 2. group insert -> returns mockCreatedGroup
      const mockInsertGroupQuery = {
        select: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: mockCreatedGroup, error: null }),
        }),
      };
      // 3. members insert
      const mockInsertMembersQuery = vi.fn().mockResolvedValueOnce({ error: null });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'planning_groups') {
          return {
            select: vi.fn().mockReturnValue(mockCountQuery),
            insert: vi.fn().mockReturnValue(mockInsertGroupQuery),
          };
        }
        if (table === 'planning_group_members') {
          return {
            insert: mockInsertMembersQuery,
          };
        }
        return {};
      });

      const res = await GroupService.createGroup('Friday Foodies', '🍲', ['Tolu', 'Amaka', 'Femi']);
      expect(res.success).toBe(true);
      expect(res.data?.name).toBe('Friday Foodies');
    });
  });

  describe('getUserGroups', () => {
    it('returns empty array when unauthenticated', async () => {
      (SessionResolver.resolveIdentity as any).mockResolvedValue({
        type: 'anonymous',
        sessionId: 'anon-123',
        profile: null,
      });

      const res = await GroupService.getUserGroups();
      expect(res.success).toBe(false);
      expect(res.data).toEqual([]);
    });

    it('fetches groups with member counts and plan statistics', async () => {
      (SessionResolver.resolveIdentity as any).mockResolvedValue({
        type: 'authenticated',
        sessionId: 'session-123',
        profile: mockUser,
      });

      const mockGroups = [
        {
          id: 'group-1',
          owner_id: mockUser.id,
          name: 'Beach Squad',
          emoji: '🌴',
          created_at: '2026-08-01T12:00:00Z',
          updated_at: '2026-08-01T12:00:00Z',
          planning_group_members: [
            { id: 'm1', display_name: 'Tolu' },
            { id: 'm2', display_name: 'Amaka' },
          ],
        },
      ];

      const mockPlans = [
        {
          id: 'plan-1',
          group_id: 'group-1',
          total_cost: 40000,
          squad_size: 2,
          created_at: '2026-08-10T12:00:00Z',
          spot: { name: 'The Good Beach' },
        },
      ];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'planning_groups') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockGroups, error: null }),
              }),
            }),
          };
        }
        if (table === 'shared_plans') {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockPlans, error: null }),
              }),
            }),
          };
        }
        return {};
      });

      const res = await GroupService.getUserGroups();
      expect(res.success).toBe(true);
      expect(res.data.length).toBe(1);
      expect(res.data[0].name).toBe('Beach Squad');
      expect(res.data[0].member_count).toBe(2);
      expect(res.data[0].plans_count).toBe(1);
      expect(res.data[0].last_outing?.venue_name).toBe('The Good Beach');
      expect(res.data[0].last_outing?.cost_per_person).toBe(20000);
    });
  });

  describe('addMember and removeMember', () => {
    it('enforces maximum 20 members limit per group', async () => {
      (SessionResolver.resolveIdentity as any).mockResolvedValue({
        type: 'authenticated',
        sessionId: 'session-123',
        profile: mockUser,
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'planning_groups') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: { id: 'g-1' }, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'planning_group_members') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ count: MAX_MEMBERS_PER_GROUP, error: null }),
            }),
          };
        }
        return {};
      });

      const res = await GroupService.addMember('g-1', '21st Member');
      expect(res.success).toBe(false);
      expect(res.error).toBe('member_limit_reached');
    });

    it('rejects member addition if group is not owned by the caller', async () => {
      (SessionResolver.resolveIdentity as any).mockResolvedValue({
        type: 'authenticated',
        sessionId: 'session-123',
        profile: mockUser,
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'planning_groups') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: new Error('not found') }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      const res = await GroupService.addMember('other-user-group-id', 'Sneaky Member');
      expect(res.success).toBe(false);
      expect(res.error).toBe('group_not_found');
    });
  });
});
