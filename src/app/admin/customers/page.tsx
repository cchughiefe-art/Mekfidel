'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { Search, Smartphone } from 'lucide-react';
import { useState } from 'react';

export default function AdminCustomersPage() {
  const supabase = createClient();
  const [search, setSearch] = useState('');

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers', search],
    queryFn: async () => {
      let query = supabase.from('customers').select('*').order('created_at', { ascending: false }).limit(50);
      if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      const { data } = await query;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Customers</h1><p className="text-gray-500 mt-1">View your customers</p></div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="input-field pl-12" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50">
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Phone</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Orders</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Location</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan={5} className="py-20"><Spinner /></td></tr> :
              customers?.length === 0 ? <tr><td colSpan={5} className="py-20 text-center text-gray-500">No customers yet</td></tr> :
              customers?.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-gray-500">{c.email}</td>
                  <td className="px-6 py-4 text-gray-500">{c.phone}</td>
                  <td className="px-6 py-4">{c.total_orders || 0}</td>
                  <td className="px-6 py-4 text-gray-500">{c.city || '-'}, {c.state || '-'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

