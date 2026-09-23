import React from 'react';
import Link from 'next/link';
import { Venue } from '@/lib/types';
import { getVerificationText } from '@/lib/planning/presentation/decisionCardMapper';
import { ShieldCheck, Clock, Camera, ArrowRight } from 'lucide-react';

interface InformationFreshnessCardProps {
  venue: Venue;
  approvedPhotosCount?: number;
  baseRoute?: 'partner' | 'business';
}

export function InformationFreshnessCard({
  venue,
  approvedPhotosCount = 0,
  baseRoute = 'partner',
}: InformationFreshnessCardProps) {
  const priceFreshness = getVerificationText(venue.last_price_updated_at);
  const totalPhotos = approvedPhotosCount + (venue.gallery_urls?.length || 0) + (venue.cover_url ? 1 : 0);
  const venueEditorPath = baseRoute === 'business' ? `/business/${venue.id}/venue` : `/partner/${venue.id}/onboarding`;
  const pricingPath = `/${baseRoute}/${venue.id}/pricing`;

  return (
    <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-7 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-border-default/60 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-midnight-lagoon uppercase tracking-tight">
            Keep your information current
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Regular updates give squads confidence to pick your venue over competitors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Pricing */}
        <div className="p-4 bg-surface-grey rounded-2xl flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-text-muted font-bold">
              <ShieldCheck className="w-4 h-4 text-[#008751]" />
              <span>Pricing</span>
            </div>
            <p className="font-bold text-text-primary text-sm">{priceFreshness}</p>
          </div>
          <Link
            href={pricingPath}
            className="text-brand-green font-bold text-[11px] inline-flex items-center gap-1 hover:underline tap-feedback"
          >
            <span>Review pricing</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Opening Hours */}
        <div className="p-4 bg-surface-grey rounded-2xl flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-text-muted font-bold">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Opening Hours</span>
            </div>
            <p className="font-bold text-text-primary text-sm">
              {venue.opening_hours && Object.keys(venue.opening_hours).length > 0
                ? 'Confirmed schedule'
                : 'Not confirmed'}
            </p>
          </div>
          <Link
            href={`${venueEditorPath}?step=1`}
            className="text-brand-green font-bold text-[11px] inline-flex items-center gap-1 hover:underline tap-feedback"
          >
            <span>Update hours</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Photos */}
        <div className="p-4 bg-surface-grey rounded-2xl flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-text-muted font-bold">
              <Camera className="w-4 h-4 text-amber-600" />
              <span>Photos</span>
            </div>
            <p className="font-bold text-text-primary text-sm">
              {totalPhotos > 0 ? `${totalPhotos} photo${totalPhotos > 1 ? 's' : ''}` : 'No photos yet'}
            </p>
          </div>
          <Link
            href={`${venueEditorPath}?step=4`}
            className="text-brand-green font-bold text-[11px] inline-flex items-center gap-1 hover:underline tap-feedback"
          >
            <span>Manage photos</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
