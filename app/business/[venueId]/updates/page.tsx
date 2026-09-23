import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenue } from '@/lib/queries/partner';
import { BusinessUpdatesClient } from './BusinessUpdatesClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId } = await params;
  return {
    title: 'Operational Status & Updates — OyaPlan for Business',
    description: 'Report temporary closures, holiday schedules, or maintenance to keep planners informed.',
  };
}

export default async function BusinessUpdatesPage({ params }: Props) {
  const { venueId } = await params;
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect(`/account?next=/business/${venueId}/updates`);
    return null;
  }

  const profile = identity.profile;
  const { data: venue, error } = await getPartnerVenue(venueId, profile.id);

  if (error || !venue) {
    notFound();
    return null;
  }

  return <BusinessUpdatesClient venue={venue} />;
}
