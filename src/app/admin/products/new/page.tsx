'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { productSchema } from '@/lib/utils/validators';
import { slugify } from '@/lib/utils/format';
import { uploadFile } from '@/lib/utils/supabase-storage';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { z } from 'zod';

type ProductFormData = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_active: true,
      is_featured: false,
      availability: 'in_stock',
      warranty: '1 Year Warranty',
      features: [],
      specifications: {},
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);
    setImagePreviewUrls(newImages.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviewUrls(newImages.map(f => URL.createObjectURL(f)));
  };

  const addFeature = () => setFeatures([...features, '']);
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));
  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const [specKeys, setSpecKeys] = useState<string[]>(['']);
  const [specVals, setSpecVals] = useState<string[]>(['']);

  const handleSpecKeyChange = (i: number, v: string) => { const k = [...specKeys]; k[i] = v; setSpecKeys(k); };
  const handleSpecValChange = (i: number, v: string) => { const val = [...specVals]; val[i] = v; setSpecVals(val); };
  const addSpec = () => { setSpecKeys([...specKeys, '']); setSpecVals([...specVals, '']); };
  const removeSpec = (i: number) => { setSpecKeys(specKeys.filter((_, idx) => idx !== i)); setSpecVals(specVals.filter((_, idx) => idx !== i)); };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // Upload images
      const uploadedUrls: string[] = [];
      for (const file of images) {
        const result = await uploadFile('products', file);
        if (result) uploadedUrls.push(result.url);
      }

      // Build product data
      const productData = {
        ...data,
        slug: data.slug || slugify(data.name),
        images: uploadedUrls,
        features: features.filter(f => f.trim()),
        specifications: specKeys.reduce((acc: Record<string, string>, key, i) => {
          if (key.trim() && specVals[i]?.trim()) acc[key.trim()] = specVals[i].trim();
          return acc;
        }, {}),
      };

      const { error } = await supabase.from('products').insert(productData);
      if (error) throw error;

      toast.success('Product created successfully');
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
          <p className="text-gray-500 mt-1">Create a new product</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Input label="Product Name" {...register('name')} error={errors.name?.message} />
            <Input label="Slug (leave blank to auto-generate)" {...register('slug')} />
          </div>
          <Textarea label="Description" rows={4} {...register('description')} error={errors.description?.message} />
          
          <div className="grid sm:grid-cols-2 gap-6">
            <Select
              label="Category"
              options={categories || []}
              placeholder="Select category"
              {...register('category_id')}
              error={errors.category_id?.message}
            />
            <Select
              label="Brand"
              options={brands || []}
              placeholder="Select brand"
              {...register('brand_id')}
              error={errors.brand_id?.message}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Pricing & Inventory</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <Input label="Price (NGN)" type="number" {...register('price')} error={errors.price?.message} />
            <Input label="Compare Price (Optional)" type="number" {...register('compare_price')} />
            <Input label="Stock Quantity" type="number" {...register('stock')} error={errors.stock?.message} />
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <Input label="SKU" {...register('sku')} error={errors.sku?.message} />
            <Input label="Warranty" {...register('warranty')} />
            <Select
              label="Availability"
              options={[
                { value: 'in_stock', label: 'In Stock' },
                { value: 'out_of_stock', label: 'Out of Stock' },
                { value: 'pre_order', label: 'Pre-Order' },
              ]}
              {...register('availability')}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Images</h2>
          <div className="flex flex-wrap gap-4">
            {imagePreviewUrls.map((url, idx) => (
              <div key={idx} className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Upload</span>
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </label>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Features</h2>
          {features.map((feature, idx) => (
            <div key={idx} className="flex gap-2">
              <input type="text" value={feature} onChange={e => updateFeature(idx, e.target.value)} className="input-field flex-1" placeholder="Enter a feature" />
              {features.length > 1 && (
                <button type="button" onClick={() => removeFeature(idx)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl"><X className="w-4 h-4" /></button>
              )}
            </div>
          ))}
          <Button type="button" variant="ghost" onClick={addFeature}><Plus className="w-4 h-4 mr-2" />Add Feature</Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Specifications</h2>
          {specKeys.map((_, idx) => (
            <div key={idx} className="flex gap-2">
              <input type="text" value={specKeys[idx]} onChange={e => handleSpecKeyChange(idx, e.target.value)} className="input-field flex-1" placeholder="Spec name (e.g., Screen Size)" />
              <input type="text" value={specVals[idx]} onChange={e => handleSpecValChange(idx, e.target.value)} className="input-field flex-1" placeholder="Spec value (e.g., 6.5 inch)" />
              {specKeys.length > 1 && (
                <button type="button" onClick={() => removeSpec(idx)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl"><X className="w-4 h-4" /></button>
              )}
            </div>
          ))}
          <Button type="button" variant="ghost" onClick={addSpec}><Plus className="w-4 h-4 mr-2" />Add Specification</Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Visibility</h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('is_active')} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('is_featured')} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
              <span className="text-sm">Featured</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="primary" size="lg" type="submit" loading={isSubmitting}>
            Create Product
          </Button>
          <Link href="/admin/products">
            <Button variant="ghost" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

