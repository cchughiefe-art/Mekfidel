'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const defaultFaqs = [
  {
    question: 'What products do you sell?',
    answer: 'We sell a wide range of mobile phones, phone accessories, phone screens, spare parts, and offer professional phone repair services. We serve both retail and wholesale customers.',
  },
  {
    question: 'Are your products genuine?',
    answer: 'Yes, all our products are 100% genuine and sourced directly from authorized distributors and manufacturers. We guarantee authenticity on every product we sell.',
  },
  {
    question: 'Do you offer warranty on products?',
    answer: 'Yes, all our products come with warranty. The warranty period varies by product type and brand. Please check the product listing or contact us for specific warranty details.',
  },
  {
    question: 'How long does phone repair take?',
    answer: 'Most repairs are completed within 1-24 hours depending on the complexity of the issue and part availability. Simple screen replacements can often be done while you wait.',
  },
  {
    question: 'Do you offer nationwide delivery?',
    answer: 'Yes, we deliver to all states in Nigeria. Delivery time depends on your location. We use reliable courier services to ensure your order arrives safely and on time.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept bank transfers, USSD payments, online payments, and cash on delivery (for local deliveries within Lagos). Contact us for more payment options.',
  },
  {
    question: 'Can I return a product?',
    answer: 'Yes, we have a 7-day return policy for defective or incorrect products. Items must be in their original condition with all packaging and accessories. See our Return Policy page for details.',
  },
  {
    question: 'Do you offer wholesale pricing?',
    answer: 'Yes, we offer competitive wholesale pricing for retailers and businesses. Contact us with your requirements and we will provide a customized quote.',
  },
  {
    question: 'How can I check if a phone screen is compatible with my phone?',
    answer: 'Use our Phone Screen Compatibility tool to search by brand, model, or screen code. You can also contact us directly and we will help you find the right part.',
  },
  {
    question: 'Can I order in bulk?',
    answer: 'Absolutely! We specialize in wholesale supply of phones, accessories, and spare parts. Contact us for bulk pricing and special arrangements.',
  },
];

export default function FAQPage() {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  // Try to get FAQs from DB, fall back to defaults
  const { data: dbFaqs } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_published', true)
        .order('order');
      return data;
    },
  });

  const faqs = dbFaqs?.length ? dbFaqs.map((f: any) => ({ question: f.question, answer: f.answer })) : defaultFaqs;

  const filteredFaqs = faqs.filter(
    faq =>
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleItem = (index: number) => {
    const newOpen = new Set(openItems);
    if (newOpen.has(index)) {
      newOpen.delete(index);
    } else {
      newOpen.add(index);
    }
    setOpenItems(newOpen);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero py-20 md:py-32">
        <div className="container-custom text-center">
          <HelpCircle className="w-16 h-16 text-white/30 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Find answers to common questions about our products and services.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No FAQs match your search.</p>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="card overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200',
                        openItems.has(index) && 'rotate-180'
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-300',
                      openItems.has(index) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    )}
                  >
                    <div className="px-6 pb-6">
                      <div className="w-full h-px bg-gray-100 mb-4" />
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

