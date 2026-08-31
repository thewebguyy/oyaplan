"use server";

import { createClient } from "@supabase/supabase-js";
import { ActivityRepository } from "@/lib/admin/repositories/activityRepository";
import { isAuthorizedAdmin } from "@/lib/admin/permissions";

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseKey);
};

export interface BulkVenueMediaInput {
  venueId?: string;
  venueName: string;
  imageUrls: string[];
}

export interface BulkMediaPreviewResult {
  matched: number;
  unmatched: number;
  ambiguous: number;
  duplicateUrlsCount: number;
  previewRows: Array<{
    originalName: string;
    normalizedName: string;
    venueId?: string;
    imagesCount: number;
    status: 'Ready' | 'Not Found' | 'Ambiguous';
    imageUrls: string[];
  }>;
}

export interface BulkMediaUploadResult {
  matched: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<{ venueId?: string; venueName?: string; reason: string }>;
}

export async function previewBulkMediaUpload(records: { venueName: string; imageUrls: string[] }[]): Promise<BulkMediaPreviewResult> {
  const auth = await isAuthorizedAdmin();
  if (!auth.authorized) {
    throw new Error("Unauthorized");
  }

  const supabase = getSupabaseAdmin();
  const { data: allVenues, error } = await supabase.from("venues").select("id, name");
  
  if (error) {
    throw new Error("Failed to fetch venues for matching");
  }

  const venueMap = new Map<string, { id: string; name: string }[]>();
  for (const v of allVenues || []) {
    const norm = v.name.trim().toLowerCase();
    const existing = venueMap.get(norm) || [];
    existing.push(v);
    venueMap.set(norm, existing);
  }

  const result: BulkMediaPreviewResult = {
    matched: 0,
    unmatched: 0,
    ambiguous: 0,
    duplicateUrlsCount: 0,
    previewRows: []
  };

  for (const record of records) {
    const originalName = record.venueName;
    const normalizedName = originalName.trim().toLowerCase();
    
    // Deduplicate URLs
    const uniqueUrls = Array.from(new Set(record.imageUrls.map(u => u.trim()).filter(u => u && (u.startsWith('http://') || u.startsWith('https://')))));
    const duplicatesRemoved = record.imageUrls.length - uniqueUrls.length;
    result.duplicateUrlsCount += duplicatesRemoved;

    const matches = venueMap.get(normalizedName) || [];
    
    let status: 'Ready' | 'Not Found' | 'Ambiguous' = 'Not Found';
    let venueId: string | undefined = undefined;

    if (matches.length === 0) {
      status = 'Not Found';
      result.unmatched++;
    } else if (matches.length > 1) {
      status = 'Ambiguous';
      result.ambiguous++;
    } else {
      status = 'Ready';
      venueId = matches[0].id;
      result.matched++;
    }

    result.previewRows.push({
      originalName,
      normalizedName,
      venueId,
      imagesCount: uniqueUrls.length,
      status,
      imageUrls: uniqueUrls
    });
  }

  return result;
}

export async function executeBulkMediaUpload(previewRows: BulkMediaPreviewResult['previewRows']): Promise<BulkMediaUploadResult> {
  const auth = await isAuthorizedAdmin();
  if (!auth.authorized) {
    throw new Error("Unauthorized");
  }
  
  const actorEmail = auth.email || "admin";
  const supabase = getSupabaseAdmin();

  const result: BulkMediaUploadResult = {
    matched: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };

  const toProcess = previewRows.filter(r => r.status === 'Ready');
  result.matched = toProcess.length;
  result.skipped = previewRows.length - toProcess.length;

  for (const record of toProcess) {
    if (!record.venueId) {
      result.failed++;
      result.errors.push({ venueName: record.originalName, reason: "Missing venue ID despite being marked ready" });
      continue;
    }

    if (record.imageUrls.length === 0) {
      result.skipped++;
      continue;
    }

    try {
      const coverUrl = record.imageUrls[0];
      const galleryUrls = record.imageUrls.slice(1);

      const dbUpdates = {
        cover_url: coverUrl,
        gallery_urls: galleryUrls
      };

      const { error } = await supabase.from("venues").update(dbUpdates).eq("id", record.venueId);

      if (error) {
        result.failed++;
        result.errors.push({ venueId: record.venueId, venueName: record.originalName, reason: error.message });
      } else {
        result.updated++;
        await ActivityRepository.logActivity(actorEmail, "Bulk Media Replace", "Venue", record.venueId, {
          cover_url: coverUrl,
          gallery_urls: galleryUrls,
          total_images: record.imageUrls.length,
          source: "Bulk Upload"
        });
      }
    } catch (e: any) {
      result.failed++;
      result.errors.push({ venueId: record.venueId, venueName: record.originalName, reason: e.message || "Unknown error" });
    }
  }

  return result;
}
