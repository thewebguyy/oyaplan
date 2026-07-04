import React from 'react';
import { ImportReportingService } from '@/lib/services/imports/importReport';

export default async function AdminImportsPage() {
  const batches = await ImportReportingService.listRecentBatches();

  return (
    <div className="max-w-6xl mx-auto p-8 text-white space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Data Platform: ETL Imports</h1>
        <p className="text-gray-400">Canonical ingestion engine for external venue intelligence.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800/50 text-gray-400 border-b border-gray-800">
            <tr>
              <th className="px-6 py-4 font-medium">Dataset</th>
              <th className="px-6 py-4 font-medium">Version</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Total Rows</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {batches.map((batch: any) => (
              <tr key={batch.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 font-medium">{batch.external_datasets?.name || 'Unknown'}</td>
                <td className="px-6 py-4 text-gray-400">{batch.version}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    batch.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                    batch.status === 'preview' ? 'bg-blue-500/10 text-blue-400' :
                    batch.status === 'rolled_back' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {batch.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">{batch.total_rows}</td>
                <td className="px-6 py-4 text-gray-400">{new Date(batch.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button className="text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors">
                    View Report
                  </button>
                </td>
              </tr>
            ))}
            {batches.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No import batches found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
