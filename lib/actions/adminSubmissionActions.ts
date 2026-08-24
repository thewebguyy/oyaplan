"use server";

import { SubmissionService } from "@/lib/admin/services/submissionService";
import { assertAdminSession } from "@/lib/admin/permissions";
import { revalidatePath } from "next/cache";

export async function moderateSubmissionAction(formData: FormData) {
  const admin = await assertAdminSession();

  const id = formData.get("id") as string;
  const status = formData.get("status") as "approved" | "rejected";

  if (!id || !status) return;

  await SubmissionService.moderateSubmission(id, status, admin.email);
  revalidatePath("/admin/submissions");
}
