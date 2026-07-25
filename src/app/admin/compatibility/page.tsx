'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { Plus, Pencil, Trash2, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCompatibilityPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ brand: '', model: '', series: '', screen_code: '', manufacturer_model: '', compatible_with: '', notes: '' });

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-compatibility'],
    queryFn: async () => {
      const { data } = await supabase.from('screen_compatibility').select('*').order('brand').order('model');
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const compatible_with = formData.compatible_with.split(',').map(s => s.trim()).filter(Boolean);
      const payload = { ...formData, compatible_with };

      if (editing) {
        const { error } = await supabase.from('screen_compatibility').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('screen_compatibility').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-compatibility'] });
      setShowModal(false); setEditing(null);
      toast.success(editing ? 'Updated' : 'Created');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('screen_compatibility').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-compatibility'] }); toast.success('Deleted'); },
    onError: (error: any) => toast.error(error.message),
  });

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).filter(Boolean);

    let success = 0;
    for (const line of rows) {
      const vals = line.split(',');
      const row: any = {};
      headers.forEach((h, i) => { row[h.trim()] = vals[i]?.trim(); });

      if (row.brand && row.model) {
        const compatible_with = row.compatible_with ? row.compatible_with.split(';') : [];
        const { error } = await supabase.from('screen_compatibility').insert({ ...row, compatible_with });
        if (!error) success++;
      }
    }

    queryClient.invalidateQueries({ queryKey: ['admin-compatibility'] });
    toast.success(`Imported ${success} records`);
  };

  const handleCSVExport = () => {
    if (!items) return;
    const headers = ['brand', 'model', 'series', 'screen_code', 'manufacturer_model', 'compatible_with', 'notes'];
    const csv = [headers.join(','), ...items.map((item: any) =>
      headers.map(h => {
        const val = item[h];
        if (h === 'compatible_with') return (val || []).join(';');
        return val || '';
      }).join(',')
    )].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screen-compatibility.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const handleBulkDelete = async () => {
    if (!confirm('Delete ALL compatibility records? This cannot be undone.')) return;
    const { error } = await supabase.from('screen_compatibility').delete().neq('id', '0');
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['admin-compatibility'] });
      toast.success('All records deleted');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Phone Screen Compatibility</h1><p className="text-gray-500 mt-1">Manage compatibility database</p></div>
        <div className="flex gap-3">
          <label className="btn-outline text-sm cursor-pointer inline-flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
          </label>
          <Button variant="ghost" size="sm" onClick={handleCSVExport}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
          <Button variant="primary" onClick={() => { setEditing(null); setFormData({ brand: '', model: '', series: '', screen_code: '', manufacturer_model: '', compatible_with: '', notes: '' }); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />Add Record
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="danger" size="sm" onClick={handleBulkDelete}>Bulk Delete All</Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead><tr className="bg-gray-50">
            <th className="text-left px-6 py-4 text-sm font-semibold">Brand</th>
            <th className="text-left px-6 py-4 text-sm font-semibold">Model</th>
            <th className="text-left px-6 py-4 text-sm font-semibold">Series</th>
            <th className="text-left px-6 py-4 text-sm font-semibold">Screen Code</th>
            <th className="text-left px-6 py-4 text-sm font-semibold">Manuf. Model</th>
            <th className="text-left px-6 py-4 text-sm font-semibold">Compatible With</th>
            <th className="text-right px-6 py-4 text-sm font-semibold">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan={7} className="py-20"><Spinner /></td></tr> :
              items?.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{item.brand}</td>
                  <td className="px-6 py-4">{item.model}</td>
                  <td className="px-6 py-4 text-gray-500">{item.series || '-'}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-sm">{item.screen_code || '-'}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-sm">{item.manufacturer_model || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(item.compatible_with || []).slice(0, 3).map((c: string, i: number) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{c}</span>
                      ))}
                      {(item.compatible_with?.length || 0) > 3 && <span className="text-xs text-gray-400">+{item.compatible_with.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditing(item);
                        setFormData({
                          brand: item.brand, model: item.model, series: item.series || '',
                          screen_code: item.screen_code || '', manufacturer_model: item.manufacturer_model || '',
                          compatible_with: (item.compatible_with || []).join(', '), notes: item.notes || '',
                        });
                        setShowModal(true);
                      }}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Record' : 'Add Record'} size="lg">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Brand" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
            <Input label="Model" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Series" value={formData.series} onChange={e => setFormData({...formData, series: e.target.value})} />
            <Input label="Screen Code" value={formData.screen_code} onChange={e => setFormData({...formData, screen_code: e.target.value})} />
          </div>
          <Input label="Manufacturer Model" value={formData.manufacturer_model} onChange={e => setFormData({...formData, manufacturer_model: e.target.value})} />
          <Input label="Compatible With (comma separated)" value={formData.compatible_with} onChange={e => setFormData({...formData, compatible_with: e.target.value})} />
          <Input label="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => mutation.mutate()} loading={mutation.isPending}>{editing ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

