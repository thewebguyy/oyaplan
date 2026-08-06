"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import EmptyState from "./EmptyState";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  action?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = "Search records...",
  onSearch,
  emptyTitle,
  emptyDescription,
  action,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
  };

  const filteredData = onSearch
    ? data
    : data.filter((row) =>
        Object.values(row as Record<string, unknown>).some(
          (val) => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden space-y-4">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
          />
        </div>

        {action && <div>{action}</div>}
      </div>

      {/* Table Content */}
      {filteredData.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider">
                {columns.map((col, idx) => (
                  <th key={idx} className={`p-3 sm:p-4 ${col.className || ""}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((row, rowIdx) => (
                <tr
                  key={(row as { id?: string | number }).id || rowIdx}
                  className="hover:bg-gray-50/60 transition-colors font-medium text-gray-900"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`p-3 sm:p-4 ${col.className || ""}`}>
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? String(row[col.accessorKey] ?? "")
                        : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DataTable;
