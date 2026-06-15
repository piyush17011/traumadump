'use client';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { CalendarDays, BookOpen, Heart } from 'lucide-react';
import api from '../../../lib/api';
import { Post, User } from '../../../types';
import { getAvatarUrl, timeAgo } from '../../../lib/utils';
import { PostCard } from '../../../components/post/PostCard';
import { format } from 'date-fns';

interface ProfileData { user: User; posts: Post[] }

export function ProfileClient({ username }: { username: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => api.get<{ data: ProfileData }>(`/users/${username}`).then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-24 bg-slate-100 rounded-2xl mb-4" />
        <div className="h-8 bg-slate-100 rounded w-48 mb-2" />
        <div className="h-4 bg-slate-100 rounded w-64" />
      </div>
    );
  }

  if (!data) return <div className="text-center py-20 text-slate-400">User not found.</div>;

  const { user, posts } = data;

  // Filter out anonymous posts from public profile view
  const publicPosts = posts.filter((p) => !p.isAnonymous);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="card p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-brand-100 shrink-0">
          <Image
            src={getAvatarUrl(user.username, user.avatar)}
            alt={`${user.username}'s avatar`}
            width={80}
            height={80}
            className="object-cover"
          />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-slate-900">@{user.username}</h1>
          {user.bio && <p className="text-slate-500 mt-1 text-sm">{user.bio}</p>}

          <div className="flex flex-wrap justify-center sm:justify-start gap-5 mt-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-brand-400" />
              <strong className="text-slate-800">{publicPosts.length}</strong> public stories
            </span>
            <span className="flex items-center gap-1.5">
              <Heart size={14} className="text-rose-400" />
              <strong className="text-slate-800">{user.reactionsReceived}</strong> reactions received
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} className="text-slate-400" />
              Joined {format(new Date(user.createdAt), 'MMM yyyy')}
            </span>
          </div>
        </div>
      </div>

      {/* Posts */}
      <h2 className="font-semibold text-slate-800 mb-4">Public Stories</h2>
      {publicPosts.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          <p className="text-2xl mb-3">📭</p>
          <p>No public stories yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {publicPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}