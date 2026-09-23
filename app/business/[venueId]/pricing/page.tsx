import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenue, getVenueMenuItems } from '@/lib/queries/partner';
import { BusinessPricingClient } from './BusinessPricingClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId } = await params;
  return {
    title: 'Pricing & Charges — OyaPlan for Business',
    description: 'Maintain accurate pricing and structured mandatory charges to build planner confidence.',
  };
}

export default async function BusinessPricingPage({ params }: Props) {
  const { venueId } = await params;
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect(`/account?next=/business/${venueId}/pricing`);
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
    <BusinessPricingClient
      venue={venue}
      initialMenuItems={menuItems}
    />
  );
}
