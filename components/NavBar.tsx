"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { ChevronLeft, User, LogOut, Bookmark } from "lucide-react";
import { useAuth } from "./providers/AuthProvider";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isLoading, openModal, signOut } = useAuth();

  // Hide on feedback and list-your-spot pages (if standalone)
  if (pathname === "/feedback" || pathname === "/list-your-spot" || pathname === "/suggest-a-spot") return null;

  const centerLinks = [
    { name: "Plan", href: "/" },
    { name: "Explore", href: "/explore" },
    { name: "Saved Ideas", href: "/saved" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-[56px] bg-white border-b border-border-default z-50 flex items-center justify-between px-4 md:px-6">
      {/* Left: Back (Mobile) + Logo */}
      <div className="flex items-center gap-1 md:gap-0">
        {pathname !== "/" && (
          <button 
            onClick={() => router.back()} 
            className="md:hidden p-2 -ml-2 text-text-primary hover:text-brand-green transition-colors tap-feedback"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <Link href="/" className="flex items-center tap-feedback">
          <Image
            src="/logo.png"
            alt="OyaPlan"
            width={610}
            height={143}
            className="h-7 w-auto"
            priority
          />
        </Link>
      </div>



      {/* Right: Links (Desktop) / CTA (Mobile) */}
      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden md:flex items-center gap-6">
          {centerLinks
            .filter((link) => !(link.name === "Plan" && pathname === "/"))
            .map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              
              // Dynamic link builders to preserve planning context strictly between Plan and Explore
              const getLinkHref = (href: string) => {
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

              return (
                <div key={link.href} className="flex items-center">
                  <Link
                    href={getLinkHref(link.href)}
                    className={`type-label relative h-[56px] flex items-center transition-all duration-150 ${
                      isActive 
                        ? "text-brand-green" 
                        : "text-text-secondary hover:text-brand-green"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-green origin-bottom"
                        style={{
                          transition: "transform 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                          transform: "scaleX(1)"
                        }}
                      />
                    )}
                  </Link>
                </div>
              );
            })}
        </div>



          {isLoading ? (
            <div className="w-10 h-10 rounded-full bg-surface-grey animate-pulse"></div>
          ) : session ? (
            <div className="relative group">
              <button
                type="button"
                aria-label="User profile dropdown"
                aria-haspopup="menu"
                className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center tap-feedback"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Dropdown menu — with slide and fade transition */}
              <div 
                role="menu" 
                className="absolute right-0 top-full mt-2 w-48 bg-white border border-border-default rounded-[12px] shadow-lg opacity-0 invisible translate-y-2 scale-95 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:scale-100 transition-all duration-200 ease-out py-2"
              >
                <Link href="/dashboard" role="menuitem" className="w-full text-left px-4 py-2 type-body text-text-primary hover:bg-surface-grey flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-text-muted" />
                  Saved Plans
                </Link>
                <div className="h-[1px] bg-border-default my-2"></div>
                <button
                  role="menuitem"
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-2 type-body text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <Button 
              onClick={() => openModal()}
              variant="outline" 
              className="h-9 md:h-10 rounded-full type-label px-3.5 md:px-5 border-border-default hover:bg-surface-grey text-xs md:text-sm font-bold"
            >
              Sign In
            </Button>
          )}

        {/* Mobile CTA */}
        <div className="md:hidden ml-4">
          {pathname !== "/" && (
            <Link href={(() => {
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
              return qs ? `/?${qs}` : "/";
            })()}>
              <Button className="bg-brand-green text-white font-[900] rounded-full type-label h-10 px-5 tap-feedback border-none hover:bg-brand-green-70">
                Start Planning
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
