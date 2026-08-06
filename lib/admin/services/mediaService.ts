import { MediaRepository } from "../repositories/mediaRepository";
import { MediaItem } from "../types";

export class MediaService {
  static async getMediaItems(): Promise<MediaItem[]> {
    return MediaRepository.getMediaItems();
  }

  static async assignImageToVenue(venueId: string, imageUrl: string, isHero = true, actorEmail = "admin"): Promise<boolean> {
    return MediaRepository.assignImageToVenue(venueId, imageUrl, isHero, actorEmail);
  }
}
