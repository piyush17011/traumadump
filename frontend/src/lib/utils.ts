import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';
import type { Reactions } from '../types';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const timeAgo = (date: string | Date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const truncate = (str: string, length: number) =>
  str.length > length ? `${str.slice(0, length)}...` : str;

export const getAvatarUrl = (username: string, avatar?: string) =>
  avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${username}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

export const decodeJwt = <T = Record<string, unknown>>(token: string): T => {
  const [, payload] = token.split('.');
  if (!payload) throw new Error('Invalid JWT token');
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
      .join('')
  );
  return JSON.parse(json) as T;
};

export const totalReactions = (reactions: Reactions) =>
  Object.values(reactions).reduce((sum, v) => sum + v, 0);
