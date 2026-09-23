import { Metadata } from 'next';
import { getInvitationPreviewAction } from '@/lib/actions/businessInvitationActions';
import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { BusinessTokenClaimClient } from '@/components/business/BusinessTokenClaimClient';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, MessageSquare, Search } from 'lucide-react';

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
      <main className="min-h-[100dvh] bg-[#FAFAF8] antialiased py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-border-default p-8 text-center space-y-6 shadow-sm">
          <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-midnight-lagoon uppercase tracking-tight">
              Invitation Link Unavailable
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {res.error || 'This invitation link has expired, has already been used, or is invalid.'}
            </p>
          </div>

          <div className="p-4 bg-surface-grey rounded-2xl text-xs text-text-muted text-left space-y-2">
            <span className="font-bold text-midnight-lagoon block uppercase text-[10px]">What can you do?</span>
            <p className="leading-relaxed">
              If your team was already invited, you can sign in to view your portal, search for your venue manually, or reach out to our Lagos partner team on WhatsApp.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <Link href="/business/claim" className="block w-full">
              <button className="w-full h-12 bg-[#008751] hover:bg-[#007043] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                <Search className="w-3.5 h-3.5" />
                <span>Search Listed Venues</span>
              </button>
            </Link>

            <a
              href="https://wa.me/2348000000000?text=Hi%20OyaPlan,%20my%20invitation%20link%20has%20expired%20or%20is%20not%20working"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <button className="w-full h-12 bg-white hover:bg-gray-50 border border-border-default text-midnight-lagoon font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer">
                <MessageSquare className="w-3.5 h-3.5 text-brand-green" />
                <span>Request New Link via WhatsApp</span>
              </button>
            </a>
          </div>
        </div>
      </main>
    );
  }

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

      <BusinessTokenClaimClient
        preview={res.preview}
        rawToken={token}
        initialUser={initialUser}
      />
    </main>
  );
}
