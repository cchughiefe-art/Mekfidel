'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { uploadFile } from '@/lib/utils/supabase-storage';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
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
    company_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    business_hours: '',
    homepage_hero_title: '',
    homepage_hero_subtitle: '',
    about_text: '',
    footer_text: '',
    google_maps_embed: '',
    social_media: {
      facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '', tiktok: '',
    },
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || '',
        phone: settings.phone || '',
        whatsapp: settings.whatsapp || '',
        email: settings.email || '',
        address: settings.address || '',
        business_hours: settings.business_hours || '',
        homepage_hero_title: settings.homepage_hero_title || '',
        homepage_hero_subtitle: settings.homepage_hero_subtitle || '',
        about_text: settings.about_text || '',
        footer_text: settings.footer_text || '',
        google_maps_embed: settings.google_maps_embed || '',
        social_media: settings.social_media || {
          facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '', tiktok: '',
        },
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async () => {
      let logo = settings?.logo;
      if (logoFile) {
        const result = await uploadFile('logos', logoFile);
        if (result) logo = result.url;
      }

      const { error } = await supabase.from('settings').update({ ...formData, logo }).eq('id', settings?.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['settings'] }); toast.success('Settings saved'); },
    onError: (error: any) => toast.error(error.message),
  });

  const updateSocial = (key: string, value: string) => {
    setFormData({ ...formData, social_media: { ...formData.social_media, [key]: value } });
  };

  if (isLoading) return <Spinner size="lg" />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div><h1 className="text-2xl font-bold text-gray-900">Settings</h1><p className="text-gray-500 mt-1">Manage website settings</p></div>

      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-8">
        {/* Company Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <h2 className="text-lg font-bold">Company Information</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Input label="Company Name" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo</label>
              <label className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">{logoFile ? logoFile.name : (settings?.logo ? 'Replace logo' : 'Upload logo')}</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => setLogoFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <Input label="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <Input label="WhatsApp Number" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
          </div>
          <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <Textarea label="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={2} />
          <Input label="Business Hours" value={formData.business_hours} onChange={e => setFormData({...formData, business_hours: e.target.value})} />
        </div>

        {/* Homepage */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <h2 className="text-lg font-bold">Homepage Content</h2>
          <Input label="Hero Title" value={formData.homepage_hero_title} onChange={e => setFormData({...formData, homepage_hero_title: e.target.value})} />
          <Input label="Hero Subtitle" value={formData.homepage_hero_subtitle} onChange={e => setFormData({...formData, homepage_hero_subtitle: e.target.value})} />
          <Textarea label="About Text" value={formData.about_text} onChange={e => setFormData({...formData, about_text: e.target.value})} rows={4} />
          <Textarea label="Footer Text" value={formData.footer_text} onChange={e => setFormData({...formData, footer_text: e.target.value})} rows={2} />
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <h2 className="text-lg font-bold">Social Media</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'].map(platform => (
              <Input key={platform} label={platform.charAt(0).toUpperCase() + platform.slice(1)} value={(formData.social_media as any)[platform] || ''} onChange={e => updateSocial(platform, e.target.value)} placeholder={`https://${platform}.com/...`} />
            ))}
          </div>
        </div>

        {/* Google Maps */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <h2 className="text-lg font-bold">Google Maps</h2>
          <Textarea label="Google Maps Embed HTML" value={formData.google_maps_embed || ''} onChange={e => setFormData({...formData, google_maps_embed: e.target.value})} rows={3} />
        </div>

        <Button variant="primary" size="lg" type="submit" loading={mutation.isPending}>Save All Settings</Button>
      </form>
    </div>
  );
}

