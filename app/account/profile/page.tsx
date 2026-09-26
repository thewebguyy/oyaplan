import { Suspense } from "react";
import { SessionResolver } from "@/lib/services/identity/sessionResolver";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Account Profile — OyaPlan",
  description: "View and manage your personal OyaPlan profile details.",
};

export default async function AccountProfilePage() {
  const identity = await SessionResolver.resolveIdentity();
  const isAuthenticated = identity.type === "authenticated";

  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-[#FAF7F2] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#008751] border-t-transparent animate-spin" />
        </div>
      }
    >
      <ProfileClient
        isAuthenticated={isAuthenticated}
        profile={identity.profile}
      />
    </Suspense>
  );
}
