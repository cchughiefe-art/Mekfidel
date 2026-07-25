'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema } from '@/lib/utils/validators';
import { useSettings } from '@/hooks/use-supabase-query';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from 'lucide-react';
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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to send message');
      toast.success('Message sent successfully! We will get back to you soon.');
      reset();
    } catch {
      toast.error('Failed to send message. Please try again or contact us via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero py-20 md:py-32">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Contact Us</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            We would love to hear from you. Get in touch with us today.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              {[
                { icon: MapPin, title: 'Address', content: settings?.address || 'Lagos, Nigeria' },
                { icon: Phone, title: 'Phone', content: settings?.phone || '+234 800 000 0000', href: `tel:${settings?.phone}` },
                { icon: Mail, title: 'Email', content: settings?.email || 'info@mekfidelcomms.com', href: `mailto:${settings?.email}` },
                { icon: Clock, title: 'Business Hours', content: settings?.business_hours || 'Mon - Sat: 8AM - 6PM' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="card p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      {item.href ? (
                        <a href={item.href} className="text-gray-600 hover:text-blue-600 transition-colors">
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-gray-600">{item.content}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              <a
                href={`https://wa.me/${settings?.whatsapp || '2348000000000'}?text=${encodeURIComponent('Hello! I have a question about your products/services.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="card p-6 flex items-center gap-4 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Chat on WhatsApp</h3>
                  <p className="text-green-600 text-sm">Quickest response time</p>
                </div>
              </a>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="card p-8 md:p-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
                <p className="text-gray-500 mb-8">Fill out the form below and we will get back to you as soon as possible.</p>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                      type="tel"
                      placeholder="+234 800 000 0000"
                      {...register('phone')}
                      error={errors.phone?.message}
                    />
                    <Input
                      label="Subject"
                      placeholder="How can we help you?"
                      {...register('subject')}
                      error={errors.subject?.message}
                    />
                  </div>
                  <Textarea
                    label="Message"
                      placeholder="Tell us more about your inquiry..."
                    rows={5}
                    {...register('message')}
                    error={errors.message?.message}
                  />
                  <Button variant="primary" size="lg" type="submit" loading={isSubmitting}>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="pb-16">
        <div className="container-custom">
          <div className="card overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{settings?.company_name || 'Mekfidel Communication Ltd'}</h3>
                <p className="text-gray-500">{settings?.address || 'Lagos, Nigeria'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

