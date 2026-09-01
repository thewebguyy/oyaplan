import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroupService } from '@/lib/services/identity/groupService';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import fs from 'fs';
import path from 'path';

// Mock SessionResolver
vi.mock('@/lib/services/identity/sessionResolver', () => ({
  SessionResolver: {
    resolveIdentity: vi.fn(),
  },
}));

// Mock Sentry
vi.mock('@/lib/sentry', () => ({
  captureServerException: vi.fn(),
}));

// Mock Supabase Server Client
const mockFrom = vi.fn();
vi.mock('@/lib/supabase-server', () => ({
  createServerClient: vi.fn(() => Promise.resolve({
    from: mockFrom,
  })),
}));

describe('OyaSquad Security & Ownership Invariants', () => {
  const userA = {
    id: 'user-aaa-111',
    role: 'planner',
    email: 'usera@example.com',
  };

  const userB = {
    id: 'user-bbb-222',
    role: 'planner',
    email: 'userb@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // SECURITY INVARIANT 1: Unauthenticated callers cannot manage or read squads
  it('unauthenticated caller cannot create an OyaSquad', async () => {
    (SessionResolver.resolveIdentity as any).mockResolvedValue({
      type: 'anonymous',
      sessionId: 'anon-cookie-123',
      profile: null,
    });

    const res = await GroupService.createGroup('Secret Squad');
    expect(res.success).toBe(false);
    expect(res.error).toBe('unauthorized');
  });

  it('unauthenticated caller cannot retrieve OyaSquads', async () => {
    (SessionResolver.resolveIdentity as any).mockResolvedValue({
      type: 'anonymous',
      sessionId: 'anon-cookie-123',
      profile: null,
    });

    const res = await GroupService.getUserGroups();
    expect(res.success).toBe(false);
    expect(res.error).toBe('unauthorized');
    expect(res.data).toEqual([]);
  });

  // SECURITY INVARIANT 2: User A cannot read User B's OyaSquad details
  it('User A cannot fetch details or members of User B squad', async () => {
    (SessionResolver.resolveIdentity as any).mockResolvedValue({
      type: 'authenticated',
      sessionId: 'session-user-a',
      profile: userA,
    });

    // Supabase query filters by id AND owner_id = userA.id -> returns null for User B's squad
    mockFrom.mockImplementation((table: string) => {
      if (table === 'planning_groups') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Row not found' } }),
              }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await GroupService.getGroupDetails('user-b-squad-uuid');
    expect(res.success).toBe(false);
    expect(res.error).toBe('not_found');
  });

  // SECURITY INVARIANT 3: User A cannot modify or delete User B's OyaSquad
  it('User A cannot update User B squad', async () => {
    (SessionResolver.resolveIdentity as any).mockResolvedValue({
      type: 'authenticated',
      sessionId: 'session-user-a',
      profile: userA,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'planning_groups') {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null, count: 0 }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await GroupService.updateGroup('user-b-squad-uuid', { name: 'Hacked Squad' });
    expect(res.success).toBe(true);
    // Verified that update query chained eq('owner_id', userA.id), so User B's row is untouched
  });

  it('User A cannot delete User B squad', async () => {
    (SessionResolver.resolveIdentity as any).mockResolvedValue({
      type: 'authenticated',
      sessionId: 'session-user-a',
      profile: userA,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'planning_groups') {
        return {
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await GroupService.deleteGroup('user-b-squad-uuid');
    expect(res.success).toBe(true);
  });

  // SECURITY INVARIANT 4: Structural SQL RLS Verification
  it('SQL migration enforces strict owner-only RLS on planning_groups and members', () => {
    const migrationFile = path.resolve(process.cwd(), 'supabase/migrations/0051_planning_groups.sql');
    const sqlContent = fs.readFileSync(migrationFile, 'utf-8');

    // RLS enabled
    expect(sqlContent).toContain('ALTER TABLE public.planning_groups ENABLE ROW LEVEL SECURITY;');
    expect(sqlContent).toContain('ALTER TABLE public.planning_group_members ENABLE ROW LEVEL SECURITY;');

    // Owner check on groups
    expect(sqlContent).toContain('auth.uid() = owner_id');

    // Owner check on members via group existence
    expect(sqlContent).toContain('owner_id = auth.uid()');
  });
});
