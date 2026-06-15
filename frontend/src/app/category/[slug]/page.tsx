import type { Metadata } from 'next';
import { CategoryClient } from './CategoryClient';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, ' ')} stories | Trauma Dump`,
    description: `Browse ${slug} stories from the Trauma Dump community.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  return <CategoryClient slug={slug} />;
}