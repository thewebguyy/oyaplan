import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VenueService } from "@/lib/admin/services/venueService";
import PageHeader from "@/components/admin/PageHeader";
import { ArrowLeft, Save, ShieldCheck } from "lucide-react";
import { updateVenueAction } from "@/lib/actions/adminVenueActions";
import { verifySpotAction } from "@/lib/actions/adminEvidenceActions";

export const dynamic = "force-dynamic";

export default async function AdminEditVenuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const venue = await VenueService.getVenueById(id);

  if (!venue) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/admin/venues"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#008751] transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Venues
        </Link>
        <PageHeader title={`Edit ${venue.name}`} description={`ID: ${venue.id}`} />
      </div>

      <form action={updateVenueAction} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-xs font-medium text-gray-700">
        <input type="hidden" name="id" value={venue.id} />

        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Basic Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-gray-600">Venue Name</label>
              <input
                name="name"
                defaultValue={venue.name}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#008751]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-600">Slug</label>
              <input
                name="slug"
                defaultValue={venue.slug}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#008751]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-600">Category</label>
              <input
                name="category"
                defaultValue={venue.category}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#008751]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-600">Status</label>
              <select
                name="status"
                defaultValue={venue.status}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#008751]"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-600">Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={venue.description}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#008751]"
            />
          </div>
        </div>

        {/* Section 2: Pricing & Location */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Pricing &amp; Location</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-gray-600">Price Level</label>
              <input
                name="price_level"
                defaultValue={venue.price_level}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#008751]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-gray-600">Price Per Person (₦)</label>
              <input
                name="price_per_person"
                type="number"
                defaultValue={venue.price_per_person}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#008751]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-600">Address</label>
            <input
              name="address"
              defaultValue={venue.address}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#008751]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-600">Hero Image URL</label>
            <input
              name="image_url"
              defaultValue={venue.image_url}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#008751]"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#008751] hover:bg-[#007043] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Venue Changes</span>
          </button>
        </div>
      </form>

      {/* Section 3: Price Provenance & Verification Evidence Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 text-xs font-medium text-gray-700">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#008751]" />
            <h3 className="font-extrabold text-sm text-gray-900">Price Provenance &amp; Verification Evidence</h3>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
            Last Updated: {venue.updated_at ? new Date(venue.updated_at).toLocaleDateString() : "Seed"}
          </span>
        </div>

        <form action={verifySpotAction} className="space-y-4">
          <input type="hidden" name="id" value={venue.id} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-gray-600">Verification Status (verified_by)</label>
              <select
                name="verified_by"
                defaultValue="owner_verified"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#008751]"
              >
                <option value="owner_verified">Owner Verified (Official Proof)</option>
                <option value="scout_verified">Scout Verified (On-ground Check)</option>
                <option value="manual">Manual Research</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-600">Price Source (price_source)</label>
              <select
                name="price_source"
                defaultValue="official_website"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#008751]"
              >
                <option value="official_website">Official Website</option>
                <option value="social_media">Social Media (Instagram / X)</option>
                <option value="receipt_upload">User / Scout Receipt Upload</option>
                <option value="manual_verification">Manual On-Ground Check</option>
                <option value="chowdeck">Chowdeck / Third Party</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-gray-600">Evidence URL (Menu or Receipt link)</label>
              <input
                name="evidence_url"
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#008751]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-600">Verified Price (₦)</label>
              <input
                name="price_per_person"
                type="number"
                defaultValue={venue.price_per_person}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#008751]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-midnight-lagoon hover:bg-[#010528] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-[#008751]" />
              <span>Log Price Evidence &amp; Verify Spot</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
