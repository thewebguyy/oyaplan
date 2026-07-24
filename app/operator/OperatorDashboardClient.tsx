"use client";

import { useState } from "react";
import { Store, ShieldAlert, FileText, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { VenueRole, submitVenueClaim } from "@/lib/queries/operator";
import { Spot } from "@/lib/types";
import Link from "next/link";

interface OperatorDashboardClientProps {
  userId: string;
  initialVenues: VenueRole[];
  initialClaims: Array<{
    id: string;
    venue_id: string;
    status: "pending" | "approved" | "rejected";
    claimed_at: string;
    venues: { name: string };
  }>;
  availableSpots: Spot[];
}

export default function OperatorDashboardClient({
  userId,
  initialVenues,
  initialClaims,
  availableSpots,
}: OperatorDashboardClientProps) {
  const [venues, setVenues] = useState(initialVenues);
  const [claims, setClaims] = useState(initialClaims);
  const [selectedSpotId, setSelectedSpotId] = useState("");
  const [claimMethod, setClaimMethod] = useState<"business_document" | "email_domain" | "phone" | "manual">("business_document");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedSpotId) {
      setError("Please select a venue to claim.");
      return;
    }

    setLoading(true);
    const res = await submitVenueClaim(userId, selectedSpotId, claimMethod);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      const chosenSpot = availableSpots.find(s => s.id === selectedSpotId);
      setClaims((prev) => [
        {
          id: `temp_${Date.now()}`,
          venue_id: selectedSpotId,
          status: "pending",
          claimed_at: new Date().toISOString(),
          venues: { name: chosenSpot?.name || "Venue" }
        },
        ...prev
      ]);
    } else {
      setError(res.error || "Claim submission failed.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-white border border-border-default/60 rounded-[28px] p-6 sm:p-8 space-y-2 shadow-lagoon">
        <h2 className="text-xl font-black text-midnight-lagoon">Manage Your Venue</h2>
        <p className="text-sm text-text-muted">
          Claim ownership of your venue on OyaPlan. Keep your menu up to date, declare taxes explicitly, and get direct budget confidence reports from your customers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Claimed Venues Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-black text-midnight-lagoon">Your Approved Venues</h3>
            </div>

            <div className="space-y-3">
              {venues.map((v) => (
                <div
                  key={v.venue_id}
                  className="bg-white border border-border-default/50 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:border-indigo-600/40 transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-text-primary">{v.venues?.name || "Venue"}</h4>
                    <p className="text-xs text-text-muted mt-0.5">{v.venues?.address || "Lagos"}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded">
                      Role: {v.role}
                    </span>
                  </div>
                  <Link
                    href={`/operator/${v.venue_id}`}
                    className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <span>Manage Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
              {venues.length === 0 && (
                <div className="bg-white border border-border-default/50 rounded-2xl p-8 text-center text-gray-400 text-sm italic">
                  You don&apos;t have any approved venues yet. Claim one below!
                </div>
              )}
            </div>
          </div>

          {/* Pending claim tracks */}
          {claims.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black text-midnight-lagoon uppercase tracking-wider">Pending Claims</h3>
              </div>
              <div className="bg-white border border-border-default/50 rounded-2xl divide-y divide-gray-100">
                {claims.map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-bold text-text-primary">{c.venues.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Submitted {new Date(c.claimed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-full tracking-wider">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Claim Venue Form */}
        <div className="bg-white border border-border-default/60 rounded-[24px] p-6 space-y-5 shadow-xs h-fit">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#008751]" />
            <h3 className="text-sm font-black text-midnight-lagoon uppercase tracking-wider">Claim ownership</h3>
          </div>

          <form onSubmit={handleClaim} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Select Venue
              </label>
              <select
                value={selectedSpotId}
                onChange={(e) => setSelectedSpotId(e.target.value)}
                className="w-full h-10 px-3 bg-surface-grey border border-border-default rounded-[10px] text-sm focus:outline-none"
              >
                <option value="">-- Choose Spot --</option>
                {availableSpots.map((spot) => (
                  <option key={spot.id} value={spot.id}>
                    {spot.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Verification Method
              </label>
              <select
                value={claimMethod}
                onChange={(e: any) => setClaimMethod(e.target.value)}
                className="w-full h-10 px-3 bg-surface-grey border border-border-default rounded-[10px] text-sm focus:outline-none"
              >
                <option value="business_document">Business Document upload</option>
                <option value="email_domain">Work Email domain Match</option>
                <option value="phone">WhatsApp Business verify</option>
                <option value="manual">Manual Call Audit</option>
              </select>
            </div>

            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
            {success && (
              <div className="flex items-center gap-2 text-[#008751] bg-[#F0FBF5] p-3 rounded-lg border border-[#008751]/20">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <p className="text-xs font-bold">Claim request submitted successfully!</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedSpotId}
              className="w-full h-11 bg-[#008751] hover:bg-[#006b41] disabled:opacity-40 text-white font-bold uppercase tracking-wider text-xs rounded-[10px] transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Claim Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
