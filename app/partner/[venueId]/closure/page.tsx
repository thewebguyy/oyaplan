import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenue } from '@/lib/queries/partner';
import { ClosureClient } from './ClosureClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId } = await params;
  return {
    title: `Temporary Availability — OyaPlan Partner`,
    description: `Report temporary closures or reopen your venue for OyaPlan itineraries.`,
  };
}

export default async function PartnerClosurePage({ params }: Props) {
  const { venueId } = await params;
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect(`/account?next=/partner/${venueId}/closure`);
  }

  const { data: venue, error } = await getPartnerVenue(venueId, identity.profile.id);

  if (error || !venue) {
    notFound();
  }

  return <ClosureClient venue={venue} />;
}
