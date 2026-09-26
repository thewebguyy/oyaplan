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
  Building2, 
  LogOut, 
  Settings, 
  Activity, 
  Compass, 
  Heart,
  ArrowRight
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

  // Venue management workspace has its own internal BusinessShell layout and header
  const isBusinessWorkspace = pathname?.startsWith("/business/") && !pathname?.startsWith("/business/claim");
  if (isBusinessWorkspace) return null;

  // Business public & claim routes get the dedicated BusinessMarketingHeader
  const isPublicBusiness = pathname === "/for-business" || pathname === "/business" || pathname?.startsWith("/business/claim") || pathname?.startsWith("/partner");
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
                className="md:hidden p-1.5 -ml-1 text-text-primary hover:text-brand-green transition-colors tap-feedback"
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
              <Link
                href="/for-business"
                className="text-xs font-bold text-text-secondary hover:text-[#008751] transition-colors px-3 py-1.5 rounded-full hover:bg-surface-grey"
              >
                For Businesses ↗
              </Link>

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
                      className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#008751]/20 transition-all tap-feedback focus-visible:outline-2 focus-visible:outline-[#008751]"
                    >
                      <Avatar 
                        name={effectiveDisplayName} 
                        src={avatarUrl} 
                        size="sm" 
                        className="w-8 h-8 cursor-pointer"
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {profileDropdownOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#EAE4DC] rounded-[20px] shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      >
                        {/* User Header */}
                        <div className="px-4 py-2.5 border-b border-border-default/60">
                          <p className="text-xs font-black text-midnight-lagoon truncate">
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
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-text-primary hover:bg-[#FAF7F2] hover:text-[#008751] flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <User className="w-4 h-4 text-text-muted" />
                              <span>Profile</span>
                            </div>
                          </Link>

                          <Link
                            href="/account"
                            role="menuitem"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-text-primary hover:bg-[#FAF7F2] hover:text-[#008751] flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Activity className="w-4 h-4 text-text-muted" />
                              <span>Activity</span>
                            </div>
                          </Link>

                          <Link
                            href="/saved"
                            role="menuitem"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-text-primary hover:bg-[#FAF7F2] hover:text-[#008751] flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Heart className="w-4 h-4 text-text-muted" />
                              <span>Saved Spots</span>
                            </div>
                          </Link>

                          <Link
                            href="/dashboard"
                            role="menuitem"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-text-primary hover:bg-[#FAF7F2] hover:text-[#008751] flex items-center justify-between transition-colors"
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
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-text-primary hover:bg-[#FAF7F2] hover:text-[#008751] flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Settings className="w-4 h-4 text-text-muted" />
                              <span>Settings</span>
                            </div>
                          </Link>
                        </div>

                        <div className="h-[1px] bg-border-default/60 my-1" />

                        <div className="py-1">
                          <Link
                            href="/for-business"
                            role="menuitem"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-midnight-lagoon hover:bg-[#FAF7F2] flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Building2 className="w-4 h-4 text-midnight-lagoon" />
                              <span>For Businesses</span>
                            </div>
                            <span className="text-[9px] font-bold text-[#008751] bg-[#EAFDF3] px-1.5 py-0.5 rounded">
                              Venues
                            </span>
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
                    className="h-8.5 px-4 rounded-full bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold flex items-center justify-center transition-all shadow-xs tap-feedback"
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
              className="md:hidden p-2 rounded-xl text-midnight-lagoon hover:bg-surface-grey transition-colors tap-feedback focus-visible:outline-2 focus-visible:outline-[#008751]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation Drawer & Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            id="mobile-navigation-drawer"
            ref={drawerRef}
            className="fixed inset-y-0 right-0 w-full max-w-[320px] bg-white shadow-2xl flex flex-col justify-between p-6 z-50 animate-in slide-in-from-right duration-250 ease-out"
          >
            <div className="space-y-6">
              {/* Drawer Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE4DC]">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center tap-feedback"
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
                  className="p-1.5 text-text-muted hover:text-midnight-lagoon rounded-lg hover:bg-surface-grey transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Authenticated User Status or Sign-in Prompt */}
              {session ? (
                <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC] flex items-center gap-3">
                  <Avatar name={effectiveDisplayName} src={avatarUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-midnight-lagoon truncate">
                      {effectiveDisplayName}
                    </p>
                    <p className="text-[11px] text-text-muted truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#EAFDF3] rounded-2xl border border-[#A3F3C6] space-y-2.5">
                  <p className="text-xs font-bold text-[#00603A]">
                    Plan outings & know your spend
                  </p>
                  <Link
                    href={`/login${pathname !== "/" ? `?returnTo=${encodeURIComponent(pathname)}` : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full h-10 rounded-xl bg-[#008751] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs tap-feedback"
                  >
                    <span>Log In to OyaPlan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Navigation Links List */}
              <div className="space-y-1">
                {session ? (
                  /* Authenticated Menu Items */
                  <>
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-surface-grey transition-colors"
                    >
                      <User className="w-4 h-4 text-[#008751]" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-surface-grey transition-colors"
                    >
                      <Activity className="w-4 h-4 text-[#008751]" />
                      <span>Activity</span>
                    </Link>

                    <Link
                      href="/saved"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-surface-grey transition-colors"
                    >
                      <Heart className="w-4 h-4 text-[#008751]" />
                      <span>Saved Spots</span>
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-surface-grey transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-[#008751]" />
                      <span>Saved Plans</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-surface-grey transition-colors"
                    >
                      <Settings className="w-4 h-4 text-text-muted" />
                      <span>Settings</span>
                    </Link>
                  </>
                ) : (
                  /* Anonymous Menu Items */
                  <>
                    <Link
                      href="/explore"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-surface-grey transition-colors"
                    >
                      <Compass className="w-4 h-4 text-[#008751]" />
                      <span>Explore Places</span>
                    </Link>

                    <Link
                      href="/saved"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-surface-grey transition-colors"
                    >
                      <Heart className="w-4 h-4 text-[#008751]" />
                      <span>Saved Spots</span>
                    </Link>
                  </>
                )}

                <div className="h-[1px] bg-[#EAE4DC] my-3" />

                {/* Business Bridge */}
                <Link
                  href="/for-business"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-[#FAF7F2] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-midnight-lagoon" />
                    <span>For Businesses</span>
                  </div>
                  <span className="text-[9px] font-bold text-[#008751] bg-[#EAFDF3] px-1.5 py-0.5 rounded">
                    Venues
                  </span>
                </Link>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#EAE4DC] space-y-3">
              {session && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full h-10 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 flex items-center justify-center gap-2 transition-colors tap-feedback"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              )}

              <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
                <Link href="/privacy" onClick={() => setMobileMenuOpen(false)} className="hover:underline">
                  Privacy
                </Link>
                <span>•</span>
                <Link href="/terms" onClick={() => setMobileMenuOpen(false)} className="hover:underline">
                  Terms
                </Link>
                <span>•</span>
                <span>© {new Date().getFullYear()} OyaPlan</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
