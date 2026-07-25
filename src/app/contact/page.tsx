'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema } from '@/lib/utils/validators';
import { useSettings } from '@/hooks/use-supabase-query';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: settings } = useSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      if (!settings?.whatsapp) {
        toast.error('WhatsApp number is not configured.');
        return;
      }

      const message = `Hello ${
        settings.company_name || 'Mekfidel Communication'
      }

New Contact Message

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'N/A'}
Subject: ${data.subject || 'N/A'}

Message:
${data.message}`;

      const whatsappUrl = `https://wa.me/${
        settings.whatsapp
      }?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, '_blank');

      toast.success('Opening WhatsApp...');
      reset();
    } catch (error) {
      console.error(error);
      toast.error('Unable to open WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="gradient-hero py-20 md:py-32">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            We would love to hear from you. Get in touch with us today.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">

            <div className="space-y-6">
              {[
                {
                  icon: MapPin,
                  title: 'Address',
                  content: settings?.address || 'Lagos, Nigeria',
                },
                {
                  icon: Phone,
                  title: 'Phone',
                  content: settings?.phone || '+2348000000000',
                  href: `tel:${settings?.phone}`,
                },
                {
                  icon: Mail,
                  title: 'Email',
                  content:
                    settings?.email || 'info@mekfidelcomms.com',
                  href: `mailto:${settings?.email}`,
                },
                {
                  icon: Clock,
                  title: 'Business Hours',
                  content:
                    settings?.business_hours || 'Mon - Sat: 8AM - 6PM',
                },
              ].map((item, idx) => {
                const Icon = item.icon;

                return (
                  <div
                    key={idx}
                    className="card p-6 flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.title}
                      </h3>

                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-gray-600 hover:text-blue-600"
                        >
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-gray-600">
                          {item.content}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              <a
                href={`https://wa.me/${
                  settings?.whatsapp || '2348000000000'
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="card p-6 flex items-center gap-4 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Chat on WhatsApp
                  </h3>
                  <p className="text-green-600 text-sm">
                    Quickest response time
                  </p>
                </div>
              </a>
            </div>

            <div className="lg:col-span-2">
              <div className="card p-8 md:p-12">
                <h2 className="text-2xl font-bold mb-2">
                  Send Us a Message
                </h2>

                <p className="text-gray-500 mb-8">
                  Fill out the form below and we'll open WhatsApp with
                  your message ready to send.
                </p>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid sm:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      {...register('name')}
                      error={errors.name?.message}
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                      {...register('email')}
                      error={errors.email?.message}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <Input
                      label="Phone Number"
                      {...register('phone')}
                      error={errors.phone?.message}
                    />

                    <Input
                      label="Subject"
                      {...register('subject')}
                      error={errors.subject?.message}
                    />
                  </div>

                  <Textarea
                    label="Message"
                    rows={5}
                    {...register('message')}
                    error={errors.message?.message}
                  />

                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    loading={isSubmitting}
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send via WhatsApp
                  </Button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-custom">
          <div className="card overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold">
                  {settings?.company_name ||
                    'Mekfidel Communication Ltd'}
                </h3>
                <p className="text-gray-500">
                  {settings?.address || 'Lagos, Nigeria'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
