'use client';

import { useSettings } from '@/hooks/use-supabase-query';
import { MapPin } from 'lucide-react';

export function GoogleMapSection() {
  const { data: settings } = useSettings();

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Visit Our Store</h2>
          <p className="section-subtitle mx-auto">
            {settings?.address || 'Lagos, Nigeria'}
          </p>
        </div>

        <div className="card overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
            <div className="text-center p-8">
              <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{settings?.company_name || 'Mekfidel Communication Ltd'}</h3>
              <p className="text-gray-500 mb-4">{settings?.address || 'Lagos, Nigeria'}</p>
              <p className="text-sm text-gray-400">
                {settings?.business_hours || 'Mon - Sat: 8AM - 6PM'}
              </p>
              {settings?.google_maps_embed && (
                <div className="mt-6" dangerouslySetInnerHTML={{ __html: settings.google_maps_embed }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

