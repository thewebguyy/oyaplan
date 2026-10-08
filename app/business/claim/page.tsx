import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getVenuesForClaimSearch } from '@/lib/queries/partner';
import { ClaimSearchClient } from '@/components/business/ClaimSearchClient';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Check Your Outside Math — OyaPlan for Business',
  description: 'Search your restaurant, café, or lounge in Lagos to inspect your live Till Slip, update prices, and earn the OyaPlan Vetted Venue badge.',
};

export default async function BusinessClaimSearchPage() {
  const venues = await getVenuesForClaimSearch();
  const waUrl = getBusinessWhatsAppUrl('claim_support');

  return (
    <div className="min-h-[100dvh] bg-[#141210] text-[#F5F1E8] antialiased flex flex-col font-sans selection:bg-[#E59A28]/30">
      {/* ── House Ledger Executive Header ── */}
      <header className="w-full bg-[#1E1B18] text-[#F5F1E8] border-b border-[#2D2823] shadow-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/for-business" className="flex items-center gap-2.5 tap-feedback">
              <Image
                src="/logo.png"
                alt="OyaPlan"
                width={610}
                height={143}
                className="h-7 w-auto object-contain shrink-0 invert brightness-200"
                style={{ width: "auto", height: "26px" }}
                priority
              />
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-[#E59A28] bg-[#E59A28]/15 border border-[#E59A28]/30 px-2.5 py-0.5 rounded-full uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E59A28] animate-pulse" />
                VENUE LEDGER
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs font-bold">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[#E59A28] bg-[#E59A28]/10 hover:bg-[#E59A28]/20 border border-[#E59A28]/30 transition-colors tap-feedback"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Menu Audit Desk</span>
              </a>
            )}
            <Link
              href="/for-business"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[#F5F1E8] bg-[#2D2823] hover:bg-[#38322C] border border-[#2D2823] transition-colors tap-feedback"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Claim Portal ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 pb-20">
        <ClaimSearchClient initialVenues={venues} />
      </main>
    </div>
  );
}
