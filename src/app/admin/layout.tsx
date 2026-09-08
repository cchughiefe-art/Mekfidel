import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await createAdminClient();
  } catch {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:ml-64 min-h-screen">
        <div className="pt-20 lg:pt-0 p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
