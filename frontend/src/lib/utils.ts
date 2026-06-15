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

export const totalReactions = (reactions: Reactions) =>
  Object.values(reactions).reduce((sum, v) => sum + v, 0);
