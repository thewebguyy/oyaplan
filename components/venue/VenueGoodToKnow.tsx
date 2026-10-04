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
    <section id="good-to-know" className="scroll-mt-32 font-sans">
      <div className="bg-white rounded-[28px] border border-[#E5E5DE] p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5DE] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#111111] text-[#F9E828] text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
              <Info className="w-3 h-3" />
              <span>Policies &amp; Logistics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#111111] font-display uppercase tracking-tight">
              Good To Know Before Going
            </h2>
            <p className="text-xs sm:text-sm text-[#555555] mt-0.5 font-medium">
              Mandatory house charges, celebration policies, operating hours, and location access.
            </p>
          </div>
        </div>

        {/* 1. Mandatory House Charges Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-[#111111]" />
            <span>Mandatory Charges &amp; Fees</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
            
            <div className="p-3.5 rounded-2xl bg-[#F6F6F2] border border-[#E5E5DE] space-y-1">
              <p className="text-[10px] font-bold uppercase text-[#6B7280]">VAT Tax</p>
              <p className="text-sm font-black text-[#111111]">{vatText}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F6F6F2] border border-[#E5E5DE] space-y-1">
              <p className="text-[10px] font-bold uppercase text-[#6B7280]">Service Charge</p>
              <p className="text-sm font-black text-[#111111]">{serviceChargeText}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F6F6F2] border border-[#E5E5DE] space-y-1">
              <p className="text-[10px] font-bold uppercase text-[#6B7280]">Corkage Fee</p>
              <p className="text-sm font-black text-[#111111]">{corkageText}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F6F6F2] border border-[#E5E5DE] space-y-1">
              <p className="text-[10px] font-bold uppercase text-[#6B7280]">Cake Fee</p>
              <p className="text-sm font-black text-[#111111]">{cakeFeeText}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F6F6F2] border border-[#E5E5DE] space-y-1 col-span-2 sm:col-span-1">
              <p className="text-[10px] font-bold uppercase text-[#6B7280]">Minimum Spend</p>
              <p className="text-sm font-black text-[#111111]">{minimumSpendText}</p>
            </div>

          </div>
        </div>

        {/* 2. Table Policies & Celebration Rules */}
        {hasCelebrationRules && (
          <div className="p-4 rounded-2xl bg-[#F6F6F2] border border-[#E5E5DE] space-y-2">
            <h4 className="text-xs font-bold text-[#111111] flex items-center gap-1.5 font-mono">
              <Wine className="w-4 h-4 text-[#111111]" />
              <span>Celebration &amp; Table Guidelines</span>
            </h4>
            <div className="text-xs text-[#555555] space-y-1 leading-relaxed">
              {venue.celebration_notes && <p>• {venue.celebration_notes}</p>}
              {venue.corkage_fee && <p>• Outside wine/champagne corkage: ₦{venue.corkage_fee.toLocaleString("en-NG")} per bottle.</p>}
              {venue.cake_fee && <p>• Outside cake cutting fee: ₦{venue.cake_fee.toLocaleString("en-NG")}.</p>}
            </div>
          </div>
        )}

        {/* 3. Hours & Location Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#E5E5DE]">
          
          {/* Operating Schedule */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#111111]" />
              <span>Weekly Schedule</span>
            </h3>

            {hasHours ? (
              <div className="rounded-2xl bg-[#F6F6F2] p-3.5 divide-y divide-[#E5E5DE] text-xs font-mono border border-[#E5E5DE]">
                {Object.entries(openingHours).map(([day, hours]) => {
                  const isToday = day.toLowerCase() === currentDayName;
                  return (
                    <div
                      key={day}
                      className={`py-2 flex justify-between items-center ${
                        isToday ? "font-bold text-[#111111]" : "text-[#555555]"
                      }`}
                    >
                      <span className="capitalize flex items-center gap-1.5">
                        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />}
                        <span>{day}</span>
                      </span>
                      <span>{hours}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#F6F6F2] text-xs text-[#6B7280] font-mono border border-[#E5E5DE]">
                Opening schedule hasn&apos;t been verified yet. Check directly before arriving.
              </div>
            )}
          </div>

          {/* Location & Contact Actions */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#111111]" />
              <span>Location &amp; Contact</span>
            </h3>

            <div className="p-4 rounded-2xl bg-[#F6F6F2] space-y-4 border border-[#E5E5DE]">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#111111]">{venue.name}</p>
                <p className="text-xs text-[#555555] font-mono">{venue.address}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E5E5DE]">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E5E5DE] hover:border-[#111111] text-xs font-bold text-[#111111] flex items-center gap-1.5 transition-colors shadow-2xs font-mono"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Google Maps Directions ↗</span>
                </a>

                {venue.contact_number && (
                  <a
                    href={`tel:${venue.contact_number}`}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#E5E5DE] hover:border-[#111111] text-xs font-bold text-[#111111] flex items-center gap-1.5 transition-colors shadow-2xs font-mono"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#111111]" />
                    <span>Call Venue</span>
                  </a>
                )}

                {whatsAppUrl && (
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[#25D366]/15 border border-[#25D366]/40 hover:bg-[#25D366]/25 text-xs font-bold text-[#111111] flex items-center gap-1.5 transition-colors shadow-2xs font-mono"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
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
