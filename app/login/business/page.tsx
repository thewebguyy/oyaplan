import { Suspense } from "react";
import BusinessAuthBridge from "@/components/auth/BusinessAuthBridge";

export const metadata = {
  title: "Operator's Desk Sign In — OyaPlan",
  description: "Manage how your venue appears, what customers see, and the demand coming through OyaPlan.",
};

export default function BusinessLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#0C0D0E] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#008751] border-t-[#F6C642] animate-spin" /></div>}>
      <BusinessAuthBridge />
    </Suspense>
  );
}
