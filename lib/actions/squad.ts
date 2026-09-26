"use server";

import { revalidatePath } from "next/cache";
import { SquadService } from "@/lib/services/squadService";

export async function joinSquadAction(planId: string, displayName: string) {
  if (!planId || !displayName?.trim()) {
    return { success: false, error: "Please provide a valid name" };
  }

  const result = await SquadService.joinSquad(planId, displayName.trim(), "in");

  if (result.success) {
    revalidatePath(`/squad/${planId}`);
    revalidatePath(`/plan/${planId}`);
  }

  return result;
}

export async function updateSquadAttendanceAction(planId: string, status: "in" | "declined") {
  if (!planId || !status) {
    return { success: false, error: "Invalid parameters" };
  }

  const result = await SquadService.updateAttendance(planId, status);

  if (result.success) {
    revalidatePath(`/squad/${planId}`);
    revalidatePath(`/plan/${planId}`);
  }

  return result;
}
