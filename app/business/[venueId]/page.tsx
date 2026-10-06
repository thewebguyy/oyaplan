import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getPartnerVenue, getVenueMenuItems, getVenuePhotos } from '@/lib/queries/partner';
import { getVenuePulseData } from '@/lib/queries/pulse';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { ThePulseClient } from '@/components/pulse/ThePulseClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId } = await params;
  return {
    title: 'The Pulse — Live Hospitality Command Center',
    description: 'Monitor tonight’s demand, broadcast capacity, review incoming squads, and control venue state in real time.',
  };
}

export default async function BusinessHomePage({ params }: Props) {
  const { venueId } = await params;
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect(`/login/business?returnTo=/business/${venueId}`);
    return null;
  }

  const { data: venue, error } = await getPartnerVenue(venueId, identity.profile.id);
  if (error || !venue) {
    notFound();
    return null;
  }

  const [demand, menuItems, photos] = await Promise.all([
    getVenuePulseData(venue.id, venue.reservation_fee),
    getVenueMenuItems(venue.id),
    getVenuePhotos(venue.id),
  ]);

  return (
    <ThePulseClient
      venue={venue}
      demand={demand}
      menuItems={menuItems}
      photos={photos}
    />
  );
}
