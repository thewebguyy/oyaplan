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

export async function saveSquadSettlementAction(
  planId: string,
  settlement: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    note?: string;
  }
) {
  if (!planId || !settlement.bankName || !settlement.accountNumber || !settlement.accountName) {
    return { success: false, error: "All bank account fields are required" };
  }

  const result = await SquadService.saveSettlementDetails(planId, settlement);

  if (result.success) {
    revalidatePath(`/squad/${planId}`);
    revalidatePath(`/plan/${planId}`);
  }

  return result;
}

export async function voteSquadOptionAction(planId: string, optionId: string) {
  if (!planId || !optionId) {
    return { success: false, error: "Invalid vote parameters" };
  }

  const result = await SquadService.voteSquadOption(planId, optionId);

  if (result.success) {
    revalidatePath(`/squad/${planId}`);
    revalidatePath(`/plan/${planId}`);
  }

  return result;
}
