import React from 'react';
import { ImportReportingService } from '@/lib/services/imports/importReport';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';

export const dynamic = "force-dynamic";

interface ImportBatch {
  id: string;
  status: string;
  version: string;
  total_rows: number;
  created_at: string;
  external_datasets: { name: string } | null;
}

export default async function AdminImportsPage() {
  const batches = (await ImportReportingService.listRecentBatches()) as ImportBatch[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="ETL Imports Data Platform"
        description="Canonical ingestion engine for external venue intelligence."
      />

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-3.5">Dataset</th>
                <th className="px-6 py-3.5">Version</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Total Rows</th>
                <th className="px-6 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{batch.external_datasets?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">{batch.version}</td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={batch.status}
                      type={
                        batch.status === 'completed' ? 'success' :
                        batch.status === 'preview' ? 'info' :
                        batch.status === 'rolled_back' ? 'error' : 'warning'
                      }
                    />
                  </td>
                  <td className="px-6 py-4 font-mono font-bold">{batch.total_rows}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(batch.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                    No import batches logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
