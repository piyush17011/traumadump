'use client';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { Post } from '../../types';
import { PostCard } from '../../components/post/PostCard';
import { cn } from '../../lib/utils';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [type, setType] = useState<'posts' | 'users'>('posts');

  const triggerSearch = useCallback(
    (val: string) => {
      const timer = setTimeout(() => setDebouncedQuery(val), 500);
      return () => clearTimeout(timer);
    },
    []
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery, type],
    queryFn: () =>
      api.get<{ data: any[] }>('/search', { params: { q: debouncedQuery, type } }).then((r) => r.data.data),
    enabled: debouncedQuery.length > 1,
  });

  const handleChange = (val: string) => {
    setQuery(val);
    triggerSearch(val);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Search</h1>
      <p className="text-slate-500 mb-8">Find stories, people, and conversations.</p>

      {/* Search input */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-11 pr-4 py-3.5 text-base"
          placeholder="Search for stories or people..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          autoFocus
        />
        {(isLoading || isFetching) && debouncedQuery && (
          <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
        )}
      </div>

      {/* Type toggle */}
      <div className="flex gap-2 mb-6">
        {(['posts', 'users'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              'px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all',
              type === t ? 'bg-brand-500 text-white shadow-soft' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Results */}
      {!debouncedQuery && (
        <div className="text-center py-16 text-slate-400">
          <Search size={40} className="mx-auto mb-4 opacity-30" />
          <p>Start typing to search</p>
        </div>
      )}

      {debouncedQuery && !isLoading && data?.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-2xl mb-3">🔍</p>
          <p>No results for "{debouncedQuery}"</p>
        </div>
      )}

      {type === 'posts' && data && data.length > 0 && (
        <div className="space-y-4">
          {(data as Post[]).map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      {type === 'users' && data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((u: any) => (
            <a
              key={u._id}
              href={`/profile/${u.username}`}
              className="card-hover p-4 flex items-center gap-4"
            >
              <img
                src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${u.username}&backgroundColor=b6e3f4`}
                alt={u.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold text-slate-800">@{u.username}</p>
                <p className="text-sm text-slate-400">{u.postsCount} stories</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
