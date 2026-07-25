'use client';

import { Shield, Target, Eye, Heart, Smartphone, Users, Award, Handshake } from 'lucide-react';
import Link from 'next/link';

const values = [
  { icon: Shield, title: 'Trust', description: 'We build lasting relationships through honesty and transparency in every transaction.' },
  { icon: Award, title: 'Quality', description: 'We never compromise on quality, offering only genuine products and expert services.' },
  { icon: Users, title: 'Customer First', description: 'Every decision we make starts with our customers needs and satisfaction.' },
  { icon: Handshake, title: 'Integrity', description: 'We uphold the highest ethical standards in all our business dealings.' },
];

const team_stats = [
  { number: '5+', label: 'Years Experience' },
  { number: '1000+', label: 'Happy Customers' },
  { number: '5000+', label: 'Products Sold' },
  { number: '50+', label: 'Brands Available' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero py-20 md:py-32">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">About Us</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Your trusted partner in mobile technology since 2020.
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="section-title">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Mekfidel Communication Ltd was founded with a simple mission: to provide Nigerians with 
                  access to quality mobile phones, genuine accessories, and reliable repair services at 
                  affordable prices.
                </p>
                <p>
                  Starting as a small mobile phone retail shop in Lagos, we have grown into a trusted 
                  name in the Nigerian mobile phone industry. Our commitment to quality, transparency, 
                  and exceptional customer service has earned us the loyalty of thousands of customers 
                  across the country.
                </p>
                <p>
                  Today, we offer a comprehensive range of products including the latest smartphones, 
                  phone accessories, replacement screens, spare parts, and professional repair services 
                  for all major brands. We serve both retail customers and wholesale buyers across Nigeria.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <Smartphone className="w-32 h-32 text-blue-600" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl">
                <p className="text-4xl font-bold text-blue-600">2020</p>
                <p className="text-gray-500">Founded in Lagos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="gradient-hero py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {team_stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</p>
                <p className="text-blue-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-8 md:p-12">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide every Nigerian with access to quality mobile phones, genuine accessories, 
                and professional repair services at the best possible prices, delivered with 
                exceptional customer service.
              </p>
            </div>
            <div className="card p-8 md:p-12">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become Nigeria most trusted mobile phone retailer and repair service provider, 
                known for quality, reliability, and innovation in everything we do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title">Our Core Values</h2>
            <p className="section-subtitle mx-auto">
              The principles that guide everything we do.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <div key={idx} className="card p-8 text-center card-hover">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-500">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-20 text-center">
        <div className="container-custom">
          <Heart className="w-12 h-12 text-white/50 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Experience the Difference?</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Visit our store or browse our catalog online. We are here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/products" className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all">
              Browse Products
            </Link>
            <Link href="/contact" className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

