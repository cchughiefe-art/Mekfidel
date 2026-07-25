'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ProductCard } from '@/components/ui/product-card';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { useCart } from '@/providers/cart-provider';
import { Search, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const supabase = createClient();
  const { addItem } = useCart();

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const [productsRes, postsRes] = await Promise.all([
        supabase
          .from('products')
          .select(`*, category:categories(*), brand:brands(*)`)
          .eq('is_active', true)
          .or(`name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%`),
        supabase
          .from('blog_posts')
          .select('*')
          .eq('is_published', true)
          .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`),
      ]);

      return {
        products: (productsRes.data || []) as Product[],
        posts: postsRes.data || [],
      };
    },
    enabled: query.length >= 2,
  });

  const handleAddToCart = (product: Product) => {
    if (product.availability !== 'in_stock' || product.stock === 0) {
      toast.error('Out of stock');
      return;
    }
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-8">
          <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
          <p className="text-gray-500 mt-2">
            {query ? `Showing results for "${query}"` : 'Enter a search term to find products'}
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {!query ? (
          <EmptyState
            icon={<Search className="w-10 h-10" />}
            title="Search for something"
            description="Try searching for a product or blog post."
          />
        ) : isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-12">
            {/* Products */}
            {results?.products && results.products.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Products ({results.products.length})</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {results.products.map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              </div>
            )}

            {/* Blog Posts */}
            {results?.posts && results.posts.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Blog Posts ({results.posts.length})</h2>
                <div className="space-y-4">
                  {results.posts.map((post: any) => (
                    <a key={post.id} href={`/blog/${post.slug}`} className="card p-6 block hover:shadow-md transition-all">
                      <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{post.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{post.excerpt}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {results && results.products.length === 0 && results.posts.length === 0 && (
              <EmptyState
                icon={<Smartphone className="w-10 h-10" />}
                title="No results found"
                description={`We couldn't find anything for "${query}". Try a different search term.`}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
