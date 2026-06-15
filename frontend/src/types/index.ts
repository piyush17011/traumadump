export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  role: 'user' | 'admin';
  isAnonymousDefault: boolean;
  postsCount: number;
  reactionsReceived: number;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
}

export interface Reactions {
  understand: number;
  support: number;
  strong: number;
  notAlone: number;
  hope: number;
}

export type ReactionType = keyof Reactions;

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  author: { username: string; avatar: string };
  category: Category;
  isAnonymous: boolean;
  tags: string[];
  reactions: Reactions;
  userReaction?: ReactionType | null;
  commentCount: number;
  viewCount: number;
  createdAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: { username: string; avatar: string };
  isAnonymous: boolean;
  likes: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export const REACTION_CONFIG: Record<ReactionType, { emoji: string; label: string; color: string }> = {
  understand: { emoji: '❤️', label: 'I Understand',     color: 'text-rose-500' },
  support:    { emoji: '🤗', label: 'Sending Support',  color: 'text-amber-500' },
  strong:     { emoji: '💪', label: 'Stay Strong',      color: 'text-blue-500'  },
  notAlone:   { emoji: '🙏', label: "You're Not Alone", color: 'text-purple-500' },
  hope:       { emoji: '🌱', label: 'Hope Things Improve', color: 'text-green-500' },
};
