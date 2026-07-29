import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:ml-64 min-h-screen">
        <div className="pt-20 lg:pt-0 p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}

