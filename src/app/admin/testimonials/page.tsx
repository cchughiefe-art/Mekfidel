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
import { Plus, Pencil, Trash2, EyeOff, Eye, Search, Star, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Testimonial } from '@/types';

export default function AdminTestimonialsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  // State
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [search, setSearch] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [avatar, setAvatar] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  // Query
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: async () => {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .order('sort_order', { ascending: true });
      return (data || []) as Testimonial[];
    },
  });

  // Mutation
  const mutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase
          .from('testimonials')
          .update({
            name,
            role: role || null,
            company: company || null,
            content,
            rating,
            avatar: avatar || null,
            is_published: isPublished,
            is_featured: isFeatured,
            sort_order: sortOrder,
          })
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert({
            name,
            role: role || null,
            company: company || null,
            content,
            rating,
            avatar: avatar || null,
            is_published: isPublished,
            is_featured: isFeatured,
            sort_order: sortOrder,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      resetForm();
      toast.success(editing ? 'Testimonial updated' : 'Testimonial created');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      toast.success('Testimonial deleted');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const togglePublishedMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_published: !is_published })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      toast.success('Status updated');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const moveUpMutation = useMutation({
    mutationFn: async (item: Testimonial) => {
      const currentIndex = testimonials?.findIndex(t => t.id === item.id) || 0;
      if (currentIndex <= 0) return;
      const prev = testimonials![currentIndex - 1];
      await supabase.from('testimonials').update({ sort_order: prev.sort_order - 1 }).eq('id', item.id);
      await supabase.from('testimonials').update({ sort_order: item.sort_order }).eq('id', prev.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] }),
    onError: (error: any) => toast.error(error.message),
  });

  const moveDownMutation = useMutation({
    mutationFn: async (item: Testimonial) => {
      const currentIndex = testimonials?.findIndex(t => t.id === item.id) || 0;
      if (currentIndex >= (testimonials?.length || 0) - 1) return;
      const next = testimonials![currentIndex + 1];
      await supabase.from('testimonials').update({ sort_order: next.sort_order + 1 }).eq('id', item.id);
      await supabase.from('testimonials').update({ sort_order: item.sort_order }).eq('id', next.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] }),
    onError: (error: any) => toast.error(error.message),
  });

  const resetForm = () => {
    setEditing(null);
    setName('');
    setRole('');
    setCompany('');
    setContent('');
    setRating(5);
    setAvatar('');
    setIsPublished(true);
    setIsFeatured(false);
    setSortOrder(0);
    setShowModal(false);
  };

  const openEdit = (testimonial: Testimonial) => {
    setEditing(testimonial);
    setName(testimonial.name);
    setRole(testimonial.role || '');
    setCompany(testimonial.company || '');
    setContent(testimonial.content);
    setRating(testimonial.rating);
    setAvatar(testimonial.avatar || '');
    setIsPublished(testimonial.is_published);
    setIsFeatured(testimonial.is_featured);
    setSortOrder(testimonial.sort_order);
    setShowModal(true);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const filteredTestimonials = useMemo(() => {
    if (!testimonials) return [];
    if (!search.trim()) return testimonials;
    const q = search.toLowerCase();
    return testimonials.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.content.toLowerCase().includes(q) ||
      t.company?.toLowerCase().includes(q)
    );
  }, [testimonials, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-500 mt-1">Manage customer testimonials and reviews</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />Add Testimonial
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search testimonials..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Testimonials List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20"><Spinner /></div>
        ) : filteredTestimonials.length === 0 ? (
          <EmptyState title="No testimonials found" description="Add your first testimonial" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 w-24">Order</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Content</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Rating</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTestimonials.map((testimonial, index) => (
                <tr key={testimonial.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveUpMutation.mutate(testimonial)}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => moveDownMutation.mutate(testimonial)}
                        disabled={index === filteredTestimonials.length - 1}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">
                        {testimonial.role && `${testimonial.role}`}
                        {testimonial.role && testimonial.company && ' at '}
                        {testimonial.company}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">{testimonial.content}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <Badge variant={testimonial.is_published ? 'success' : 'warning'}>
                        {testimonial.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      {testimonial.is_featured && (
                        <Badge variant="info">Featured</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublishedMutation.mutate({ id: testimonial.id, is_published: testimonial.is_published })}
                      >
                        {testimonial.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(testimonial)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => {
                          if (confirm(`Delete testimonial from "${testimonial.name}"?`)) {
                            deleteMutation.mutate(testimonial.id);
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

      {/* Modal */}
      <Modal isOpen={showModal} onClose={resetForm} title={editing ? 'Edit Testimonial' : 'New Testimonial'} size="lg">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Customer Name" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
            <Input label="Role/Title" value={role} onChange={e => setRole(e.target.value)} placeholder="CEO" />
          </div>
          <Input label="Company" value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Inc" />
          <Textarea label="Testimonial Content" value={content} onChange={e => setContent(e.target.value)} placeholder="What the customer said..." rows={4} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <select
                value={rating}
                onChange={e => setRating(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[5, 4, 3, 2, 1].map(r => (
                  <option key={r} value={r}>{r} Stars</option>
                ))}
              </select>
            </div>
            <Input label="Avatar URL" value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sort Order" type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)} />
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="published" className="text-sm text-gray-700">Published</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="featured" className="text-sm text-gray-700">Featured</label>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={resetForm}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!name.trim() || !content.trim()}
            >
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
