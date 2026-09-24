import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicVenueById, getVenueMenuItems, getVenuePhotos } from '@/lib/queries/partner';
import { PublicVenueClient } from './PublicVenueClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data: venue } = await getPublicVenueById(id);

  if (!venue) {
    return { title: 'Venue Not Found — OyaPlan' };
  }

  const spendText = venue.derived_typical_cost > 0
    ? `Typical spend ~₦${venue.derived_typical_cost.toLocaleString('en-NG')} per person.`
    : '';

  return {
    title: `${venue.name} — Lagos Outing Pricing & Plans | OyaPlan`,
    description: `Realistic Lagos outing plans for ${venue.name}. Verified menu prices, service charge, and budget confidence before you leave home. ${spendText}`,
    openGraph: {
      title: `${venue.name} — OyaPlan Budget Confidence`,
      description: `Plan an outing at ${venue.name} with transparent costs.`,
      images: venue.cover_url ? [venue.cover_url] : undefined,
    },
  };
}

export default async function PublicVenuePage({ params }: Props) {
  const { id } = await params;
  const { data: venue } = await getPublicVenueById(id);

  if (!venue) {
    notFound();
    return null;
  }

  const [menuItems, photos] = await Promise.all([
    getVenueMenuItems(venue.id),
    getVenuePhotos(venue.id),
  ]);

  const district = venue.districts;
  const areaName = district?.name || 'Lagos';
  const areaSlug = district?.slug || 'ikeja';

  return (
    <PublicVenueClient
      venue={venue}
      menuItems={menuItems}
      photos={photos}
      areaName={areaName}
      areaSlug={areaSlug}
    />
  );
}
