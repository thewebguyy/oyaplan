"use client";

import { ExternalLink } from "lucide-react";
import { getUberRideDeepLink } from "@/lib/services/uberService";

interface RouteCardProps {
  startAreaName: string;
  startAreaSlug: string;
  venueName: string;
  venueAddress: string;
  venueCoords: { lat: number; lng: number } | null | undefined;
  transportCost: number;
  distanceKm?: number;
}

// Lagos zone label positions in the SVG viewport (600x240)
const ZONE_POSITIONS: Record<string, { x: number; y: number; label: string }> = {
  lekki:       { x: 490, y: 140, label: "Lekki" },
  "lekki-phase-1": { x: 490, y: 140, label: "Lekki" },
  vi:          { x: 380, y: 170, label: "VI" },
  ikoyi:       { x: 330, y: 145, label: "Ikoyi" },
  yaba:        { x: 190, y: 110, label: "Yaba" },
  ikeja:       { x: 95,  y: 65,  label: "Ikeja" },
  surulere:    { x: 145, y: 150, label: "Surulere" },
};

const DEFAULT_START = { x: 120, y: 110, label: "Your Area" };
const DEFAULT_VENUE = { x: 440, y: 155, label: "Venue" };

function getMapsUrl(coords: { lat: number; lng: number }, label: string): string {
  // Works for both Google Maps (Android/web) and Apple Maps (iOS via universal link)
  return `https://maps.google.com/?q=${encodeURIComponent(label)}&ll=${coords.lat},${coords.lng}`;
}

