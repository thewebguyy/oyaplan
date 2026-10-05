import { Metadata } from 'next';
import { getInvitationPreviewAction } from '@/lib/actions/businessInvitationActions';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { BusinessTokenClaimClient } from '@/components/business/BusinessTokenClaimClient';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, AlertCircle, MessageSquare, Search } from 'lucide-react';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const res = await getInvitationPreviewAction(token);

  if (res.success && res.preview) {
    return {
      title: `Claim ${res.preview.venueName} — OyaPlan for Business`,
      description: `Review your pre-populated OyaPlan listing and claim your business for ${res.preview.venueName}.`,
    };
  }

  return {
    title: 'Claim Invitation — OyaPlan for Business',
    description: 'Claim your venue listing on OyaPlan.',
  };
}

export default async function BusinessTokenClaimPage({ params }: Props) {
  const { token } = await params;
  const res = await getInvitationPreviewAction(token);
  const identity = await SessionResolver.resolveIdentity();

  const initialUser = identity.type === 'authenticated' && identity.profile ? {
    id: identity.profile.id,
    email: identity.profile.email,
    name: identity.profile.display_name,
  } : null;

  // Invalid / Expired / Consumed state
  if (!res.success || !res.preview) {
    return (
      <main className="min-h-[100dvh] bg-[#FAF7F2] antialiased py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-border-default p-6 sm:p-8 text-center space-y-6 shadow-xs">
          <div className="w-12 h-12 bg-[#FAF7F2] text-[#7A3E1D] border border-[#EAE4DC] rounded-xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-extrabold text-midnight-lagoon tracking-tight">
              Invitation Link Unavailable
            </h1>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              {res.error || 'This invitation link has expired, has already been used, or is invalid.'}
            </p>
          </div>

          <div className="p-4 bg-[#FAF7F2] border border-[#EAE4DC]/60 rounded-xl text-xs text-text-muted text-left space-y-1.5">
            <span className="font-bold text-midnight-lagoon block">What should I do?</span>
            <p>1. If you already completed this claim, sign in to the Operator&apos;s Desk.</p>
            <p>2. If you need a new invitation token, reach out to our Lagos team on WhatsApp.</p>
          </div>

          <div className="space-y-2 pt-2">
            <Link href="/login/business?returnTo=/business" className="block">
              <button className="w-full h-11 bg-midnight-lagoon hover:bg-[#00041f] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer tap-feedback">
                Sign In to Operator&apos;s Desk
              </button>
            </Link>

            <Link href="/business/claim" className="block">
              <button className="w-full h-11 bg-surface-grey hover:bg-gray-100 text-midnight-lagoon text-xs font-bold uppercase tracking-wider rounded-xl border border-border-default transition-all flex items-center justify-center gap-1.5 tap-feedback">
                <Search className="w-3.5 h-3.5 text-text-muted" />
                <span>Search for Your Venue</span>
              </button>
            </Link>

            {(() => {
              const waUrl = getBusinessWhatsAppUrl('invitation_help');
              if (!waUrl) return null;
              return (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 bg-[#EAFDF3] hover:bg-[#D5F9E4] text-[#0A7C3F] border border-[#A3F3C6] text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all tap-feedback"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Contact OyaPlan Operations</span>
                </a>
              );
            })()}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[#FAF7F2] antialiased py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between">
        <Link
          href="/for-business"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-midnight-lagoon uppercase tracking-wider transition-colors tap-feedback"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to OyaPlan for Business</span>
        </Link>

        <Image
          src="/logo.png"
          alt="OyaPlan"
          width={610}
          height={143}
          className="h-5 w-auto object-contain shrink-0 opacity-80"
        />
      </div>

      <BusinessTokenClaimClient
        preview={res.preview}
        rawToken={token}
        initialUser={initialUser}
      />
    </main>
  );
}
