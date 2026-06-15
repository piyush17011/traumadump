'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { PostCard } from '../../components/post/PostCard';
import { Post, Category, PaginatedResponse } from '../../types';
import { useAuthStore } from '../../store/authStore';
import Link from 'next/link';
import { Flame, Clock, TrendingUp, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';

const SORT_OPTIONS = [
  { value: 'latest',   label: 'Latest',   icon: <Clock size={14} /> },
  { value: 'trending', label: 'Trending', icon: <Flame size={14} /> },
  { value: 'top',      label: 'Top',      icon: <TrendingUp size={14} /> },
];

export default function FeedPage() {
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<{ data: Category[] }>('/categories').then((r) => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['posts', sort, category, page],
    queryFn: () =>
      api
        .get<PaginatedResponse<Post>>('/posts', { params: { sort, category, page, limit: 10 } })
        .then((r) => r.data),
  });

  const reactMutation = useMutation({
    mutationFn: ({ slug, type }: { slug: string; type: string }) =>
      api.post(`/posts/${slug}/react`, { type }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
    onError: () => {
      if (!user) toast.error('Log in to react to posts');
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Main feed ───────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Sort tabs */}
          <div className="flex items-center gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-card border border-slate-100 w-fit">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setSort(opt.value); setPage(1); }}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  sort === opt.value
                    ? 'bg-brand-500 text-white shadow-soft'
                    : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>

          {/* Post list */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="flex gap-3 mb-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-slate-100 rounded w-32" />
                      <div className="h-3 bg-slate-100 rounded w-20" />
                    </div>
                  </div>
                  <div className="h-5 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-3.5 bg-slate-100 rounded w-full mb-1.5" />
                  <div className="h-3.5 bg-slate-100 rounded w-5/6" />
                </div>
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="card p-12 text-center text-slate-400">
              <p className="text-4xl mb-4">📭</p>
              <p className="font-medium">No stories yet in this category.</p>
              <Link href="/create" className="btn-primary mt-4 inline-flex">Be the first</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.data.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onReact={(slug, type) => reactMutation.mutate({ slug, type })}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-5"
              >
                Previous
              </button>
              <span className="flex items-center text-sm text-slate-500 px-4">
                {page} / {data.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                disabled={page === data.pagination.pages}
                className="btn-secondary px-5"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* ── Sidebar ─────────────────────────────── */}
        <aside className="w-full lg:w-72 shrink-0 space-y-5">
          {/* Filter by category */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Filter size={15} /> Categories
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => { setCategory(''); setPage(1); }}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-xl text-sm transition-colors',
                  !category ? 'bg-brand-50 text-brand-600 font-medium' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                All Stories
              </button>
              {categoriesData?.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => { setCategory(cat.slug); setPage(1); }}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center gap-2',
                    category === cat.slug ? 'bg-brand-50 text-brand-600 font-medium' : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <span>{cat.icon}</span>
                  <span className="flex-1 truncate">{cat.name}</span>
                  <span className="text-xs text-slate-400">{cat.postCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CTA card */}
          {!user && (
            <div className="card p-5 bg-gradient-to-br from-brand-50 to-lavender border-brand-100">
              <h3 className="font-semibold text-slate-800 mb-2">Ready to share?</h3>
              <p className="text-sm text-slate-500 mb-4">Join the community and speak freely.</p>
              <Link href="/register" className="btn-primary w-full justify-center">Join Free</Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
