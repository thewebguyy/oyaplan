"use server";

import { createServerClient } from "@/lib/supabase-server";
import { captureServerException } from "@/lib/sentry";
import { TransportPricingProvider } from "@/lib/planning/transport";
import { calculateOutsideMath } from "@/lib/venue/venueSpend";


export async function togglePlanTransport(planId: string, hasCar: boolean) {
  try {
    const supabase = await createServerClient();

    // 1. Fetch the existing plan
    const { data: existingPlan, error: fetchError } = await supabase
      .from("shared_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (fetchError || !existingPlan) {
      throw new Error("Plan not found");
    }

    const explanation = existingPlan.explanation || {};
    
    // If they already match the requested state, just return the same ID
    const currentlyHasCar = explanation.has_car === true;
    if (currentlyHasCar === hasCar) {
      return { success: true, id: planId };
    }

    let newTransportCost = 0;
    let newTransportEstimate = null;

    if (hasCar) {
      newTransportCost = 0;
      newTransportEstimate = {
        low: 0,
        high: 0,
        mode: "driving",
        origin: existingPlan.start_area,
        destination: existingPlan.transport_estimate?.destination || "ikeja",
        departure_assumption: "off-peak",
        calculation_version: "2026-v1"
      };
      explanation.has_car = true;
    } else {
      // Recalculate range from database spot values
      const { data: spot } = await supabase
        .from("spots")
        .select("address_slug, transport_matrix")
        .eq("id", existingPlan.spot_id)
        .single();

      const estimate = TransportPricingProvider.calculateEstimate(
        existingPlan.start_area,
        spot?.address_slug || "ikeja",
        existingPlan.squad_size || 1,
        "ride-hailing",
        spot?.transport_matrix || {}
      );
      newTransportCost = estimate.midpointCost;
      newTransportEstimate = estimate;
      explanation.has_car = false;
    }

    const newTotalCost = existingPlan.food_cost + newTransportCost;

    // 2. Clone the row with new values
    const { id, created_at, ...planDataToClone } = existingPlan;
    
    const newPlanData = {
      ...planDataToClone,
      transport_cost: newTransportCost,
      total_cost: newTotalCost,
      explanation: explanation,
      transport_estimate: newTransportEstimate
    };

    const { data: newPlan, error: insertError } = await supabase
      .from("shared_plans")
      .insert([newPlanData])
      .select("id")
      .single();

    if (insertError || !newPlan) {
      throw insertError;
    }

    return { success: true, id: newPlan.id };

  } catch (error) {
    captureServerException(error);
    return { success: false, error: "Failed to update transport mode" };
  }
}

export async function switchPlanSpot(
  planId: string,
  newSpotId: string
) {
  try {
    const supabase = await createServerClient();

    // 1. Fetch the existing plan
    const { data: existingPlan, error: fetchError } = await supabase
      .from("shared_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (fetchError || !existingPlan) {
      throw new Error("Plan not found");
    }

    // Fetch the new spot's verified price and address metadata directly from database
    const { data: newSpot, error: spotError } = await supabase
      .from("spots")
      .select("address_slug, transport_matrix, price_per_person, vat_pct, service_charge_pct")
      .eq("id", newSpotId)
      .single();

    if (spotError || !newSpot || typeof newSpot.price_per_person !== "number" || newSpot.price_per_person <= 0) {
      throw new Error("Target spot does not have a verified pricing baseline in database");
    }

    const squadSize = existingPlan.squad_size || 1;
    const foodSubtotal = newSpot.price_per_person * squadSize;

    const explanation = existingPlan.explanation || {};
    explanation.previous_spot_id = existingPlan.spot_id;

    const currentlyHasCar = explanation.has_car === true;

    let newTransportCost = 0;
    let newTransportEstimate = null;

    if (currentlyHasCar) {
      newTransportCost = 0;
      newTransportEstimate = {
        low: 0,
        high: 0,
        mode: "driving",
        origin: existingPlan.start_area,
        destination: newSpot?.address_slug || "ikeja",
        departure_assumption: "off-peak",
        calculation_version: "2026-v1"
      };
    } else {
      const mode = existingPlan.transport_estimate?.mode || "ride-hailing";
      const estimate = TransportPricingProvider.calculateEstimate(
        existingPlan.start_area,
        newSpot?.address_slug || "ikeja",
        existingPlan.squad_size || 1,
        mode,
        newSpot?.transport_matrix || {}
      );
      newTransportCost = estimate.midpointCost;
      newTransportEstimate = estimate;
    }

    const outsideMath = calculateOutsideMath({
      foodSubtotal,
      vatPct: newSpot.vat_pct ?? 7.5,
      serviceChargePct: newSpot.service_charge_pct ?? 10,
      transportCost: newTransportCost,
      headcount: squadSize,
    });

    const newFoodCost = outsideMath.foodSubtotal;
    const newTaxCost = outsideMath.vatAmount + outsideMath.serviceChargeAmount;
    const newTotalCost = outsideMath.totalCost;


    // 2. Clone the row with new values
    const { id, created_at, ...planDataToClone } = existingPlan;
    
    const newPlanData = {
      ...planDataToClone,
      spot_id: newSpotId,
      food_cost: newFoodCost,
      total_cost: newTotalCost,
      explanation: explanation,
      transport_estimate: newTransportEstimate
    };

    const { data: newPlan, error: insertError } = await supabase
      .from("shared_plans")
      .insert([newPlanData])
      .select("id")
      .single();

    if (insertError || !newPlan) {
      throw insertError;
    }

    return { success: true, id: newPlan.id };

  } catch (error) {
    captureServerException(error);
    return { success: false, error: "Failed to switch plan spot" };
  }
}
