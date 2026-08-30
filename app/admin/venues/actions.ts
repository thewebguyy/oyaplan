"use server";

import { createClient } from "@supabase/supabase-js";

export async function bulkUploadVenueMedia(records: { venueName?: string; venueId?: string; heroUrl?: string; galleryUrls?: string[] }[]) {
  // Using service role to bypass RLS for admin operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let successCount = 0;
  let failCount = 0;

  for (const record of records) {
    try {
      let query = supabase.from("venues").update({
        ...(record.heroUrl && { cover_url: record.heroUrl }),
        ...(record.galleryUrls && { gallery_urls: record.galleryUrls }),
      });

      if (record.venueId) {
        query = query.eq("id", record.venueId);
      } else if (record.venueName) {
        query = query.eq("name", record.venueName);
      } else {
        failCount++;
        continue;
      }

      const { data, error } = await query.select("id").single();

      if (error || !data) {
        failCount++;
      } else {
        successCount++;
      }
    } catch (e) {
      failCount++;
    }
  }

  return { successCount, failCount };
}
