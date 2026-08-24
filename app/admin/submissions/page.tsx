import React from "react";
import { SubmissionService } from "@/lib/admin/services/submissionService";
import PageHeader from "@/components/admin/PageHeader";
import SubmissionsTable from "./SubmissionsTable";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage() {
  const submissions = await SubmissionService.getSubmissions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spot Submissions Queue"
        description="Review venue suggestions submitted by users and scouts."
      />

      <SubmissionsTable submissions={submissions} />
    </div>
  );
}
