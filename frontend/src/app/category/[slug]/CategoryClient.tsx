'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, PenSquare } from 'lucide-react';
import api from '../../../lib/api';
import { Category, Post, PaginatedResponse } from '../../../types';
import { PostCard } from '../../../components/post/PostCard';
import { useAuthStore } from '../../../store/authStore';
import { useState } from 'react';

export function CategoryClient({ slug }: { slug: string }) {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);

  const { data: category } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => api.get<{ data: Category }>(`/categories/${slug}`).then((r) => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['posts', 'latest', slug, page],
    queryFn: () =>
      api.get<PaginatedResponse<Post>>('/posts', { params: { category: slug, page, limit: 10 } }).then((r) => r.data),
  });

  const reactMutation = useMutation({
    mutationFn: ({ slug: s, type }: { slug: string; type: string }) =>
      api.post(`/posts/${s}/react`, { type }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
    onError: () => toast.error('Log in to react'),
  });

  if (!category) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/feed" className="btn-ghost mb-6 inline-flex">
        <ArrowLeft size={15} /> Back to Feed
      </Link>

      {/* Category header */}
      <div
        className="rounded-3xl p-8 mb-8 text-white flex items-center gap-5"
        style={{ backgroundColor: category.color }}
      >
        <span className="text-5xl">{category.icon}</span>
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p className="text-white/80 text-sm mt-1">{category.description}</p>
          <p className="text-white/60 text-xs mt-2">{category.postCount} stories</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-slate-800">Stories</h2>
        {user && (
          <Link href={`/create?category=${slug}`} className="btn-primary">
            <PenSquare size={14} /> Share Story
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse h-36" />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <p className="text-3xl mb-3">{category.icon}</p>
          <p className="font-medium mb-4">No stories in this category yet.</p>
          {user ? (
            <Link href="/create" className="btn-primary inline-flex">Be the first</Link>
          ) : (
            <Link href="/register" className="btn-primary inline-flex">Join &amp; Share</Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data?.data.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onReact={(s, type) => reactMutation.mutate({ slug: s, type })}
              />
            ))}
          </div>

          {data && data.pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-5">
                Previous
              </button>
              <span className="flex items-center text-sm text-slate-500 px-4">{page} / {data.pagination.pages}</span>
              <button onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))} disabled={page === data.pagination.pages} className="btn-secondary px-5">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
