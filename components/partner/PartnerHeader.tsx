'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Venue } from '@/lib/types';
import { ShieldCheck, ExternalLink, MessageCircle } from 'lucide-react';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';

interface PartnerHeaderProps {
  venue: Venue;
}

export function PartnerHeader({ venue }: PartnerHeaderProps) {
  const pathname = usePathname();

  const isVerified = venue.partner_state === 'verified_partner';

  const navLinks = [
    { label: 'Home', href: `/partner/${venue.id}` },
    { label: 'Pricing', href: `/partner/${venue.id}/pricing` },
    { label: 'Profile & Setup', href: `/partner/${venue.id}/onboarding` },
    { label: 'Closure', href: `/partner/${venue.id}/closure` },
  ];

  return (
    <header className="w-full bg-white border-b border-border-default sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Top brand bar */}
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/partner/${venue.id}`} className="tap-feedback">
              <span className="text-lg font-black tracking-tighter uppercase text-midnight-lagoon">
                OyaPlan
              </span>
            </Link>
            <span className="text-gray-300">/</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase text-text-primary tracking-tight truncate max-w-[140px] sm:max-w-xs">
                {venue.name}
              </span>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EAFDF3] text-[#0A7C3F]">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700">
                  {venue.partner_state === 'verification_pending' ? 'In Review' : 'Claimed'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(() => {
              const waUrl = getBusinessWhatsAppUrl('general_support', { venueName: venue.name });
              if (!waUrl) return null;
              return (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#008751] bg-[#EAFDF3] hover:bg-[#daf8e7] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Support</span>
                </a>
              );
            })()}

            <Link
              href={`/venue/${venue.id}`}
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-text-muted hover:text-midnight-lagoon hover:bg-surface-grey transition-colors"
            >
              <span>Public Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto hide-scrollbar -mb-px">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors tap-feedback ${
                  isActive
                    ? 'border-[#008751] text-[#008751]'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
