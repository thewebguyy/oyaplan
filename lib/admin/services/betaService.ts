import { BetaRepository } from "../repositories/betaRepository";
import { ApprovedBetaUser } from "../types";

export class BetaService {
  static async getApprovedBetaUsers(search?: string): Promise<ApprovedBetaUser[]> {
    return BetaRepository.getApprovedBetaUsers(search);
  }

  static async approveEmail(email: string, notes?: string, actorEmail = "admin"): Promise<boolean> {
    return BetaRepository.approveEmail(email, notes, actorEmail);
  }

  static async removeEmail(email: string, actorEmail = "admin"): Promise<boolean> {
    return BetaRepository.removeEmail(email, actorEmail);
  }
}
