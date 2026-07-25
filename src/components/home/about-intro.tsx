'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Award, HeadphonesIcon, Package } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Genuine Products',
    description: '100% authentic mobile phones and accessories sourced directly from trusted manufacturers.',
  },
  {
    icon: Award,
    title: 'Expert Service',
    description: 'Professional phone repair services by certified technicians with years of experience.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Customer Support',
    description: 'Dedicated support team ready to help you with any questions or concerns.',
  },
  {
    icon: Package,
    title: 'Fast Delivery',
    description: 'Nationwide shipping with fast and reliable delivery right to your doorstep.',
  },
];

export function AboutIntro() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="section-title">Why Choose Mekfidel Communication?</h2>
          <p className="section-subtitle mx-auto">
            We combine quality products with exceptional service to deliver the best mobile experience in Nigeria.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="card p-8 text-center card-hover"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/about"
            className="btn-outline inline-flex items-center gap-2"
          >
            Learn More About Us
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

