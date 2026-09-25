import React from 'react';
import { Venue } from '@/lib/types';
import { Clock, MapPin, Car, Shirt, Navigation, ShieldCheck, Store, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PublicOverviewSectionProps {
  venue: Venue;
}

export function PublicOverviewSection({ venue }: PublicOverviewSectionProps) {
  const isPartnerVerified = venue.partner_state === 'verified_partner';
  const openingHours = venue.opening_hours || {};
  const hasHours = Object.keys(openingHours).length > 0;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}, Lagos`)}`;

  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  return (
    <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-8 space-y-6 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-default/60 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-midnight-lagoon uppercase tracking-tight">
            Overview &amp; Operations
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Operating schedule, location access, and verified house guidelines.
          </p>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green hover:underline tap-feedback self-start sm:self-auto"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Get Directions (Google Maps) →</span>
        </a>
      </div>

      {/* Trust & Management Badge Block */}
      <div className={`p-4 rounded-2xl border ${isPartnerVerified ? 'bg-[#EAFDF3] border-[#A3F3C6] text-[#0A7C3F]' : 'bg-[#FAF7F2] border-[#EAE4DC] text-slate-800'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              {isPartnerVerified ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
                  <span className="uppercase tracking-wide font-extrabold text-[11px]">Direct Partner Managed</span>
                </>
              ) : (
                <>
                  <Store className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="uppercase tracking-wide font-extrabold text-[11px] text-slate-600">Community Indexed Profile</span>
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {isPartnerVerified
                ? `Menu prices, hours, and policies for ${venue.name} are directly updated and verified by the venue's management.`
                : `This spot's pricing and details were curated from public menus and Lagos outing reports. Are you the operator? Claim this venue to manage directly.`}
            </p>
          </div>

          {!isPartnerVerified && (
            <Link
              href={`/venue/${venue.id}/claim`}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE4DC] text-xs font-bold text-brand-green hover:bg-slate-50 shrink-0 transition-colors shadow-xs"
            >
              Claim Spot
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Hours */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black text-midnight-lagoon uppercase tracking-wider">
            <Clock className="w-4 h-4 text-brand-green" />
            <span>Operating Hours</span>
          </div>

          {hasHours ? (
            <div className="bg-surface-grey rounded-2xl p-4 divide-y divide-gray-200/60 text-xs">
              {Object.entries(openingHours).map(([day, hours]) => {
                const isToday = day.toLowerCase() === currentDayName;
                return (
                  <div
                    key={day}
                    className={`py-2 flex justify-between items-center ${
                      isToday ? 'font-bold text-brand-green' : ''
                    }`}
                  >
                    <span className="capitalize flex items-center gap-1.5">
                      {isToday && <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />}
                      <span>{day}</span>
                    </span>
                    <span className="font-mono">{hours}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-surface-grey rounded-2xl text-xs text-text-muted">
              Standard operating hours apply. Typically open afternoons &amp; evenings.
            </div>
          )}
        </div>

        {/* Right Column: Practical Outing Notes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black text-midnight-lagoon uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-brand-green" />
            <span>Practical Outing Logistics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Parking */}
            <div className="p-3 bg-surface-grey rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-text-muted font-bold">
                <Car className="w-3.5 h-3.5 text-brand-green" />
                <span>Parking</span>
              </div>
              <p className="font-bold text-text-primary">
                {venue.has_parking ? 'Dedicated / Valet available' : 'Limited street parking'}
              </p>
            </div>

            {/* Dress code */}
            <div className="p-3 bg-surface-grey rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-text-muted font-bold">
                <Shirt className="w-3.5 h-3.5 text-brand-green" />
                <span>Dress Code</span>
              </div>
              <p className="font-bold text-text-primary capitalize">
                {venue.dress_code ? venue.dress_code.replace('_', ' ') : 'Smart casual'}
              </p>
            </div>
          </div>

          {/* Table Policies if defined */}
          {venue.table_policies && venue.table_policies.length > 0 && (
            <div className="p-4 rounded-xl bg-surface-grey space-y-2 text-xs">
              <span className="font-bold text-midnight-lagoon uppercase tracking-wider text-[10px] block">
                Table &amp; Reservation Policies
              </span>
              <div className="space-y-1 text-slate-700">
                {venue.table_policies.map((p) => (
                  <div key={p.id} className="flex justify-between items-center py-1 border-b border-slate-200/50 last:border-none">
                    <span className="capitalize font-medium">{p.name || p.seating_type.replace('_', ' ')}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {p.minimum_spend > 0 ? `₦${p.minimum_spend.toLocaleString('en-NG')} min` : 'Standard'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
