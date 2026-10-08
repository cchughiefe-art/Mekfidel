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
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar role={role} />
      <div className="lg:ml-64 min-h-screen">
        <div className="pt-20 lg:pt-0 p-4 lg:p-8">
          <AdminErrors />
          {children}
        </div>
      </div>
    </div>
  );
}
