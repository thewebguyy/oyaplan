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
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#FAF8F8] border-2 border-dashed border-[#111111]/20 rounded-lg">
      <div className="w-12 h-12 rounded border-2 border-[#111111]/20 bg-white text-[#111111]/60 flex items-center justify-center mb-3 shadow-[2px_2px_0px_#111111]">
        <FolderOpen className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-display font-black text-[#111111]">{title}</h3>
      <p className="text-xs font-mono text-[#111111]/60 max-w-sm mt-1 mb-4">{description}</p>
      {action}
    </div>
  );
}

export default EmptyState;
