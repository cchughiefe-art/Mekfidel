'use client';

import Link from 'next/link';
import { ArrowRight, Smartphone, Watch, Wrench, ShieldCheck, Cpu, Battery } from 'lucide-react';

const services = [
  {
    icon: Smartphone,
    title: 'Phone Sales',
    description: 'Latest smartphones from top brands at competitive prices.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Wrench,
    title: 'Phone Repair',
    description: 'Professional repair services for all phone models and issues.',
    color: 'bg-red-50 text-red-600',
  },
  {
    icon: Battery,
    title: 'Battery Replacement',
    description: 'Genuine battery replacement services to extend your phone life.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Cpu,
    title: 'Screen Replacement',
    description: 'Quality screen replacement using genuine or high-quality parts.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Watch,
    title: 'Accessories',
    description: 'Wide range of phone accessories from cases to chargers.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: ShieldCheck,
    title: 'Wholesale Supply',
    description: 'Bulk supply of phones and accessories for businesses.',
    color: 'bg-indigo-50 text-indigo-600',
  },
];

export function ServicesOverview() {
  return (
    <section className="section-padding bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle mx-auto">
            Comprehensive mobile solutions tailored to meet all your phone needs.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
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

