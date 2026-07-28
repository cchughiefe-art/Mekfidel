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
import { Plus, Pencil, Trash2, EyeOff, Eye, Search, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import type { HomepageSection, FeatureCard, Statistic } from '@/types';

const iconNames = getLucideIconNames();

const colorOptions = [
  { value: 'text-blue-600 bg-blue-50', label: 'Blue' },
  { value: 'text-red-600 bg-red-50', label: 'Red' },
  { value: 'text-green-600 bg-green-50', label: 'Green' },
  { value: 'text-purple-600 bg-purple-50', label: 'Purple' },
  { value: 'text-orange-600 bg-orange-50', label: 'Orange' },
  { value: 'text-indigo-600 bg-indigo-50', label: 'Indigo' },
  { value: 'text-pink-600 bg-pink-50', label: 'Pink' },
  { value: 'text-teal-600 bg-teal-50', label: 'Teal' },
  { value: 'text-cyan-600 bg-cyan-50', label: 'Cyan' },
  { value: 'text-amber-600 bg-amber-50', label: 'Amber' },
];

export default function AdminHomepagePage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  // State
  const [activeTab, setActiveTab] = useState<'sections' | 'features' | 'stats'>('sections');
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showStatModal, setShowStatModal] = useState(false);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [editingFeature, setEditingFeature] = useState<FeatureCard | null>(null);
  const [editingStat, setEditingStat] = useState<Statistic | null>(null);
  const [search, setSearch] = useState('');
  
  // Section form
  const [sectionKey, setSectionKey] = useState('');
  const [sectionType, setSectionType] = useState('features_grid');
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSubtitle, setSectionSubtitle] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');
  const [sectionButtonText, setSectionButtonText] = useState('');
  const [sectionButtonUrl, setSectionButtonUrl] = useState('');
  const [sectionImage, setSectionImage] = useState('');
  const [sectionSortOrder, setSectionSortOrder] = useState(0);
  const [sectionIsActive, setSectionIsActive] = useState(true);
  
  // Feature form
  const [featureSectionId, setFeatureSectionId] = useState('');
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  const [featureIcon, setFeatureIcon] = useState('Shield');
  const [featureIconColor, setFeatureIconColor] = useState('text-blue-600 bg-blue-50');
  const [featureSortOrder, setFeatureSortOrder] = useState(0);
  const [featureIsActive, setFeatureIsActive] = useState(true);
  
  // Stat form
  const [statLabel, setStatLabel] = useState('');
  const [statValue, setStatValue] = useState('');
  const [statSuffix, setStatSuffix] = useState('');
  const [statIcon, setStatIcon] = useState('Users');
  const [statContext, setStatContext] = useState('homepage');
  const [statSortOrder, setStatSortOrder] = useState(0);
  const [statIsActive, setStatIsActive] = useState(true);

  // Queries
  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ['admin-homepage-sections'],
    queryFn: async () => {
      const { data } = await supabase
        .from('homepage_sections')
        .select('*, feature_cards(*)')
        .order('sort_order', { ascending: true });
      return (data || []) as HomepageSection[];
    },
  });

  const { data: features, isLoading: featuresLoading } = useQuery({
    queryKey: ['admin-features'],
    queryFn: async () => {
      const { data } = await supabase
        .from('feature_cards')
        .select('*')
        .order('sort_order', { ascending: true });
      return (data || []) as FeatureCard[];
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await supabase
        .from('statistics')
        .select('*')
        .eq('context', 'homepage')
        .order('sort_order', { ascending: true });
      return (data || []) as Statistic[];
    },
  });

  // Mutations
  const sectionMutation = useMutation({
    mutationFn: async () => {
      if (editingSection) {
        const { error } = await supabase
          .from('homepage_sections')
          .update({
            section_key: sectionKey,
            section_type: sectionType,
            title: sectionTitle,
            subtitle: sectionSubtitle,
            description: sectionDescription,
            button_text: sectionButtonText,
            button_url: sectionButtonUrl,
            image: sectionImage,
            sort_order: sectionSortOrder,
            is_active: sectionIsActive,
          })
          .eq('id', editingSection.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('homepage_sections')
          .insert({
            section_key: sectionKey,
            section_type: sectionType,
            title: sectionTitle,
            subtitle: sectionSubtitle,
            description: sectionDescription,
            button_text: sectionButtonText,
            button_url: sectionButtonUrl,
            image: sectionImage,
            sort_order: sectionSortOrder,
            is_active: sectionIsActive,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-sections'] });
      resetSectionForm();
      toast.success(editingSection ? 'Section updated' : 'Section created');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('homepage_sections').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-sections'] });
      toast.success('Section deleted');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const featureMutation = useMutation({
    mutationFn: async () => {
      const [colorClass, bgClass] = featureIconColor.split(' ');
      if (editingFeature) {
        const { error } = await supabase
          .from('feature_cards')
          .update({
            section_id: featureSectionId,
            title: featureTitle,
            description: featureDescription,
            icon_library: 'lucide',
            icon_name: featureIcon,
            icon_color: featureIconColor,
            sort_order: featureSortOrder,
            is_active: featureIsActive,
          })
          .eq('id', editingFeature.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('feature_cards')
          .insert({
            section_id: featureSectionId,
            title: featureTitle,
            description: featureDescription,
            icon_library: 'lucide',
            icon_name: featureIcon,
            icon_color: featureIconColor,
            sort_order: featureSortOrder,
            is_active: featureIsActive,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-features'] });
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-sections'] });
      resetFeatureForm();
      toast.success(editingFeature ? 'Feature updated' : 'Feature created');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteFeatureMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('feature_cards').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-features'] });
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-sections'] });
      toast.success('Feature deleted');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const statMutation = useMutation({
    mutationFn: async () => {
      if (editingStat) {
        const { error } = await supabase
          .from('statistics')
          .update({
            label: statLabel,
            value: statValue,
            suffix: statSuffix,
            icon_library: 'lucide',
            icon_name: statIcon,
            sort_order: statSortOrder,
            is_active: statIsActive,
          })
          .eq('id', editingStat.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('statistics')
          .insert({
            context: statContext,
            label: statLabel,
            value: statValue,
            suffix: statSuffix,
            icon_library: 'lucide',
            icon_name: statIcon,
            sort_order: statSortOrder,
            is_active: statIsActive,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      resetStatForm();
      toast.success(editingStat ? 'Statistic updated' : 'Statistic created');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteStatMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('statistics').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Statistic deleted');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const toggleSectionMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('homepage_sections')
        .update({ is_active: !is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-sections'] });
      toast.success('Section status updated');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('feature_cards')
        .update({ is_active: !is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-features'] });
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-sections'] });
      toast.success('Feature status updated');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const toggleStatMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('statistics')
        .update({ is_active: !is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Statistic status updated');
    },
    onError: (error: any) => toast.error(error.message),
  });

  // Form resets
  const resetSectionForm = () => {
    setEditingSection(null);
    setSectionKey('');
    setSectionType('features_grid');
    setSectionTitle('');
    setSectionSubtitle('');
    setSectionDescription('');
    setSectionButtonText('');
    setSectionButtonUrl('');
    setSectionImage('');
    setSectionSortOrder(0);
    setSectionIsActive(true);
    setShowSectionModal(false);
  };

  const resetFeatureForm = () => {
    setEditingFeature(null);
    setFeatureSectionId('');
    setFeatureTitle('');
    setFeatureDescription('');
    setFeatureIcon('Shield');
    setFeatureIconColor('text-blue-600 bg-blue-50');
    setFeatureSortOrder(0);
    setFeatureIsActive(true);
    setShowFeatureModal(false);
  };

  const resetStatForm = () => {
    setEditingStat(null);
    setStatLabel('');
    setStatValue('');
    setStatSuffix('+');
    setStatIcon('Users');
    setStatContext('homepage');
    setStatSortOrder(0);
    setStatIsActive(true);
    setShowStatModal(false);
  };

  // Open edit functions
  const openEditSection = (section: HomepageSection) => {
    setEditingSection(section);
    setSectionKey(section.section_key);
    setSectionType(section.section_type);
    setSectionTitle(section.title || '');
    setSectionSubtitle(section.subtitle || '');
    setSectionDescription(section.description || '');
    setSectionButtonText(section.button_text || '');
    setSectionButtonUrl(section.button_url || '');
    setSectionImage(section.image || '');
    setSectionSortOrder(section.sort_order);
    setSectionIsActive(section.is_active);
    setShowSectionModal(true);
  };

  const openEditFeature = (feature: FeatureCard) => {
    setEditingFeature(feature);
    setFeatureSectionId(feature.section_id);
    setFeatureTitle(feature.title);
    setFeatureDescription(feature.description || '');
    setFeatureIcon(feature.icon_name);
    setFeatureIconColor(feature.icon_color || 'text-blue-600 bg-blue-50');
    setFeatureSortOrder(feature.sort_order);
    setFeatureIsActive(feature.is_active);
    setShowFeatureModal(true);
  };

  const openEditStat = (stat: Statistic) => {
    setEditingStat(stat);
    setStatLabel(stat.label);
    setStatValue(stat.value);
    setStatSuffix(stat.suffix || '+');
    setStatIcon(stat.icon_name || 'Users');
    setStatContext(stat.context);
    setStatSortOrder(stat.sort_order);
    setStatIsActive(stat.is_active);
    setShowStatModal(true);
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

  const filteredFeatures = useMemo(() => {
    if (!features) return [];
    if (!search.trim()) return features;
    const q = search.toLowerCase();
    return features.filter(f => 
      f.title.toLowerCase().includes(q) || 
      f.description?.toLowerCase().includes(q)
    );
  }, [features, search]);

  const filteredStats = useMemo(() => {
    if (!stats) return [];
    if (!search.trim()) return stats;
    const q = search.toLowerCase();
    return stats.filter(s => s.label.toLowerCase().includes(q));
  }, [stats, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage CMS</h1>
          <p className="text-gray-500 mt-1">Manage homepage sections, features, and statistics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { key: 'sections', label: 'Sections', count: sections?.length || 0 },
            { key: 'features', label: 'Feature Cards', count: features?.length || 0 },
            { key: 'stats', label: 'Statistics', count: stats?.length || 0 },
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
            } else if (activeTab === 'features') {
              resetFeatureForm();
              setShowFeatureModal(true);
            } else {
              resetStatForm();
              setShowStatModal(true);
            }
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {activeTab === 'sections' ? 'Section' : activeTab === 'features' ? 'Feature' : 'Statistic'}
        </Button>
      </div>

      {/* Sections Tab */}
      {activeTab === 'sections' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {sectionsLoading ? (
            <div className="py-20"><Spinner /></div>
          ) : filteredSections.length === 0 ? (
            <EmptyState title="No sections found" description="Add your first homepage section" />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Order</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Key</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Title</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Type</th>
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
                    <td className="px-6 py-4 text-gray-500 text-sm">{section.section_type}</td>
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

      {/* Features Tab */}
      {activeTab === 'features' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {featuresLoading ? (
            <div className="py-20"><Spinner /></div>
          ) : filteredFeatures.length === 0 ? (
            <EmptyState title="No features found" description="Add your first feature card" />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Order</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Icon</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Title</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Description</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFeatures.map((feature) => (
                  <tr key={feature.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">{feature.sort_order}</td>
                    <td className="px-6 py-4">
                      <div className={`w-10 h-10 rounded-xl ${feature.icon_color} flex items-center justify-center`}>
                        <SimpleIcon name={feature.icon_name} size={20} />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{feature.title}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">{feature.description}</td>
                    <td className="px-6 py-4">
                      <Badge variant={feature.is_active ? 'success' : 'warning'}>
                        {feature.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFeatureMutation.mutate({ id: feature.id, is_active: feature.is_active })}
                        >
                          {feature.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditFeature(feature)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => {
                            if (confirm(`Delete "${feature.title}"?`)) {
                              deleteFeatureMutation.mutate(feature.id);
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

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {statsLoading ? (
            <div className="py-20"><Spinner /></div>
          ) : filteredStats.length === 0 ? (
            <EmptyState title="No statistics found" description="Add your first statistic" />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Order</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Icon</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Label</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Value</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStats.map((stat) => (
                  <tr key={stat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">{stat.sort_order}</td>
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <SimpleIcon name={stat.icon_name || 'Users'} size={20} className="text-blue-600" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{stat.label}</td>
                    <td className="px-6 py-4 text-gray-500">{stat.value}{stat.suffix}</td>
                    <td className="px-6 py-4">
                      <Badge variant={stat.is_active ? 'success' : 'warning'}>
                        {stat.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatMutation.mutate({ id: stat.id, is_active: stat.is_active })}
                        >
                          {stat.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditStat(stat)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => {
                            if (confirm(`Delete "${stat.label}"?`)) {
                              deleteStatMutation.mutate(stat.id);
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
      <Modal isOpen={showSectionModal} onClose={resetSectionForm} title={editingSection ? 'Edit Section' : 'New Section'} size="xl">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Section Key" value={sectionKey} onChange={e => setSectionKey(e.target.value)} placeholder="e.g., hero, about_intro" />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={sectionType}
                onChange={e => setSectionType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hero">Hero</option>
                <option value="features_grid">Features Grid</option>
                <option value="stats">Statistics</option>
                <option value="cta">Call to Action</option>
                <option value="steps">Steps</option>
                <option value="promo">Promotional</option>
              </select>
            </div>
          </div>
          <Input label="Title" value={sectionTitle} onChange={e => setSectionTitle(e.target.value)} placeholder="Section title" />
          <Input label="Subtitle" value={sectionSubtitle} onChange={e => setSectionSubtitle(e.target.value)} placeholder="Section subtitle" />
          <Textarea label="Description" value={sectionDescription} onChange={e => setSectionDescription(e.target.value)} placeholder="Section description" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Button Text" value={sectionButtonText} onChange={e => setSectionButtonText(e.target.value)} placeholder="e.g., Shop Now" />
            <Input label="Button URL" value={sectionButtonUrl} onChange={e => setSectionButtonUrl(e.target.value)} placeholder="e.g., /products" />
          </div>
          <Input label="Image URL" value={sectionImage} onChange={e => setSectionImage(e.target.value)} placeholder="https://..." />
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

      {/* Feature Modal */}
      <Modal isOpen={showFeatureModal} onClose={resetFeatureForm} title={editingFeature ? 'Edit Feature' : 'New Feature'} size="xl">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Parent Section</label>
            <select
              value={featureSectionId}
              onChange={e => setFeatureSectionId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a section</option>
              {sections?.map(s => (
                <option key={s.id} value={s.id}>{s.title || s.section_key}</option>
              ))}
            </select>
          </div>
          <Input label="Title" value={featureTitle} onChange={e => setFeatureTitle(e.target.value)} placeholder="e.g., Quality Products" />
          <Textarea label="Description" value={featureDescription} onChange={e => setFeatureDescription(e.target.value)} placeholder="Feature description" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Icon</label>
              <select
                value={featureIcon}
                onChange={e => setFeatureIcon(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {iconNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Icon Color</label>
              <select
                value={featureIconColor}
                onChange={e => setFeatureIconColor(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {colorOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-medium text-gray-500 mb-3">Preview</p>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${featureIconColor} flex items-center justify-center`}>
                <SimpleIcon name={featureIcon} size={20} />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">{featureTitle || 'Feature Title'}</p>
                <p className="text-xs text-gray-500">{featureDescription ? featureDescription.slice(0, 50) + '...' : 'Description'}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sort Order" type="number" value={featureSortOrder} onChange={e => setFeatureSortOrder(parseInt(e.target.value) || 0)} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={featureIsActive ? 'true' : 'false'}
                onChange={e => setFeatureIsActive(e.target.value === 'true')}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={resetFeatureForm}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => featureMutation.mutate()}
              loading={featureMutation.isPending}
              disabled={!featureTitle.trim() || !featureSectionId}
            >
              {editingFeature ? 'Update Feature' : 'Create Feature'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Stat Modal */}
      <Modal isOpen={showStatModal} onClose={resetStatForm} title={editingStat ? 'Edit Statistic' : 'New Statistic'} size="md">
        <div className="space-y-5">
          <Input label="Label" value={statLabel} onChange={e => setStatLabel(e.target.value)} placeholder="e.g., Happy Customers" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Value" value={statValue} onChange={e => setStatValue(e.target.value)} placeholder="e.g., 1000" />
            <Input label="Suffix" value={statSuffix} onChange={e => setStatSuffix(e.target.value)} placeholder="e.g., +" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Icon</label>
            <select
              value={statIcon}
              onChange={e => setStatIcon(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {iconNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sort Order" type="number" value={statSortOrder} onChange={e => setStatSortOrder(parseInt(e.target.value) || 0)} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={statIsActive ? 'true' : 'false'}
                onChange={e => setStatIsActive(e.target.value === 'true')}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={resetStatForm}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => statMutation.mutate()}
              loading={statMutation.isPending}
              disabled={!statLabel.trim() || !statValue.trim()}
            >
              {editingStat ? 'Update Statistic' : 'Create Statistic'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
