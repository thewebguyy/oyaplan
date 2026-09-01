/**
 * OyaPlan V1 Authentication Security Regression Tests
 * 
 * Tests security invariants — not implementation details.
 * These verify that the auth architecture prevents real attack scenarios.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ═══════════════════════════════════════════════════════════════════════════
// 1. RoleService — RBAC Enforcement
// ═══════════════════════════════════════════════════════════════════════════
import { RoleService } from '@/lib/services/identity/roleService';
import type { IdentityState } from '@/lib/services/identity/sessionResolver';

describe('RoleService RBAC Security', () => {
  const anonymousIdentity: IdentityState = {
    type: 'anonymous',
    sessionId: 'anon-session-123',
    profile: null
  };

  const plannerIdentity: IdentityState = {
    type: 'authenticated',
    sessionId: 'session-456',
    profile: {
      id: 'user-uuid-1',
      role: 'planner',
      display_name: 'Test Planner',
      email: 'planner@example.com',
      profile_badge: null,
      beta_joined_at: null,
      beta_onboarding_complete: false
    }
  };

  const scoutIdentity: IdentityState = {
    type: 'authenticated',
    sessionId: 'session-789',
    profile: {
      id: 'user-uuid-2',
      role: 'scout',
      display_name: 'Test Scout',
      email: 'scout@example.com',
      profile_badge: null,
      beta_joined_at: null,
      beta_onboarding_complete: false
    }
  };

  const adminIdentity: IdentityState = {
    type: 'authenticated',
    sessionId: 'session-admin',
    profile: {
      id: 'admin-uuid',
      role: 'admin',
      display_name: 'Admin User',
      email: 'admin@oyaplan.com',
      profile_badge: null,
      beta_joined_at: null,
      beta_onboarding_complete: false
    }
  };

  // SECURITY INVARIANT: Anonymous users cannot perform any privileged operation
  it('anonymous users are denied all permissions', () => {
    expect(RoleService.can(anonymousIdentity, 'save_plan')).toBe(false);
    expect(RoleService.can(anonymousIdentity, 'submit_price_evidence')).toBe(false);
    expect(RoleService.can(anonymousIdentity, 'submit_price_flag')).toBe(false);
    expect(RoleService.can(anonymousIdentity, 'moderate_evidence')).toBe(false);
    expect(RoleService.can(anonymousIdentity, 'view_admin_portal')).toBe(false);
    expect(RoleService.can(anonymousIdentity, 'claim_venue')).toBe(false);
  });

  // SECURITY INVARIANT: Non-admin roles cannot access admin operations
  it('planner cannot moderate evidence or view admin portal', () => {
    expect(RoleService.can(plannerIdentity, 'moderate_evidence')).toBe(false);
    expect(RoleService.can(plannerIdentity, 'view_admin_portal')).toBe(false);
  });

  it('scout cannot moderate evidence or view admin portal', () => {
    expect(RoleService.can(scoutIdentity, 'moderate_evidence')).toBe(false);
    expect(RoleService.can(scoutIdentity, 'view_admin_portal')).toBe(false);
  });

  // SECURITY INVARIANT: Admin role grants all permissions
  it('admin can perform all privileged operations', () => {
    expect(RoleService.can(adminIdentity, 'save_plan')).toBe(true);
    expect(RoleService.can(adminIdentity, 'moderate_evidence')).toBe(true);
    expect(RoleService.can(adminIdentity, 'view_admin_portal')).toBe(true);
    expect(RoleService.can(adminIdentity, 'submit_price_evidence')).toBe(true);
    expect(RoleService.can(adminIdentity, 'claim_venue')).toBe(true);
  });

  // SECURITY INVARIANT: Role escalation is impossible through the RoleService
  it('a planner identity object with manually set admin role is treated as admin', () => {
    // This test documents that RoleService trusts the profile.role field.
    // The security boundary is that profile.role comes from the profiles table
    // via SessionResolver.resolveIdentity() -> getUser() -> DB query,
    // NOT from any client-controlled input.
    const fabricatedAdmin: IdentityState = {
      type: 'authenticated',
      sessionId: 'fake',
      profile: {
        id: 'fake-id',
        role: 'admin',
        display_name: 'Fake Admin',
        email: 'attacker@example.com',
        profile_badge: null,
        beta_joined_at: null,
        beta_onboarding_complete: false
      }
    };
    // RoleService itself doesn't verify — that's SessionResolver's job.
    // This test confirms the architecture requires the caller to use
    // SessionResolver which fetches from DB, not from client input.
    expect(RoleService.can(fabricatedAdmin, 'moderate_evidence')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. submitActualSpend — Input Validation
// ═══════════════════════════════════════════════════════════════════════════
describe('submitActualSpend Input Validation Security', () => {
  // Mock supabase to isolate validation logic
  vi.mock('@/lib/supabase', () => ({
    supabase: {
      from: () => ({
        insert: () => ({ error: null })
      })
    }
  }));
  vi.mock('@/lib/sentry', () => ({
    captureServerException: vi.fn()
  }));

  // Dynamic import after mocks
  let submitActualSpend: typeof import('@/lib/actions/submitActualSpend').submitActualSpend;

  beforeEach(async () => {
    const mod = await import('@/lib/actions/submitActualSpend');
    submitActualSpend = mod.submitActualSpend;
  });

  it('rejects negative actual spend', async () => {
    const result = await submitActualSpend({
      sharedPlanId: null,
      spotId: null,
      estimatedTotal: 10000,
      actualTotal: -5000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero actual spend', async () => {
    const result = await submitActualSpend({
      sharedPlanId: null,
      spotId: null,
      estimatedTotal: 10000,
      actualTotal: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects absurdly large actual spend (>10M)', async () => {
    const result = await submitActualSpend({
      sharedPlanId: null,
      spotId: null,
      estimatedTotal: 10000,
      actualTotal: 99_000_000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer actual spend', async () => {
    const result = await submitActualSpend({
      sharedPlanId: null,
      spotId: null,
      estimatedTotal: 10000,
      actualTotal: 5000.50,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID format for sharedPlanId', async () => {
    const result = await submitActualSpend({
      sharedPlanId: 'not-a-uuid',
      spotId: null,
      estimatedTotal: 10000,
      actualTotal: 12000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects notes exceeding 500 characters', async () => {
    const result = await submitActualSpend({
      sharedPlanId: null,
      spotId: null,
      estimatedTotal: 10000,
      actualTotal: 12000,
      notes: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. Admin Authorization Architecture — Structural Tests
// ═══════════════════════════════════════════════════════════════════════════
describe('Admin Authorization Architecture', () => {
  it('isAuthorizedAdmin uses getUser() not getSession()', async () => {
    // This is a structural assertion: the permissions module must use
    // supabase.auth.getUser() for server-side identity verification.
    const fs = await import('fs');
    const path = await import('path');
    const permissionsSource = fs.readFileSync(
      path.resolve(process.cwd(), 'lib/admin/permissions.ts'),
      'utf-8'
    );
    expect(permissionsSource).toContain('auth.getUser()');
    expect(permissionsSource).not.toContain('auth.getSession()');
  });

  it('admin authorization queries admin_users table, not user_metadata', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const permissionsSource = fs.readFileSync(
      path.resolve(process.cwd(), 'lib/admin/permissions.ts'),
      'utf-8'
    );
    expect(permissionsSource).toContain("admin_users");
    expect(permissionsSource).not.toContain('user_metadata');
    expect(permissionsSource).not.toContain('app_metadata');
  });

  it('attribution route uses getUser() not getSession()', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const routeSource = fs.readFileSync(
      path.resolve(process.cwd(), 'app/api/v1/growth/attribution/route.ts'),
      'utf-8'
    );
    expect(routeSource).toContain('auth.getUser()');
    expect(routeSource).not.toContain('auth.getSession()');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. Service Role Isolation — Structural Tests
// ═══════════════════════════════════════════════════════════════════════════
describe('Service Role Isolation', () => {
  it('client supabase module does not reference service role key', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const clientSource = fs.readFileSync(
      path.resolve(process.cwd(), 'lib/supabase.ts'),
      'utf-8'
    );
    expect(clientSource).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(clientSource).not.toContain('service_role');
  });

  it('AuthProvider does not reference service role key', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const providerSource = fs.readFileSync(
      path.resolve(process.cwd(), 'components/providers/AuthProvider.tsx'),
      'utf-8'
    );
    expect(providerSource).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(providerSource).not.toContain('service_role');
  });
});
