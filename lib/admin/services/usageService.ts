import { UsageRepository, UsageSummary } from "../repositories/usageRepository";

export class UsageService {
  static async getAccountUsage(search?: string): Promise<UsageSummary> {
    return UsageRepository.getAccountUsage(search);
  }
}
