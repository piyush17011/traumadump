import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '../components/layout/Providers';
import { Navbar } from '../components/layout/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: { default: 'Trauma Dump — Say What You\'ve Never Said Out Loud', template: '%s | Trauma Dump' },
  description: 'A safe, anonymous community where people share experiences, support each other, and feel understood.',
  keywords: ['anonymous sharing', 'mental health community', 'safe space', 'life stories', 'support'],
  openGraph: {
    type: 'website',
    siteName: 'Trauma Dump',
    title: 'Trauma Dump — Say What You\'ve Never Said Out Loud',
    description: 'A safe, anonymous community where people share experiences and support each other.',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Providers>
          <Navbar />
          <main className="pt-16">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
