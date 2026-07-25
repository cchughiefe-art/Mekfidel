'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/format';
import { Calendar, User, ArrowLeft, ChevronLeft } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { PlaceholderImage } from '@/components/ui/placeholder-image';

export default function BlogPostPage() {
  const params = useParams();
  const supabase = createClient();

  const { data: post, isLoading, error, refetch } = useQuery({
    queryKey: ['blog-post', params.slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', params.slug)
        .single();
      if (error) throw error;

      // Increment views
      try {
  await supabase.rpc("increment_blog_views", {
    post_id: data.id,
  });
} catch {
  // Ignore view count errors
}
      
      return data;
    },
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><ErrorState onRetry={refetch} /></div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Post not found</p></div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronLeft className="w-3 h-3 rotate-180" />
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            <ChevronLeft className="w-3 h-3 rotate-180" />
            <span className="text-gray-900">{post.title}</span>
          </div>
        </div>
      </div>

      <article className="container-custom py-12">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {post.image && (
            <div className="aspect-video rounded-2xl overflow-hidden mb-8">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="space-y-6">
            {post.category && (
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-full">
                {post.category}
              </span>
            )}

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(post.published_at || post.created_at)}
              </span>
              {post.author && (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
              )}
              {post.views > 0 && (
                <span>{post.views} views</span>
              )}
            </div>

            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-blue-600 prose-img:rounded-xl">
              {post.content?.split('\n').map((paragraph: string, idx: number) => (
                paragraph.trim() ? <p key={idx}>{paragraph}</p> : null
              ))}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-100">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

