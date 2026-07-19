import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import { Toaster } from "@/components/ui/sonner";
import AuthModal from "@/components/AuthModal";

const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
// Using Inter (sans-serif) for both body and display
const displayFont = Inter({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://oyaplan.com"),
  title: "OyaPlan | Find where to go, know what it costs",
  description: "Stop debating, start outing. Get a complete Lagos plan with verified prices and transport estimates in under two minutes.",
  keywords: ["Lagos", "Planning", "Outing", "Squad", "Food", "Transport", "Nigeria"],
  openGraph: {
    title: "OyaPlan | Find where to go, know what it costs",
    description: "Stop debating, start outing. Get your Lagos plan in under two minutes.",
    url: "https://oyaplan.com",
    siteName: "OyaPlan",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "OyaPlan: The Squad Outing Plan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OyaPlan | Lagos Outing Planner",
    description: "Stop debating, start outing. Get your Lagos plan in 60s.",
    images: ["/og"],
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#008751",
};

import { Suspense } from "react";
import NavBar from "@/components/NavBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${displayFont.variable}`}>
      <body className="font-body antialiased">
        <AnalyticsProvider>
          <AuthProvider>
            <Suspense fallback={
              <nav className="fixed top-0 left-0 right-0 h-[56px] bg-white border-b border-border-default z-50 flex items-center justify-between px-4 md:px-6">
                <div className="w-24 h-7 bg-slate-100 animate-pulse rounded"></div>
                <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse"></div>
              </nav>
            }>
              <NavBar />
            </Suspense>
            <div className="pt-14">
              {children}
            </div>
            <AuthModal />
            <Toaster richColors position="bottom-right" />
          </AuthProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
