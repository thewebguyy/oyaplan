import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OyaPlan | Stop the group chat wahala",
  description: "Get one complete Lagos outing plan in 60 seconds. Accurate food costs, transport estimates, and squad-ready vibes.",
  keywords: ["Lagos", "Planning", "Outing", "Squad", "Food", "Transport", "Nigeria"],
  openGraph: {
    title: "OyaPlan | Stop the group chat wahala",
    description: "One tap to copy a complete Lagos plan to WhatsApp.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
