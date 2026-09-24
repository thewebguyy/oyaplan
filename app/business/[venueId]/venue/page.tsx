import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenue, getVenueMenuItems, getVenuePhotos } from '@/lib/queries/partner';
import { PartnerOnboardingClient } from '@/app/partner/[venueId]/onboarding/PartnerOnboardingClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
  searchParams?: Promise<{ step?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId } = await params;
  return {
    title: 'Venue Details & Listing — OyaPlan for Business',
    description: 'Update business hours, contact info, vibe tags, and photos to keep your OyaPlan presence current.',
  };
}

export default async function BusinessVenuePage({ params, searchParams }: Props) {
  const { venueId } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const initialStep = sp?.step ? Math.min(Math.max(parseInt(sp.step, 10) || 1, 1), 4) : 1;
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect(`/account?next=/business/${venueId}/venue`);
    return null;
  }

  const profile = identity.profile;
  const { data: venue, error } = await getPartnerVenue(venueId, profile.id);

  if (error || !venue) {
    notFound();
    return null;
  }

  const [menuItems, photos] = await Promise.all([
    getVenueMenuItems(venue.id),
    getVenuePhotos(venue.id),
  ]);

  return (
    <div className="space-y-6">
      <PartnerOnboardingClient
        venue={venue}
        initialMenuItems={menuItems}
        initialPhotos={photos}
        initialStep={initialStep}
      />
    </div>
  );
}
