import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem('td_token', token);
    localStorage.setItem('td_user', JSON.stringify(user));
    set({ user, token, isLoading: false });
  },

  clearAuth: () => {
    localStorage.removeItem('td_token');
    localStorage.removeItem('td_user');
    set({ user: null, token: null, isLoading: false });
  },

  initAuth: () => {
    try {
      const token = localStorage.getItem('td_token');
      const raw = localStorage.getItem('td_user');
      if (token && raw) {
        set({ user: JSON.parse(raw), token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
