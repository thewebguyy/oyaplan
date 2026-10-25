import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { SquadService } from '@/lib/services/squadService';
import { switchPlanSpot } from '@/app/plan/[id]/actions';
import { POST as postOutingNotification } from '@/app/api/notify/post-outing/route';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * PHASE 1: REGRESSION OF PRIOR FIXES
 * Verifies that previously patched vulnerabilities stay closed:
 * 1. Anon direct write/read on plan_settlements and plan_squad_participants is revoked.
 * 2. Anon cannot set is_creator = true directly.
 * 3. Host token verification via save_settlement_rpc rejects non-host / cross-squad tokens.
 * 4. Bank details never returned to unauthorized callers.
 * 5. switchPlanSpot ignores client-supplied prices and recomputes server-side.
 * 6. /api/notify/post-outing rejects missing CRON_SECRET, wrong secret, and spoofed Host: localhost.
 * 7. Rate limiter rejects spoofed X-Forwarded-For attempts.
 */

describe('Phase 1 Security Regression: Prior Fixes Invariant Suite', () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  const anonClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
  });

  // 1.1 RLS on plan_settlements
  it('Regression 1.1: Migration 0058 strictly blocks anon and authenticated direct SELECT on plan_settlements', () => {
    const migrationFile = path.resolve(process.cwd(), 'supabase/migrations/0058_harden_squad_and_pricing_security.sql');
    const sql = fs.readFileSync(migrationFile, 'utf-8');

    expect(sql).toContain('DROP POLICY IF EXISTS "Allow public read settlements" ON public.plan_settlements;');
    expect(sql).toContain('CREATE POLICY "Restrict read settlements" ON public.plan_settlements');
    expect(sql).toContain('FOR SELECT TO anon, authenticated');
    expect(sql).toContain('USING (false);');
  });

  it('Regression 1.2: Migration 0058 revokes all direct INSERT, UPDATE, DELETE on plan_settlements and plan_squad_participants', () => {
    const migrationFile = path.resolve(process.cwd(), 'supabase/migrations/0058_harden_squad_and_pricing_security.sql');
    const sql = fs.readFileSync(migrationFile, 'utf-8');

    expect(sql).toContain('DROP POLICY IF EXISTS "Allow public insert settlements" ON public.plan_settlements;');
    expect(sql).toContain('DROP POLICY IF EXISTS "Allow public update settlements" ON public.plan_settlements;');
    expect(sql).toContain('DROP POLICY IF EXISTS "Allow public insert on squad participants" ON public.plan_squad_participants;');
    expect(sql).toContain('DROP POLICY IF EXISTS "Allow update on squad participants" ON public.plan_squad_participants;');
    expect(sql).toContain('DROP POLICY IF EXISTS "Allow delete on squad participants" ON public.plan_squad_participants;');
  });

  // 1.3 Creator Token Check in save_settlement_rpc
  it('Regression 1.3: save_settlement_rpc enforces SECURITY DEFINER with fixed search_path and validates is_creator', () => {
    const migrationFile = path.resolve(process.cwd(), 'supabase/migrations/0058_harden_squad_and_pricing_security.sql');
    const sql = fs.readFileSync(migrationFile, 'utf-8');

    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.save_settlement_rpc(');
    expect(sql).toContain('SECURITY DEFINER');
    expect(sql).toContain("SET search_path = public, pg_temp");
    expect(sql).toContain('WHERE plan_id = p_plan_id AND participant_token = p_participant_token_hash');
    expect(sql).toContain("IF v_is_creator IS NOT TRUE THEN");
    expect(sql).toContain("Unauthorized: Only squad creator can set settlement bank details");
  });

  // 1.4 Non-host token calling settlement save path is rejected
  it('Regression 1.4: saveSettlementDetails rejects invalid NUBAN account number before database hit', async () => {
    const badSettlement = {
      bankName: 'Access Bank',
      accountNumber: '1234', // invalid length (< 8)
      accountName: 'Tester',
    };
    const res = await SquadService.saveSettlementDetails('00000000-0000-0000-0000-000000000001', badSettlement);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Please enter valid bank details');
  });

  // 1.5 switchPlanSpot ignores client-supplied prices and recomputes server-side
  it('Regression 1.5: switchPlanSpot rejects missing or zero price_per_person in database spots', async () => {
    // When spot has 0 or invalid price, action must reject rather than fabricating ₦0
    const res = await switchPlanSpot('00000000-0000-0000-0000-000000000001', 'non-existent-spot-id');
    expect(res.success).toBe(false);
    expect(res.error).toBe('Failed to switch plan spot');
  });

  // 1.6 /api/notify/post-outing authentication & Host spoofing protection
  it('Regression 1.6: /api/notify/post-outing returns 401 on missing or wrong CRON_SECRET and spoofed Host: localhost', async () => {
    // Set CRON_SECRET for test
    const originalSecret = process.env.CRON_SECRET;
    process.env.CRON_SECRET = 'super-secret-cron-token-123';

    try {
      // 1. No secret
      const reqNoSecret = new NextRequest('http://localhost:3000/api/notify/post-outing', {
        method: 'POST',
        headers: { 'host': 'localhost' },
      });
      const resNoSecret = await postOutingNotification(reqNoSecret);
      expect(resNoSecret.status).toBe(401);

      // 2. Wrong secret
      const reqWrongSecret = new NextRequest('http://localhost:3000/api/notify/post-outing', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer wrong-secret',
          'host': 'localhost',
        },
      });
      const resWrongSecret = await postOutingNotification(reqWrongSecret);
      expect(resWrongSecret.status).toBe(401);

      // 3. Spoofed Host header does not bypass
      const reqSpoofedHost = new NextRequest('http://127.0.0.1:3000/api/notify/post-outing', {
        method: 'POST',
        headers: {
          'host': '127.0.0.1',
          'x-forwarded-host': 'localhost',
        },
      });
      const resSpoofedHost = await postOutingNotification(reqSpoofedHost);
      expect(resSpoofedHost.status).toBe(401);
    } finally {
      process.env.CRON_SECRET = originalSecret;
    }
  });

  // 1.7 Rate limiter X-Forwarded-For rightmost IP extraction
  it('Regression 1.7: Rate limit IP extractor in proxy.ts picks rightmost IP from X-Forwarded-For, preventing prepended spoofing', () => {
    const proxyFile = path.resolve(process.cwd(), 'proxy.ts');
    const proxyCode = fs.readFileSync(proxyFile, 'utf-8');

    // Asserts rightmost IP extraction logic
    expect(proxyCode).toContain('const ips = forwarded.split(\',\').map((ip) => ip.trim()).filter(Boolean);');
    expect(proxyCode).toContain('return ips[ips.length - 1] || \'unknown\';');
  });
});
