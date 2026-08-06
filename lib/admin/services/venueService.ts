import { VenueRepository } from "../repositories/venueRepository";
import { AdminVenue } from "../types";

export class VenueService {
  static async getVenues(options?: {
    search?: string;
    areaId?: string;
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ venues: AdminVenue[]; total: number }> {
    return VenueRepository.getVenues(options);
  }

  static async getVenueById(id: string): Promise<AdminVenue | null> {
    return VenueRepository.getVenueById(id);
  }

  static async updateVenue(id: string, updates: Partial<AdminVenue>, actorEmail = "admin"): Promise<boolean> {
    return VenueRepository.updateVenue(id, updates, actorEmail);
  }
}
