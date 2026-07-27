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
import { getServiceIcon } from '@/lib/utils/icon-mapper';
import { Plus, Pencil, Trash2, EyeOff, Eye, GripVertical, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Service } from '@/types';

const iconOptions = [
  { value: 'Smartphone', label: 'Smartphone' },
  { value: 'Wrench', label: 'Wrench' },
  { value: 'Battery', label: 'Battery' },
  { value: 'Cpu', label: 'Cpu' },
  { value: 'Watch', label: 'Watch' },
  { value: 'ShieldCheck', label: 'Shield' },
  { value: 'ShoppingCart', label: 'Cart' },
  { value: 'Settings', label: 'Settings' },
  { value: 'Package', label: 'Package' },
  { value: 'Phone', label: 'Phone' },
  { value: 'Monitor', label: 'Monitor' },
  { value: 'Headphones', label: 'Headphones' },
  { value: 'Zap', label: 'Zap' },
  { value: 'Tool', label: 'Tool' },
  { value: 'RefreshCw', label: 'Refresh' },
  { value: 'Truck', label: 'Truck' },
];

const colorOptions = [
  { value: 'bg-blue-50 text-blue-600', label: 'Blue' },
  { value: 'bg-red-50 text-red-600', label: 'Red' },
  { value: 'bg-green-50 text-green-600', label: 'Green' },
  { value: 'bg-purple-50 text-purple-600', label: 'Purple' },
  { value: 'bg-orange-50 text-orange-600', label: 'Orange' },
  { value: 'bg-indigo-50 text-indigo-600', label: 'Indigo' },
  { value: 'bg-pink-50 text-pink-600', label: 'Pink' },
  { value: 'bg-teal-50 text-teal-600', label: 'Teal' },
  { value: 'bg-cyan-50 text-cyan-600', label: 'Cyan' },
  { value: 'bg-amber-50 text-amber-600', label: 'Amber' },
];

export default function AdminServicesPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [search, setSearch] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Smartphone');
  const [color, setColor] = useState('bg-blue-50 text-blue-600');
  const [featuresText, setFeaturesText] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .order('order_index', { ascending: true });
      return (data || []) as Service[];
    },
  });

  const filteredServices = useMemo(() => {
    if (!services) return [];
    if (!search.trim()) return services;
    const q = search.toLowerCase();
    return services.filter(
      s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }, [services, search]);

  const mutation = useMutation({
    mutationFn: async () => {
      const features = featuresText
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean);

      if (editing) {
        const { error } = await supabase
          .from('services')
          .update({
            title,
            description,
            icon,
            color,
            features,
            order_index: orderIndex,
            is_active: isActive,
          })
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('services')
          .insert({
            title,
            description,
            icon,
            color,
            features,
            order_index: orderIndex,
            is_active: isActive,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      resetForm();
      toast.success(editing ? 'Service updated' : 'Service created');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Service deleted');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Service status updated');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, order_index }: { id: string; order_index: number }) => {
      const { error } = await supabase
        .from('services')
        .update({ order_index })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    },
    onError: (error: any) => toast.error(error.message),
  });

  const moveUp = (service: Service, index: number) => {
    if (index === 0) return;
    const prev = filteredServices[index - 1];
    reorderMutation.mutate({ id: service.id, order_index: prev.order_index - 1 });
    reorderMutation.mutate({ id: prev.id, order_index: service.order_index });
  };

  const moveDown = (service: Service, index: number) => {
    if (index === filteredServices.length - 1) return;
    const next = filteredServices[index + 1];
    reorderMutation.mutate({ id: service.id, order_index: next.order_index + 1 });
    reorderMutation.mutate({ id: next.id, order_index: service.order_index });
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setTitle(service.title);
    setDescription(service.description);
    setIcon(service.icon);
    setColor(service.color);
    setFeaturesText(service.features?.join('\n') || '');
    setOrderIndex(service.order_index);
    setIsActive(service.is_active);
    setShowModal(true);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setEditing(null);
    setTitle('');
    setDescription('');
    setIcon('Smartphone');
    setColor('bg-blue-50 text-blue-600');
    setFeaturesText('');
    setOrderIndex(0);
    setIsActive(true);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-500 mt-1">Manage your business services</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />Add Service
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="w-12 px-2 py-4"></th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-gray-600">Icon</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-gray-600">Title</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-gray-600 hidden md:table-cell">Description</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-gray-600">Order</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="text-right px-4 py-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={7} className="py-20"><Spinner /></td></tr>
            ) : filteredServices.length === 0 ? (
              <tr><td colSpan={7} className="py-10">
                <EmptyState
                  title={search ? 'No matching services' : 'No services yet'}
                  description={search ? 'Try a different search term.' : 'Create your first service to get started.'}
                  action={!search ? <Button variant="primary" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Service</Button> : undefined}
                />
              </td></tr>
            ) : filteredServices.map((service, index) => {
              const Icon = getServiceIcon(service.icon);
              return (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-2 py-4">
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        onClick={() => moveUp(service, index)}
                        disabled={index === 0}
                        className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <button
                        onClick={() => moveDown(service, index)}
                        disabled={index === filteredServices.length - 1}
                        className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`w-10 h-10 rounded-xl ${service.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900">{service.title}</td>
                  <td className="px-4 py-4 text-gray-500 text-sm max-w-xs truncate hidden md:table-cell">{service.description}</td>
                  <td className="px-4 py-4 text-gray-500">{service.order_index}</td>
                  <td className="px-4 py-4">
                    <Badge variant={service.is_active ? 'success' : 'warning'}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActiveMutation.mutate({ id: service.id, is_active: service.is_active })}
                        title={service.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {service.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(service)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => {
                          if (confirm(`Delete "${service.title}"? This action cannot be undone.`)) {
                            deleteMutation.mutate(service.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={resetForm} title={editing ? 'Edit Service' : 'New Service'} size="xl">
        <div className="space-y-5">
          <Input
            label="Service Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Phone Repair Services"
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe this service..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Icon</label>
              <select
                value={icon}
                onChange={e => setIcon(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {iconOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Color Theme</label>
              <select
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {colorOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-medium text-gray-500 mb-3">Preview</p>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                {(() => {
                  const Icon = getServiceIcon(icon);
                  return <Icon className="w-5 h-5" />;
                })()}
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">{title || 'Service Title'}</p>
                <p className="text-xs text-gray-500">{description ? description.slice(0, 60) + (description.length > 60 ? '...' : '') : 'Description'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Features (one per line)
            </label>
            <Textarea
              value={featuresText}
              onChange={e => setFeaturesText(e.target.value)}
              placeholder="Latest models available&#10;Competitive pricing&#10;Warranty included"
              rows={4}
            />
            <p className="text-xs text-gray-400">Each line becomes a feature bullet point.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Order Index"
              type="number"
              value={orderIndex}
              onChange={e => setOrderIndex(parseInt(e.target.value) || 0)}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={isActive ? 'true' : 'false'}
                onChange={e => setIsActive(e.target.value === 'true')}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={resetForm}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!title.trim() || !description.trim()}
            >
              {editing ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

