'use client';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MessageCircle, Eye, Flag, ArrowLeft } from 'lucide-react';
import api from '../../../lib/api';
import { Post, Comment, REACTION_CONFIG, ReactionType } from '../../../types';
import { timeAgo, getAvatarUrl, cn } from '../../../lib/utils';
import { useAuthStore } from '../../../store/authStore';

export function PostDetailClient({ slug }: { slug: string }) {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [comment, setComment] = useState('');
  const [commentAnon, setCommentAnon] = useState(false);
  const viewCounted = useRef(false);

  // Fetch post — first call includes view=1, subsequent refetches do not
  const { data: postData, isLoading } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => {
      const params = !viewCounted.current ? { view: '1' } : {};
      viewCounted.current = true;
      return api.get<{ data: Post }>(`/posts/${slug}`, { params }).then((r) => r.data.data);
    },
  });

  const { data: comments } = useQuery({
    queryKey: ['comments', slug],
    queryFn: () => api.get<{ data: Comment[] }>(`/posts/${slug}/comments`).then((r) => r.data.data),
  });

  const reactMutation = useMutation({
    mutationFn: (type: string) => api.post(`/posts/${slug}/react`, { type }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['post', slug] }),
    onError: () => toast.error('Log in to react'),
  });

  const commentMutation = useMutation({
    mutationFn: () =>
      api.post(`/posts/${slug}/comments`, { content: comment, isAnonymous: commentAnon }),
    onSuccess: () => {
      setComment('');
      qc.invalidateQueries({ queryKey: ['comments', slug] });
      qc.invalidateQueries({ queryKey: ['post', slug] });
      toast.success('Comment added!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to comment'),
  });

  const reportMutation = useMutation({
    mutationFn: () =>
      api.post('/reports', { targetType: 'post', targetId: postData?._id, reason: 'other' }),
    onSuccess: () => toast.success('Reported. Thank you.'),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse space-y-4">
        <div className="h-8 bg-slate-100 rounded w-3/4" />
        <div className="h-4 bg-slate-100 rounded w-1/2" />
        <div className="h-48 bg-slate-100 rounded" />
      </div>
    );
  }

  const post = postData;
  if (!post) return <div className="text-center py-20 text-slate-400">Story not found.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/feed" className="btn-ghost mb-6 inline-flex">
        <ArrowLeft size={15} /> Back to Feed
      </Link>

      {/* ── Post ─────────────────────────────── */}
      <article className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100">
            <Image
              src={getAvatarUrl(post.author.username, post.author.avatar)}
              alt={`${post.author.username}'s avatar`}
              width={40} height={40}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {post.isAnonymous ? 'Anonymous' : `@${post.author.username}`}
            </p>
            <p className="text-xs text-slate-400">{timeAgo(post.createdAt)}</p>
          </div>
          <span
            className="ml-auto badge text-white text-xs"
            style={{ backgroundColor: post.category.color }}
          >
            {post.category.icon} {post.category.name}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-4 leading-snug">{post.title}</h1>
        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((t) => (
              <span key={t} className="badge bg-slate-100 text-slate-500">#{t}</span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-slate-400 mt-4 pt-4 border-t border-slate-50">
          <span className="flex items-center gap-1"><Eye size={12} /> {post.viewCount} views</span>
          <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.commentCount} comments</span>
          <button
            onClick={() => user ? reportMutation.mutate() : toast.error('Log in to report')}
            className="ml-auto flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors"
          >
            <Flag size={12} /> Report
          </button>
        </div>
      </article>

      {/* ── Reactions ─────────────────────────── */}
      <div className="card p-5 mb-6">
        <p className="text-sm font-semibold text-slate-700 mb-4">Send your support 💙</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((type) => {
            const { emoji, label } = REACTION_CONFIG[type];
            const count = post.reactions[type];
            const isActive = post.userReaction === type;
            return (
              <button
                key={type}
                onClick={() => reactMutation.mutate(type)}
                disabled={reactMutation.isPending}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all hover:scale-105 active:scale-95',
                  isActive
                    ? 'border-brand-400 bg-brand-50 text-brand-700 shadow-soft'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                <span className="text-base">{emoji}</span>
                <span>{label}</span>
                {count > 0 && <span className="text-xs text-slate-400 ml-1">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Comments ───────────────────────────── */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <MessageCircle size={16} /> Comments ({post.commentCount})
        </h2>

        {user ? (
          <div className="mb-6">
            <textarea
              className="input resize-none mb-3"
              rows={3}
              placeholder="Share some support or relate to their story..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={commentAnon}
                  onChange={(e) => setCommentAnon(e.target.checked)}
                  className="accent-brand-500"
                />
                Comment anonymously
              </label>
              <button
                onClick={() => commentMutation.mutate()}
                disabled={!comment.trim() || commentMutation.isPending}
                className="btn-primary"
              >
                {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-brand-50 rounded-xl text-sm text-center text-slate-600">
            <Link href="/login" className="text-brand-600 font-semibold">Log in</Link> to leave a comment.
          </div>
        )}

        <div className="space-y-4">
          {comments?.map((c) => (
            <div key={c._id} className="flex gap-3 p-4 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0">
                <Image
                  src={getAvatarUrl(c.author.username, c.author.avatar)}
                  alt={`${c.author.username}'s avatar`}
                  width={32} height={32}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-700">
                    {c.isAnonymous ? 'Anonymous' : `@${c.author.username}`}
                  </span>
                  <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}

          {comments?.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-6">Be the first to comment 💙</p>
          )}
        </div>
      </div>
    </div>
  );
}