'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../lib/api';
import { AuthResponse } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { decodeJwt } from '../../lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: () => api.post<AuthResponse>('/auth/login', { email, password }),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome back, @${res.data.user.username}! 👋`);
      router.push('/feed');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Login failed'),
  });

  const handleSubmit = () => {
    if (!email.trim()) { toast.error('Email is required'); return; }
    if (!password) { toast.error('Password is required'); return; }
    mutation.mutate();
  };

  const handleGoogleSuccess = async (idToken: string) => {
    if (process.env.NODE_ENV === 'development') {
      try {
        const payload = decodeJwt<{ aud: string; iss: string; email: string }>(idToken);
        console.log('Google ID token payload:', payload);
        console.log('Expected client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
      } catch (err) {
        console.warn('Failed to decode Google ID token:', err);
      }
    }

    try {
      setGoogleLoading(true);
      const res = await api.post<AuthResponse>('/auth/google', { idToken });
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome, @${res.data.user.username}! 👋`);
      router.push('/feed');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      (window as any).google?.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => handleGoogleSuccess(response.credential),
      });
      (window as any).google?.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'outline', size: 'large', width: '100%', text: 'signin_with' }
      );
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-brand-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">😮‍💨</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-3 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm">Sign in to your safe space</p>
        </div>

        <div className="card p-8 space-y-5">
          {/* Google Button */}
          <div id="google-btn" className="w-full flex justify-center" />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                className="input pr-11"
                type={showPw ? 'text' : 'password'}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            className="btn-primary w-full justify-center py-3 text-base"
            onClick={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-600 font-semibold hover:underline">
              Join for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}