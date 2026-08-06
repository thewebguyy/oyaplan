import React from "react";
import { isAuthorizedAdmin } from "@/lib/admin/permissions";
import Sidebar from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await isAuthorizedAdmin();

  // Route passes directly if login page or authorized
  return (
    <div className="min-h-[100dvh] bg-[#FAFAF8] flex flex-col md:flex-row antialiased">
      {auth.authorized ? (
        <>
          <Sidebar userEmail={auth.email} role={auth.role} />
          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
            {children}
          </main>
        </>
      ) : (
        <div className="flex-1 w-full">{children}</div>
      )}
    </div>
  );
}
