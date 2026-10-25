import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenuesForUser, getDefaultFloorVenue } from '@/lib/queries/partner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The Floor — Live Venue Command Center',
  description: 'Access live table management, guestlists, squad approvals, and pulse telemetry.',
};

export default async function BusinessIndexPage() {
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect('/login/business?returnTo=/business');
    return null;
  }

  // 1. If user has claimed or linked venues, take them straight to their primary venue's Floor
  const venues = await getPartnerVenuesForUser(identity.profile.id);
  if (venues.length > 0 && venues[0]?.venue?.id) {
    redirect(`/business/${venues[0].venue.id}/reservations`);
    return null;
  }

  // 2. User has not claimed any venue yet -> Immediately route into the flagship Floor (No claim required!)
  const defaultVenue = await getDefaultFloorVenue();
  if (defaultVenue?.id) {
    redirect(`/business/${defaultVenue.id}/reservations`);
    return null;
  }

  // 3. Fallback to 100 Hours (Flagship Floor)
  redirect('/business/100-hours/reservations');
  return null;
}
