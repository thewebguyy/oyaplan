'use server';

import { supabase } from '../supabase';
import { captureServerException } from '../sentry';
import { Plan, ForgeInput } from '../types';

export async function createShareablePlan(plan: Plan, input: ForgeInput): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('shared_plans')
      .insert({
        start_area: input.startArea,
        squad_size: input.squadSize,
        budget: input.budget,
        vibe: input.vibe,
        spot_id: plan.spot.id,
        food_cost: plan.foodCost,
        transport_cost: plan.transportCost,
        total_cost: plan.totalCost,
        why_it_fits: plan.whyItFits
      })
      .select('id')
      .single();

    if (error) {
      captureServerException(new Error(`sharePlan Supabase error: ${error.message}`));
      return null;
    }

    return data.id;
  } catch (e) {
    captureServerException(e);
    return null;
  }
}
