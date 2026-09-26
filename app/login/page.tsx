import { Suspense } from "react";
import LoginWorldSelector from "@/components/auth/LoginWorldSelector";

export const metadata = {
  title: "Sign In — OyaPlan",
  description: "Sign in to OyaPlan as a planner or manage your venue with OyaPlan for Business.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#FAF7F2] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#008751] border-t-transparent animate-spin" /></div>}>
      <LoginWorldSelector />
    </Suspense>
  );
}
