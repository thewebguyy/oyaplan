"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  ChevronLeft, 
  Menu, 
  X, 
  User, 
  Bookmark, 
  LogOut, 
  Settings, 
  Compass, 
  Heart,
  Sparkles
} from "lucide-react";
import { useAuth } from "./providers/AuthProvider";
import { Avatar } from "./ui/avatar";
import ClientOnly from "./ClientOnly";
import { BusinessMarketingHeader } from "./business/BusinessMarketingHeader";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, user, avatarUrl, displayName, signOut } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [pathname]);

  // Handle escape key to close menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Hide on standalone flow pages
  if (pathname === "/feedback" || pathname === "/list-your-spot" || pathname === "/suggest-a-spot") {
    return null;
  }

  // Dedicated auth routes don't show the standard navbar
  if (pathname === "/login" || pathname === "/login/planner" || pathname === "/login/business" || pathname === "/account/finish-signup") {
    return null;
  }

  // Business portal (/business, /business/[venueId], /business/claim) manages its own standalone headers
  if (pathname === "/business" || pathname?.startsWith("/business/")) {
    return null;
  }

  // Public marketing page (/for-business) & partner onboarding get BusinessMarketingHeader
  const isPublicBusiness = pathname === "/for-business" || pathname?.startsWith("/partner");
  if (isPublicBusiness) {
    return <BusinessMarketingHeader />;
  }

  // Dynamic link builder to preserve search parameters between Plan and Explore
  const getPreservedHref = (href: string) => {
    if (href !== "/" && href !== "/explore") return href;
    const params = new URLSearchParams();
    const budget = searchParams.get("budget");
    const squad = searchParams.get("squad") || searchParams.get("squadSize");
    const vibe = searchParams.get("vibe");
    const area = searchParams.get("area") || searchParams.get("startArea");
    const pinned = searchParams.get("pinned") || searchParams.get("pinnedSpotId");

    if (budget) params.set("budget", budget);
    if (squad) params.set("squad", squad);
    if (vibe) params.set("vibe", vibe);
    if (area) params.set("area", area);
    if (pinned) params.set("pinned", pinned);

    const qs = params.toString();
    return qs ? `${href}?${qs}` : href;
  };

  const navLinks = [
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Saved Spots", href: "/saved", icon: Heart },
  ];

  const effectiveDisplayName = displayName || user?.email?.split("@")[0] || "Planner";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[56px] bg-white/95 backdrop-blur-md border-b border-border-default z-50 transition-colors">
        <nav className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          
          {/* Left: Back button (Mobile only if deep route) + Logo */}
          <div className="flex items-center gap-1 sm:gap-4">
            {pathname !== "/" && pathname !== "/explore" && (
              <button 
                onClick={() => router.back()} 
                className="md:hidden p-2 -ml-2 text-text-primary hover:text-brand-green transition-colors tap-feedback min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <Link href="/" className="flex items-center shrink-0 tap-feedback focus-visible:outline-2 focus-visible:outline-[#008751] rounded-lg">
              <Image
                src="/logo.png"
                alt="OyaPlan"
                width={610}
                height={143}
                className="h-7 w-auto object-contain shrink-0"
                style={{ width: "auto", height: "26px" }}
                priority
              />
            </Link>

            {/* Desktop Left-Center Navigation Links */}
            <div className="hidden md:flex items-center gap-1 ml-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={getPreservedHref(link.href)}
                    className={`relative px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? "text-[#008751] bg-[#008751]/10"
                        : "text-text-secondary hover:text-midnight-lagoon hover:bg-surface-grey"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Navigation (Desktop & Mobile trigger) */}
          <div className="flex items-center gap-3">
            
            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center gap-3">
              <ClientOnly fallback={<div className="w-9 h-9 rounded-full bg-surface-grey animate-pulse" />}>
                {session ? (
                  /* Authenticated Avatar Menu */
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setProfileDropdownOpen((prev) => !prev)}
                      aria-label="Open user menu"
                      aria-haspopup="menu"
                      aria-expanded={profileDropdownOpen}
                      className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#111111]/20 transition-all tap-feedback focus-visible:outline-2 focus-visible:outline-[#111111] min-h-[44px] min-w-[44px] justify-center"
                    >
                      <Avatar 
                        name={effectiveDisplayName} 
                        src={avatarUrl} 
                        size="sm" 
                        className="w-8 h-8 cursor-pointer ring-1 ring-[#111111]/10"
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {profileDropdownOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#E5E5DE] rounded-[16px] shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      >
                        {/* User Header */}
                        <div className="px-4 py-2.5 border-b border-border-default/60">
                          <p className="text-xs font-black text-obsidian truncate">
                            {effectiveDisplayName}
                          </p>
                          <p className="text-[11px] text-text-muted truncate">
                            {user?.email}
                          </p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/account"
                            role="menuitem"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-text-primary hover:bg-[#F6F6F2] hover:text-obsidian flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <User className="w-4 h-4 text-text-muted" />
                              <span>Resident Pass</span>
                            </div>
                          </Link>

                          <Link
                            href="/saved"
                            role="menuitem"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-text-primary hover:bg-[#F6F6F2] hover:text-obsidian flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Heart className="w-4 h-4 text-text-muted" />
                              <span>The Shortlist</span>
                            </div>
                          </Link>

                          <Link
                            href="/saved?tab=plans"
                            role="menuitem"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-text-primary hover:bg-[#F6F6F2] hover:text-obsidian flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Bookmark className="w-4 h-4 text-text-muted" />
                              <span>Saved Plans</span>
                            </div>
                          </Link>

                          <Link
                            href="/settings"
                            role="menuitem"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-text-primary hover:bg-[#F6F6F2] hover:text-obsidian flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Settings className="w-4 h-4 text-text-muted" />
                              <span>Settings</span>
                            </div>
                          </Link>
                        </div>

                        <div className="h-[1px] bg-border-default/60 my-1" />

                        <div className="py-1">
                          <button
                            role="menuitem"
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              signOut();
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-red-500" />
                            <span>Log out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Anonymous Sign In Button */
                  <Link
                    href={`/login${pathname !== "/" ? `?returnTo=${encodeURIComponent(pathname)}` : ""}`}
                    className="h-9 px-4 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-bold flex items-center justify-center transition-all shadow-xs tap-feedback hover:ring-2 hover:ring-[#F9E828]"
                  >
                    Log In
                  </Link>
                )}
              </ClientOnly>
            </div>

            {/* Mobile Menu Hamburger Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              className="md:hidden p-2 rounded-xl text-midnight-lagoon hover:bg-surface-grey transition-colors tap-feedback focus-visible:outline-2 focus-visible:outline-[#008751] min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Streamlined OyaPlan Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Surface */}
          <div
            id="mobile-navigation-drawer"
            ref={drawerRef}
            className="fixed inset-y-0 right-0 w-full max-w-[300px] bg-[#FAF9F6] shadow-2xl flex flex-col justify-between z-50 animate-in slide-in-from-right duration-250 ease-out overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#FAF9F6]/95 backdrop-blur-md px-5 py-4 border-b border-[#EAE4DC] flex items-center justify-between z-10">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center tap-feedback focus-visible:outline-2 focus-visible:outline-[#008751] rounded-lg"
              >
                <Image
                  src="/logo.png"
                  alt="OyaPlan"
                  width={610}
                  height={143}
                  className="h-6 w-auto object-contain"
                  priority
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#6B7280] hover:text-[#1A1A1A] rounded-xl hover:bg-surface-grey transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#008751]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Destinations Only */}
            <div className="p-4 space-y-1 flex-1">
              <Link
                href={getPreservedHref("/explore")}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all min-h-[48px] tap-feedback ${
                  pathname.startsWith("/explore")
                    ? "text-[#008751] bg-[#008751]/10"
                    : "text-midnight-lagoon hover:bg-surface-grey active:bg-[#EAE4DC]/50"
                }`}
              >
                <Compass className="w-5 h-5 text-[#008751] shrink-0" />
                <span>Explore</span>
              </Link>

              <Link
                href={getPreservedHref("/forge")}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all min-h-[48px] tap-feedback ${
                  pathname === "/forge" || pathname === "/"
                    ? "text-[#008751] bg-[#008751]/10"
                    : "text-midnight-lagoon hover:bg-surface-grey active:bg-[#EAE4DC]/50"
                }`}
              >
                <Sparkles className="w-5 h-5 text-[#FCC630] shrink-0" />
                <span>Plan</span>
              </Link>

              <Link
                href="/saved"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all min-h-[48px] tap-feedback ${
                  pathname.startsWith("/saved")
                    ? "text-obsidian bg-obsidian/10"
                    : "text-obsidian hover:bg-surface-grey active:bg-[#EAE4DC]/50"
                }`}
              >
                <Heart className="w-5 h-5 text-obsidian shrink-0" />
                <span>The Shortlist</span>
              </Link>

              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all min-h-[48px] tap-feedback ${
                  pathname.startsWith("/account")
                    ? "text-obsidian bg-obsidian/10"
                    : "text-obsidian hover:bg-surface-grey active:bg-[#EAE4DC]/50"
                }`}
              >
                <User className="w-5 h-5 text-obsidian shrink-0" />
                <span>Resident Pass</span>
              </Link>
            </div>

            {/* Quiet Footer */}
            <div className="p-5 border-t border-[#EAE4DC] bg-white text-center pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
              <p className="text-[11px] font-medium text-text-muted">
                Lagos, Nigeria • © {new Date().getFullYear()} OyaPlan
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
