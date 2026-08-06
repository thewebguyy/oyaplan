import { createServerClient } from "@/lib/supabase-server";
import { AdminVenue } from "../types";
import { ActivityRepository } from "./activityRepository";

export class VenueRepository {
  static async getVenues(options?: {
    search?: string;
    areaId?: string;
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ venues: AdminVenue[]; total: number }> {
    const supabase = await createServerClient();
    
    let query = supabase.from("spots").select("*, areas:area_id(name)", { count: "exact" });

    if (options?.search) {
      query = query.ilike("name", `%${options.search}%`);
    }

    if (options?.areaId) {
      query = query.eq("area_id", options.areaId);
    }

    if (options?.category) {
      query = query.eq("category", options.category);
    }

    if (options?.status) {
      query = query.eq("status", options.status);
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const { data, count, error } = await query
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Failed to fetch venues:", error);
      return { venues: [], total: 0 };
    }

    const venues: AdminVenue[] = (data || []).map((spot: any) => ({
      id: spot.id,
      name: spot.name,
      slug: spot.slug || spot.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      area_id: spot.area_id,
      area_name: spot.areas?.name || "Lagos",
      category: spot.category || "Venue",
      vibe: spot.vibe || "Squad Linkup",
      address: spot.address || "",
      description: spot.description || "",
      image_url: spot.image_url || "",
      gallery_urls: spot.gallery_urls || [],
      price_level: spot.price_level || "₦₦",
      min_price: spot.min_price || 0,
      max_price: spot.max_price || 0,
      is_verified: spot.is_verified || false,
      status: spot.status === "draft" ? "draft" : "published",
      opening_hours: spot.opening_hours || {},
      amenities: spot.amenities || [],
      tags: spot.tags || [],
      latitude: spot.latitude,
      longitude: spot.longitude,
      updated_at: spot.updated_at,
    }));

    return { venues, total: count || 0 };
  }

  static async getVenueById(id: string): Promise<AdminVenue | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("spots")
      .select("*, areas:area_id(name)")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      area_id: data.area_id,
      area_name: data.areas?.name || "Lagos",
      category: data.category || "Venue",
      vibe: data.vibe || "Squad Linkup",
      address: data.address || "",
      description: data.description || "",
      image_url: data.image_url || "",
      gallery_urls: data.gallery_urls || [],
      price_level: data.price_level || "₦₦",
      min_price: data.min_price || 0,
      max_price: data.max_price || 0,
      is_verified: data.is_verified || false,
      status: data.status === "draft" ? "draft" : "published",
      opening_hours: data.opening_hours || {},
      amenities: data.amenities || [],
      tags: data.tags || [],
      latitude: data.latitude,
      longitude: data.longitude,
      updated_at: data.updated_at,
    };
  }

  static async updateVenue(id: string, updates: Partial<AdminVenue>, actorEmail = "admin"): Promise<boolean> {
    const supabase = await createServerClient();
    const { error } = await supabase.from("spots").update(updates).eq("id", id);

    if (error) {
      console.error("Failed to update venue:", error);
      return false;
    }

    await ActivityRepository.logActivity(actorEmail, "Updated Venue", "Venue", id, updates as Record<string, unknown>);
    return true;
  }
}
