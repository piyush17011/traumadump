'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, PenSquare, Menu, X, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn, getAvatarUrl } from '../../lib/utils';
import Image from 'next/image';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { href: '/feed', label: 'Feed' },
    { href: '/feed?sort=trending', label: 'Trending' },
    { href: '/search', label: 'Search' },
  ];

  const handleLogout = () => {
    clearAuth();
    router.push('/');
    setDropdownOpen(false);
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-brand-600 shrink-0">
          <span className="text-2xl">🌊</span>
          <span className="hidden sm:block">Trauma Dump</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                pathname === link.href.split('?')[0] && !link.href.includes('?')
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link href="/search" className="btn-ghost p-2 md:hidden">
            <Search size={18} />
          </Link>

          {user ? (
            <>
              <Link href="/create" className="btn-primary hidden sm:inline-flex">
                <PenSquare size={15} /> Share Story
              </Link>
              <Link href="/create" className="btn-primary sm:hidden p-2">
                <PenSquare size={18} />
              </Link>

              {/* Avatar dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full ring-2 ring-brand-100 overflow-hidden hover:ring-brand-300 transition-all"
                >
                  <Image
                    src={getAvatarUrl(user.username, user.avatar)}
                    alt={user.username}
                    width={36} height={36}
                    className="object-cover"
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-11 w-48 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">@{user.username}</p>
                    </div>
                    <Link
                      href={`/profile/${user.username}`}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={15} /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                    >
                      <LogOut size={15} /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-ghost text-sm">Log in</Link>
              <Link href="/register" className="btn-primary text-sm">Join Free</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button className="md:hidden btn-ghost p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 space-y-1 animate-slide-up">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
