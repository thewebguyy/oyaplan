import React from "react";
import { Venue } from "@/lib/types";
import { ShieldAlert, CreditCard, Clock, Navigation, AlertCircle, MapPin } from "lucide-react";

interface BeforeYouGoProps {
  venue?: Venue | null;
  isCrossWater?: boolean;
}

export function BeforeYouGo({ venue, isCrossWater }: BeforeYouGoProps) {
  const isNightlife = venue?.category === "club" || venue?.category === "bar" || venue?.subcategory === "lounge";
  const dressCode = venue?.dress_code;
  const parkingInfo = venue?.has_parking !== undefined
    ? (venue.has_parking ? "Valet / dedicated parking space available." : "Street parking only; arrive early or use ride-hailing.")
    : null;

  return (
    <div className="w-full mt-6 border border-[#EAE4DC] bg-[#FAF7F2] rounded-2xl p-5 sm:p-6 text-text-primary">
      <div className="flex items-center justify-between mb-4 border-b border-[#EAE4DC] pb-3">
        <h3 className="font-extrabold text-sm sm:text-base text-midnight-lagoon uppercase tracking-wide flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-green" /> Practical Outing Guidance
        </h3>
        <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest bg-brand-green/10 px-2 py-0.5 rounded-full">
          Verified Smarts
        </span>
      </div>

      <ul className="space-y-3.5 text-xs sm:text-sm">
        {/* Bridge/Water crossing transit buffer */}
        {isCrossWater && (
          <li className="flex items-start gap-3">
            <Navigation className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
            <div className="text-text-secondary leading-snug">
              <strong className="text-midnight-lagoon font-bold">Island / Mainland Corridor:</strong>{" "}
              Your plan crosses between zones. Allow an extra 30–45 mins during peak hours (4:30 PM – 7:30 PM) so table reservations aren&apos;t lost.
            </div>
          </li>
        )}

        {/* Real Venue Parking */}
        {parkingInfo && (
          <li className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
            <div className="text-text-secondary leading-snug">
              <strong className="text-midnight-lagoon font-bold">Parking &amp; Arrival:</strong> {parkingInfo}
            </div>
          </li>
        )}

        {/* Real Venue Dress Code */}
        {dressCode && dressCode.toLowerCase() !== "casual" && (
          <li className="flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
            <div className="text-text-secondary leading-snug">
              <strong className="text-midnight-lagoon font-bold">Dress Code:</strong> {dressCode} is requested by the venue.
            </div>
          </li>
        )}

        {/* Payment and Settlement */}
        <li className="flex items-start gap-3">
          <CreditCard className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
          <div className="text-text-secondary leading-snug">
            <strong className="text-midnight-lagoon font-bold">Payment &amp; POS:</strong> Keep instant mobile bank transfer accessible. Terminal networks can dip during peak weekend evening dining hours.
          </div>
        </li>

        {/* Late Night Surge note for nightlife spots */}
        {isNightlife && (
          <li className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-text-secondary leading-snug">
              <strong className="text-midnight-lagoon font-bold">Peak Return Transit:</strong> Ride-hailing fares typically rise 1.2x–1.4x after midnight in nightlife corridors. Our estimate incorporates this surge.
            </div>
          </li>
        )}

        {/* Specific venue things to know */}
        {venue?.things_to_know && venue.things_to_know.length > 0 && (
          <li className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
            <div className="text-text-secondary leading-snug">
              <strong className="text-midnight-lagoon font-bold">Venue Policy:</strong> {venue.things_to_know[0]}
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}

export default BeforeYouGo;
