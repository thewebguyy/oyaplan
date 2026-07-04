'use server';

import { supabase } from '../supabase';
import { captureServerException } from '../sentry';
import { Plan, ForgeInput } from '../types';
import { z } from 'zod';

const sharePlanSchema = z.object({
  plan: z.object({
    spot: z.object({
      id: z.string().uuid()
    }).passthrough(),
    foodCost: z.number().int().nonnegative(),
    transportCost: z.number().int().nonnegative(),
    totalCost: z.number().int().nonnegative(),
    whyItFits: z.string().max(2000)
  }).passthrough(),
  input: z.object({
    startArea: z.string().max(100),
    squadSize: z.number().int().positive(),
    budget: z.number().int().positive(),
    vibe: z.string().max(100)
  }).passthrough()
});

export async function createShareablePlan(plan: Plan, input: ForgeInput): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const parseResult = sharePlanSchema.safeParse({ plan, input });
    if (!parseResult.success) {
      return { success: false, error: 'Invalid plan data' };
    }

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
      return { success: false, error: 'Failed to create plan' };
    }

    return { success: true, id: data.id };
  } catch (e) {
    captureServerException(e);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
