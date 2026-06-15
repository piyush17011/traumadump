'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Send } from 'lucide-react';
import api from '../../lib/api';
import { Category } from '../../types';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import Link from 'next/link';

export default function CreatePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(user?.isAnonymousDefault || false);
  const [tags, setTags] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<{ data: Category[] }>('/categories').then((r) => r.data.data),
  });

  const mutation = useMutation({
    mutationFn: (payload: object) => api.post('/posts', payload),
    onSuccess: (res) => {
      toast.success('Story shared! 🎉');
      router.push(`/post/${res.data.data.slug}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to publish');
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || !categorySlug) {
      toast.error('Please fill in all required fields');
      return;
    }
    mutation.mutate({
      title: title.trim(),
      content: content.trim(),
      categorySlug,
      isAnonymous,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🔒</p>
        <h2 className="text-xl font-bold mb-3">Log in to share your story</h2>
        <Link href="/login" className="btn-primary">Log In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Share Your Story</h1>
        <p className="text-slate-500">Your words matter. Someone out there needs to hear them.</p>
      </div>

      <div className="card p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="label">Title <span className="text-red-400">*</span></label>
          <input
            className="input"
            placeholder="What's on your mind? Give it a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
          <p className="text-xs text-slate-400 mt-1 text-right">{title.length}/200</p>
        </div>

        {/* Category */}
        <div>
          <label className="label">Category <span className="text-red-400">*</span></label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories?.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setCategorySlug(cat.slug)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all',
                  categorySlug === cat.slug
                    ? 'border-brand-400 bg-brand-50 text-brand-700 shadow-soft'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                <span>{cat.icon}</span>
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="label">Your Story <span className="text-red-400">*</span></label>
          <textarea
            className="input resize-none"
            rows={8}
            placeholder="Write what you've been holding inside. This is your safe space..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={5000}
          />
          <p className="text-xs text-slate-400 mt-1 text-right">{content.length}/5000</p>
        </div>

        {/* Tags */}
        <div>
          <label className="label">Tags <span className="text-slate-400 font-normal">(optional, comma separated)</span></label>
          <input
            className="input"
            placeholder="e.g. healing, family, college"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        {/* Anonymous toggle */}
        <div
          className={cn(
            'flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer select-none',
            isAnonymous ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-slate-50'
          )}
          onClick={() => setIsAnonymous(!isAnonymous)}
        >
          <div className="flex items-center gap-3">
            {isAnonymous ? <EyeOff size={18} className="text-brand-500" /> : <Eye size={18} className="text-slate-400" />}
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {isAnonymous ? 'Posting Anonymously' : 'Posting as @' + user.username}
              </p>
              <p className="text-xs text-slate-500">
                {isAnonymous ? 'Your username will be hidden' : 'Your username will be visible'}
              </p>
            </div>
          </div>
          <div className={cn('w-10 h-6 rounded-full transition-colors', isAnonymous ? 'bg-brand-500' : 'bg-slate-200')}>
            <div className={cn('w-4 h-4 bg-white rounded-full mt-1 shadow transition-transform', isAnonymous ? 'translate-x-5' : 'translate-x-1')} />
          </div>
        </div>

        {/* Submit */}
        <button
          className="btn-primary w-full justify-center py-3 text-base"
          onClick={handleSubmit}
          disabled={mutation.isPending}
        >
          <Send size={16} />
          {mutation.isPending ? 'Publishing...' : 'Publish Story'}
        </button>
      </div>
    </div>
  );
}
