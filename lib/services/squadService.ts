import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSharedPlanWithSpot } from "@/lib/queries/plans";
import { calculateZoneFare } from "@/lib/planning/transport";
import { captureServerException } from "@/lib/sentry";
import { SessionResolver } from "@/lib/services/identity/sessionResolver";

export interface SquadParticipant {
  id: string;
  plan_id: string;
  participant_token: string;
  display_name: string;
  status: "in" | "declined" | "invited";
  is_creator: boolean;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SquadLiveEconomics {
  headcount: number;
  foodSpend: number;
  transportSpend: number;
  totalSpend: number;
  perPersonSpend: number;
  vehiclesRequired: number;
  transportNote: string;
  pricePerPerson: number;
  originalBudget: number;
  originalSquadSize: number;
}

export interface SquadRoomData {
  planId: string;
  plan: {
    id: string;
    start_area: string;
    squad_size: number;
    budget: number;
    vibe: string;
    food_cost: number;
    transport_cost: number;
    total_cost: number;
    why_it_fits: string;
    created_at: string;
  };
  spot: {
    id: string;
    name: string;
    category?: string;
    address?: string;
    address_slug?: string;
    price_per_person?: number;
    image_url?: string;
    phone?: string;
  };
  participants: SquadParticipant[];
  confirmedCount: number;
  totalParticipantsCount: number;
  currentUserParticipant: SquadParticipant | null;
  currentUserToken: string;
  isCreator: boolean;
  liveEconomics: SquadLiveEconomics;
}

export class SquadService {
  /**
   * Helper to instantiate Supabase client with SSR cookie handling
   */
  private static async getSupabaseClient() {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handled
          }
        },
      },
    });
  }

  /**
   * Resolves or generates the unique guest participant token from cookies
   */
  public static async getOrCreateParticipantToken(): Promise<string> {
    const cookieStore = await cookies();
    let token = cookieStore.get("oya_participant_token")?.value;

    if (!token) {
      token = crypto.randomUUID();
      try {
        cookieStore.set("oya_participant_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 60, // 60 days
          path: "/",
        });
      } catch {
        // Handled in server component read-only contexts
      }
    }

    return token;
  }

  /**
   * Fetches all Squad Room data and recalculates live per-person economics based on confirmed headcount
   */
  public static async getSquadRoomData(planId: string): Promise<{
    data: SquadRoomData | null;
    notFound: boolean;
    error: string | null;
  }> {
    try {
      const [planRes, participantToken, identity] = await Promise.all([
        getSharedPlanWithSpot(planId),
        this.getOrCreateParticipantToken(),
        SessionResolver.resolveIdentity(),
      ]);

      if (planRes.notFound || !planRes.data) {
        return { data: null, notFound: true, error: null };
      }

      const planData = planRes.data;
      const spot = (planData.spot || {}) as Record<string, unknown>;
      const supabase = await this.getSupabaseClient();

      let participants: SquadParticipant[] = [];

      try {
        const { data: dbParticipants, error: partError } = await supabase
          .from("plan_squad_participants")
          .select("*")
          .eq("plan_id", planId)
          .order("created_at", { ascending: true });

        if (!partError && dbParticipants) {
          participants = dbParticipants as SquadParticipant[];
        }
      } catch {
        // Fallback to empty participants if table is initializing
        participants = [];
      }

      const currentUserParticipant =
        participants.find(
          (p) =>
            p.participant_token === participantToken ||
            (identity.type === "authenticated" && p.user_id === identity.profile.id)
        ) || null;

      const confirmedParticipants = participants.filter((p) => p.status === "in");
      const confirmedCount = confirmedParticipants.length;

      // Determine effective headcount for dynamic cost calculation:
      // If people have explicitly RSVP'd 'in', use that number; otherwise default to initial target squad size
      const targetSquadSize = Number(planData.squad_size) || 2;
      const effectiveHeadcount = confirmedCount > 0 ? confirmedCount : targetSquadSize;

      // Price per person baseline from spot or original food estimate
      const pricePerPerson =
        Number(spot.price_per_person) ||
        Math.round((Number(planData.food_cost) || 20000) / targetSquadSize);

      const foodSpend = pricePerPerson * effectiveHeadcount;

      const startArea = (planData.start_area as string) || "ikeja";
      const destination = (spot.address_slug as string) || (spot.area as string) || "lekki";

      const transportSpend = calculateZoneFare(startArea, destination, effectiveHeadcount);
      const totalSpend = foodSpend + transportSpend;
      const perPersonSpend = Math.ceil(totalSpend / effectiveHeadcount);

      const vehiclesRequired = Math.max(1, Math.ceil(effectiveHeadcount / 4));
      const transportNote =
        effectiveHeadcount <= 4
          ? "1 ride-hailing vehicle (fits up to 4 people)"
          : `${vehiclesRequired} vehicles calculated for ${effectiveHeadcount} people`;

      const isCreator =
        currentUserParticipant?.is_creator ||
        (identity.type === "authenticated" && planData.user_id === identity.profile.id);

      const liveEconomics: SquadLiveEconomics = {
        headcount: effectiveHeadcount,
        foodSpend,
        transportSpend,
        totalSpend,
        perPersonSpend,
        vehiclesRequired,
        transportNote,
        pricePerPerson,
        originalBudget: Number(planData.budget) || totalSpend,
        originalSquadSize: targetSquadSize,
      };

      const roomData: SquadRoomData = {
        planId,
        plan: {
          id: planData.id as string,
          start_area: (planData.start_area as string) || "ikeja",
          squad_size: targetSquadSize,
          budget: Number(planData.budget) || totalSpend,
          vibe: (planData.vibe as string) || "Dinner",
          food_cost: Number(planData.food_cost) || foodSpend,
          transport_cost: Number(planData.transport_cost) || transportSpend,
          total_cost: Number(planData.total_cost) || totalSpend,
          why_it_fits: (planData.why_it_fits as string) || "",
          created_at: (planData.created_at as string) || new Date().toISOString(),
        },
        spot: {
          id: (spot.id as string) || "",
          name: (spot.name as string) || "Lagos Venue",
          category: (spot.category as string) || "Dining & Drinks",
          address: (spot.address as string) || "Lagos, Nigeria",
          address_slug: (spot.address_slug as string) || "lagos",
          price_per_person: pricePerPerson,
          image_url: (spot.image_url as string) || undefined,
          phone: (spot.phone as string) || undefined,
        },
        participants,
        confirmedCount,
        totalParticipantsCount: participants.length,
        currentUserParticipant,
        currentUserToken: participantToken,
        isCreator,
        liveEconomics,
      };

      return { data: roomData, notFound: false, error: null };
    } catch (e) {
      captureServerException(e);
      return { data: null, notFound: false, error: "Failed to load squad room" };
    }
  }

  /**
   * Joins or updates a guest / member attendance record in the squad room
   */
  public static async joinSquad(
    planId: string,
    displayName: string,
    status: "in" | "declined" = "in"
  ): Promise<{ success: boolean; data?: SquadParticipant; error?: string }> {
    try {
      const sanitizedName = displayName.trim().slice(0, 50);
      if (sanitizedName.length === 0) {
        return { success: false, error: "Please enter your name" };
      }

      const [participantToken, identity, supabase] = await Promise.all([
        this.getOrCreateParticipantToken(),
        SessionResolver.resolveIdentity(),
        this.getSupabaseClient(),
      ]);

      const userId = identity.type === "authenticated" ? identity.profile.id : null;

      // Upsert participant record by plan_id and participant_token
      const { data, error } = await supabase
        .from("plan_squad_participants")
        .upsert(
          {
            plan_id: planId,
            participant_token: participantToken,
            display_name: sanitizedName,
            status,
            user_id: userId,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "plan_id,participant_token",
          }
        )
        .select()
        .single();

      if (error) {
        captureServerException(error);
        return { success: false, error: "Could not record participation" };
      }

      return { success: true, data: data as SquadParticipant };
    } catch (e) {
      captureServerException(e);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Toggles participant status (e.g. 'in' to 'declined')
   */
  public static async updateAttendance(
    planId: string,
    status: "in" | "declined"
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const [participantToken, supabase] = await Promise.all([
        this.getOrCreateParticipantToken(),
        this.getSupabaseClient(),
      ]);

      const { error } = await supabase
        .from("plan_squad_participants")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("plan_id", planId)
        .eq("participant_token", participantToken);

      if (error) {
        captureServerException(error);
        return { success: false, error: "Could not update status" };
      }

      return { success: true };
    } catch (e) {
      captureServerException(e);
      return { success: false, error: "An unexpected error occurred" };
    }
  }
}
