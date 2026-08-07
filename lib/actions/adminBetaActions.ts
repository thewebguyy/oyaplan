"use server";

import { BetaService } from "@/lib/admin/services/betaService";
import { revalidatePath } from "next/cache";

export async function approveBetaEmailAction(formData: FormData) {
  const email = formData.get("email") as string;
  const notes = formData.get("notes") as string;

  if (!email) return;

  await BetaService.approveEmail(email, notes);
  revalidatePath("/admin/beta-users");
}

export async function approveBulkBetaEmailsAction(formData: FormData) {
  const rawEmails = formData.get("rawEmails") as string;
  const notes = formData.get("notes") as string;

  if (!rawEmails) return;

  const emails = rawEmails.split(/[\n,;\s]+/).map(e => e.trim()).filter(Boolean);
  await BetaService.approveBulkEmails(emails, notes);
  revalidatePath("/admin/beta-users");
}

export async function removeBetaEmailAction(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return;

  await BetaService.removeEmail(email);
  revalidatePath("/admin/beta-users");
}
