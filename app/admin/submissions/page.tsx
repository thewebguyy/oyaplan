import React from "react";
import { SubmissionService } from "@/lib/admin/services/submissionService";
import PageHeader from "@/components/admin/PageHeader";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { SpotSubmission } from "@/lib/admin/types";
import { moderateSubmissionAction } from "@/lib/actions/adminSubmissionActions";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage() {
  const submissions = await SubmissionService.getSubmissions();

  const columns: Column<SpotSubmission>[] = [
    {
      header: "Spot Name",
      cell: (row) => (
        <div>
          <div className="font-bold text-gray-900">{row.spot_name}</div>
          <div className="text-[11px] text-gray-400">By: {row.submitted_by}</div>
        </div>
      ),
    },
    {
      header: "Area & Category",
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-700">{row.area}</div>
          <div className="text-[11px] text-gray-400">{row.category}</div>
        </div>
      ),
    },
    {
      header: "Est. Price",
      accessorKey: "estimated_price",
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.status === "pending" && (
            <>
              <form action={moderateSubmissionAction}>
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="status" value="approved" />
                <button type="submit" className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold">
                  Approve
                </button>
              </form>
              <form action={moderateSubmissionAction}>
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="status" value="rejected" />
                <button type="submit" className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold">
                  Reject
                </button>
              </form>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spot Submissions Queue"
        description="Review venue suggestions submitted by users and scouts."
      />

      <DataTable
        columns={columns}
        data={submissions}
        searchPlaceholder="Search spot submissions..."
        emptyTitle="No submissions pending"
        emptyDescription="All venue submissions have been moderated."
      />
    </div>
  );
}
