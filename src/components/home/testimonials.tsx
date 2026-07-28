'use client';

import { useQuery } from '@tanstack/react-query';
import { Star, Quote } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import type { Testimonial } from '@/types';

export function Testimonials() {
  const supabase = createClient();

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['public-testimonials'],
    queryFn: async () => {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });
      return (data || []) as Testimonial[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Show default testimonials if none in database
  const displayTestimonials = testimonials?.length ? testimonials : [
    {
      id: '1',
      name: 'Chioma Okafor',
      role: 'Business Owner',
      content: 'Mekfidel Communication has been my go-to store for phone accessories. Their products are genuine and the prices are unbeatable. Highly recommended!',
      rating: 5,
      sort_order: 1,
      is_published: true,
      is_featured: false,
    },
    {
      id: '2',
      name: 'Emmanuel Adeyemi',
      role: 'Tech Enthusiast',
      content: 'I had my phone screen replaced here and the service was exceptional. Quick turnaround and quality work. My phone looks brand new!',
      rating: 5,
      sort_order: 2,
      is_published: true,
      is_featured: false,
    },
    {
      id: '3',
      name: 'Fatima Bello',
      role: 'Retailer',
      content: 'As a retailer, I source all my phone inventory from Mekfidel. Their wholesale prices are competitive and delivery is always on time.',
      rating: 5,
      sort_order: 3,
      is_published: true,
      is_featured: false,
    },
  ] as Testimonial[];

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle mx-auto">
            Trusted by hundreds of customers across Nigeria.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayTestimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="card p-8 relative card-hover"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <Quote className="w-10 h-10 text-blue-100 absolute top-6 right-6" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 relative z-10">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    {testimonial.role && (
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

