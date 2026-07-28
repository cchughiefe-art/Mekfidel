'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { SimpleIcon } from '@/components/ui/icon-renderer';
import { Spinner } from '@/components/ui/spinner';
import type { FeatureCard } from '@/types';

export function AboutIntro() {
  const supabase = createClient();

  const { data: features, isLoading } = useQuery({
    queryKey: ['cms-features'],
    queryFn: async () => {
      const { data } = await supabase
        .from('feature_cards')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      return (data || []) as FeatureCard[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: section } = useQuery({
    queryKey: ['cms-section-about_intro'],
    queryFn: async () => {
      const { data } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('section_key', 'about_intro')
        .eq('is_active', true)
        .single();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="section-title">{section?.title || 'Why Choose Mekfidel Communication?'}</h2>
          <p className="section-subtitle mx-auto">
            {section?.subtitle || 'We combine quality products with exceptional service to deliver the best mobile experience in Nigeria.'}
          </p>
        </div>

        {isLoading ? (
          <div className="py-20"><Spinner /></div>
        ) : !features?.length ? (
          <div className="text-center py-16 text-gray-400">
            <p>Features coming soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.id} className="card p-8 text-center card-hover">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
                  <SimpleIcon name={feature.icon_name} size={32} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/about" className="btn-outline inline-flex items-center gap-2">
            Learn More About Us
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}


