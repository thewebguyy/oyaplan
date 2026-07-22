"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Sparkles, Compass, Bookmark, User } from "lucide-react";
import { useAuth } from "./providers/AuthProvider";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { session, openModal } = useAuth();

  // Hide on standalone forms / dedicated pages
  if (
    pathname === "/feedback" ||
    pathname === "/list-your-spot" ||
    pathname === "/suggest-a-spot"
  ) {
    return null;
  }

  // Preserve planning context parameters between Plan and Explore
  const buildPreservedHref = (href: string) => {
    if (href !== "/" && href !== "/explore") return href;
    const params = new URLSearchParams();
    const budget = searchParams.get("budget");
    const squad = searchParams.get("squad") || searchParams.get("squadSize");
    const vibe = searchParams.get("vibe");
    const area = searchParams.get("area") || searchParams.get("startArea");

    if (budget) params.set("budget", budget);
    if (squad) params.set("squad", squad);
    if (vibe) params.set("vibe", vibe);
    if (area) params.set("area", area);

    const qs = params.toString();
    return qs ? `${href}?${qs}` : href;
  };

  const navItems = [
    {
      name: "Plan",
      href: "/",
      icon: Sparkles,
      isActive: pathname === "/",
    },
    {
      name: "Explore",
      href: "/explore",
      icon: Compass,
      isActive: pathname.startsWith("/explore"),
    },
    {
      name: "Saved",
      href: session ? "/dashboard" : "/saved",
      icon: Bookmark,
      isActive: pathname === "/saved" || pathname === "/dashboard",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-[#E5E7EB] md:hidden px-2 py-1.5 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const href = buildPreservedHref(item.href);
          return (
            <Link
              key={item.name}
              href={href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 tap-feedback ${
                item.isActive
                  ? "text-[#008751] font-bold"
                  : "text-[#6B7280] hover:text-[#1A1A1A]"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    item.isActive ? "scale-110" : ""
                  }`}
                />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#008751] rounded-full" />
                )}
              </div>
              <span className="text-[11px] mt-1 font-medium tracking-tight">
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Account / Sign In Tab */}
        <button
          onClick={() => {
            if (!session) {
              openModal();
            } else {
              window.location.href = "/dashboard";
            }
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 tap-feedback ${
            session
              ? "text-[#008751] font-bold"
              : "text-[#6B7280] hover:text-[#1A1A1A]"
          }`}
          aria-label={session ? "Account profile" : "Sign in"}
        >
          <div className="relative">
            <User className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-1 font-medium tracking-tight">
            {session ? "Account" : "Sign In"}
          </span>
        </button>
      </nav>
    </div>
  );
}
