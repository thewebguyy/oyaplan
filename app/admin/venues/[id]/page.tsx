import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VenueService } from "@/lib/admin/services/venueService";
import PageHeader from "@/components/admin/PageHeader";
import { ArrowLeft, Save } from "lucide-react";
import { updateVenueAction } from "@/lib/actions/adminVenueActions";

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

            <div className="space-y-1">
              <label className="font-bold text-gray-600">Min Price (₦)</label>
              <input
                name="min_price"
                type="number"
                defaultValue={venue.min_price}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#008751]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-600">Max Price (₦)</label>
              <input
                name="max_price"
                type="number"
                defaultValue={venue.max_price}
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
    </div>
  );
}
