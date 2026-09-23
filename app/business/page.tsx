import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenuesForUser } from '@/lib/queries/partner';
import Link from 'next/link';
import { Store, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'OyaPlan for Business',
  description: 'Keep your venue information accurate, confirm prices, and understand how Lagos squads plan around your business.',
};

export default async function BusinessIndexPage() {
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type === 'authenticated' && identity.profile) {
    const venues = await getPartnerVenuesForUser(identity.profile.id);

    if (venues.length === 1 && venues[0]?.venue?.id) {
      redirect(`/business/${venues[0].venue.id}`);
      return null;
    }

    if (venues.length > 1) {
      return (
        <main className="min-h-[100dvh] bg-[#FAFAF8] antialiased py-12 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-black text-brand-green uppercase tracking-wider block">
                OyaPlan for Business
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon uppercase tracking-tight">
                Your Venues
              </h1>
              <p className="text-xs text-text-muted">
                Select a venue to manage.
              </p>
            </div>

            <div className="space-y-3">
              {venues.map(({ venue, role }) => (
                <Link
                  key={venue.id}
                  href={`/business/${venue.id}`}
                  className="block bg-white rounded-2xl border border-border-default p-5 shadow-xs hover:border-brand-green/60 transition-all tap-feedback"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-midnight-lagoon uppercase tracking-tight">
                        {venue.name}
                      </h2>
                      <p className="text-xs text-text-muted mt-0.5">{venue.address}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-surface-grey text-text-secondary">
                        {role}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      );
    }
  }

  // Unauthenticated or 0 venues — send to the public front door
  redirect('/for-business');
  return null;
}
