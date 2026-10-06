import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenue, getVenueMenuItems } from '@/lib/queries/partner';
import { TheBoardClient } from '@/components/pulse/TheBoardClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId } = await params;
  return {
    title: 'The Board — Live Menu & Availability',
    description: 'Control what customers can order. 86 sold-out items instantly and manage customer pricing.',
  };
}

export default async function BusinessPricingPage({ params }: Props) {
  const { venueId } = await params;
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect(`/login/business?returnTo=/business/${venueId}/pricing`);
    return null;
  }

  const profile = identity.profile;
  const { data: venue, error } = await getPartnerVenue(venueId, profile.id);

  if (error || !venue) {
    notFound();
    return null;
  }

  const menuItems = await getVenueMenuItems(venue.id);

  return (
    <TheBoardClient
      venue={venue}
      initialMenuItems={menuItems}
    />
  );
}
