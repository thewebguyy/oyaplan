import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenue, getVenueMenuItems } from '@/lib/queries/partner';
import { PartnerPricingClient } from './PartnerPricingClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId } = await params;
  return {
    title: `Pricing & Transparency — OyaPlan Partner`,
    description: `Maintain accurate, auditable pricing and structured mandatory charges.`,
  };
}

export default async function PartnerPricingPage({ params }: Props) {
  const { venueId } = await params;
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect(`/account?next=/partner/${venueId}/pricing`);
  }

  const { data: venue, error } = await getPartnerVenue(venueId, identity.profile.id);

  if (error || !venue) {
    notFound();
  }

  const menuItems = await getVenueMenuItems(venue.id);

  return (
    <PartnerPricingClient
      venue={venue}
      initialMenuItems={menuItems}
    />
  );
}
