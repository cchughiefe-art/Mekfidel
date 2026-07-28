'use client';

import Link from 'next/link';
import { Smartphone, Headphones, Monitor, Cpu, Battery, Tablet, Wrench, Package, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import type { Category } from '@/types';

const colorOptions = [
  'bg-blue-50 text-blue-600',
  'bg-green-50 text-green-600',
  'bg-purple-50 text-purple-600',
  'bg-orange-50 text-orange-600',
  'bg-red-50 text-red-600',
  'bg-indigo-50 text-indigo-600',
  'bg-yellow-50 text-yellow-600',
  'bg-teal-50 text-teal-600',
];

const iconOptions = [Smartphone, Headphones, Monitor, Cpu, Battery, Tablet, Wrench, Package];

export function ProductCategories() {
  const supabase = createClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('order', { ascending: true });
      return (data || []) as Category[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle mx-auto">
            Browse our extensive collection of mobile phones and accessories.
          </p>
        </div>

        {isLoading ? (
          <div className="py-20"><Spinner /></div>
        ) : !categories?.length ? (
          <div className="text-center py-16 text-gray-400">
            <p>Categories coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat, index) => {
              const colorClass = colorOptions[index % colorOptions.length];
              const Icon = iconOptions[index % iconOptions.length];
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="card p-6 text-center card-hover group"
                >
                  <div className={`w-16 h-16 rounded-2xl ${colorClass} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <Icon className="w-8 h-8" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{cat.description || 'View products'}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

