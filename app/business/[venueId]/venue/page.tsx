import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenue, getVenuePhotos } from '@/lib/queries/partner';
import { HouseRulesClient } from '@/components/pulse/HouseRulesClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId } = await params;
  return {
    title: 'House Rules & Live Vibe — The Pulse',
    description: 'Define venue boundaries, toggle corkage and dress codes, and edit your live venue presentation.',
  };
}

export default async function BusinessVenuePage({ params }: Props) {
  const { venueId } = await params;
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect(`/login/business?returnTo=/business/${venueId}/venue`);
    return null;
  }

  const profile = identity.profile;
  const { data: venue, error } = await getPartnerVenue(venueId, profile.id);

  if (error || !venue) {
    notFound();
    return null;
  }

  const photos = await getVenuePhotos(venue.id);

  return (
    <HouseRulesClient
      venue={venue}
      photos={photos}
    />
  );
}
