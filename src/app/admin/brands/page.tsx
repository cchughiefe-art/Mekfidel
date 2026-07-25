'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBrandsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: brands, isLoading } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const { data } = await supabase.from('brands').select('*').order('name');
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from('brands').update({ name, description }).eq('id', editing.id);
        if (error) throw error;
      } else {
        const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
        const { error } = await supabase.from('brands').insert({ name, slug, description });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      setShowModal(false); setEditing(null); setName(''); setDescription('');
      toast.success(editing ? 'Brand updated' : 'Brand created');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('brands').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-brands'] }); toast.success('Brand deleted'); },
    onError: (error: any) => toast.error(error.message),
  });

  const openEdit = (brand: any) => { setEditing(brand); setName(brand.name); setDescription(brand.description || ''); setShowModal(true); };
  const openCreate = () => { setEditing(null); setName(''); setDescription(''); setShowModal(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Brands</h1><p className="text-gray-500 mt-1">Manage product brands</p></div>
        <Button variant="primary" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Brand</Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50">
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Slug</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan={4} className="py-20"><Spinner /></td></tr> :
              brands?.map((brand: any) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{brand.name}</td>
                  <td className="px-6 py-4 text-gray-500">{brand.slug}</td>
                  <td className="px-6 py-4"><Badge variant={brand.is_active ? 'success' : 'warning'}>{brand.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(brand)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(brand.id); }}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Brand' : 'New Brand'}>
        <div className="space-y-4">
          <Input label="Brand Name" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Description (Optional)" value={description} onChange={e => setDescription(e.target.value)} />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => mutation.mutate()} loading={mutation.isPending}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

