import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { getPartnerVenuesForUser, getVenuesForClaimSearch } from '@/lib/queries/partner';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Building2, ShieldCheck, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your Venues — OyaPlan for Business',
  description: 'Select a venue to manage pricing, hours, demand, and operational status.',
};

export default async function BusinessIndexPage() {
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type === 'authenticated' && identity.profile) {
    const venues = await getPartnerVenuesForUser(identity.profile.id);

    const isAdminUser = identity.profile.role === 'admin' || venues.some(v => v.role.includes('Admin'));

    if (venues.length === 1 && venues[0]?.venue?.id && !isAdminUser) {
      redirect(`/business/${venues[0].venue.id}`);
      return null;
    }

    if (venues.length >= 1) {
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
                  THE FLOOR
                </span>
              </div>

              {isAdminUser && (
                <Link
                  href="/admin/venues"
                  className="text-[11px] font-mono font-bold text-stone-600 hover:text-black bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg border border-stone-200 transition-colors"
                >
                  Admin Master Catalog →
                </Link>
              )}
            </div>
          </header>

          <main className="flex-1 max-w-xl w-full mx-auto py-10 px-4 sm:px-6 space-y-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Venues on The Floor
                </h1>
                {isAdminUser && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-[#00E575] border border-emerald-500/20">
                    Admin Preview Mode
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-white/60">
                Select a venue to enter live table management, guestlists, and pulse telemetry.
              </p>
            </div>

            <div className="space-y-3">
              {venues.map(({ venue, role }) => (
                <div
                  key={venue.id}
                  className="bg-[#121418] rounded-2xl border border-[#232732] p-5 shadow-lg hover:border-[#008751]/60 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <h2 className="text-base font-bold text-white truncate">
                        {venue.name}
                      </h2>
                      <p className="text-xs text-white/60 truncate">{venue.address}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-white/5 text-[#00E575] border border-white/10">
                        {role}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#232732]">
                    <Link
                      href={`/business/${venue.id}/reservations`}
                      className="px-3 py-2 rounded-xl bg-[#008751] hover:bg-[#009E5F] text-white text-xs font-bold font-mono text-center transition-all flex items-center justify-center gap-1.5 tap-feedback"
                    >
                      <span>Access The Floor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/business/${venue.id}`}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold font-mono text-center transition-all flex items-center justify-center gap-1.5 tap-feedback"
                    >
                      <span>The Pulse</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white/60" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      );
    }

    // Authenticated user with 0 linked venues: render the Welcome & Simulator Hub on The Floor
    const availableVenues = await getVenuesForClaimSearch();
    const previewList = availableVenues.slice(0, 8);

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
                THE FLOOR
              </span>
            </div>

            <Link
              href="/business/claim"
              className="text-[11px] font-mono font-bold text-[#0D0E11] bg-[#E59A28] hover:bg-[#D48B1B] px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider"
            >
              Claim Venue →
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-xl w-full mx-auto py-8 px-4 sm:px-6 space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#12151B] to-[#171B24] border border-[#232732] space-y-4 shadow-xl">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E575] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Sparkles className="w-3 h-3" />
                WELCOME TO THE FLOOR
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Hospitality Command Center
              </h1>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                You haven&apos;t linked an operating venue yet. Claim your spot to verify pricing, approve table requests, and receive direct deposits.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/business/claim"
                className="w-full h-12 rounded-xl bg-[#E59A28] hover:bg-[#D48B1B] text-[#0D0E11] font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md tap-feedback"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Search &amp; Claim Your Venue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Explore Sample Venue Floors
              </h2>
              <p className="text-xs text-white/60">
                Preview live telemetry, demand radar, and floor squad approvals.
              </p>
            </div>

            <div className="space-y-2.5">
              {previewList.map((venue) => (
                <div
                  key={venue.id}
                  className="bg-[#121418] rounded-2xl border border-[#232732] p-4 hover:border-[#008751]/50 transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="text-sm font-bold text-white truncate">{venue.name}</h3>
                    <p className="text-xs text-white/50 truncate">{venue.address || venue.district_name || 'Lagos, Nigeria'}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/business/${venue.id}/reservations`}
                      className="px-2.5 py-1.5 rounded-lg bg-[#008751] hover:bg-[#009E5F] text-white text-[11px] font-bold font-mono transition-all flex items-center gap-1 tap-feedback"
                    >
                      <span>Floor</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link
                      href={`/business/${venue.id}`}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-bold font-mono transition-all flex items-center gap-1 tap-feedback"
                    >
                      <span>Pulse</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Unauthenticated — send to Access The Floor
  redirect('/login/business?returnTo=/business');
  return null;
}
