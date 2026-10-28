import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#111111]/15 pb-5 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#008751]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#111111]/50">
            SYSTEM CONTROL // OPERATIONAL LEDGER
          </span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-[#111111] tracking-tight">{title}</h1>
        {description && <p className="text-xs font-mono font-medium text-[#111111]/70 mt-1">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}

export default PageHeader;
