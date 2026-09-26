import { Suspense } from "react";
import FinishSignupForm from "@/components/auth/FinishSignupForm";

export const metadata = {
  title: "Complete Your Profile — OyaPlan",
  description: "Complete your OyaPlan account profile.",
};

export default function FinishSignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#FAF7F2] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#008751] border-t-transparent animate-spin" /></div>}>
      <FinishSignupForm />
    </Suspense>
  );
}
