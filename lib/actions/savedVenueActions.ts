'use server';

import { SavedVenueService } from '../services/identity/savedVenueService';
import { revalidatePath } from 'next/cache';

export async function saveVenueAction(venueId: string) {
  const res = await SavedVenueService.saveVenue(venueId);
  if (res.success) {
    revalidatePath('/saved');
    revalidatePath('/dashboard');
  }
  return res;
}

export async function removeVenueAction(venueId: string) {
  const res = await SavedVenueService.removeVenue(venueId);
  if (res.success) {
    revalidatePath('/saved');
    revalidatePath('/dashboard');
  }
  return res;
}

export async function getSavedVenueIdsAction() {
  return await SavedVenueService.getSavedVenueIds();
}

export async function getSavedVenuesAction() {
  return await SavedVenueService.getSavedVenues();
}
