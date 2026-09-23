import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { 
  getPartnerVenue, 
  getVenueMenuItems, 
  getVenuePhotos, 
  calculateProfileHealth, 
  getVenueDemandActivity, 
  getVenuePlanningInsights 
} from '@/lib/queries/partner';
import { PartnerHomeClient } from './PartnerHomeClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId } = await params;
  return {
    title: `Partner Home — OyaPlan Supply Network`,
    description: `Manage your venue presence and see planning demand on OyaPlan.`,
  };
}

export default async function PartnerHomePage({ params }: Props) {
  const { venueId } = await params;
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    redirect(`/account?next=/partner/${venueId}`);
  }

  const { data: venue, error } = await getPartnerVenue(venueId, identity.profile.id);

  if (error || !venue) {
    // If venue doesn't exist or unauthorized
    notFound();
  }

  const [menuItems, photos, activity, insights] = await Promise.all([
    getVenueMenuItems(venue.id),
    getVenuePhotos(venue.id),
    getVenueDemandActivity(venue.id),
    getVenuePlanningInsights(venue.id),
  ]);

  const approvedPhotos = photos.filter(p => p.status === 'approved').length;
  const health = calculateProfileHealth(venue, menuItems, approvedPhotos);

  return (
    <PartnerHomeClient
      venue={venue}
      health={health}
      activity={activity}
      insights={insights}
      menuItems={menuItems}
      photos={photos}
    />
  );
}
