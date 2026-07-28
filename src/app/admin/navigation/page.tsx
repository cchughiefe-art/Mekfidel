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
import { getLucideIconNames } from '@/lib/utils/icon-mapper';
import { Plus, Pencil, Trash2, EyeOff, Eye, Search, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import type { NavigationItem, NavigationLocation } from '@/types';

const iconNames = getLucideIconNames();
const locationOptions: { value: NavigationLocation; label: string }[] = [
  { value: 'header', label: 'Header Navigation' },
  { value: 'footer_main', label: 'Footer Main Links' },
  { value: 'footer_categories', label: 'Footer Categories' },
  { value: 'mobile', label: 'Mobile Menu' },
];

export default function AdminNavigationPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  // State
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<NavigationItem | null>(null);
  const [search, setSearch] = useState('');
  const [filterLocation, setFilterLocation] = useState<NavigationLocation | 'all'>('all');
  
  // Form state
  const [location, setLocation] = useState<NavigationLocation>('header');
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [iconName, setIconName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isNewTab, setIsNewTab] = useState(false);

  // Query
  const { data: navItems, isLoading } = useQuery({
    queryKey: ['admin-navigation'],
    queryFn: async () => {
      const { data } = await supabase
        .from('navigation_items')
        .select('*')
        .order('location')
        .order('sort_order', { ascending: true });
      return (data || []) as NavigationItem[];
    },
  });

  // Mutation
  const mutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase
          .from('navigation_items')
          .update({
            location,
            label,
            url,
            icon_name: iconName || null,
            sort_order: sortOrder,
            is_active: isActive,
            is_new_tab: isNewTab,
          })
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('navigation_items')
          .insert({
            location,
            label,
            url,
            icon_name: iconName || null,
            sort_order: sortOrder,
            is_active: isActive,
            is_new_tab: isNewTab,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-navigation'] });
      resetForm();
      toast.success(editing ? 'Navigation item updated' : 'Navigation item created');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('navigation_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-navigation'] });
      toast.success('Navigation item deleted');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('navigation_items')
        .update({ is_active: !is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-navigation'] });
      toast.success('Status updated');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const moveUpMutation = useMutation({
    mutationFn: async (item: NavigationItem) => {
      const sameLocationItems = navItems?.filter(n => n.location === item.location) || [];
      const currentIndex = sameLocationItems.findIndex(n => n.id === item.id);
      if (currentIndex <= 0) return;
      
      const prev = sameLocationItems[currentIndex - 1];
      await supabase.from('navigation_items').update({ sort_order: prev.sort_order - 1 }).eq('id', item.id);
      await supabase.from('navigation_items').update({ sort_order: item.sort_order }).eq('id', prev.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-navigation'] }),
    onError: (error: any) => toast.error(error.message),
  });

  const moveDownMutation = useMutation({
    mutationFn: async (item: NavigationItem) => {
      const sameLocationItems = navItems?.filter(n => n.location === item.location) || [];
      const currentIndex = sameLocationItems.findIndex(n => n.id === item.id);
      if (currentIndex >= sameLocationItems.length - 1) return;
      
      const next = sameLocationItems[currentIndex + 1];
      await supabase.from('navigation_items').update({ sort_order: next.sort_order + 1 }).eq('id', item.id);
      await supabase.from('navigation_items').update({ sort_order: item.sort_order }).eq('id', next.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-navigation'] }),
    onError: (error: any) => toast.error(error.message),
  });

  const resetForm = () => {
    setEditing(null);
    setLocation('header');
    setLabel('');
    setUrl('');
    setIconName('');
    setSortOrder(0);
    setIsActive(true);
    setIsNewTab(false);
    setShowModal(false);
  };

  const openEdit = (item: NavigationItem) => {
    setEditing(item);
    setLocation(item.location);
    setLabel(item.label);
    setUrl(item.url);
    setIconName(item.icon_name || '');
    setSortOrder(item.sort_order);
    setIsActive(item.is_active);
    setIsNewTab(item.is_new_tab);
    setShowModal(true);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const filteredItems = useMemo(() => {
    if (!navItems) return [];
    let items = navItems;
    if (filterLocation !== 'all') {
      items = items.filter(n => n.location === filterLocation);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(n => 
        n.label.toLowerCase().includes(q) || 
        n.url.toLowerCase().includes(q)
      );
    }
    return items;
  }, [navItems, filterLocation, search]);

  const groupedItems = useMemo(() => {
    const groups: Record<NavigationLocation, NavigationItem[]> = {
      header: [],
      footer_main: [],
      footer_quick: [],
      footer_categories: [],
      mobile: [],
    };
    filteredItems.forEach(item => {
      if (groups[item.location]) {
        groups[item.location].push(item);
      }
    });
    return groups;
  }, [filteredItems]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Navigation</h1>
          <p className="text-gray-500 mt-1">Manage header and footer navigation</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />Add Navigation Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search navigation..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterLocation}
          onChange={e => setFilterLocation(e.target.value as NavigationLocation | 'all')}
          className="px-4 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Locations</option>
          {locationOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Navigation Items */}
      {isLoading ? (
        <div className="py-20"><Spinner /></div>
      ) : filteredItems.length === 0 ? (
        <EmptyState title="No navigation items found" description="Add your first navigation item" />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([loc, items]) => {
            if (items.length === 0) return null;
            const locInfo = locationOptions.find(l => l.value === loc);
            return (
              <div key={loc} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">{locInfo?.label || loc}</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 w-24">Order</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Label</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">URL</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 w-24">Status</th>
                      <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveUpMutation.mutate(item)}
                              disabled={index === 0}
                              className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ArrowUp className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => moveDownMutation.mutate(item)}
                              disabled={index === items.length - 1}
                              className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ArrowDown className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">{item.label}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">{item.url}</td>
                        <td className="px-6 py-4">
                          <Badge variant={item.is_active ? 'success' : 'warning'}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleMutation.mutate({ id: item.id, is_active: item.is_active })}
                            >
                              {item.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => {
                                if (confirm(`Delete "${item.label}"?`)) {
                                  deleteMutation.mutate(item.id);
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
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={resetForm} title={editing ? 'Edit Navigation Item' : 'New Navigation Item'} size="md">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <select
              value={location}
              onChange={e => setLocation(e.target.value as NavigationLocation)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {locationOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <Input label="Label" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g., Products" />
          <Input label="URL" value={url} onChange={e => setUrl(e.target.value)} placeholder="e.g., /products" />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Icon (Optional)</label>
            <select
              value={iconName}
              onChange={e => setIconName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No Icon</option>
              {iconNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sort Order" type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={isActive ? 'true' : 'false'}
                onChange={e => setIsActive(e.target.value === 'true')}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="newTab"
              checked={isNewTab}
              onChange={e => setIsNewTab(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="newTab" className="text-sm text-gray-700">Open in new tab</label>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={resetForm}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!label.trim() || !url.trim()}
            >
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
