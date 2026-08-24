import React from "react";
import { MediaService } from "@/lib/admin/services/mediaService";
import { VenueService } from "@/lib/admin/services/venueService";
import PageHeader from "@/components/admin/PageHeader";
import MediaTable from "./MediaTable";
import { assignMediaAction } from "@/lib/actions/adminMediaActions";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const [mediaItems, { venues }] = await Promise.all([
    MediaService.getMediaItems(),
    VenueService.getVenues({ limit: 100 }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Media Library"
        description="Search venues, upload photos, and assign Hero and Gallery images."
      />

      {/* Upload & Assign Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Assign Photo to Venue</h3>
        
        <form action={assignMediaAction} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-gray-700">
          <div className="space-y-1">
            <label className="font-bold text-gray-600">Select Venue</label>
            <select name="venueId" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#008751]">
              {venues.map((v) => (
                <option key={v.id} value={v.id}>{v.name} ({v.area_name})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-600">Image URL</label>
            <input name="imageUrl" required placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#008751]" />
          </div>

          <div className="flex items-end">
            <button type="submit" className="w-full py-2.5 bg-[#008751] hover:bg-[#007043] text-white font-extrabold text-xs rounded-lg transition-colors">
              Save &amp; Set as Hero
            </button>
          </div>
        </form>
      </div>

      <MediaTable mediaItems={mediaItems} />
    </div>
  );
}
