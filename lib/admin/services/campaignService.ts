import { CampaignRepository } from "../repositories/campaignRepository";
import { SponsoredCampaign } from "../types";

export class CampaignService {
  static async getCampaigns(): Promise<SponsoredCampaign[]> {
    return CampaignRepository.getCampaigns();
  }

  static async createCampaign(
    campaign: Omit<SponsoredCampaign, "id" | "created_at">,
    actorEmail = "admin"
  ): Promise<boolean> {
    return CampaignRepository.createCampaign(campaign, actorEmail);
  }
}
