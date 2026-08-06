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
    
    let query = supabase.from("spots").select("*, areas(name)", { count: "exact" });

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
      query = query.eq("active", options.status === "published");
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
      slug: spot.address_slug || spot.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      area_id: spot.area_id,
      area_name: spot.areas?.name || "Lagos",
      category: spot.category || "Venue",
      address: spot.address || "",
      description: spot.description || spot.crowd_type || "",
      image_url: spot.cover_url || spot.logo_url || "",
      cover_url: spot.cover_url || "",
      logo_url: spot.logo_url || "",
      price_level: spot.price_tier ? "₦".repeat(Math.min(spot.price_tier, 4)) : "₦₦",
      price_per_person: spot.price_per_person || 0,
      price_tier: spot.price_tier || 1,
      active: spot.active ?? true,
      status: spot.active === false ? "draft" : "published",
      opening_hours: spot.opening_hours || {},
      vibe_tags: spot.vibe_tags || [],
      updated_at: spot.price_updated_at || spot.created_at,
    }));

    return { venues, total: count || 0 };
  }

  static async getVenueById(id: string): Promise<AdminVenue | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("spots")
      .select("*, areas(name)")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      slug: data.address_slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      area_id: data.area_id,
      area_name: data.areas?.name || "Lagos",
      category: data.category || "Venue",
      address: data.address || "",
      description: data.description || "",
      image_url: data.cover_url || data.logo_url || "",
      cover_url: data.cover_url || "",
      logo_url: data.logo_url || "",
      price_level: data.price_tier ? "₦".repeat(Math.min(data.price_tier, 4)) : "₦₦",
      price_per_person: data.price_per_person || 0,
      price_tier: data.price_tier || 1,
      active: data.active ?? true,
      status: data.active === false ? "draft" : "published",
      opening_hours: data.opening_hours || {},
      vibe_tags: data.vibe_tags || [],
      updated_at: data.price_updated_at || data.created_at,
    };
  }

  static async updateVenue(id: string, updates: Partial<AdminVenue>, actorEmail = "admin"): Promise<boolean> {
    const supabase = await createServerClient();
    
    // Map AdminVenue updates back to actual spots DB columns
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.image_url !== undefined) dbUpdates.cover_url = updates.image_url;
    if (updates.price_per_person !== undefined) dbUpdates.price_per_person = updates.price_per_person;
    if (updates.status !== undefined) dbUpdates.active = updates.status === "published";

    const { error } = await supabase.from("spots").update(dbUpdates).eq("id", id);

    if (error) {
      console.error("Failed to update venue:", error);
      return false;
    }

    await ActivityRepository.logActivity(actorEmail, "Updated Venue", "Venue", id, dbUpdates);
    return true;
  }
}
