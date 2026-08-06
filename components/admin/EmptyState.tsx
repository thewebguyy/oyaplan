import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  title = "No data found",
  description = "There are no records matching your request right now.",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
        <FolderOpen className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">{description}</p>
      {action}
    </div>
  );
}

export default EmptyState;
