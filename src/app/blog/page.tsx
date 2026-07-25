'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/format';
import { Search, Calendar, User, ArrowRight, FileText } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PlaceholderImage } from '@/components/ui/placeholder-image';

export default function BlogPage() {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: posts, isLoading, error, refetch } = useQuery({
    queryKey: ['blog-posts', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-8 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Our Blog</h1>
            <p className="text-lg text-gray-500 mb-8">
              Tips, guides, and insights about mobile phones, accessories, repairs, and technology.
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="input-field pl-12"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : !posts || posts.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-10 h-10" />}
            title="No blog posts yet"
            description="Blog posts will appear here once published."
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <article className="card overflow-hidden card-hover">
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    {post.image ? (
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <PlaceholderImage className="aspect-video rounded-none" />
                    )}
                  </div>
                  <div className="p-6 space-y-4">
                    {post.category && (
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                    )}
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-500 text-sm line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(post.published_at || post.created_at)}
                        </span>
                        {post.author && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

