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
        <div className="min-h-[100dvh] bg-[#090A0D] text-white antialiased flex flex-col font-sans selection:bg-[#008751]/30">
          {/* ── Crisp White Business Header with Original Logo ── */}
          <header className="w-full bg-[#FFFFFF] text-[#111111] border-b border-[#EAE4DC] shadow-xs sticky top-0 z-40">
            <div className="max-w-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/logo.png"
                  alt="OyaPlan"
                  width={610}
                  height={143}
                  className="h-7 w-auto object-contain shrink-0"
                  style={{ width: "auto", height: "26px" }}
                  priority
                />
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-[#008751] bg-[#008751]/10 border border-[#008751]/25 px-2.5 py-0.5 rounded-full uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#008751] animate-pulse" />
                  THE PULSE
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-xl w-full mx-auto py-10 px-4 sm:px-6 space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Your Venues on the Floor
              </h1>
              <p className="text-xs sm:text-sm text-white/60">
                Select a venue to enter The Pulse command center.
              </p>
            </div>

            <div className="space-y-3">
              {venues.map(({ venue, role }) => (
                <Link
                  key={venue.id}
                  href={`/business/${venue.id}`}
                  className="block bg-[#121418] rounded-2xl border border-[#232732] p-5 shadow-lg hover:border-[#008751] transition-all tap-feedback"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <h2 className="text-base font-bold text-white truncate">
                        {venue.name}
                      </h2>
                      <p className="text-xs text-white/60 truncate">{venue.address}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-white/5 text-[#00E575] border border-white/10">
                        {role}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#00E575] shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </main>
        </div>
      );
    }

    // Authenticated user with 0 linked venues: send directly to claim flow with first-time onboarding state
    if (venues.length === 0) {
      redirect('/business/claim?firstTime=true');
      return null;
    }
  }

  // Unauthenticated — send to Access The Floor
  redirect('/login/business?returnTo=/business');
  return null;
}
