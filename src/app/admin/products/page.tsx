'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { useSupabaseDelete } from '@/hooks/use-supabase-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ['admin-products', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, category:categories(name), brand:brands(name)')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useSupabaseDelete('products', [['admin-products']]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
    toast.success('Product deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="input-field pl-12"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Product</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Brand</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Price</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Stock</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="py-20"><Spinner /></td></tr>
              ) : !products?.length ? (
                <tr><td colSpan={7} className="py-20 text-center text-gray-500">No products found</td></tr>
              ) : products.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.category?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.brand?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium">{formatPrice(product.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={product.is_active ? 'success' : 'warning'}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/edit/${product.id}`}>
                        <Button variant="ghost" size="sm"><Pencil className="w-4 h-4" /></Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(product)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product">
        <div className="space-y-4">
          <p>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteMutation.isPending}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

