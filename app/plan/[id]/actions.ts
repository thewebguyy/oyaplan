"use server";

import { supabase } from "@/lib/supabase";
import { captureServerException } from "@/lib/sentry";

export async function togglePlanTransport(planId: string, hasCar: boolean) {
  try {
    // 1. Fetch the existing plan
    const { data: existingPlan, error: fetchError } = await supabase
      .from("shared_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (fetchError || !existingPlan) {
      throw new Error("Plan not found");
    }

    // Use explanation JSON column to store state, defaulting to empty object if null
    const explanation = existingPlan.explanation || {};
    
    // If they already match the requested state, just return the same ID
    const currentlyHasCar = explanation.has_car === true;
    if (currentlyHasCar === hasCar) {
      return { success: true, id: planId };
    }

    let newTransportCost = 0;
    
    if (hasCar) {
      // Transitioning TO car: save the original transport cost, zero it out in DB
      explanation.original_transport_cost = existingPlan.transport_cost;
      explanation.has_car = true;
      newTransportCost = 0;
    } else {
      // Transitioning FROM car back to ride: restore original transport cost
      newTransportCost = explanation.original_transport_cost || 0;
      explanation.has_car = false;
    }

    const newTotalCost = existingPlan.food_cost + newTransportCost;

    // 2. Clone the row with new values
    // Destructure to remove id and created_at so DB generates new ones
    const { id, created_at, ...planDataToClone } = existingPlan;
    
    const newPlanData = {
      ...planDataToClone,
      transport_cost: newTransportCost,
      total_cost: newTotalCost,
      explanation: explanation
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
