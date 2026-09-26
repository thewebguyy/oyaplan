"use client";

import React from "react";
import { Venue } from "@/lib/types";
import { 
  Receipt, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Navigation, 
  Info, 
  Wine, 
  Cake, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { getBusinessWhatsAppUrl } from "@/lib/config/businessWhatsApp";

interface VenueGoodToKnowProps {
  venue: Venue;
}

export function VenueGoodToKnow({ venue }: VenueGoodToKnowProps) {
  const openingHours = (venue.opening_hours as Record<string, string>) || {};
  const hasHours = Object.keys(openingHours).length > 0;
  const currentDayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}, Lagos`)}`;

  const whatsAppUrl = venue.contact_number
    ? getBusinessWhatsAppUrl("availability_inquiry", {
        venueName: venue.name,
        customPhone: venue.contact_number,
        availability: {
          venueName: venue.name,
          squadSize: 4,
          date: "This Weekend",
          time: "Evening",
        },
      })
    : null;

  // Non-zero NULL semantics
  const vatText = venue.vat_pct !== null && venue.vat_pct !== undefined ? `${venue.vat_pct}%` : "Not stated";
  const serviceChargeText = venue.service_charge_pct !== null && venue.service_charge_pct !== undefined ? `${venue.service_charge_pct}%` : "Not stated";
  const corkageText = venue.corkage_fee !== null && venue.corkage_fee !== undefined ? (venue.corkage_fee > 0 ? `₦${venue.corkage_fee.toLocaleString("en-NG")} / bottle` : "Free") : "Not stated";
  const cakeFeeText = venue.cake_fee !== null && venue.cake_fee !== undefined ? (venue.cake_fee > 0 ? `₦${venue.cake_fee.toLocaleString("en-NG")}` : "Free") : "Not stated";
  const minimumSpendText = venue.minimum_spend !== null && venue.minimum_spend !== undefined ? (venue.minimum_spend > 0 ? `₦${venue.minimum_spend.toLocaleString("en-NG")}` : "None") : "Not stated";

  const hasCelebrationRules = Boolean(
    venue.cake_fee || venue.corkage_fee || venue.decor_fee || venue.celebration_notes
  );

  return (
    <section id="good-to-know" className="scroll-mt-32">
      <div className="bg-white rounded-[28px] border border-[#EAE4DC] p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE4DC] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#008751]/10 text-[#008751] text-[10px] font-black uppercase tracking-wider mb-1">
              <Info className="w-3 h-3" />
              <span>Policies &amp; Logistics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-midnight-lagoon uppercase tracking-tight">
              Good To Know Before Going
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Mandatory house charges, celebration policies, operating hours, and location access.
            </p>
          </div>
        </div>

        {/* 1. Mandatory House Charges Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-midnight-lagoon flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-[#008751]" />
            <span>Mandatory Charges &amp; Fees</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-1">
              <p className="text-[10px] font-black uppercase text-text-muted">VAT Tax</p>
              <p className="text-sm font-bold text-midnight-lagoon">{vatText}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-1">
              <p className="text-[10px] font-black uppercase text-text-muted">Service Charge</p>
              <p className="text-sm font-bold text-midnight-lagoon">{serviceChargeText}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-1">
              <p className="text-[10px] font-black uppercase text-text-muted">Corkage Fee</p>
              <p className="text-sm font-bold text-midnight-lagoon">{corkageText}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-1">
              <p className="text-[10px] font-black uppercase text-text-muted">Cake Fee</p>
              <p className="text-sm font-bold text-midnight-lagoon">{cakeFeeText}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-1 col-span-2 sm:col-span-1">
              <p className="text-[10px] font-black uppercase text-text-muted">Minimum Spend</p>
              <p className="text-sm font-bold text-midnight-lagoon">{minimumSpendText}</p>
            </div>

          </div>
        </div>

        {/* 2. Table Policies & Celebration Rules */}
        {hasCelebrationRules && (
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-2">
            <h4 className="text-xs font-bold text-midnight-lagoon flex items-center gap-1.5">
              <Wine className="w-4 h-4 text-[#008751]" />
              <span>Celebration &amp; Table Guidelines</span>
            </h4>
            <div className="text-xs text-text-secondary space-y-1 leading-relaxed">
              {venue.celebration_notes && <p>• {venue.celebration_notes}</p>}
              {venue.corkage_fee && <p>• Outside wine/champagne corkage: ₦{venue.corkage_fee.toLocaleString("en-NG")} per bottle.</p>}
              {venue.cake_fee && <p>• Outside cake cutting fee: ₦{venue.cake_fee.toLocaleString("en-NG")}.</p>}
            </div>
          </div>
        )}

        {/* 3. Hours & Location Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#EAE4DC]">
          
          {/* Operating Schedule */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-midnight-lagoon flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#008751]" />
              <span>Weekly Schedule</span>
            </h3>

            {hasHours ? (
              <div className="rounded-2xl bg-surface-grey p-3.5 divide-y divide-[#EAE4DC] text-xs">
                {Object.entries(openingHours).map(([day, hours]) => {
                  const isToday = day.toLowerCase() === currentDayName;
                  return (
                    <div
                      key={day}
                      className={`py-2 flex justify-between items-center ${
                        isToday ? "font-bold text-[#008751]" : "text-text-secondary"
                      }`}
                    >
                      <span className="capitalize flex items-center gap-1.5">
                        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-[#008751]" />}
                        <span>{day}</span>
                      </span>
                      <span>{hours}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-surface-grey text-xs text-text-muted">
                Opening schedule hasn&apos;t been verified yet. Check directly before arriving.
              </div>
            )}
          </div>

          {/* Location & Contact Actions */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-midnight-lagoon flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#008751]" />
              <span>Location &amp; Contact</span>
            </h3>

            <div className="p-4 rounded-2xl bg-surface-grey space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-midnight-lagoon">{venue.name}</p>
                <p className="text-xs text-text-secondary">{venue.address}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EAE4DC]">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#EAE4DC] hover:border-midnight-lagoon text-xs font-bold text-midnight-lagoon flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#008751]" />
                  <span>Google Maps Directions ↗</span>
                </a>

                {venue.contact_number && (
                  <a
                    href={`tel:${venue.contact_number}`}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#EAE4DC] hover:border-midnight-lagoon text-xs font-bold text-midnight-lagoon flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#008751]" />
                    <span>Call Venue</span>
                  </a>
                )}

                {whatsAppUrl && (
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[#EAFDF3] border border-[#A3F3C6] hover:bg-[#d8f9e7] text-xs font-bold text-[#00603A] flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#008751]" />
                    <span>Inquire via WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
