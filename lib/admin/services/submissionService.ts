import { SubmissionRepository } from "../repositories/submissionRepository";
import { SpotSubmission } from "../types";

export class SubmissionService {
  static async getSubmissions(): Promise<SpotSubmission[]> {
    return SubmissionRepository.getSubmissions();
  }

  static async moderateSubmission(id: string, status: "approved" | "rejected", actorEmail = "admin"): Promise<boolean> {
    return SubmissionRepository.moderateSubmission(id, status, actorEmail);
  }
}
