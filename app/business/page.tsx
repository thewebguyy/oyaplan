import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenuesForUser } from '@/lib/queries/partner';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Building2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your Venues — OyaPlan for Business',
  description: 'Select a venue to manage pricing, hours, demand, and operational status.',
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
        <main className="min-h-[100dvh] bg-[#FAF7F2] antialiased py-12 px-4 sm:px-6">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-2.5 mb-2">
              <Image
                src="/logo.png"
                alt="OyaPlan"
                width={610}
                height={143}
                className="h-6 w-auto object-contain shrink-0"
                priority
              />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 py-0.5 rounded bg-surface-grey border border-border-default/60">
                Business
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-midnight-lagoon tracking-tight">
                Your Managed Venues
              </h1>
              <p className="text-xs sm:text-sm text-text-muted">
                Select a business to review and update.
              </p>
            </div>

            <div className="space-y-3">
              {venues.map(({ venue, role }) => (
                <Link
                  key={venue.id}
                  href={`/business/${venue.id}`}
                  className="block bg-white rounded-2xl border border-border-default p-5 shadow-xs hover:border-brand-green/60 transition-all tap-feedback"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <h2 className="text-base font-bold text-midnight-lagoon truncate">
                        {venue.name}
                      </h2>
                      <p className="text-xs text-text-muted truncate">{venue.address}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FAF7F2] text-[#7A3E1D] border border-[#EAE4DC]">
                        {role}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted shrink-0" />
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
