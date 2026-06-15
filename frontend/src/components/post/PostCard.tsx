'use client';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Eye } from 'lucide-react';
import { Post, REACTION_CONFIG } from '../../types';
import { timeAgo, truncate, getAvatarUrl, totalReactions, cn } from '../../lib/utils';

interface PostCardProps {
  post: Post;
  onReact?: (slug: string, type: string) => void;
}

export function PostCard({ post, onReact }: PostCardProps) {
  const total = totalReactions(post.reactions);

  return (
    <article className="card-hover p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 shrink-0">
          <Image
            src={getAvatarUrl(post.author.username, post.author.avatar)}
            alt={`${post.author.username}'s avatar`}
            width={36} height={36}
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {post.isAnonymous ? 'Anonymous' : `@${post.author.username}`}
          </p>
          <p className="text-xs text-slate-400">{timeAgo(post.createdAt)}</p>
        </div>

        {/* Category badge */}
        <span
          className="ml-auto badge shrink-0 text-white text-xs"
          style={{ backgroundColor: post.category.color }}
        >
          {post.category.icon} {post.category.name}
        </span>
      </div>

      {/* Body */}
      <Link href={`/post/${post.slug}`} className="block group">
        <h2 className="font-semibold text-slate-900 text-base mb-1.5 group-hover:text-brand-600 transition-colors leading-snug">
          {post.title}
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          {truncate(post.content, 160)}
        </p>
      </Link>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="badge bg-slate-100 text-slate-500">#{tag}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-50">
        {/* Reactions */}
        <div className="flex items-center gap-1">
          {(Object.keys(REACTION_CONFIG) as Array<keyof typeof REACTION_CONFIG>).map((type) => {
            const config = REACTION_CONFIG[type];
            const count = post.reactions[type];
            const isActive = post.userReaction === type;
            return (
              <button
                key={type}
                onClick={() => onReact?.(post.slug, type)}
                className={cn(
                  'flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium transition-all hover:scale-110 active:scale-95',
                  isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:bg-slate-100'
                )}
                title={config.label}
              >
                <span>{config.emoji}</span>
                {count > 0 && <span>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="ml-auto flex items-center gap-3 text-slate-400 text-xs">
          <span className="flex items-center gap-1">
            <MessageCircle size={13} /> {post.commentCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={13} /> {post.viewCount}
          </span>
        </div>
      </div>
    </article>
  );
}