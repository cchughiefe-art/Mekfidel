'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ProductCard } from '@/components/ui/product-card';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { useCart } from '@/providers/cart-provider';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product, Category, Brand } from '@/types';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('name');
      return data as Category[];
    },
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data } = await supabase.from('brands').select('*').eq('is_active', true).order('name');
      return data as Brand[];
    },
  });

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products', selectedCategory, selectedBrand, sortBy, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*)
        `)
        .eq('is_active', true);

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }
      if (selectedBrand) {
        query = query.eq('brand_id', selectedBrand);
      }
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      switch (sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });

  const handleAddToCart = (product: Product) => {
    if (product.availability !== 'in_stock' || product.stock === 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSearchQuery('');
    setSortBy('newest');
    setPriceRange([0, 1000000]);
  };

  const hasActiveFilters = selectedCategory || selectedBrand || searchQuery || sortBy !== 'newest';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-2">Browse our complete catalog of phones, accessories, and spare parts.</p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-12"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input-field w-auto"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-outline px-4 ${showFilters ? 'bg-blue-600 text-white' : ''}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  {categories?.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Brand</h3>
                <div className="space-y-2">
                  {brands?.map(brand => (
                    <button
                      key={brand.id}
                      onClick={() => setSelectedBrand(selectedBrand === brand.id ? '' : brand.id)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedBrand === brand.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-ghost text-sm flex items-center gap-1">
                  <X className="w-4 h-4" /> Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <ErrorState onRetry={refetch} />
            ) : !products || products.length === 0 ? (
              <EmptyState
                icon={<Smartphone className="w-10 h-10 text-gray-400" />}
                title="No products found"
                description={searchQuery ? `No results for "${searchQuery}"` : 'Products will appear here once added.'}
                action={
                  hasActiveFilters ? (
                    <button onClick={clearFilters} className="btn-outline">
                      Clear Filters
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

