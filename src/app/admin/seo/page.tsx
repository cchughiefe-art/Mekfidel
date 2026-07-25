'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import toast from 'react-hot-toast';

export default function AdminSEOPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await supabase.from('settings').select('*').single();
      return data;
    },
  });

  const [formData, setFormData] = useState({
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  });

  // Update local state when settings load
  if (settings && !formData.seo_title && settings.seo_title) {
    setFormData({
      seo_title: settings.seo_title || '',
      seo_description: settings.seo_description || '',
      seo_keywords: settings.seo_keywords || '',
    });
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('settings').update(formData).eq('id', settings?.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['settings'] }); toast.success('SEO settings updated'); },
    onError: (error: any) => toast.error(error.message),
  });

  if (isLoading) return <Spinner size="lg" />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-2xl font-bold text-gray-900">SEO</h1><p className="text-gray-500 mt-1">Manage search engine optimization</p></div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
        <h2 className="text-lg font-bold">Meta Tags</h2>
        <Input label="SEO Title" value={formData.seo_title} onChange={e => setFormData({...formData, seo_title: e.target.value})} />
        <Textarea label="Meta Description" value={formData.seo_description} onChange={e => setFormData({...formData, seo_description: e.target.value})} rows={3} />
        <Input label="Meta Keywords (comma separated)" value={formData.seo_keywords} onChange={e => setFormData({...formData, seo_keywords: e.target.value})} />
        
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">SEO Preview</p>
          <p className="text-blue-600 text-lg font-medium">{formData.seo_title || 'Mekfidel Communication Ltd'}</p>
          <p className="text-green-700 text-sm">mekfidelcomms.com</p>
          <p className="text-gray-600">{formData.seo_description || 'Your trusted partner for mobile phones...'}</p>
        </div>

        <Button variant="primary" onClick={() => mutation.mutate()} loading={mutation.isPending}>Save SEO Settings</Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-4">
        <h2 className="text-lg font-bold">SEO Checklist</h2>
        <ul className="space-y-3">
          {[
            'robots.txt is configured',
            'Sitemap.xml is generated',
            'Schema.org markup is implemented',
            'Open Graph meta tags are set',
            'Twitter Cards are configured',
            'Canonical URLs are set',
            'Dynamic page titles are implemented',
            'Meta descriptions on all pages',
            'Image alt attributes',
            'Fast page load times',
          ].map((item, idx) => (
            <li key={idx} className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

