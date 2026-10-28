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
    return (
      <div className="min-h-[calc(100vh-56px)] bg-[#FAF8F8] bg-[linear-gradient(to_right,#11111108_1px,transparent_1px),linear-gradient(to_bottom,#11111108_1px,transparent_1px)] bg-[size:32px_32px] flex-1 w-full">
        {children}
      </div>
    );
  }

  // For all other /admin routes, enforce strict authorization
  if (!auth.authorized) {
    redirect("/admin/login");
  }

  return (
    <div className="w-full bg-[#FAF8F8] bg-[linear-gradient(to_right,#11111106_1px,transparent_1px),linear-gradient(to_bottom,#11111106_1px,transparent_1px)] bg-[size:32px_32px] flex flex-col md:flex-row antialiased min-h-[calc(100vh-56px)]">
      <Sidebar userEmail={auth.email} role={auth.role} />
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full min-w-0">
        {children}
      </main>
    </div>
  );
}
