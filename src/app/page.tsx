'use client';

import { HeroSection } from '@/components/home/hero';
import { AboutIntro } from '@/components/home/about-intro';
import { ServicesOverview } from '@/components/home/services-overview';
import { ProductCategories } from '@/components/home/product-categories';
import { FeaturedProducts } from '@/components/home/featured-products';
import { Testimonials } from '@/components/home/testimonials';
import { CTASection } from '@/components/home/cta-section';
import { GoogleMapSection } from '@/components/home/google-map';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutIntro />
      <ServicesOverview />
      <ProductCategories />
      <FeaturedProducts />
      <Testimonials />
      <CTASection />
      <GoogleMapSection />
    </>
  );
}

