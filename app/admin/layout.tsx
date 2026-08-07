import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAuthorizedAdmin } from "@/lib/admin/permissions";
import Sidebar from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const isLoginPage = pathname === "/admin/login" || pathname.endsWith("/admin/login");

  const auth = await isAuthorizedAdmin();

  // If currently on login page
  if (isLoginPage) {
    if (auth.authorized) {
      redirect("/admin");
    }
    return <div className="min-h-[100dvh] bg-[#FAFAF8] flex-1 w-full">{children}</div>;
  }

  // For all other /admin routes, enforce strict authorization
  if (!auth.authorized) {
    redirect("/admin/login");
  }

  return (
    <div className="h-[100dvh] w-full bg-[#FAFAF8] flex flex-col md:flex-row antialiased overflow-hidden">
      <Sidebar userEmail={auth.email} role={auth.role} />
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto h-full scroll-smooth">
        {children}
      </main>
    </div>
  );
}
