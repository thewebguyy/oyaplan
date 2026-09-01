import { describe, it, expect, vi, beforeEach } from 'vitest';
import { linkPlanToSquadAction } from './linkPlanToSquadAction';
import { GroupService } from '@/lib/services/identity/groupService';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';

vi.mock('@/lib/services/identity/sessionResolver', () => ({
  SessionResolver: {
    resolveIdentity: vi.fn(),
  },
}));

vi.mock('@/lib/services/identity/groupService', () => ({
  GroupService: {
    createGroup: vi.fn(),
  },
}));

vi.mock('@/lib/sentry', () => ({
  captureServerException: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const mockFrom = vi.fn();
vi.mock('@/lib/supabase-server', () => ({
  createServerClient: vi.fn(() => Promise.resolve({
    from: mockFrom,
  })),
}));

describe('linkPlanToSquadAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated user', async () => {
    vi.mocked(SessionResolver.resolveIdentity).mockResolvedValue({
      type: 'anonymous',
      sessionId: 'anon-123',
      profile: null,
    });

    const res = await linkPlanToSquadAction({
      sharedPlanId: '11111111-1111-1111-1111-111111111111',
      squadName: 'Friday Squad',
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe('unauthorized');
  });

  it('rejects invalid inputs', async () => {
    const res = await linkPlanToSquadAction({
      sharedPlanId: '',
      squadName: '',
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe('invalid_input');
  });

  it('creates squad and updates shared_plans table with group_id', async () => {
    vi.mocked(SessionResolver.resolveIdentity).mockResolvedValue({
      type: 'authenticated',
      sessionId: 'sess-123',
      profile: {
        id: 'user-1',
        role: 'planner',
        email: 'user@test.com',
        display_name: 'User 1',
        profile_badge: null,
        beta_joined_at: null,
        beta_onboarding_complete: true,
      },
    });

    vi.mocked(GroupService.createGroup).mockResolvedValue({
      success: true,
      data: {
        id: 'new-group-uuid',
        owner_id: 'user-1',
        name: 'Friday Squad',
        emoji: '⚡',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'shared_plans') {
        return { update: mockUpdate };
      }
      return {};
    });

    const res = await linkPlanToSquadAction({
      sharedPlanId: '11111111-1111-1111-1111-111111111111',
      squadName: 'Friday Squad',
      memberNames: ['Tolu', 'Amaka'],
    });

    expect(res.success).toBe(true);
    expect(res.groupId).toBe('new-group-uuid');
    expect(res.squadName).toBe('Friday Squad');
    expect(GroupService.createGroup).toHaveBeenCalledWith('Friday Squad', '⚡', ['Tolu', 'Amaka']);
  });
});
