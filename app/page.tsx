'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import Feed from '@/components/Feed';
import { motion } from 'framer-motion';
import { Spinner } from '@/components/ui/Spinner';
import { Home as HomeIcon, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="pt-[120px]">
      <Feed type={isAuthenticated ? 'feed' : 'explore'} />
    </div>
  );
}
