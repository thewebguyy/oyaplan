import { Metadata } from 'next';
import { getVenuesForClaimSearch } from '@/lib/queries/partner';
import { ClaimSearchClient } from '@/components/business/ClaimSearchClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Find & Claim Your Venue — OyaPlan for Business',
  description: 'Search for your venue in Lagos to verify business information and connect with customers planning outings.',
};

export default async function BusinessClaimSearchPage() {
  const venues = await getVenuesForClaimSearch();

  return (
    <main className="min-h-[100dvh] bg-[#FAFAF8] antialiased py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto mb-6">
        <Link
          href="/for-business"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-midnight-lagoon uppercase tracking-wider transition-colors tap-feedback"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to OyaPlan for Business</span>
        </Link>
      </div>

      <ClaimSearchClient initialVenues={venues} />
    </main>
  );
}
