import crypto from "crypto";
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

export interface PlanSettlement {
  id: string;
  plan_id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SquadOption {
  id: string;
  plan_id: string;
  spot_id?: string | null;
  option_label: string;
  title: string;
  category?: string | null;
  estimated_per_person: number;
  address?: string | null;
  votes_count: number;
  created_at: string;
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
  settlement: PlanSettlement | null;
  options: SquadOption[];
  userVotedOptionId: string | null;
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
   * Hashes a raw participant token using SHA-256 for secure database comparisons
   */
  public static hashParticipantToken(token: string): string {
    if (!token) return "";
    return crypto.createHash("sha256").update(token).digest("hex");
  }


  /**
   * Fetches all Squad Room data including live headcount, non-custodial settlement details, and showdown options
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
      let settlement: PlanSettlement | null = null;
      let rawOptions: any[] = [];
      let rawVotes: any[] = [];

      try {
        const [partRes, settleRes, optionsRes, votesRes] = await Promise.all([
          supabase
            .from("plan_squad_participants")
            .select("*")
            .eq("plan_id", planId)
            .order("created_at", { ascending: true }),
          supabase
            .from("plan_settlements")
            .select("*")
            .eq("plan_id", planId)
            .maybeSingle(),
          supabase
            .from("squad_options")
            .select("*")
            .eq("plan_id", planId)
            .order("created_at", { ascending: true }),
          supabase
            .from("squad_option_votes")
            .select("*")
            .eq("plan_id", planId),
        ]);

        if (!partRes.error && partRes.data) {
          participants = partRes.data as SquadParticipant[];
        }
        if (!settleRes.error && settleRes.data) {
          settlement = settleRes.data as PlanSettlement;
        }
        if (!optionsRes.error && optionsRes.data) {
          rawOptions = optionsRes.data;
        }
        if (!votesRes.error && votesRes.data) {
          rawVotes = votesRes.data;
        }
      } catch {
        // Resilient fallback
      }

      // Calculate votes tally per option
      const votesByOption: Record<string, number> = {};
      let userVotedOptionId: string | null = null;

      for (const vote of rawVotes) {
        votesByOption[vote.option_id] = (votesByOption[vote.option_id] || 0) + 1;
        if (vote.participant_token === participantToken) {
          userVotedOptionId = vote.option_id;
        }
      }

      const options: SquadOption[] = rawOptions.map((opt) => ({
        id: opt.id,
        plan_id: opt.plan_id,
        spot_id: opt.spot_id,
        option_label: opt.option_label || "Option",
        title: opt.title,
        category: opt.category,
        estimated_per_person: opt.estimated_per_person,
        address: opt.address,
        votes_count: votesByOption[opt.id] || 0,
        created_at: opt.created_at,
      }));

      const currentUserParticipant =
        participants.find(
          (p) =>
            p.participant_token === participantToken ||
            (identity.type === "authenticated" && p.user_id === identity.profile.id)
        ) || null;

      const confirmedParticipants = participants.filter((p) => p.status === "in");
      const confirmedCount = confirmedParticipants.length;

      const targetSquadSize = Number(planData.squad_size) || 2;
      const effectiveHeadcount = confirmedCount > 0 ? confirmedCount : targetSquadSize;

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
        settlement,
        options,
        userVotedOptionId,
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

  /**
   * Saves or updates non-custodial host bank settlement details on the plan via SECURITY DEFINER RPC
   */
  public static async saveSettlementDetails(
    planId: string,
    settlement: {
      bankName: string;
      accountNumber: string;
      accountName: string;
      note?: string;
    }
  ): Promise<{ success: boolean; data?: PlanSettlement; error?: string }> {
    try {
      const cleanBank = settlement.bankName.trim();
      const cleanNumber = settlement.accountNumber.trim().replace(/\D/g, "");
      const cleanName = settlement.accountName.trim();

      if (!cleanBank || cleanNumber.length < 8 || cleanNumber.length > 15 || !cleanName) {
        return { success: false, error: "Please enter valid bank details (10-digit NUBAN account number)" };
      }

      const [participantToken, supabase] = await Promise.all([
        this.getOrCreateParticipantToken(),
        this.getSupabaseClient(),
      ]);

      const hashedToken = this.hashParticipantToken(participantToken);

      const { data: rpcRes, error } = await supabase.rpc("save_settlement_rpc", {
        p_plan_id: planId,
        p_participant_token_hash: hashedToken,
        p_bank_name: cleanBank,
        p_account_number: cleanNumber,
        p_account_name: cleanName,
        p_note: settlement.note?.trim() || null,
      });

      if (error || (rpcRes && typeof rpcRes === "object" && (rpcRes as any).success === false)) {
        const errMsg = (rpcRes as any)?.error || error?.message || "Failed to save bank settlement details";
        captureServerException(error || new Error(errMsg));
        return { success: false, error: errMsg };
      }

      return {
        success: true,
        data: {
          id: `settle-${planId}`,
          plan_id: planId,
          bank_name: cleanBank,
          account_number: cleanNumber,
          account_name: cleanName,
          note: settlement.note?.trim() || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    } catch (e) {
      captureServerException(e);
      return { success: false, error: "An unexpected error occurred" };
    }
  }


  /**
   * Casts a 1-tap blind vote for an option in the squad showdown
   */
  public static async voteSquadOption(
    planId: string,
    optionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const [participantToken, supabase] = await Promise.all([
        this.getOrCreateParticipantToken(),
        this.getSupabaseClient(),
      ]);

      const { error } = await supabase
        .from("squad_option_votes")
        .upsert(
          {
            plan_id: planId,
            option_id: optionId,
            participant_token: participantToken,
            voted_at: new Date().toISOString(),
          },
          {
            onConflict: "plan_id,participant_token",
          }
        );

      if (error) {
        captureServerException(error);
        return { success: false, error: "Could not record option vote" };
      }

      return { success: true };
    } catch (e) {
      captureServerException(e);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Adds an itinerary candidate option for squad showdown voting
   */
  public static async createSquadOption(
    planId: string,
    option: {
      optionLabel?: string;
      title: string;
      category?: string;
      estimatedPerPerson: number;
      address?: string;
      spotId?: string;
    }
  ): Promise<{ success: boolean; data?: SquadOption; error?: string }> {
    try {
      if (!option.title.trim() || option.estimatedPerPerson <= 0) {
        return { success: false, error: "Please provide valid option details" };
      }

      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from("squad_options")
        .insert({
          plan_id: planId,
          option_label: option.optionLabel || "Option",
          title: option.title.trim(),
          category: option.category || "Dining",
          estimated_per_person: option.estimatedPerPerson,
          address: option.address || null,
          spot_id: option.spotId || null,
        })
        .select()
        .single();

      if (error) {
        captureServerException(error);
        return { success: false, error: "Could not create squad option" };
      }

      return { success: true, data: data as SquadOption };
    } catch (e) {
      captureServerException(e);
      return { success: false, error: "An unexpected error occurred" };
    }
  }
}
