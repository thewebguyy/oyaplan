import { Suspense } from "react";
import SettingsClient from "@/components/account/SettingsClient";

export const metadata = {
  title: "Settings — OyaPlan",
  description: "Manage your OyaPlan account settings and preferences.",
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#FAF7F2] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#008751] border-t-transparent animate-spin" /></div>}>
      <SettingsClient />
    </Suspense>
  );
}
