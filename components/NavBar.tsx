"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  // Hide on feedback page
  if (pathname === "/feedback") return null;

  const links = [
    { name: "Plan", href: "/" },
    { name: "Explore", href: "/explore" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 z-[100] flex items-center justify-between px-6">
      <Link href="/" className="flex items-center">
        <span className="text-xl font-black tracking-tighter text-[#008751]">
          OyaPlan<span className="text-gray-300 font-normal">.com</span>
        </span>
      </Link>

      <div className="flex items-center gap-6">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[11px] font-black uppercase tracking-widest transition-colors ${
                isActive ? "text-[#008751]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
