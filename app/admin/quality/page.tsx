import React from "react";
import { QualityService } from "@/lib/admin/services/qualityService";
import PageHeader from "@/components/admin/PageHeader";
import QualityTable from "./QualityTable";

export const dynamic = "force-dynamic";

export default async function AdminQualityPage() {
  const issues = await QualityService.getChecklist();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Quality Checklist"
        description={`Surfacing ${issues.length} operational health issues across the catalog.`}
      />

      <QualityTable issues={issues} />
    </div>
  );
}
