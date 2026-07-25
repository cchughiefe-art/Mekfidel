'use client';

import Link from 'next/link';
import { Smartphone, Mail, Phone, MapPin, Clock, Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import { useSettings } from '@/hooks/use-supabase-query';

export function Footer() {
  const { data: settings } = useSettings();

  const socialLinks = [
    { icon: Facebook, href: settings?.social_media?.facebook || '#', label: 'Facebook' },
    { icon: Instagram, href: settings?.social_media?.instagram || '#', label: 'Instagram' },
    { icon: Twitter, href: settings?.social_media?.twitter || '#', label: 'Twitter' },
    { icon: Linkedin, href: settings?.social_media?.linkedin || '#', label: 'LinkedIn' },
    { icon: Youtube, href: settings?.social_media?.youtube || '#', label: 'YouTube' },
  ].filter(s => s.href && s.href !== '#');

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter */}
      <div className="border-b border-gray-800">
        <div className="container-custom py-12">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Stay Updated</h3>
            <p className="text-gray-400 mb-6">Subscribe to get the latest products and offers.</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const email = new FormData(form).get('email');
                try {
                  await fetch('/api/newsletter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                  });
                  form.reset();
                  alert('Subscribed successfully!');
                } catch {
                  alert('Subscription failed. Please try again.');
                }
              }}
              className="flex gap-3"
            >
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white block leading-tight">
                  {settings?.company_name?.split(' ')[0] || 'Mekfidel'}
                </span>
                <span className="text-[10px] text-gray-400 block leading-tight tracking-wider uppercase">
                  {settings?.company_name?.split(' ').slice(1).join(' ') || 'Communication Ltd'}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {settings?.about_text
                ? settings.about_text.slice(0, 200) + '...'
                : 'Your trusted partner for mobile phones, accessories, repairs, and wholesale solutions across Nigeria.'}
            </p>
            <div className="flex gap-3">
              {socialLinks.map(social => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: '/' },
                { name: 'Products', href: '/products' },
                { name: 'Services', href: '/services' },
                { name: 'About Us', href: '/about' },
                { name: 'Blog', href: '/blog' },
                { name: 'Contact', href: '/contact' },
                { name: 'FAQ', href: '/faq' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-5">Categories</h4>
            <ul className="space-y-3">
              {[
                'Mobile Phones',
                'Phone Accessories',
                'Phone Screens',
                'Spare Parts',
                'Phone Repair',
              ].map(cat => (
                <li key={cat}>
                  <Link
                    href={`/products?category=${encodeURIComponent(cat.toLowerCase())}`}
                    className="text-sm hover:text-blue-400 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{settings?.address || 'Lagos, Nigeria'}</span>
              </li>
              <li>
                <a href={`tel:${settings?.phone}`} className="flex items-center gap-3 hover:text-blue-400 transition-colors">
                  <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="text-sm">{settings?.phone || '+234 800 000 0000'}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${settings?.email}`} className="flex items-center gap-3 hover:text-blue-400 transition-colors">
                  <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="text-sm">{settings?.email || 'info@mekfidelcomms.com'}</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{settings?.business_hours || 'Mon - Sat: 8AM - 6PM'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {settings?.company_name || 'Mekfidel Communication Ltd'}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">Terms of Service</Link>
            <Link href="/return-policy" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">Return Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

