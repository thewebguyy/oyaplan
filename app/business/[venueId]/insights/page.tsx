import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenue, getVenuePlanningInsights } from '@/lib/queries/partner';
import { BusinessInsightsClient } from './BusinessInsightsClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId } = await params;
  return {
    title: 'Planning Insights — OyaPlan for Business',
    description: 'Understand how Lagos squads plan around your venue, group sizes, and budget envelopes.',
  };
}

export default async function BusinessInsightsPage({ params }: Props) {
  const { venueId } = await params;
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect(`/login/business?returnTo=/business/${venueId}/insights`);
    return null;
  }

  const profile = identity.profile;
  const { data: venue, error } = await getPartnerVenue(venueId, profile.id);

  if (error || !venue) {
    notFound();
    return null;
  }

  const insights = await getVenuePlanningInsights(venue.id);

  return (
    <BusinessInsightsClient
      venue={venue}
      insights={insights}
    />
  );
}
