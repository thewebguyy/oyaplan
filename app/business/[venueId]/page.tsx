import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getPartnerVenue,
  getVenueMenuItems,
  getVenuePhotos,
  calculateProfileHealth,
  getVenueDemandActivity,
  getVenuePlanningInsights,
} from '@/lib/queries/partner';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { redirect } from 'next/navigation';
import { BusinessHomeClient } from './BusinessHomeClient';
import type { VenuePhoto } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId } = await params;
  return {
    title: 'Business Home — OyaPlan for Business',
    description: 'Understand what needs attention, how customers see your venue, and what OyaPlan is doing for your business.',
  };
}

export default async function BusinessHomePage({ params }: Props) {
  const { venueId } = await params;
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect(`/login/business?returnTo=/business/${venueId}`);
    return null;
  }

  const { data: venue, error } = await getPartnerVenue(venueId, identity.profile.id);
  if (error || !venue) {
    notFound();
    return null;
  }

  const [menuItems, photos, activity, insights] = await Promise.all([
    getVenueMenuItems(venue.id),
    getVenuePhotos(venue.id),
    getVenueDemandActivity(venue.id),
    getVenuePlanningInsights(venue.id),
  ]);

  const approvedPhotos = photos.filter((p: VenuePhoto) => p.status === 'approved').length;
  const health = calculateProfileHealth(venue, menuItems, approvedPhotos, 'business');

  return (
    <BusinessHomeClient
      venue={venue}
      health={health}
      activity={activity}
      insights={insights}
      menuItems={menuItems}
      photos={photos}
    />
  );
}
