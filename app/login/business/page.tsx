import { Suspense } from "react";
import BusinessAuthBridge from "@/components/auth/BusinessAuthBridge";

export const metadata = {
  title: "Business Sign In — OyaPlan for Business",
  description: "Sign in to manage your venue pricing, table policies, operating updates, and planning signals.",
};

export default function BusinessLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#FAF7F2] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-midnight-lagoon border-t-transparent animate-spin" /></div>}>
      <BusinessAuthBridge />
    </Suspense>
  );
}
