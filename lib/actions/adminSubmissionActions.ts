"use server";

import { SubmissionService } from "@/lib/admin/services/submissionService";
import { revalidatePath } from "next/cache";

export async function moderateSubmissionAction(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as "approved" | "rejected";

  if (!id || !status) return;

  await SubmissionService.moderateSubmission(id, status);
  revalidatePath("/admin/submissions");
}
