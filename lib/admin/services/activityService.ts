import { ActivityRepository } from "../repositories/activityRepository";
import { AdminActivityItem } from "../types";

export class ActivityService {
  static async getRecentActivity(limit = 20): Promise<AdminActivityItem[]> {
    return ActivityRepository.getRecentActivity(limit);
  }

  static async logActivity(
    actorEmail: string,
    action: string,
    targetType: string,
    targetId?: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    return ActivityRepository.logActivity(actorEmail, action, targetType, targetId, details);
  }
}
