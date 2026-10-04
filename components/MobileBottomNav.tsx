"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Sparkles, Compass, Heart, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./providers/AuthProvider";
import { triggerHaptic } from "@/lib/ui/haptics";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Hide-on-down-scroll and restore-on-up-scroll behavior
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      // Only trigger after scrolling down past top barrier
      if (currentScrollY > 70) {
        if (delta > 8 && isVisible) {
          // Scrolling down -> hide
          setIsVisible(false);
        } else if (delta < -8 && !isVisible) {
          // Scrolling up -> restore
          setIsVisible(true);
        }
      } else {
        // At or near top -> always show
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isVisible]);

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
      name: "Shortlist",
      href: "/saved",
      icon: Heart,
      isActive: pathname.startsWith("/saved") || pathname === "/dashboard",
    },
    {
      id: "account",
      name: "Resident Pass",
      href: "/account",
      icon: User,
      isActive: isAccountActive,
    },
  ];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ease-in-out pointer-events-none ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-xl border-t border-[#E5E5DE] px-3 py-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] pointer-events-auto">
        <nav className="flex items-center justify-around w-full max-w-md mx-auto relative" role="navigation" aria-label="Mobile Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const href = buildPreservedHref(item.href);
            const active = item.isActive;

            return (
              <Link
                key={item.id}
                href={href}
                prefetch={true}
                onClick={() => triggerHaptic("selection")}
                className="relative flex flex-col items-center justify-center min-h-[48px] min-w-[56px] py-1 px-2 rounded-2xl group select-none cursor-pointer tap-feedback"
              >
                {/* Active Pill Backdrop */}
                {active && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-[#111111]/8 rounded-xl pointer-events-none"
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
                    y: active ? -1 : 0,
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
                      active ? "text-[#111111] stroke-[2.4]" : "text-[#777777] group-hover:text-[#111111] stroke-[1.8]"
                    }`}
                  />
                </motion.div>

                {/* Label */}
                <span
                  className={`text-[10px] mt-0.5 font-bold tracking-tight relative z-10 transition-colors duration-200 ${
                    active ? "text-[#111111] font-mono" : "text-[#777777] group-hover:text-[#111111]"
                  }`}
                >
                  {item.name}
                </span>

                {/* Solar Yellow Pulse Dot for Active State */}
                {active && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="w-1.5 h-1.5 bg-[#F9E828] border border-[#111111] rounded-full mt-0.5"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
