"use client";

import { useSettings } from "@/hooks/use-supabase-query";
import { MapPin } from "lucide-react";
import { googleMapsUrl } from "@/lib/utils/safe-content";

export function GoogleMapSection({
  title,
  subtitle,
}: { title?: string; subtitle?: string } = {}) {
  const { data: settings } = useSettings();
  const mapUrl = googleMapsUrl(settings?.google_maps_embed);

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">{title || "Visit Our Store"}</h2>
          <p className="section-subtitle mx-auto">
            {subtitle ||
              settings?.address ||
              "Alaba International Market, Lagos"}
          </p>
        </div>

        <div className="card overflow-hidden">
          {mapUrl ? (
            <iframe
              title="Mekfidel store location"
              src={mapUrl}
              className="h-96 w-full border-0"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <div className="p-8 text-center">
              <MapPin className="mx-auto mb-4 h-12 w-12 text-blue-600" />
              <p>{settings?.address || "Contact the shop for directions"}</p>
              <p className="mt-3 text-gray-500">{settings?.business_hours}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
