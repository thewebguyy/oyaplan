import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenuesForUser } from '@/lib/queries/partner';
import { getForgeSpots } from '@/lib/queries/spots';
import Link from 'next/link';
import { Store, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Partner Portal — OyaPlan Supply Network',
  description: 'Keep your venue data accurate, verify prices, and reach Lagos squads actively planning outings.',
};

export default async function PartnerPortalIndexPage() {
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated' || !identity.profile) {
    return (
      <main className="min-h-[100dvh] bg-[#FAFAF8] antialiased py-16 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-border-default p-8 sm:p-10 space-y-6 shadow-md text-center">
          <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Store className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="type-ui-label text-xs font-black text-brand-green uppercase tracking-wider block">
              OyaPlan Partner Program
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon uppercase tracking-tight">
              Reach people actively planning to spend
            </h1>
            <p className="type-body text-xs sm:text-sm text-text-muted leading-relaxed">
              OyaPlan builds realistic outing plans for Lagos squads based on transparent pricing. Claim your listing to keep information current and understand the demand we send your way.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link href="/account?next=/partner">
              <button className="w-full h-14 bg-[#008751] hover:bg-[#007043] text-white font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer">
                <span>Sign in to Partner Home</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <Link href="/explore">
              <button className="w-full h-12 bg-surface-grey hover:bg-black/5 text-midnight-lagoon font-bold text-xs uppercase tracking-wider rounded-xl transition-all">
                Browse Listed Venues to Claim
              </button>
            </Link>
          </div>

          <div className="border-t border-border-default/50 pt-4 text-[11px] text-text-muted">
            Free to claim. We do not charge listing fees or mandatory subscriptions.
          </div>
        </div>
      </main>
    );
  }

  const partnerVenues = await getPartnerVenuesForUser(identity.profile.id);

  // If user manages exactly 1 venue, redirect directly to their partner home
  if (partnerVenues.length === 1 && partnerVenues[0]?.venue?.id) {
    redirect(`/partner/${partnerVenues[0].venue.id}`);
    return null;
  }

  // If user manages multiple venues, show a switcher
  if (partnerVenues.length > 1) {
    return (
      <main className="min-h-[100dvh] bg-[#FAFAF8] antialiased py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="type-ui-label text-xs font-black text-brand-green uppercase tracking-wider">
              Partner Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon uppercase tracking-tight">
              Your Managed Venues
            </h1>
            <p className="type-body text-xs sm:text-sm text-text-muted">
              Select a venue to manage pricing, photos, and view demand.
            </p>
          </div>

          <div className="space-y-3">
            {partnerVenues.map(({ venue, role }) => (
              <Link
                key={venue.id}
                href={`/partner/${venue.id}`}
                className="block bg-white rounded-2xl border border-border-default p-5 shadow-xs hover:border-brand-green/60 transition-all tap-feedback"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-midnight-lagoon uppercase tracking-tight">
                      {venue.name}
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">{venue.address}</p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-surface-grey text-text-secondary">
                      Role: {role}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // User is logged in, but has 0 claimed venues yet
  const { data: spots } = await getForgeSpots();

  return (
    <main className="min-h-[100dvh] bg-[#FAFAF8] antialiased py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-border-default p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-brand-green" />
            <span className="type-ui-label text-xs font-black text-brand-green uppercase tracking-wider">
              No Venues Linked Yet
            </span>
          </div>
          <h1 className="text-2xl font-black text-midnight-lagoon uppercase tracking-tight">
            Claim your business on OyaPlan
          </h1>
          <p className="type-body text-xs sm:text-sm text-text-muted leading-relaxed">
            You don&apos;t have any approved venue listings associated with your account yet. Find your venue below or search our catalog to claim it.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-black text-text-muted uppercase tracking-wider">
            Popular Spots to Claim
          </h2>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
            {(spots || []).slice(0, 15).map((spot) => (
              <div key={spot.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-text-primary text-sm">{spot.name}</h3>
                  <p className="text-text-muted">{spot.address}</p>
                </div>
                <Link
                  href={`/venue/${spot.id}/claim`}
                  className="px-3.5 py-1.5 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded-lg uppercase tracking-wider text-[11px] tap-feedback shrink-0"
                >
                  Claim
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
