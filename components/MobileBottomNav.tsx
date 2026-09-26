"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Sparkles, Compass, Bookmark, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "./providers/AuthProvider";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Hide on business pages, dedicated action surfaces (venue detail, generated plan, forge), auth routes, and standalone forms
  const isBusinessRoute =
    pathname === "/for-business" ||
    pathname === "/business" ||
    pathname?.startsWith("/business/") ||
    pathname?.startsWith("/partner");

  const isDedicatedActionSurface =
    pathname?.startsWith("/venue/") ||
    pathname?.startsWith("/plan/") ||
    pathname === "/forge";

  const isAuthRoute =
    pathname === "/login" ||
    pathname?.startsWith("/login/") ||
    pathname === "/account/finish-signup";

  if (
    isBusinessRoute ||
    isDedicatedActionSurface ||
    isAuthRoute ||
    pathname === "/feedback" ||
    pathname === "/list-your-spot" ||
    pathname === "/suggest-a-spot"
  ) {
    return null;
  }

  const showSessionState = mounted && !!session;

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

  const isAccountActive = pathname.startsWith("/account") || pathname.startsWith("/settings");

  const navItems = [
    {
      id: "plan",
      name: "Plan",
      href: "/",
      icon: Sparkles,
      isActive: pathname === "/" || pathname === "/forge",
    },
    {
      id: "explore",
      name: "Explore",
      href: "/explore",
      icon: Compass,
      isActive: pathname.startsWith("/explore"),
    },
    {
      id: "saved",
      name: "Saved",
      href: "/saved",
      icon: Bookmark,
      isActive: pathname.startsWith("/saved") || pathname === "/dashboard",
    },
    {
      id: "account",
      name: "Account",
      href: "/account",
      icon: User,
      isActive: isAccountActive,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#EAE4DC] md:hidden px-3 py-1.5 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.07)]">
      <nav className="flex items-center justify-around w-full max-w-md mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const href = buildPreservedHref(item.href);
          const active = item.isActive;

          return (
            <Link
              key={item.id}
              href={href}
              prefetch={true}
              className="relative flex flex-col items-center justify-center min-h-[48px] min-w-[56px] py-1 px-2.5 rounded-2xl group select-none cursor-pointer"
            >
              {/* Animated Floating Pill Backdrop */}
              {active && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-[#008751]/10 rounded-2xl border border-[#008751]/20 shadow-xs pointer-events-none"
                  transition={{
                    type: "spring",
                    stiffness: 450,
                    damping: 35,
                    mass: 0.8,
                  }}
                />
              )}

              {/* Icon with Spring Bounce */}
              <motion.div
                animate={{
                  scale: active ? 1.15 : 1,
                  y: active ? -1.5 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 25,
                }}
                className="relative z-10"
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    active ? "text-[#008751] stroke-[2.4]" : "text-[#6B7280] group-hover:text-[#1A1A1A] stroke-[1.8]"
                  }`}
                />
              </motion.div>

              {/* Label & Active Dot */}
              <span
                className={`text-[11px] mt-0.5 font-bold tracking-tight relative z-10 transition-colors duration-200 ${
                  active ? "text-[#008751]" : "text-[#6B7280] group-hover:text-[#1A1A1A]"
                }`}
              >
                {item.name}
              </span>

              {/* Glowing Pulse Dot for Active State */}
              {active && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="w-1.5 h-1.5 bg-[#008751] rounded-full mt-0.5 shadow-[0_0_6px_rgba(0,135,81,0.6)]"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
