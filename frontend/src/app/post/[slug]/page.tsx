import type { Metadata } from 'next';
import { PostDetailClient } from './PostDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/posts/${slug}`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    const post = data.data;
    return {
      title: post.title,
      description: post.content.slice(0, 155),
      openGraph: { title: post.title, description: post.content.slice(0, 155) },
    };
  } catch {
    return { title: 'Story | Trauma Dump' };
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  return <PostDetailClient slug={slug} />;
}