import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenue } from '@/lib/queries/partner';
import { getVenuePulseData } from '@/lib/queries/pulse';
import { BouncerModeClient } from '@/components/pulse/BouncerModeClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId } = await params;
  return {
    title: 'Bouncer Stand — Door Check-in Console',
    description: 'Stripped-down door staff guestlist view. Verify customer plan codes and seat squads without financial data.',
  };
}

export default async function BusinessBouncerPage({ params }: Props) {
  const { venueId } = await params;
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect(`/login/business?returnTo=/business/${venueId}/bouncer`);
    return null;
  }

  const profile = identity.profile;
  const { data: venue, error } = await getPartnerVenue(venueId, profile.id);

  if (error || !venue) {
    notFound();
    return null;
  }

  const demand = await getVenuePulseData(venue.id, venue.reservation_fee);

  return (
    <BouncerModeClient
      venue={venue}
      demand={demand}
    />
  );
}
