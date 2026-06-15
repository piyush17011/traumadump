'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';
import { AuthResponse } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { decodeJwt } from '../../lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: () => api.post<AuthResponse>('/auth/register', { username, email, password }),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.token);
      toast.success('Welcome to Trauma Dump! 🎉');
      router.push('/feed');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Registration failed'),
  });

  const handleSubmit = () => {
    if (!username.trim()) { toast.error('Username is required'); return; }
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
      toast.success(`Welcome, @${res.data.user.username}! 🎉`);
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
        document.getElementById('google-btn-register'),
        { theme: 'outline', size: 'large', width: '100%', text: 'signup_with' }
      );
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const perks = [
    'Post anonymously whenever you want',
    'React and support others',
    'Join category conversations',
    '100% free, always',
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-lavender to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">😮‍💨</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-3 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm">Start sharing. Start healing.</p>
        </div>

        <div className="card p-8">
          <div className="bg-brand-50 rounded-xl p-4 mb-6 space-y-2">
            {perks.map((p) => (
              <div key={p} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 size={14} className="text-brand-500 shrink-0" />
                {p}
              </div>
            ))}
          </div>

          {/* Google Button */}
          <div id="google-btn-register" className="w-full flex justify-center mb-5" />

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">or register with email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="space-y-5">
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                placeholder="anonymous_writer"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                maxLength={30}
              />
              <p className="text-xs text-slate-400 mt-1">Letters, numbers and underscores only</p>
            </div>

            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-11"
                  type={showPw ? 'text' : 'password'}
                  placeholder="At least 6 characters"
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
              disabled={mutation.isPending || googleLoading}
            >
              {mutation.isPending ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
