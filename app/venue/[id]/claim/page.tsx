import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicVenueById } from '@/lib/queries/partner';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { ClaimVenueForm } from '@/components/venue/ClaimVenueForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data: venue } = await getPublicVenueById(id);

  if (!venue) {
    return { title: 'Claim Venue — OyaPlan' };
  }

  return {
    title: `Claim ${venue.name} — OyaPlan Partner Program`,
    description: `Take control of how ${venue.name} is represented on OyaPlan. Verify menu pricing, opening hours, and connect with people planning outings.`,
  };
}

export default async function ClaimVenuePage({ params }: Props) {
  const { id } = await params;
  const { data: venue } = await getPublicVenueById(id);

  if (!venue) {
    notFound();
    return null;
  }

  const identity = await SessionResolver.resolveIdentity();
  const initialUser = identity.type === 'authenticated' && identity.profile ? {
    id: identity.profile.id,
    email: identity.profile.email,
    name: identity.profile.display_name,
  } : null;

  return (
    <main className="min-h-[100dvh] bg-[#FAFAF8] antialiased py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto mb-6">
        <Link
          href={`/venue/${venue.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-midnight-lagoon uppercase tracking-wider transition-colors tap-feedback"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {venue.name}</span>
        </Link>
      </div>

      <ClaimVenueForm venue={venue} initialUser={initialUser} />
    </main>
  );
}
