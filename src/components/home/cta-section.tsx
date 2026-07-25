'use client';

import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useSettings } from '@/hooks/use-supabase-query';

export function CTASection() {
  const { data: settings } = useSettings();

  return (
    <section className="gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container-custom relative z-10 py-20 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
          Browse our catalog, request a quote, or visit our store. We are here to help you with all your mobile needs.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/products"
            className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-xl inline-flex items-center gap-2"
          >
            <ArrowRight className="w-5 h-5" />
            Shop Now
          </Link>
          <a
            href={`https://wa.me/${settings?.whatsapp || '2348000000000'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-all shadow-xl inline-flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

