import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenue, getVenuePlanningInsights, getVenueMenuItems } from '@/lib/queries/partner';
import { getVenuePulseData } from '@/lib/queries/pulse';
import { RadarClient } from '@/components/pulse/RadarClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId } = await params;
  return {
    title: 'Radar — Narrative Squad Intelligence',
    description: 'Understand how Lagos squads plan around your venue: party sizes, primary occasions, and budget envelopes.',
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

  const [insights, demand, menuItems] = await Promise.all([
    getVenuePlanningInsights(venue.id),
    getVenuePulseData(venue.id, venue.reservation_fee),
    getVenueMenuItems(venue.id),
  ]);

  return (
    <RadarClient
      venue={venue}
      insights={insights}
      demand={demand}
      menuItems={menuItems}
    />
  );
}
