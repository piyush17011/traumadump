'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';
import { AuthResponse } from '../../types';
import { useAuthStore } from '../../store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

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
          <span className="text-4xl">🌊</span>
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
              disabled={mutation.isPending}
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