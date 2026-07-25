import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}

