"use server";

import { BetaService } from "@/lib/admin/services/betaService";
import { assertAdminSession } from "@/lib/admin/permissions";
import { revalidatePath } from "next/cache";

export async function approveBetaEmailAction(formData: FormData) {
  const admin = await assertAdminSession();
  const email = formData.get("email") as string;
  const notes = formData.get("notes") as string;

  if (!email) return;

  await BetaService.approveEmail(email, notes, admin.email);
  revalidatePath("/admin/beta-users");
}

export async function approveBulkBetaEmailsAction(formData: FormData) {
  const admin = await assertAdminSession();
  const rawEmails = formData.get("rawEmails") as string;
  const notes = formData.get("notes") as string;

  if (!rawEmails) return;

  const emails = rawEmails.split(/[\n,;\s]+/).map(e => e.trim()).filter(Boolean);
  await BetaService.approveBulkEmails(emails, notes, admin.email);
  revalidatePath("/admin/beta-users");
}

export async function removeBetaEmailAction(formData: FormData) {
  const admin = await assertAdminSession();
  const email = formData.get("email") as string;
  if (!email) return;

  await BetaService.removeEmail(email, admin.email);
  revalidatePath("/admin/beta-users");
}
