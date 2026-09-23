import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenue, getVenueMenuItems, getVenuePhotos } from '@/lib/queries/partner';
import { PartnerOnboardingClient } from './PartnerOnboardingClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId } = await params;
  return {
    title: `Listing Onboarding — OyaPlan Partner`,
    description: `Complete your OyaPlan listing details to build budget confidence for planners.`,
  };
}

export default async function PartnerOnboardingPage({ params }: Props) {
  const { venueId } = await params;
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect(`/account?next=/partner/${venueId}/onboarding`);
  }

  const { data: venue, error } = await getPartnerVenue(venueId, identity.profile.id);

  if (error || !venue) {
    notFound();
  }

  const [menuItems, photos] = await Promise.all([
    getVenueMenuItems(venue.id),
    getVenuePhotos(venue.id),
  ]);

  return (
    <PartnerOnboardingClient
      venue={venue}
      initialMenuItems={menuItems}
      initialPhotos={photos}
    />
  );
}
