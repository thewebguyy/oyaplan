'use server';

import { SavedVenueService } from '../services/identity/savedVenueService';

export async function saveVenueAction(venueId: string) {
  return await SavedVenueService.saveVenue(venueId);
}

export async function removeVenueAction(venueId: string) {
  return await SavedVenueService.removeVenue(venueId);
}

export async function getSavedVenueIdsAction() {
  return await SavedVenueService.getSavedVenueIds();
}
