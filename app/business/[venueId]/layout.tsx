import { redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenue, getPartnerVenuesForUser } from '@/lib/queries/partner';
import { BusinessShell } from '@/components/business/BusinessShell';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
  children: React.ReactNode;
}

export default async function BusinessVenueLayout({ params, children }: Props) {
  const { venueId } = await params;
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect(`/login/business?returnTo=/business/${venueId}`);
    return null;
  }

  const profile = identity.profile;
  const { data: venue, error } = await getPartnerVenue(venueId, profile.id);

  if (error || !venue) {
    redirect('/business');
    return null;
  }

  // Load sibling venues for the switcher (non-blocking — empty array on failure)
  const allVenues = await getPartnerVenuesForUser(profile.id);

  return (
    <BusinessShell venue={venue} allVenues={allVenues}>
      {children}
    </BusinessShell>
  );
}
