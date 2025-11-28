'use client';

import { use } from 'react';
import UserProfile from '@/components/UserProfile';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  
  return <UserProfile username={username} />;
}

