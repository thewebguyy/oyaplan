"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Image as ImageIcon,
  Award,
  FileSpreadsheet,
  Star,
  CheckCircle2,
  Activity,
  Settings,
  LogOut,
  ChevronRight,
  BarChart3,
  Database,
} from "lucide-react";
import { signOutAdmin } from "@/lib/actions/adminAuth";

interface SidebarProps {
  userEmail?: string;
  role?: string;
}

export function Sidebar({ userEmail = "admin@oyaplan.com", role = "admin" }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Venues", href: "/admin/venues", icon: MapPin },
    { name: "Partner Claims", href: "/admin/venues/claims", icon: ShieldCheck },
    { name: "Media", href: "/admin/media", icon: ImageIcon },
    { name: "Beta Users", href: "/admin/beta-users", icon: Award },
    { name: "Usage", href: "/admin/usage", icon: BarChart3 },
    { name: "Submissions", href: "/admin/submissions", icon: FileSpreadsheet },
    { name: "ETL Imports", href: "/admin/imports", icon: Database },
    { name: "Sponsored", href: "/admin/sponsored", icon: Star },
    { name: "Data Quality", href: "/admin/quality", icon: CheckCircle2 },
    { name: "Activity", href: "/admin/activity", icon: Activity },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#010528] text-white flex flex-col justify-between shrink-0 border-r-2 border-[#111111]/40 select-none md:sticky md:top-14 md:h-[calc(100vh-56px)] md:overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 bg-[#010528]">
          <Link href="/admin" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F6C642] rounded">
            <span className="w-7 h-7 rounded bg-[#008751] text-white flex items-center justify-center font-mono font-black text-xs border border-white/20 shadow-[1px_1px_0px_#000]">
              OP
            </span>
            <span className="font-display font-black text-sm tracking-tight text-white">Control Center</span>
          </Link>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F6C642] text-[#010528] border border-[#E5B535]">
            v1.0
          </span>
        </div>

        {/* Ledger Category Marker */}
        <div className="px-4 pt-4 pb-1">
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-white/40 block">
            NAVIGATION // MODULES
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded text-xs font-mono font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F6C642] ${
                  isActive
                    ? "bg-[#008751] text-white border-l-4 border-l-[#F6C642] shadow-[2px_2px_0px_rgba(0,0,0,0.3)] pl-2"
                    : "text-white/70 hover:text-white hover:bg-white/10 border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-white/60"}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/90" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/10 bg-white/[0.03] space-y-3">
        <div className="flex items-center gap-2.5 p-2 rounded bg-white/[0.04] border border-white/5">
          <div className="w-8 h-8 rounded bg-[#008751]/30 text-[#008751] flex items-center justify-center font-mono font-black text-xs border border-[#008751]/60">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-mono text-xs font-bold text-white truncate">{userEmail}</span>
            <span className="font-mono text-[9px] font-semibold text-white/50 uppercase tracking-widest">
              ROLE: {role}
            </span>
          </div>
        </div>

        <button
          onClick={() => signOutAdmin()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-mono font-bold text-[#E54D2E] hover:bg-[#E54D2E]/15 hover:text-white border border-[#E54D2E]/30 active:translate-x-[1px] active:translate-y-[1px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E54D2E]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
