'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { getServiceIcon } from '@/lib/utils/icon-mapper';
import { Spinner } from '@/components/ui/spinner';
import type { Service } from '@/types';

export function ServicesOverview() {
  const supabase = createClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ['home-services'],
    queryFn: async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      return (data || []) as Service[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="section-padding bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle mx-auto">
            Comprehensive mobile solutions tailored to meet all your phone needs.
          </p>
        </div>

        {isLoading ? (
          <div className="py-20"><Spinner /></div>
        ) : !services?.length ? (
          <div className="text-center py-16 text-gray-400">
            <p>Services coming soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = getServiceIcon(service.icon);
              return (
                <div
                  key={service.id}
                  className="card p-6 card-hover flex items-start gap-5"
                >
                  <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/services"
            className="btn-primary inline-flex items-center gap-2"
          >
            View All Services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

