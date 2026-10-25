import { redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenue, getPartnerVenuesForUser, getVenuesForClaimSearch } from '@/lib/queries/partner';
import { BusinessShell } from '@/components/business/BusinessShell';
import { Venue } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
  children: React.ReactNode;
}

export default async function BusinessVenueLayout({ params, children }: Props) {
  const { venueId } = await params;
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect(`/login/business?returnTo=/business/${venueId}/reservations`);
    return null;
  }

  const profile = identity.profile;
  const { data: venue, error } = await getPartnerVenue(venueId, profile.id);

  if (error || !venue) {
    redirect('/business');
    return null;
  }

  // Load sibling venues for the switcher
  let allVenues = await getPartnerVenuesForUser(profile.id);

  // If the user has <= 1 claimed venue, augment with active Lagos catalog floors for instant preview & switching
  if (allVenues.length <= 1) {
    const catalog = await getVenuesForClaimSearch();
    const catalogOptions = catalog.slice(0, 20).map((c) => ({
      venue: {
        id: c.id,
        name: c.name,
        address: c.address || 'Lagos, Nigeria',
        category: (c.category as any) || 'restaurant',
      } as Venue,
      role: 'Floor Operator',
    }));

    const existingIds = new Set(allVenues.map((v) => v.venue.id));
    for (const opt of catalogOptions) {
      if (!existingIds.has(opt.venue.id)) {
        allVenues.push(opt);
        existingIds.add(opt.venue.id);
      }
    }
  }

  return (
    <BusinessShell venue={venue} allVenues={allVenues}>
      {children}
    </BusinessShell>
  );
}
