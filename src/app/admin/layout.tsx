import { AdminTopbar } from "@/components/layout/admin-topbar";
import { AdminErrors } from "@/components/layout/admin-errors";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { createAdminClient } from "@/lib/supabase/server";
export const metadata = { robots: { index: false, follow: false } };

import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let role: "admin" | "editor" = "editor";
  try {
    const db = await createAdminClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    const { data: profile } = await db
      .from("profiles")
      .select("role")
      .eq("id", user!.id)
      .single();
    role = profile?.role === "admin" ? "admin" : "editor";
  } catch {
    redirect("/auth/login");
  }

  return (
    <div className="admin-workspace min-h-screen">
      <AdminSidebar role={role} />
      <div className="lg:ml-64 min-h-screen">
        <div className="mx-auto max-w-[1600px] p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8 lg:pt-6">
          <AdminTopbar role={role} />
          <AdminErrors />
          {children}
        </div>
      </div>
    </div>
  );
}
