"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
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
    { name: "Media", href: "/admin/media", icon: ImageIcon },
    { name: "Beta Users", href: "/admin/beta-users", icon: Award },
    { name: "Usage", href: "/admin/usage", icon: BarChart3 },
    { name: "Submissions", href: "/admin/submissions", icon: FileSpreadsheet },
    { name: "Sponsored", href: "/admin/sponsored", icon: Star },
    { name: "Data Quality", href: "/admin/quality", icon: CheckCircle2 },
    { name: "Activity", href: "/admin/activity", icon: Activity },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#010528] text-white flex flex-col justify-between shrink-0 border-r border-white/10 select-none md:sticky md:top-14 md:h-[calc(100vh-56px)] md:overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#008751] text-white flex items-center justify-center font-black text-xs">
              OP
            </span>
            <span className="font-extrabold text-sm tracking-tight text-white">Control Center</span>
          </Link>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FCC630] text-[#00603A]">
            v1.0
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
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all tap-feedback ${
                  isActive
                    ? "bg-[#008751] text-white shadow-sm"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/10 bg-white/5 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#008751]/20 text-[#008751] flex items-center justify-center font-black text-xs border border-[#008751]/40">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-white truncate">{userEmail}</span>
            <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider capitalize">
              {role}
            </span>
          </div>
        </div>

        <button
          onClick={() => signOutAdmin()}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors tap-feedback"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
