'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { uploadFile, deleteFile } from '@/lib/utils/supabase-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product-edit', params.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', params.id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories-select'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('name');
      return (data || []).map((c: any) => ({ value: c.id, label: c.name }));
    },
  });

  const { data: brands } = useQuery({
    queryKey: ['brands-select'],
    queryFn: async () => {
      const { data } = await supabase.from('brands').select('*').eq('is_active', true).order('name');
      return (data || []).map((b: any) => ({ value: b.id, label: b.name }));
    },
  });

  const [formData, setFormData] = useState<any>({});
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>(['']);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);

  useEffect(() => {
    if (product) {
      setFormData(product);
      setExistingImages(product.images || []);
      setFeatures(product.features?.length ? product.features : ['']);
      const specEntries = product.specifications ? Object.entries(product.specifications).map(([key, value]) => ({ key, value: value as string })) : [{ key: '', value: '' }];
      setSpecs(specEntries);
    }
  }, [product]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let images = [...existingImages];
      
      for (const file of newImages) {
        const result = await uploadFile('products', file);
        if (result) images.push(result.url);
      }

      const { error } = await supabase
        .from('products')
        .update({
          ...formData,
          images,
          features: features.filter(f => f.trim()),
          specifications: specs.reduce((acc: Record<string, string>, s) => {
            if (s.key.trim() && s.value.trim()) acc[s.key.trim()] = s.value.trim();
            return acc;
          }, {}),
        })
        .eq('id', params.id);

      if (error) throw error;
      toast.success('Product updated');
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Spinner size="lg" />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-500 mt-1">{formData.name}</p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <h2 className="text-lg font-bold">Basic Info</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Input label="Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
            <Input label="Slug" value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} />
          </div>
          <Textarea label="Description" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} />
          <div className="grid sm:grid-cols-2 gap-6">
            <Select label="Category" options={categories || []} placeholder="Select" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} />
            <Select label="Brand" options={brands || []} placeholder="Select" value={formData.brand_id} onChange={e => setFormData({...formData, brand_id: e.target.value})} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <h2 className="text-lg font-bold">Pricing</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <Input label="Price" type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} />
            <Input label="Compare Price" type="number" value={formData.compare_price || ''} onChange={e => setFormData({...formData, compare_price: e.target.value})} />
            <Input label="Stock" type="number" value={formData.stock || ''} onChange={e => setFormData({...formData, stock: e.target.value})} />
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <Input label="SKU" value={formData.sku || ''} onChange={e => setFormData({...formData, sku: e.target.value})} />
            <Input label="Warranty" value={formData.warranty || ''} onChange={e => setFormData({...formData, warranty: e.target.value})} />
            <Select label="Availability" options={[{value:'in_stock',label:'In Stock'},{value:'out_of_stock',label:'Out of Stock'},{value:'pre_order',label:'Pre-Order'}]} value={formData.availability || 'in_stock'} onChange={e => setFormData({...formData, availability: e.target.value})} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <h2 className="text-lg font-bold">Images</h2>
          <div className="flex flex-wrap gap-4">
            {existingImages.map((url, idx) => (
              <div key={idx} className="relative w-32 h-32 rounded-xl overflow-hidden border">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={async () => {
                  const path = url.split('/').pop();
                  if (path) await deleteFile('products', path);
                  setExistingImages(existingImages.filter((_, i) => i !== idx));
                }} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
            <Upload className="w-4 h-4" /> Add Images
            <input type="file" multiple accept="image/*" className="hidden" onChange={e => setNewImages(Array.from(e.target.files || []))} />
          </label>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-4">
          <h2 className="text-lg font-bold">Features</h2>
          {features.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input value={f} onChange={e => { const nf = [...features]; nf[i] = e.target.value; setFeatures(nf); }} className="input-field flex-1" placeholder="Feature" />
              {features.length > 1 && <button type="button" onClick={() => setFeatures(features.filter((_, idx) => idx !== i))} className="p-3 text-red-500"><X className="w-4 h-4" /></button>}
            </div>
          ))}
          <Button type="button" variant="ghost" onClick={() => setFeatures([...features, ''])}><Plus className="w-4 h-4 mr-2" />Add</Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-4">
          <h2 className="text-lg font-bold">Specifications</h2>
          {specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input value={s.key} onChange={e => { const ns = [...specs]; ns[i].key = e.target.value; setSpecs(ns); }} className="input-field flex-1" placeholder="Key" />
              <input value={s.value} onChange={e => { const ns = [...specs]; ns[i].value = e.target.value; setSpecs(ns); }} className="input-field flex-1" placeholder="Value" />
              {specs.length > 1 && <button type="button" onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))} className="p-3 text-red-500"><X className="w-4 h-4" /></button>}
            </div>
          ))}
          <Button type="button" variant="ghost" onClick={() => setSpecs([...specs, { key: '', value: '' }])}><Plus className="w-4 h-4 mr-2" />Add</Button>
        </div>

        <div className="flex gap-4">
          <Button variant="primary" size="lg" type="submit" loading={isSubmitting}>Save Changes</Button>
          <Link href="/admin/products"><Button variant="ghost" size="lg">Cancel</Button></Link>
        </div>
      </form>
    </div>
  );
}

