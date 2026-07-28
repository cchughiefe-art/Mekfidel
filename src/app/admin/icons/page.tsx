'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { getLucideIconNames, searchIcons } from '@/lib/utils/icon-mapper';
import { SimpleIcon } from '@/components/ui/icon-renderer';
import { Plus, Trash2, Search, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import type { UploadedIcon } from '@/types';

const availableIcons = getLucideIconNames();

export default function AdminIconsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  // State
  const [activeTab, setActiveTab] = useState<'browse' | 'uploaded'>('browse');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null);
  
  // Upload form
  const [iconName, setIconName] = useState('');
  const [svgContent, setSvgContent] = useState('');
  const [tags, setTags] = useState('');

  // Query
  const { data: uploadedIcons, isLoading: uploadedLoading } = useQuery({
    queryKey: ['admin-uploaded-icons'],
    queryFn: async () => {
      const { data } = await supabase
        .from('uploaded_icons')
        .select('*')
        .order('usage_count', { ascending: false });
      return (data || []) as UploadedIcon[];
    },
  });

  // Mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('uploaded_icons')
        .insert({
          name: iconName,
          slug: iconName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          svg_content: svgContent,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-uploaded-icons'] });
      resetUploadForm();
      toast.success('Icon uploaded successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('uploaded_icons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-uploaded-icons'] });
      toast.success('Icon deleted');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const resetUploadForm = () => {
    setIconName('');
    setSvgContent('');
    setTags('');
    setShowUploadModal(false);
  };

  const copyToClipboard = (iconName: string) => {
    navigator.clipboard.writeText(iconName);
    setCopiedIcon(iconName);
    setTimeout(() => setCopiedIcon(null), 2000);
    toast.success('Copied to clipboard');
  };

  const filteredAvailableIcons = useMemo(() => {
    if (!search.trim()) return availableIcons.slice(0, 100); // Show first 100
    return availableIcons.filter(name => name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const filteredUploadedIcons = useMemo(() => {
    if (!uploadedIcons) return [];
    if (!search.trim()) return uploadedIcons;
    const q = search.toLowerCase();
    return uploadedIcons.filter(icon => 
      icon.name.toLowerCase().includes(q) ||
      icon.slug.toLowerCase().includes(q) ||
      icon.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [uploadedIcons, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Icons</h1>
          <p className="text-gray-500 mt-1">Browse Lucide icons and manage uploaded SVGs</p>
        </div>
        <Button variant="primary" onClick={() => setShowUploadModal(true)}>
          <Plus className="w-4 h-4 mr-2" />Upload SVG
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { key: 'browse', label: 'Browse Icons', count: availableIcons.length },
            { key: 'uploaded', label: 'Uploaded SVGs', count: uploadedIcons?.length || 0 },
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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={activeTab === 'browse' ? 'Search Lucide icons...' : 'Search uploaded icons...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Browse Icons Tab */}
      {activeTab === 'browse' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
          {filteredAvailableIcons.map(iconName => (
            <button
              key={iconName}
              onClick={() => copyToClipboard(iconName)}
              className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center gap-2"
            >
              <SimpleIcon name={iconName} size={24} className="text-gray-700 group-hover:text-blue-600" />
              <span className="text-xs text-gray-500 truncate w-full text-center">{iconName}</span>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {copiedIcon === iconName ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5 text-blue-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Uploaded Icons Tab */}
      {activeTab === 'uploaded' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {uploadedLoading ? (
            <div className="py-20"><Spinner /></div>
          ) : filteredUploadedIcons.length === 0 ? (
            <EmptyState title="No uploaded icons" description="Upload your first SVG icon" />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Preview</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Slug</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Tags</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Usage</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUploadedIcons.map((icon) => (
                  <tr key={icon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div 
                        className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: icon.svg_content }}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium">{icon.name}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm font-mono">{icon.slug}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {icon.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="info">{tag}</Badge>
                        ))}
                        {icon.tags.length > 3 && (
                          <Badge variant="default">+{icon.tags.length - 3}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{icon.usage_count}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(icon.slug)}
                        >
                          {copiedIcon === icon.slug ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => {
                            if (confirm(`Delete "${icon.name}"?`)) {
                              deleteMutation.mutate(icon.id);
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

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={resetUploadForm} title="Upload SVG Icon" size="md">
        <div className="space-y-5">
          <Input 
            label="Icon Name" 
            value={iconName} 
            onChange={e => setIconName(e.target.value)} 
            placeholder="e.g., Brand Logo" 
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">SVG Content</label>
            <textarea
              value={svgContent}
              onChange={e => setSvgContent(e.target.value)}
              placeholder="<svg>...</svg>"
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <p className="text-xs text-gray-400">Paste the full SVG code including &lt;svg&gt; tags</p>
          </div>
          <Input 
            label="Tags (comma-separated)" 
            value={tags} 
            onChange={e => setTags(e.target.value)} 
            placeholder="e.g., logo, brand, custom" 
          />
          
          {svgContent && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-medium text-gray-500 mb-3">Preview</p>
              <div className="flex items-center justify-center">
                <div 
                  className="w-16 h-16"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              </div>
            </div>
          )}
          
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={resetUploadForm}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => uploadMutation.mutate()}
              loading={uploadMutation.isPending}
              disabled={!iconName.trim() || !svgContent.trim()}
            >
              Upload Icon
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
