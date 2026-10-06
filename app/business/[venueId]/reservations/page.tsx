import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenue } from '@/lib/queries/partner';
import { getVenuePulseData } from '@/lib/queries/pulse';
import { TheFloorClient } from '@/components/pulse/TheFloorClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId } = await params;
  return {
    title: 'The Floor — Squad Approvals & Guestlist',
    description: 'Review incoming squads, approve table deposits with swipe gestures, and manage tonight’s guestlist.',
  };
}

export default async function BusinessReservationsPage({ params }: Props) {
  const { venueId } = await params;
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect(`/login/business?returnTo=/business/${venueId}/reservations`);
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
    <TheFloorClient
      venue={venue}
      demand={demand}
    />
  );
}
