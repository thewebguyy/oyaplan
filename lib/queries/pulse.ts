import { supabase } from '@/lib/supabase';
import { createServerClient } from '@/lib/supabase-server';

export interface PulseSquadItem {
  id: string;
  plan_code: string;
  squad_size: number;
  vibe: string;
  budget: number;
  total_cost: number;
  deposit_ready: boolean;
  deposit_amount: number;
  created_at: string;
  status: 'pending' | 'approved' | 'declined';
  confirmed_at?: string | null;
}

export interface PulseDemandSummary {
  headlineCount: number;
  pendingSquads: PulseSquadItem[];
  approvedSquads: PulseSquadItem[];
  totalPendingRevenue: number;
  totalConfirmedRevenue: number;
  hasRealDemand: boolean;
}

/**
 * getVenuePulseData
 * Fetches real squad plans and attributed visits for a venue.
 * Never manufactures or fakes demand — strictly queries shared_plans and venue_attributed_visits.
 */
export async function getVenuePulseData(
  venueId: string,
  reservationFee: number = 0
): Promise<PulseDemandSummary> {
  try {
    const serverSupabase = await createServerClient();

    // 1. Fetch real shared plans featuring this spot
    const { data: plansData } = await serverSupabase
      .from('shared_plans')
      .select('id, plan_code, squad_size, total_cost, budget, vibe, created_at')
      .eq('spot_id', venueId)
      .order('created_at', { ascending: false })
      .limit(40);

    // 2. Fetch attributed visits already confirmed
    const { data: visitsData } = await serverSupabase
      .from('venue_attributed_visits')
      .select('shared_plan_id, confirmed_at, squad_size, estimated_total_cost')
      .eq('venue_id', venueId);

    const visitsMap = new Map<string, { confirmed_at: string }>();
    if (visitsData) {
      for (const v of visitsData) {
        if (v.shared_plan_id) {
          visitsMap.set(v.shared_plan_id, { confirmed_at: v.confirmed_at });
        }
      }
    }

    const squads: PulseSquadItem[] = [];
    const pendingSquads: PulseSquadItem[] = [];
    const approvedSquads: PulseSquadItem[] = [];

    let totalPendingRevenue = 0;
    let totalConfirmedRevenue = 0;

    if (plansData && plansData.length > 0) {
      for (const p of plansData) {
        const isApproved = visitsMap.has(p.id);
        const depositAmount = reservationFee > 0
          ? reservationFee
          : (p.total_cost ? Math.round((p.total_cost * 0.1) / 1000) * 1000 : 0);

        const item: PulseSquadItem = {
          id: p.id,
          plan_code: p.plan_code || `OYA-${p.id.slice(0, 6).toUpperCase()}`,
          squad_size: p.squad_size || 4,
          vibe: p.vibe || 'Dinner Outing',
          budget: p.budget || 0,
          total_cost: p.total_cost || 0,
          deposit_ready: depositAmount > 0,
          deposit_amount: depositAmount,
          created_at: p.created_at,
          status: isApproved ? 'approved' : 'pending',
          confirmed_at: isApproved ? visitsMap.get(p.id)?.confirmed_at : null,
        };

        squads.push(item);

        if (isApproved) {
          approvedSquads.push(item);
          totalConfirmedRevenue += item.total_cost || item.deposit_amount;
        } else {
          pendingSquads.push(item);
          totalPendingRevenue += item.deposit_amount || item.total_cost;
        }
      }
    }

    return {
      headlineCount: squads.length,
      pendingSquads,
      approvedSquads,
      totalPendingRevenue,
      totalConfirmedRevenue,
      hasRealDemand: squads.length > 0,
    };
  } catch (err) {
    console.error('Error fetching pulse demand data:', err);
    return {
      headlineCount: 0,
      pendingSquads: [],
      approvedSquads: [],
      totalPendingRevenue: 0,
      totalConfirmedRevenue: 0,
      hasRealDemand: false,
    };
  }
}
