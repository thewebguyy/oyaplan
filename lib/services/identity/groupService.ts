import { createServerClient } from '../../supabase-server';
import { SessionResolver } from './sessionResolver';
import { captureServerException } from '../../sentry';
import { OyaSquadSummary, PlanningGroup, PlanningGroupMember } from '../../types';

export const MAX_GROUPS_PER_USER = 10;
export const MAX_MEMBERS_PER_GROUP = 20;

export class GroupService {
  /**
   * Creates a new reusable planning group (OyaSquad).
   */
  static async createGroup(
    name: string,
    emoji: string = '⚡',
    initialMemberNames: string[] = []
  ): Promise<{ success: boolean; data?: PlanningGroup; error?: string }> {
    try {
      const identity = await SessionResolver.resolveIdentity();
      if (identity.type !== 'authenticated') {
        return { success: false, error: 'unauthorized' };
      }

      const trimmedName = name.trim();
      if (trimmedName.length === 0 || trimmedName.length > 60) {
        return { success: false, error: 'invalid_name' };
      }

      const supabase = await createServerClient();

      // Enforce V1 group count limit
      const { count, error: countErr } = await supabase
        .from('planning_groups')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', identity.profile.id);

      if (countErr) throw countErr;
      if ((count ?? 0) >= MAX_GROUPS_PER_USER) {
        return { success: false, error: 'group_limit_reached' };
      }

      // Insert group
      const { data: group, error: insertErr } = await supabase
        .from('planning_groups')
        .insert({
          owner_id: identity.profile.id,
          name: trimmedName,
          emoji: emoji.slice(0, 10) || '⚡',
        })
        .select()
        .single();

      if (insertErr || !group) throw insertErr || new Error('Failed to create group');

      // Insert initial members if provided
      const validNames = Array.from(
        new Set(
          initialMemberNames
            .map((n) => n.trim())
            .filter((n) => n.length > 0 && n.length <= 60)
        )
      ).slice(0, MAX_MEMBERS_PER_GROUP);

      if (validNames.length > 0) {
        const memberRows = validNames.map((displayName) => ({
          group_id: group.id,
          display_name: displayName,
        }));

        const { error: memberErr } = await supabase
          .from('planning_group_members')
          .insert(memberRows);

        if (memberErr) {
          captureServerException(memberErr);
        }
      }

      return { success: true, data: group };
    } catch (error) {
      captureServerException(error);
      return { success: false, error: 'failed_to_create_group' };
    }
  }

  /**
   * Retrieves all OyaSquads for the current authenticated user with stats and members.
   */
  static async getUserGroups(): Promise<{ success: boolean; data: OyaSquadSummary[]; error?: string }> {
    try {
      const identity = await SessionResolver.resolveIdentity();
      if (identity.type !== 'authenticated') {
        return { success: false, data: [], error: 'unauthorized' };
      }

      const supabase = await createServerClient();

      // Fetch groups owned by user
      const { data: groups, error: groupsErr } = await supabase
        .from('planning_groups')
        .select(`
          id,
          owner_id,
          name,
          emoji,
          created_at,
          updated_at,
          planning_group_members (
            id,
            display_name
          )
        `)
        .eq('owner_id', identity.profile.id)
        .order('updated_at', { ascending: false });

      if (groupsErr) throw groupsErr;
      if (!groups) return { success: true, data: [] };

      // Fetch shared plans counts and latest outings for these groups
      const groupIds = groups.map((g) => g.id);
      let plansByGroup: Record<string, any[]> = {};

      if (groupIds.length > 0) {
        const { data: plans } = await supabase
          .from('shared_plans')
          .select(`
            id,
            group_id,
            total_cost,
            squad_size,
            created_at,
            spot:spots(name)
          `)
          .in('group_id', groupIds)
          .order('created_at', { ascending: false });

        if (plans) {
          plansByGroup = plans.reduce((acc, p) => {
            if (!p.group_id) return acc;
            if (!acc[p.group_id]) acc[p.group_id] = [];
            acc[p.group_id].push(p);
            return acc;
          }, {} as Record<string, any[]>);
        }
      }

      const summaries: OyaSquadSummary[] = groups.map((g) => {
        const members = (g.planning_group_members || []).map((m: any) => ({
          id: m.id,
          display_name: m.display_name,
        }));

        const groupPlans = plansByGroup[g.id] || [];
        const latestPlan = groupPlans[0];

        let lastOuting = null;
        if (latestPlan) {
          const spotName = Array.isArray(latestPlan.spot)
            ? latestPlan.spot[0]?.name
            : latestPlan.spot?.name;

          lastOuting = {
            venue_name: spotName || 'Lagos Outing',
            total_cost: latestPlan.total_cost || 0,
            cost_per_person:
              latestPlan.squad_size > 0
                ? Math.round(latestPlan.total_cost / latestPlan.squad_size)
                : latestPlan.total_cost,
            date: latestPlan.created_at,
            shared_plan_id: latestPlan.id,
          };
        }

        return {
          id: g.id,
          owner_id: g.owner_id,
          name: g.name,
          emoji: g.emoji || '⚡',
          created_at: g.created_at,
          updated_at: g.updated_at,
          member_count: members.length,
          members,
          plans_count: groupPlans.length,
          last_outing: lastOuting,
        };
      });

      return { success: true, data: summaries };
    } catch (error) {
      captureServerException(error);
      return { success: false, data: [], error: 'failed_to_fetch_groups' };
    }
  }

