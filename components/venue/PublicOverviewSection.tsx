import React from 'react';
import { Venue } from '@/lib/types';
import { Clock, MapPin, Car, Shirt, Phone, Calendar, AtSign } from 'lucide-react';

interface PublicOverviewSectionProps {
  venue: Venue;
}

export function PublicOverviewSection({ venue }: PublicOverviewSectionProps) {
  const openingHours = venue.opening_hours || {};
  const hasHours = Object.keys(openingHours).length > 0;

  return (
    <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-8 space-y-6 shadow-xs">
      <h2 className="text-xl sm:text-2xl font-black text-midnight-lagoon uppercase tracking-tight">
        Overview &amp; Operations
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Hours */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black text-midnight-lagoon uppercase tracking-wider">
            <Clock className="w-4 h-4 text-brand-green" />
            <span>Opening Hours</span>
          </div>

          {hasHours ? (
            <div className="bg-surface-grey rounded-2xl p-4 divide-y divide-gray-200/60 text-xs">
              {Object.entries(openingHours).map(([day, hours]) => (
                <div key={day} className="py-2 flex justify-between items-center">
                  <span className="font-semibold text-text-secondary capitalize">{day}</span>
                  <span className="font-mono font-bold text-text-primary">{hours}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-surface-grey rounded-2xl text-xs text-text-muted">
              Standard operating hours apply. Typically open afternoons &amp; evenings.
            </div>
          )}

          {venue.is_temporarily_closed && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
              <span className="font-bold block uppercase tracking-wide text-[10px]">Temporarily Unavailable</span>
              <p>{venue.temporary_closure_reason || 'Currently undergoing scheduled maintenance or private event.'}</p>
              {venue.temporary_closure_end && (
                <p className="font-mono text-[11px] text-amber-900">
                  Expected to reopen: {new Date(venue.temporary_closure_end).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Practical Outing Notes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black text-midnight-lagoon uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-brand-green" />
            <span>Planning Facts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Parking */}
            <div className="p-3 bg-surface-grey rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-text-muted font-bold">
                <Car className="w-3.5 h-3.5 text-brand-green" />
                <span>Parking</span>
              </div>
              <p className="font-bold text-text-primary">
                {venue.has_parking ? 'Parking space available' : 'Limited street parking'}
              </p>
            </div>

            {/* Dress code */}
            <div className="p-3 bg-surface-grey rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-text-muted font-bold">
                <Shirt className="w-3.5 h-3.5 text-brand-green" />
                <span>Dress Code</span>
              </div>
              <p className="font-bold text-text-primary capitalize">
                {venue.dress_code ? venue.dress_code.replace('_', ' ') : 'Smart casual / Casual'}
              </p>
            </div>

            {/* Layout */}
            <div className="p-3 bg-surface-grey rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-text-muted font-bold">
                <Calendar className="w-3.5 h-3.5 text-brand-green" />
                <span>Layout &amp; Seating</span>
              </div>
              <p className="font-bold text-text-primary capitalize">
                {venue.indoor_outdoor ? `${venue.indoor_outdoor} seating` : 'Indoor & Lounge'}
              </p>
            </div>

            {/* Contact / Social */}
            <div className="p-3 bg-surface-grey rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-text-muted font-bold">
                {venue.instagram_handle ? (
                  <AtSign className="w-3.5 h-3.5 text-brand-green" />
                ) : (
                  <Phone className="w-3.5 h-3.5 text-brand-green" />
                )}
                <span>Contact</span>
              </div>
              <p className="font-bold text-text-primary truncate">
                {venue.instagram_handle ? `@${venue.instagram_handle.replace('@', '')}` : (venue.contact_number || 'Available via OyaPlan')}
              </p>
            </div>
          </div>

          {/* Personality / Planning notes */}
          {venue.confidence_reasons && venue.confidence_reasons.length > 0 && (
            <div className="p-4 bg-[#FAFAF8] rounded-2xl border border-border-default/60 space-y-1.5 text-xs">
              <span className="font-black text-midnight-lagoon uppercase tracking-wider text-[10px] block">
                Things to Know
              </span>
              <ul className="space-y-1 text-text-secondary list-disc list-inside">
                {venue.confidence_reasons.slice(0, 3).map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
