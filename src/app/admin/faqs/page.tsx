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
import { Plus, Pencil, Trash2, EyeOff, Eye, Search, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import type { FAQ } from '@/types';

export default function AdminFAQsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  // State
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Form state
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  // Query
  const { data: faqs, isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('faqs')
        .select('*')
        .order('sort_order', { ascending: true });
      return (data || []) as FAQ[];
    },
  });

  // Get unique categories
  const categories = useMemo(() => {
    if (!faqs) return [];
    const cats = new Set(faqs.map(f => f.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [faqs]);

  // Mutation
  const mutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase
          .from('faqs')
          .update({
            question,
            answer,
            category: category || null,
            is_published: isPublished,
            sort_order: sortOrder,
          })
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert({
            question,
            answer,
            category: category || null,
            is_published: isPublished,
            sort_order: sortOrder,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      resetForm();
      toast.success(editing ? 'FAQ updated' : 'FAQ created');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      toast.success('FAQ deleted');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const togglePublishedMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from('faqs')
        .update({ is_published: !is_published })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      toast.success('Status updated');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const moveUpMutation = useMutation({
    mutationFn: async (item: FAQ) => {
      const currentIndex = faqs?.findIndex(f => f.id === item.id) || 0;
      if (currentIndex <= 0) return;
      const prev = faqs![currentIndex - 1];
      await supabase.from('faqs').update({ sort_order: prev.sort_order - 1 }).eq('id', item.id);
      await supabase.from('faqs').update({ sort_order: item.sort_order }).eq('id', prev.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-faqs'] }),
    onError: (error: any) => toast.error(error.message),
  });

  const moveDownMutation = useMutation({
    mutationFn: async (item: FAQ) => {
      const currentIndex = faqs?.findIndex(f => f.id === item.id) || 0;
      if (currentIndex >= (faqs?.length || 0) - 1) return;
      const next = faqs![currentIndex + 1];
      await supabase.from('faqs').update({ sort_order: next.sort_order + 1 }).eq('id', item.id);
      await supabase.from('faqs').update({ sort_order: item.sort_order }).eq('id', next.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-faqs'] }),
    onError: (error: any) => toast.error(error.message),
  });

  const resetForm = () => {
    setEditing(null);
    setQuestion('');
    setAnswer('');
    setCategory('');
    setIsPublished(true);
    setSortOrder(0);
    setShowModal(false);
  };

  const openEdit = (faq: FAQ) => {
    setEditing(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category || '');
    setIsPublished(faq.is_published);
    setSortOrder(faq.sort_order);
    setShowModal(true);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const filteredFAQs = useMemo(() => {
    if (!faqs) return [];
    let items = faqs;
    if (filterCategory !== 'all') {
      items = items.filter(f => f.category === filterCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(f => 
        f.question.toLowerCase().includes(q) || 
        f.answer.toLowerCase().includes(q)
      );
    }
    return items;
  }, [faqs, filterCategory, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQs</h1>
          <p className="text-gray-500 mt-1">Manage frequently asked questions</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />Add FAQ
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* FAQs List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20"><Spinner /></div>
        ) : filteredFAQs.length === 0 ? (
          <EmptyState title="No FAQs found" description="Add your first FAQ" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 w-24">Order</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Question</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFAQs.map((faq, index) => (
                <tr key={faq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveUpMutation.mutate(faq)}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => moveDownMutation.mutate(faq)}
                        disabled={index === filteredFAQs.length - 1}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{faq.question}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{faq.answer}</p>
                  </td>
                  <td className="px-6 py-4">
                    {faq.category ? (
                      <Badge variant="info">{faq.category}</Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={faq.is_published ? 'success' : 'warning'}>
                      {faq.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublishedMutation.mutate({ id: faq.id, is_published: faq.is_published })}
                      >
                        {faq.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(faq)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => {
                          if (confirm(`Delete this FAQ?`)) {
                            deleteMutation.mutate(faq.id);
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
      <Modal isOpen={showModal} onClose={resetForm} title={editing ? 'Edit FAQ' : 'New FAQ'} size="lg">
        <div className="space-y-5">
          <Input label="Question" value={question} onChange={e => setQuestion(e.target.value)} placeholder="What is your question?" />
          <Textarea label="Answer" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Provide a detailed answer..." rows={4} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g., Products, Shipping" />
            <Input label="Sort Order" type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)} />
          </div>
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
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={resetForm}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!question.trim() || !answer.trim()}
            >
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
