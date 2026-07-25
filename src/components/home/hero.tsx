'use client';

import Link from 'next/link';
import { ArrowRight, Smartphone, Shield, Truck } from 'lucide-react';
import { useSettings } from '@/hooks/use-supabase-query';

export function HeroSection() {
  const { data: settings } = useSettings();

  return (
    <section className="relative overflow-hidden gradient-hero min-h-[90vh] flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              <Shield className="w-4 h-4" />
              <span>Trusted Phone Dealer in Nigeria</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
              {settings?.homepage_hero_title || (
                <>
                  Your Premium
                  <span className="text-yellow-400"> Mobile Phone</span>
                  {' '}Destination
                </>
              )}
            </h1>

            <p className="text-lg md:text-xl text-blue-100 max-w-xl leading-relaxed">
              {settings?.homepage_hero_subtitle || 
                'Discover the latest mobile phones, quality accessories, genuine spare parts, and professional repair services. Your one-stop shop for all things mobile.'}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl flex items-center gap-2">
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/services" className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                Our Services
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">100+</p>
                  <p className="text-blue-200 text-sm">Phone Models</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">Quality</p>
                  <p className="text-blue-200 text-sm">Genuine Parts</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">Delivery</p>
                  <p className="text-blue-200 text-sm">Nationwide</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="hidden lg:flex justify-center">
            <div className="relative">
              <div className="w-96 h-96 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <Smartphone className="w-48 h-48 text-white/30" />
              </div>
              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl animate-bounce-slow">
                <p className="text-2xl font-bold text-blue-600">NEW</p>
                <p className="text-xs text-gray-500">Latest Arrivals</p>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl">
                <p className="text-2xl font-bold text-green-600">-30%</p>
                <p className="text-xs text-gray-500">Special Offer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

