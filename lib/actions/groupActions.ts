'use server';

import { GroupService } from '@/lib/services/identity/groupService';
import { OyaSquadSummary, PlanningGroup, PlanningGroupMember } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createGroupSchema = z.object({
  name: z.string().trim().min(1).max(60),
  emoji: z.string().max(10).optional().default('⚡'),
  memberNames: z.array(z.string().trim().min(1).max(60)).max(20).optional().default([]),
});

const updateGroupSchema = z.object({
  groupId: z.string().uuid(),
  name: z.string().trim().min(1).max(60).optional(),
  emoji: z.string().max(10).optional(),
});

const memberSchema = z.object({
  groupId: z.string().uuid(),
  displayName: z.string().trim().min(1).max(60),
});

export async function createGroupAction(input: {
  name: string;
  emoji?: string;
  memberNames?: string[];
}): Promise<{ success: boolean; data?: PlanningGroup; error?: string }> {
  const parsed = createGroupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid group data' };
  }

  const res = await GroupService.createGroup(
    parsed.data.name,
    parsed.data.emoji,
    parsed.data.memberNames
  );

  if (res.success) {
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/squads');
  }

  return res;
}

export async function updateGroupAction(input: {
  groupId: string;
  name?: string;
  emoji?: string;
}): Promise<{ success: boolean; error?: string }> {
  const parsed = updateGroupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid updates' };
  }

  const res = await GroupService.updateGroup(parsed.data.groupId, {
    name: parsed.data.name,
    emoji: parsed.data.emoji,
  });

  if (res.success) {
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/squads');
    revalidatePath(`/dashboard/squads/${parsed.data.groupId}`);
  }

  return res;
}

export async function deleteGroupAction(groupId: string): Promise<{ success: boolean; error?: string }> {
  if (!groupId || typeof groupId !== 'string') {
    return { success: false, error: 'Invalid group ID' };
  }

  const res = await GroupService.deleteGroup(groupId);

  if (res.success) {
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/squads');
  }

  return res;
}

export async function addMemberAction(input: {
  groupId: string;
  displayName: string;
}): Promise<{ success: boolean; data?: PlanningGroupMember; error?: string }> {
  const parsed = memberSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid member name' };
  }

  const res = await GroupService.addMember(parsed.data.groupId, parsed.data.displayName);

  if (res.success) {
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/squads');
    revalidatePath(`/dashboard/squads/${parsed.data.groupId}`);
  }

  return res;
}

export async function removeMemberAction(input: {
  groupId: string;
  memberId: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!input.groupId || !input.memberId) {
    return { success: false, error: 'Invalid parameters' };
  }

  const res = await GroupService.removeMember(input.groupId, input.memberId);

  if (res.success) {
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/squads');
    revalidatePath(`/dashboard/squads/${input.groupId}`);
  }

  return res;
}

export async function getUserGroupsAction(): Promise<{
  success: boolean;
  data: OyaSquadSummary[];
  error?: string;
}> {
  return await GroupService.getUserGroups();
}

