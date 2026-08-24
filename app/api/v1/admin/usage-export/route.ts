import { NextResponse } from "next/server";
import { isAuthorizedAdmin } from "@/lib/admin/permissions";
import { UsageService } from "@/lib/admin/services/usageService";
import { AccountUsageRow } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

function escapeCSVField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDate(isoDate: string | null): string {
  if (!isoDate) return "";
  try {
    return new Date(isoDate).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

function rowToCSV(row: AccountUsageRow): string {
  return [
    escapeCSVField(row.email),
    escapeCSVField(row.display_name),
    escapeCSVField(row.profile_badge || "—"),
    formatDate(row.created_at),
    String(row.plan_count),
    formatDate(row.last_plan_at),
  ].join(",");
}

export async function GET() {
  const auth = await isAuthorizedAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const usage = await UsageService.getAccountUsage();

  const headers = [
    "Email",
    "Display Name",
    "Badge",
    "Account Created",
    "Plans Generated",
    "Last Plan Date",
  ].join(",");

  const rows = usage.accounts.map(rowToCSV);

  // Add summary row for anonymous plans
  rows.push("");
  rows.push(`"Anonymous (no account) plans","","","",${usage.anonymousPlansCount},""`);

  const csvContent = [headers, ...rows].join("\n");
  const today = new Date().toISOString().split("T")[0];

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="oyaplan_usage_report_${today}.csv"`,
    },
  });
}
