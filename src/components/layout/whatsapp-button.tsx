'use client';

import { MessageCircle } from 'lucide-react';
import { useSettings } from '@/hooks/use-supabase-query';

export function WhatsAppButton() {
  const { data: settings } = useSettings();
  const number = settings?.whatsapp || '2348000000000';

  const message = encodeURIComponent(
    'Hello! I visited Mekfidel Communication Ltd website and I have a question.'
  );

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}

