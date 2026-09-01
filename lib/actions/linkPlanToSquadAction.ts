'use server';

import { GroupService } from '@/lib/services/identity/groupService';
import { createServerClient } from '@/lib/supabase-server';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { captureServerException } from '@/lib/sentry';

const linkPlanSchema = z.object({
  sharedPlanId: z.string().min(1),
  squadName: z.string().trim().min(1).max(60),
  emoji: z.string().max(10).optional().default('⚡'),
  memberNames: z.array(z.string().trim().min(1).max(60)).max(20).optional().default([]),
});

export async function linkPlanToSquadAction(input: {
  sharedPlanId: string;
  squadName: string;
  emoji?: string;
  memberNames?: string[];
}): Promise<{ success: boolean; groupId?: string; squadName?: string; error?: string }> {
  const parsed = linkPlanSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'invalid_input' };
  }

  try {
    const identity = await SessionResolver.resolveIdentity();
    if (identity.type !== 'authenticated') {
      return { success: false, error: 'unauthorized' };
    }

    // 1. Create the OyaSquad
    const createRes = await GroupService.createGroup(
      parsed.data.squadName,
      parsed.data.emoji,
      parsed.data.memberNames
    );

    if (!createRes.success || !createRes.data) {
      return { success: false, error: createRes.error || 'failed_to_create_squad' };
    }

    const groupId = createRes.data.id;

    // 2. Link the shared_plan to this squad
    const supabase = await createServerClient();
    const { error: updateErr } = await supabase
      .from('shared_plans')
      .update({ group_id: groupId })
      .eq('id', parsed.data.sharedPlanId);

    if (updateErr) {
      captureServerException(updateErr);
    }

    revalidatePath(`/plan/${parsed.data.sharedPlanId}`);
    revalidatePath('/dashboard');

    return {
      success: true,
      groupId,
      squadName: createRes.data.name,
    };
  } catch (e) {
    captureServerException(e);
    return { success: false, error: 'failed_to_link_plan' };
  }
}
