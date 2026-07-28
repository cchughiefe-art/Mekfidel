'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { getLucideIconNames } from '@/lib/utils/icon-mapper';
import { SimpleIcon } from '@/components/ui/icon-renderer';
import { Plus, Pencil, Trash2, EyeOff, Eye, Search, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import type { FooterSection, SocialLink, FooterLink } from '@/types';

const iconNames = getLucideIconNames();
const platformIcons: Record<string, string> = {
  facebook: 'Globe',
  instagram: 'Globe',
  twitter: 'Globe',
  linkedin: 'Globe',
  youtube: 'Globe',
  tiktok: 'Globe',
};

export default function AdminFooterPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  // State
  const [activeTab, setActiveTab] = useState<'sections' | 'social'>('sections');
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [editingSection, setEditingSection] = useState<FooterSection | null>(null);
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null);
  const [search, setSearch] = useState('');
  
  // Section form
  const [sectionKey, setSectionKey] = useState('');
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionContent, setSectionContent] = useState('');
  const [sectionLinks, setSectionLinks] = useState<FooterLink[]>([]);
  const [sectionSortOrder, setSectionSortOrder] = useState(0);
  const [sectionIsActive, setSectionIsActive] = useState(true);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  
  // Social form
  const [socialPlatform, setSocialPlatform] = useState('');
  const [socialLabel, setSocialLabel] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [socialIcon, setSocialIcon] = useState('');
  const [socialSortOrder, setSocialSortOrder] = useState(0);
  const [socialIsVisible, setSocialIsVisible] = useState(true);

  // Queries
  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ['admin-footer-sections'],
    queryFn: async () => {
      const { data } = await supabase
        .from('footer_sections')
        .select('*')
        .order('sort_order', { ascending: true });
      return (data || []) as FooterSection[];
    },
  });

  const { data: socialLinks, isLoading: socialLoading } = useQuery({
    queryKey: ['admin-social-links'],
    queryFn: async () => {
      const { data } = await supabase
        .from('social_links')
        .select('*')
        .order('sort_order', { ascending: true });
      return (data || []) as SocialLink[];
    },
  });

  // Section Mutations
  const sectionMutation = useMutation({
    mutationFn: async () => {
      if (editingSection) {
        const { error } = await supabase
          .from('footer_sections')
          .update({
            section_key: sectionKey,
            title: sectionTitle,
            content: sectionContent,
            links: sectionLinks,
            sort_order: sectionSortOrder,
            is_active: sectionIsActive,
          })
          .eq('id', editingSection.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('footer_sections')
          .insert({
            section_key: sectionKey,
            title: sectionTitle,
            content: sectionContent,
            links: sectionLinks,
            sort_order: sectionSortOrder,
            is_active: sectionIsActive,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-footer-sections'] });
      resetSectionForm();
      toast.success(editingSection ? 'Section updated' : 'Section created');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('footer_sections').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-footer-sections'] });
      toast.success('Section deleted');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const toggleSectionMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('footer_sections')
        .update({ is_active: !is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-footer-sections'] });
      toast.success('Section status updated');
    },
    onError: (error: any) => toast.error(error.message),
  });

  // Social Mutations
  const socialMutation = useMutation({
    mutationFn: async () => {
      if (editingSocial) {
        const { error } = await supabase
          .from('social_links')
          .update({
            platform: socialPlatform,
            label: socialLabel,
            url: socialUrl,
            icon_name: socialIcon,
            sort_order: socialSortOrder,
            is_visible: socialIsVisible,
          })
          .eq('id', editingSocial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('social_links')
          .insert({
            platform: socialPlatform,
            label: socialLabel,
            url: socialUrl,
            icon_name: socialIcon,
            sort_order: socialSortOrder,
            is_visible: socialIsVisible,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-social-links'] });
      resetSocialForm();
      toast.success(editingSocial ? 'Social link updated' : 'Social link created');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteSocialMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('social_links').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-social-links'] });
      toast.success('Social link deleted');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const toggleSocialMutation = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase
        .from('social_links')
        .update({ is_visible: !is_visible })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-social-links'] });
      toast.success('Social link status updated');
    },
    onError: (error: any) => toast.error(error.message),
  });

  // Helpers
  const resetSectionForm = () => {
    setEditingSection(null);
    setSectionKey('');
    setSectionTitle('');
    setSectionContent('');
    setSectionLinks([]);
    setSectionSortOrder(0);
    setSectionIsActive(true);
    setNewLinkLabel('');
    setNewLinkUrl('');
    setShowSectionModal(false);
  };

  const resetSocialForm = () => {
    setEditingSocial(null);
    setSocialPlatform('');
    setSocialLabel('');
    setSocialUrl('');
    setSocialIcon('');
    setSocialSortOrder(0);
    setSocialIsVisible(true);
    setShowSocialModal(false);
  };

  const openEditSection = (section: FooterSection) => {
    setEditingSection(section);
    setSectionKey(section.section_key);
    setSectionTitle(section.title || '');
    setSectionContent(section.content || '');
    setSectionLinks(section.links || []);
    setSectionSortOrder(section.sort_order);
    setSectionIsActive(section.is_active);
    setShowSectionModal(true);
  };

  const openEditSocial = (social: SocialLink) => {
    setEditingSocial(social);
    setSocialPlatform(social.platform);
    setSocialLabel(social.label);
    setSocialUrl(social.url || '');
    setSocialIcon(social.icon_name || '');
    setSocialSortOrder(social.sort_order);
    setSocialIsVisible(social.is_visible);
    setShowSocialModal(true);
  };

  const addLink = () => {
    if (newLinkLabel.trim() && newLinkUrl.trim()) {
      setSectionLinks([...sectionLinks, { label: newLinkLabel.trim(), url: newLinkUrl.trim() }]);
      setNewLinkLabel('');
      setNewLinkUrl('');
    }
  };

  const removeLink = (index: number) => {
    setSectionLinks(sectionLinks.filter((_, i) => i !== index));
  };

  const filteredSections = useMemo(() => {
    if (!sections) return [];
    if (!search.trim()) return sections;
    const q = search.toLowerCase();
    return sections.filter(s => 
      s.title?.toLowerCase().includes(q) || 
      s.section_key.toLowerCase().includes(q)
    );
  }, [sections, search]);

  const filteredSocial = useMemo(() => {
    if (!socialLinks) return [];
    if (!search.trim()) return socialLinks;
    const q = search.toLowerCase();
    return socialLinks.filter(s => 
      s.label.toLowerCase().includes(q) || 
      s.platform.toLowerCase().includes(q) ||
      s.url?.toLowerCase().includes(q)
    );
  }, [socialLinks, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Footer</h1>
          <p className="text-gray-500 mt-1">Manage footer sections and social links</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { key: 'sections', label: 'Sections', count: sections?.length || 0 },
            { key: 'social', label: 'Social Links', count: socialLinks?.length || 0 },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button
          variant="primary"
          onClick={() => {
            if (activeTab === 'sections') {
              resetSectionForm();
              setShowSectionModal(true);
            } else {
              resetSocialForm();
              setShowSocialModal(true);
            }
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {activeTab === 'sections' ? 'Section' : 'Social Link'}
        </Button>
      </div>

      {/* Sections Tab */}
      {activeTab === 'sections' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {sectionsLoading ? (
            <div className="py-20"><Spinner /></div>
          ) : filteredSections.length === 0 ? (
            <EmptyState title="No sections found" description="Add your first footer section" />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Order</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Key</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Title</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Links</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSections.map((section) => (
                  <tr key={section.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">{section.sort_order}</td>
                    <td className="px-6 py-4 font-mono text-sm">{section.section_key}</td>
                    <td className="px-6 py-4 font-medium">{section.title || '-'}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{section.links?.length || 0} links</td>
                    <td className="px-6 py-4">
                      <Badge variant={section.is_active ? 'success' : 'warning'}>
                        {section.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSectionMutation.mutate({ id: section.id, is_active: section.is_active })}
                        >
                          {section.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditSection(section)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => {
                            if (confirm(`Delete "${section.title || section.section_key}"?`)) {
                              deleteSectionMutation.mutate(section.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Social Tab */}
      {activeTab === 'social' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {socialLoading ? (
            <div className="py-20"><Spinner /></div>
          ) : filteredSocial.length === 0 ? (
            <EmptyState title="No social links found" description="Add your first social link" />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Order</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Platform</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Label</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">URL</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSocial.map((social) => (
                  <tr key={social.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">{social.sort_order}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <SimpleIcon name={social.icon_name || platformIcons[social.platform] || 'Globe'} size={16} />
                        </div>
                        <span className="capitalize">{social.platform}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{social.label}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">
                      {social.url ? (
                        <a href={social.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 flex items-center gap-1">
                          {social.url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={social.is_visible ? 'success' : 'warning'}>
                        {social.is_visible ? 'Visible' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSocialMutation.mutate({ id: social.id, is_visible: social.is_visible })}
                        >
                          {social.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditSocial(social)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => {
                            if (confirm(`Delete "${social.label}"?`)) {
                              deleteSocialMutation.mutate(social.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Section Modal */}
      <Modal isOpen={showSectionModal} onClose={resetSectionForm} title={editingSection ? 'Edit Footer Section' : 'New Footer Section'} size="xl">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Section Key" value={sectionKey} onChange={e => setSectionKey(e.target.value)} placeholder="e.g., company, quick_links" />
            <Input label="Title" value={sectionTitle} onChange={e => setSectionTitle(e.target.value)} placeholder="e.g., Company" />
          </div>
          <Textarea label="Content" value={sectionContent} onChange={e => setSectionContent(e.target.value)} placeholder="Optional content text" />
          
          <div className="border-t border-gray-100 pt-5">
            <h4 className="font-medium text-gray-900 mb-3">Quick Links</h4>
            <div className="space-y-3 mb-4">
              {sectionLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="flex-1 text-sm">{link.label}</span>
                  <span className="text-gray-400 text-xs">{link.url}</span>
                  <button onClick={() => removeLink(index)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Label" value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)} className="flex-1" />
              <Input placeholder="URL" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} className="flex-1" />
              <Button variant="outline" onClick={addLink}>Add</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Sort Order" type="number" value={sectionSortOrder} onChange={e => setSectionSortOrder(parseInt(e.target.value) || 0)} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={sectionIsActive ? 'true' : 'false'}
                onChange={e => setSectionIsActive(e.target.value === 'true')}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={resetSectionForm}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => sectionMutation.mutate()}
              loading={sectionMutation.isPending}
              disabled={!sectionKey.trim()}
            >
              {editingSection ? 'Update Section' : 'Create Section'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Social Modal */}
      <Modal isOpen={showSocialModal} onClose={resetSocialForm} title={editingSocial ? 'Edit Social Link' : 'New Social Link'} size="md">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Platform</label>
            <select
              value={socialPlatform}
              onChange={e => {
                setSocialPlatform(e.target.value);
                setSocialIcon(platformIcons[e.target.value] || 'Globe');
                if (!socialLabel) setSocialLabel(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1));
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select platform</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          <Input label="Label" value={socialLabel} onChange={e => setSocialLabel(e.target.value)} placeholder="e.g., Follow us on Facebook" />
          <Input label="URL" value={socialUrl} onChange={e => setSocialUrl(e.target.value)} placeholder="https://..." />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Icon</label>
            <select
              value={socialIcon}
              onChange={e => setSocialIcon(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {iconNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sort Order" type="number" value={socialSortOrder} onChange={e => setSocialSortOrder(parseInt(e.target.value) || 0)} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Visibility</label>
              <select
                value={socialIsVisible ? 'true' : 'false'}
                onChange={e => setSocialIsVisible(e.target.value === 'true')}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Visible</option>
                <option value="false">Hidden</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={resetSocialForm}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => socialMutation.mutate()}
              loading={socialMutation.isPending}
              disabled={!socialPlatform.trim() || !socialLabel.trim()}
            >
              {editingSocial ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
