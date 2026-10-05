import { Suspense } from "react";
import PlannerAuthForm from "@/components/auth/PlannerAuthForm";

export const metadata = {
  title: "Sign In — OyaPlan",
  description: "Sign in to your OyaPlanner account to access saved spots, run plans with friends, and view your outing passport.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#FAF7F2] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#008751] border-t-transparent animate-spin" /></div>}>
      <PlannerAuthForm />
    </Suspense>
  );
}
