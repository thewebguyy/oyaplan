import { Suspense } from "react";
import BusinessAuthBridge from "@/components/auth/BusinessAuthBridge";

export const metadata = {
  title: "Access The Floor — OyaPlan",
  description: "Manage your presence, review squads, and control the vibe.",
};

export default function BusinessLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#090A0D] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#008751] border-t-[#00E575] animate-spin" /></div>}>
      <BusinessAuthBridge />
    </Suspense>
  );
}
