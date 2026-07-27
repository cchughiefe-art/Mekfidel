'use client';

import { ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { getServiceIcon } from '@/lib/utils/icon-mapper';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { Service } from '@/types';

export default function ServicesPage() {
  const supabase = createClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ['services-page'],
    queryFn: async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      return (data || []) as Service[];
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero py-20 md:py-32">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Our Services</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Comprehensive mobile solutions from sales to repair and wholesale.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding">
        <div className="container-custom">
          {isLoading ? (
            <div className="py-20"><Spinner /></div>
          ) : !services?.length ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No services available at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-8">
              {services.map((service) => {
                const Icon = getServiceIcon(service.icon);
                return (
                  <div key={service.id} className="card p-8 md:p-12 grid md:grid-cols-3 gap-8 card-hover">
                    <div className="space-y-4">
                      <div className={`w-16 h-16 rounded-2xl ${service.color} flex items-center justify-center`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{service.description}</p>
                    </div>
                    <div className="md:col-span-2">
                      {service.features?.length > 0 && (
                        <>
                          <h4 className="font-semibold text-gray-900 mb-4">What We Offer:</h4>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {service.features.map((feature, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-2 text-gray-600">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      <div className="mt-6">
                        <Link href="/contact">
                          <Button variant="primary">
                            Request This Service
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle mx-auto">Simple steps to get started with our services.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Contact Us', desc: 'Reach out via phone, WhatsApp, email, or visit our store.' },
              { step: '02', title: 'Get a Quote', desc: 'We provide transparent pricing with no hidden fees.' },
              { step: '03', title: 'Service Delivery', desc: 'We complete the service with quality and care.' },
              { step: '04', title: 'Satisfaction', desc: 'Enjoy your product with full warranty and support.' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-20 text-center">
        <div className="container-custom">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Need a Service Not Listed?</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Contact us and we will find a solution for you.
          </p>
          <Link href="/contact" className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all inline-block">
            Contact Us Today
          </Link>
        </div>
      </section>
    </div>
  );
}

