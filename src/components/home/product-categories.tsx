'use client';

import Link from 'next/link';
import { Smartphone, Headphones, Monitor, Cpu, Battery, Tablet, Wrench, Package } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

const categories = [
  { name: 'Mobile Phones', icon: Smartphone, slug: 'mobile-phones', color: 'bg-blue-50 text-blue-600', count: 'New & Used' },
  { name: 'Phone Accessories', icon: Headphones, slug: 'phone-accessories', color: 'bg-green-50 text-green-600', count: 'Cases, Chargers & More' },
  { name: 'Phone Screens', icon: Monitor, slug: 'phone-screens', color: 'bg-purple-50 text-purple-600', count: 'OEM & Quality' },
  { name: 'Spare Parts', icon: Cpu, slug: 'spare-parts', color: 'bg-orange-50 text-orange-600', count: 'Genuine Parts' },
  { name: 'Batteries', icon: Battery, slug: 'batteries', color: 'bg-red-50 text-red-600', count: 'High Quality' },
  { name: 'Tablets', icon: Tablet, slug: 'tablets', color: 'bg-indigo-50 text-indigo-600', count: 'Latest Models' },
  { name: 'Repair Services', icon: Wrench, slug: 'repair-services', color: 'bg-yellow-50 text-yellow-600', count: 'Expert Technicians' },
  { name: 'Wholesale', icon: Package, slug: 'wholesale', color: 'bg-teal-50 text-teal-600', count: 'Bulk Orders' },
];

export function ProductCategories() {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle mx-auto">
            Browse our extensive collection of mobile phones and accessories.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <Link
                key={index}
                href={`/products?category=${cat.slug}`}
                className="card p-6 text-center card-hover group"
              >
                <div className={`w-16 h-16 rounded-2xl ${cat.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{cat.count}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

