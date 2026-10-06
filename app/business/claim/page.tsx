import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getVenuesForClaimSearch } from '@/lib/queries/partner';
import { ClaimSearchClient } from '@/components/business/ClaimSearchClient';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Who's on the Floor? — OyaPlan for Business",
  description: 'Search for your venue in Lagos to verify your host stand, broadcast live demand, and connect with squads planning outings.',
};

export default async function BusinessClaimSearchPage() {
  const venues = await getVenuesForClaimSearch();
  const waUrl = getBusinessWhatsAppUrl('claim_support');

  return (
    <div className="min-h-[100dvh] bg-[#090A0D] text-[#F8F9FA] antialiased flex flex-col font-sans selection:bg-[#008751]/30">
      {/* ── Crisp White Business Header with Original Logo ── */}
      <header className="w-full bg-[#FFFFFF] text-[#111111] border-b border-[#EAE4DC] shadow-xs sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/for-business" className="flex items-center gap-2.5 tap-feedback">
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
            </Link>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs font-bold">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[#008751] bg-[#008751]/10 hover:bg-[#008751]/20 border border-[#008751]/25 transition-colors tap-feedback"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Host Concierge</span>
              </a>
            )}
            <Link
              href="/for-business"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors tap-feedback"
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
