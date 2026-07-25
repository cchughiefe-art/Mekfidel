'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '@/components/ui/product-card';
import { Spinner } from '@/components/ui/spinner';
import { useCart } from '@/providers/cart-provider';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/types';

export function FeaturedProducts() {
  const { addItem } = useCart();
  const supabase = createClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(8);
      if (error) throw error;
      return data as Product[];
    },
  });

  const handleAddToCart = (product: Product) => {
    if (product.availability !== 'in_stock' || product.stock === 0) {
      toast.error('This product is currently out of stock');
      return;
    }
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Handpicked favorites just for you.</p>
          </div>
          <Link
            href="/products"
            className="btn-ghost hidden sm:flex items-center gap-2"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <SmartphoneIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No featured products yet</h3>
            <p className="text-gray-500 mt-1">Products marked as featured will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-10 sm:hidden">
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SmartphoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  );
}

