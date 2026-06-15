import type { Metadata } from 'next';
import { ProfileClient } from './ProfileClient';

interface Props { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} | Trauma Dump`,
    description: `View ${username}'s stories on Trauma Dump`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  return <ProfileClient username={username} />;
}