import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenue, getVenueDemandActivity } from '@/lib/queries/partner';
import { BusinessActivityClient } from './BusinessActivityClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId } = await params;
  return {
    title: 'Demand Activity — OyaPlan for Business',
    description: 'Track genuine squad planning activity, WhatsApp plan shares, and confirmed outings.',
  };
}

export default async function BusinessActivityPage({ params }: Props) {
  const { venueId } = await params;
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect(`/login/business?returnTo=/business/${venueId}/activity`);
    return null;
  }

  const profile = identity.profile;
  const { data: venue, error } = await getPartnerVenue(venueId, profile.id);

  if (error || !venue) {
    notFound();
    return null;
  }

  const activity = await getVenueDemandActivity(venue.id);

  return (
    <BusinessActivityClient
      venue={venue}
      activity={activity}
    />
  );
}
