'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { formatDate } from '@/lib/utils/format';

export default function AdminUsersPage() {
  const supabase = createClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Users</h1><p className="text-gray-500 mt-1">Manage admin users</p></div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50">
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">User</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Joined</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan={4} className="py-20"><Spinner /></td></tr> :
              users?.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {user.full_name?.charAt(0) || 'A'}
                      </div>
                      <span className="font-medium">{user.full_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={user.role === 'admin' ? 'danger' : 'info'}>{user.role || 'viewer'}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.created_at)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