  /**
   * Retrieves full details for a single OyaSquad including member list and plan history.
   */
  static async getGroupDetails(groupId: string): Promise<{
    success: boolean;
    data?: {
      group: PlanningGroup;
      members: PlanningGroupMember[];
      plans: any[];
    };
    error?: string;
  }> {
    try {
      const identity = await SessionResolver.resolveIdentity();
      if (identity.type !== 'authenticated') {
        return { success: false, error: 'unauthorized' };
      }

      const supabase = await createServerClient();

      const { data: group, error: groupErr } = await supabase
        .from('planning_groups')
        .select('*')
        .eq('id', groupId)
        .eq('owner_id', identity.profile.id)
        .single();

      if (groupErr || !group) {
        return { success: false, error: 'not_found' };
      }

      const [membersRes, plansRes] = await Promise.all([
        supabase
          .from('planning_group_members')
          .select('*')
          .eq('group_id', groupId)
          .order('created_at', { ascending: true }),
        supabase
          .from('shared_plans')
          .select(`
            id,
            total_cost,
            food_cost,
            transport_cost,
            squad_size,
            vibe,
            created_at,
            spot:spots(name, category, address)
          `)
          .eq('group_id', groupId)
          .order('created_at', { ascending: false }),
      ]);

      return {
        success: true,
        data: {
          group,
          members: membersRes.data || [],
          plans: plansRes.data || [],
        },
      };
    } catch (error) {
      captureServerException(error);
      return { success: false, error: 'failed_to_fetch_group_details' };
    }
  }

  /**
   * Updates an existing OyaSquad.
   */
  static async updateGroup(
    groupId: string,
    updates: { name?: string; emoji?: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const identity = await SessionResolver.resolveIdentity();
      if (identity.type !== 'authenticated') {
        return { success: false, error: 'unauthorized' };
      }

      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name !== undefined) {
        const trimmed = updates.name.trim();
        if (trimmed.length === 0 || trimmed.length > 60) {
          return { success: false, error: 'invalid_name' };
        }
        payload.name = trimmed;
      }

      if (updates.emoji !== undefined) {
        payload.emoji = updates.emoji.slice(0, 10) || '⚡';
      }

      const supabase = await createServerClient();
      const { error } = await supabase
        .from('planning_groups')
        .update(payload)
        .eq('id', groupId)
        .eq('owner_id', identity.profile.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      captureServerException(error);
      return { success: false, error: 'failed_to_update_group' };
    }
  }

  /**
   * Deletes an OyaSquad (members cascade automatically).
   */
  static async deleteGroup(groupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const identity = await SessionResolver.resolveIdentity();
      if (identity.type !== 'authenticated') {
        return { success: false, error: 'unauthorized' };
      }

      const supabase = await createServerClient();
      const { error } = await supabase
        .from('planning_groups')
        .delete()
        .eq('id', groupId)
        .eq('owner_id', identity.profile.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      captureServerException(error);
      return { success: false, error: 'failed_to_delete_group' };
    }
  }

  /**
   * Adds a member to an OyaSquad.
   */
  static async addMember(
    groupId: string,
    displayName: string
  ): Promise<{ success: boolean; data?: PlanningGroupMember; error?: string }> {
    try {
      const identity = await SessionResolver.resolveIdentity();
      if (identity.type !== 'authenticated') {
        return { success: false, error: 'unauthorized' };
      }

      const trimmedName = displayName.trim();
      if (trimmedName.length === 0 || trimmedName.length > 60) {
        return { success: false, error: 'invalid_name' };
      }

      const supabase = await createServerClient();

      // Verify group ownership
      const { data: group, error: groupErr } = await supabase
        .from('planning_groups')
        .select('id')
        .eq('id', groupId)
        .eq('owner_id', identity.profile.id)
        .single();

      if (groupErr || !group) {
        return { success: false, error: 'group_not_found' };
      }

      // Check member count limit
      const { count, error: countErr } = await supabase
        .from('planning_group_members')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', groupId);

      if (countErr) throw countErr;
      if ((count ?? 0) >= MAX_MEMBERS_PER_GROUP) {
        return { success: false, error: 'member_limit_reached' };
      }

      // Insert member
      const { data: member, error: insertErr } = await supabase
        .from('planning_group_members')
        .insert({
          group_id: groupId,
          display_name: trimmedName,
        })
        .select()
        .single();

      if (insertErr || !member) throw insertErr || new Error('Failed to insert member');

      // Update group's updated_at
      await supabase
        .from('planning_groups')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', groupId);

      return { success: true, data: member };
    } catch (error) {
      captureServerException(error);
      return { success: false, error: 'failed_to_add_member' };
    }
  }

  /**
   * Removes a member from an OyaSquad.
   */
  static async removeMember(
    groupId: string,
    memberId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const identity = await SessionResolver.resolveIdentity();
      if (identity.type !== 'authenticated') {
        return { success: false, error: 'unauthorized' };
      }

      const supabase = await createServerClient();

      // Verify group ownership
      const { data: group, error: groupErr } = await supabase
        .from('planning_groups')
        .select('id')
        .eq('id', groupId)
        .eq('owner_id', identity.profile.id)
        .single();

      if (groupErr || !group) {
        return { success: false, error: 'group_not_found' };
      }

      const { error } = await supabase
        .from('planning_group_members')
        .delete()
        .eq('id', memberId)
        .eq('group_id', groupId);

      if (error) throw error;

      // Update group's updated_at
      await supabase
        .from('planning_groups')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', groupId);

      return { success: true };
    } catch (error) {
      captureServerException(error);
      return { success: false, error: 'failed_to_remove_member' };
    }
  }

  /**
   * Checks how many plans have already been created with this group.
   */
  static async getRepeatPlanCount(groupId: string): Promise<number> {
    try {
      const supabase = await createServerClient();
      const { count } = await supabase
        .from('shared_plans')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', groupId);

      return count ?? 0;
    } catch {
      return 0;
    }
  }
}