export default function RouteCard({
  startAreaName,
  startAreaSlug,
  venueName,
  venueAddress,
  venueCoords,
  transportCost,
  distanceKm,
}: RouteCardProps) {
  const startPos = ZONE_POSITIONS[startAreaSlug] ?? DEFAULT_START;
  const venuePos = venueCoords
    ? (() => {
        // Map real-world coords to SVG space (Lagos bounding box)
        // lat: 6.38–6.65, lng: 3.30–3.55 → SVG 0–600, 0–240
        const x = Math.round(((venueCoords.lng - 3.30) / (3.55 - 3.30)) * 580 + 10);
        const y = Math.round((1 - (venueCoords.lat - 6.38) / (6.65 - 6.38)) * 220 + 10);
        return { x: Math.min(Math.max(x, 20), 580), y: Math.min(Math.max(y, 20), 220), label: venueName };
      })()
    : DEFAULT_VENUE;

  // Bezier control point midway between start and venue
  const cpX = Math.round((startPos.x + venuePos.x) / 2);
  const cpY = Math.round(Math.min(startPos.y, venuePos.y) - 40);

  const pathD = `M ${startPos.x} ${startPos.y} Q ${cpX} ${cpY} ${venuePos.x} ${venuePos.y}`;

  const mapsUrl = venueCoords
    ? getMapsUrl(venueCoords, venueName)
    : `https://maps.google.com/?q=${encodeURIComponent(venueAddress || venueName)}`;

  const uberUrl = venueCoords
    ? getUberRideDeepLink({ latitude: venueCoords.lat, longitude: venueCoords.lng, venueName })
    : null;

  return (
    <div className="w-full rounded-[20px] border border-border-default/60 overflow-hidden bg-[#FAFAF8]">
      {/* Map Visual */}
      <div className="relative w-full bg-[#F0F4F0] overflow-hidden" style={{ height: "200px" }}>
        {/* Lagos stylized background grid */}
        <svg
          viewBox="0 0 600 240"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D1D5DB" strokeWidth="0.5" opacity="0.4" />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="600" height="240" fill="url(#grid)" />

          {/* Lagos waterfront hint */}
          <path
            d="M 0 200 C 100 190 200 195 300 185 C 400 175 500 180 600 175 L 600 240 L 0 240 Z"
            fill="#E0F2F7"
            opacity="0.6"
          />
          <path
            d="M 0 210 C 100 200 200 205 300 195 C 400 185 500 190 600 183"
            fill="none"
            stroke="#90CAF9"
            strokeWidth="1.5"
            opacity="0.5"
          />

          {/* Animated route path */}
          <path
            d={pathD}
            fill="none"
            stroke="#008751"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
            opacity="0.85"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="100"
              to="0"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </path>

          {/* Glow on route */}
          <path
            d={pathD}
            fill="none"
            stroke="#008751"
            strokeWidth="6"
            opacity="0.12"
            strokeLinecap="round"
          />

          {/* Start pin */}
          <g transform={`translate(${startPos.x}, ${startPos.y})`}>
            <circle r="8" fill="#1A1A1A" stroke="white" strokeWidth="2" />
            <circle r="3" fill="white" />
          </g>
          <rect
            x={startPos.x - 32}
            y={startPos.y - 26}
            width={Math.min(startPos.label.length * 7 + 10, 80)}
            height="18"
            rx="5"
            fill="#1A1A1A"
            opacity="0.85"
          />
          <text
            x={startPos.x - 27}
            y={startPos.y - 13}
            fontSize="9"
            fontWeight="700"
            fill="white"
            fontFamily="system-ui, sans-serif"
          >
            {startPos.label.length > 9 ? startPos.label.slice(0, 9) + "…" : startPos.label}
          </text>

          {/* Destination pin */}
          <g transform={`translate(${venuePos.x}, ${venuePos.y})`}>
            <circle r="11" fill="#008751" stroke="white" strokeWidth="2.5" filter="url(#glow)" />
            <text x="-5" y="4.5" fontSize="10" fill="white" fontFamily="system-ui">📍</text>
          </g>
          <rect
            x={Math.min(venuePos.x - 36, 520)}
            y={venuePos.y + 16}
            width={Math.min(venueName.length * 6.5 + 12, 120)}
            height="18"
            rx="5"
            fill="#008751"
            opacity="0.92"
          />
          <text
            x={Math.min(venuePos.x - 31, 525)}
            y={venuePos.y + 29}
            fontSize="9"
            fontWeight="700"
            fill="white"
            fontFamily="system-ui, sans-serif"
          >
            {venueName.length > 14 ? venueName.slice(0, 14) + "…" : venueName}
          </text>
        </svg>

        {/* Distance/cost overlay chip */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-white shadow-sm rounded-xl px-3 py-1.5 flex flex-col items-end">
          {distanceKm && (
            <span className="text-[10px] font-bold text-[#6B7280] leading-none">
              ~{distanceKm.toFixed(1)} km
            </span>
          )}
          <span className="text-sm font-black text-[#1A1A1A] leading-tight">
            ₦{transportCost.toLocaleString()}
          </span>
          <span className="text-[9px] text-[#6B7280] font-medium">Est. Transport (Uber/Bolt)</span>
        </div>

        {/* From/To label */}
        <div className="absolute bottom-3 left-3 text-[10px] font-bold text-[#6B7280] bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-white/60">
          {startAreaName} → {venueName.length > 14 ? venueName.slice(0, 14) + "…" : venueName}
        </div>
      </div>

      {/* Action CTAs */}
      <div className="flex gap-2.5 p-4 border-t border-border-default/50">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 h-10 bg-[#1A1A1A] hover:bg-[#333] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors tap-feedback"
          aria-label={`Open directions to ${venueName} in Google Maps`}
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          Open in Maps
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>

        {uberUrl && (
          <a
            href={uberUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-10 bg-[#008751] hover:bg-[#006b41] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors tap-feedback"
            aria-label={`Book Uber to ${venueName}`}
          >
            {/* Uber U icon */}
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3v4c0 1.66-1.34 3-3 3s-3-1.34-3-3V8c0-1.66 1.34-3 3-3z" />
            </svg>
            Book Uber
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        )}
      </div>
    </div>
  );
}
