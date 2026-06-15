import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Users, BookOpen, Heart, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: "Trauma Dump — Say What You've Never Said Out Loud",
  description: 'A safe, anonymous community where people share experiences, support each other, and feel understood.',
};

const CATEGORIES = [
  { name: 'Family',          icon: '🏠', color: '#F59E0B', slug: 'family' },
  { name: 'Relationships',   icon: '💕', color: '#EC4899', slug: 'relationships' },
  { name: 'College & School',icon: '🎓', color: '#8B5CF6', slug: 'college' },
  { name: 'Career & Work',   icon: '💼', color: '#3B82F6', slug: 'career' },
  { name: 'Anxiety & Stress',icon: '🌊', color: '#06B6D4', slug: 'anxiety' },
  { name: 'Self Improvement',icon: '🌱', color: '#10B981', slug: 'self-improvement' },
  { name: 'Friendships',     icon: '🤝', color: '#F97316', slug: 'friendships' },
  { name: 'Confessions',     icon: '🤫', color: '#A855F7', slug: 'confessions' },
];

const TESTIMONIALS = [
  { quote: "I finally said what I'd been holding in for years. Someone replied 'me too' and I cried for 20 minutes.", tag: 'Family' },
  { quote: "This place doesn't feel like a therapy website. It feels like talking to a friend who actually gets it.", tag: 'Relationships' },
  { quote: "Posted anonymously about my burnout and got more support than I ever expected.", tag: 'Career' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-lavender to-white px-4 pt-20 pb-24 text-center">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-brand-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-peach rounded-full blur-3xl opacity-40" />

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 badge bg-brand-100 text-brand-700 mb-6 px-4 py-1.5 text-sm">
            <Sparkles size={13} /> Safe · Anonymous · Judgment-Free
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            Say what you've{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-purple-500">
              never said
            </span>{' '}
            out loud.
          </h1>

          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
            A safe, anonymous community where people share their experiences, support each other, and finally feel understood.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="btn-primary text-base px-7 py-3 rounded-2xl">
              Start Sharing <ArrowRight size={16} />
            </Link>
            <Link href="/feed" className="btn-secondary text-base px-7 py-3 rounded-2xl">
              Explore Stories
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="bg-white py-12 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          {[
            { icon: <Users size={22} className="text-brand-500" />, label: 'Community Members', value: '50K+' },
            { icon: <BookOpen size={22} className="text-purple-500" />, label: 'Stories Shared', value: '200K+' },
            { icon: <Heart size={22} className="text-rose-400" />, label: 'Support Reactions', value: '1M+' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2">
              {stat.icon}
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs sm:text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Find Your Space</h2>
          <p className="text-slate-500">Whatever you're going through, there's a space for it here.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="card-hover p-5 flex flex-col items-center text-center gap-3 group"
            >
              <span
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                {cat.icon}
              </span>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-600 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Real Words, Real People</h2>
            <p className="text-slate-500">Stories from our anonymous community.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card p-6">
                <p className="text-slate-600 text-sm leading-relaxed mb-4 italic">"{t.quote}"</p>
                <span className="badge bg-brand-50 text-brand-600">— {t.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-brand-500 to-purple-600 py-20 px-4 text-center text-white">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">You don't have to carry it alone.</h2>
        <p className="text-brand-100 mb-8 text-lg">Join thousands sharing honestly, healing slowly.</p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-white text-brand-600 font-semibold px-8 py-3.5 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5">
          Join for Free <ArrowRight size={16} />
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-100 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <span className="text-xl">🌊</span> Trauma Dump
          </div>
          <div className="flex items-center gap-6">
            <Link href="/feed" className="hover:text-slate-700 transition-colors">Feed</Link>
            <Link href="/search" className="hover:text-slate-700 transition-colors">Search</Link>
            <Link href="/register" className="hover:text-slate-700 transition-colors">Join</Link>
          </div>
          <p>© {new Date().getFullYear()} Trauma Dump. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}