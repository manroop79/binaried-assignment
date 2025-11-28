'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Post as PostType } from '@/lib/types';
import { postApi } from '@/lib/api';
import { useAuthStore, usePostStore } from '@/lib/store';
import { getSocket } from '@/lib/socket';
import Post from './Post';
import CreatePost from './CreatePost';
import toast from 'react-hot-toast';
import { Loader2, Sparkles, TrendingUp, ArrowUp, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { SkeletonFeed } from './ui/SkeletonPost';

interface FeedProps {
  type: 'feed' | 'explore';
}

export default function Feed({ type }: FeedProps) {
  const { isAuthenticated } = useAuthStore();
  const { posts, setPosts, addPost } = usePostStore();
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { scrollY } = useScroll();
  const observerTarget = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  useEffect(() => {
    loadPosts();
    const cleanupRealtime = setupRealtimeUpdates();
    const cleanupScroll = setupInfiniteScroll();
    
    // Track scroll position for jump-to-top button
    const unsubscribe = scrollY.on('change', (latest) => {
      setShowScrollTop(latest > 400);
    });
    
    return () => {
      if (cleanupRealtime) cleanupRealtime();
      if (cleanupScroll) cleanupScroll();
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // Setup infinite scroll observer
  const setupInfiniteScroll = useCallback(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          if (!hasMore || isLoadingMore) return;
          setIsLoadingMore(true);
          loadPosts(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoadingMore, isLoading, page]);

  const loadPosts = async (pageNum = 1) => {
    try {
      setIsLoading(pageNum === 1);
      const data = type === 'feed' 
        ? await postApi.getFeed(pageNum)
        : await postApi.getExplore(pageNum);

      if (pageNum === 1) {
        setPosts(data);
      } else {
        setPosts([...posts, ...data]);
      }

      setHasMore(data.length === 20);
      setPage(pageNum);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (type === 'feed' && error.response?.status === 401) {
        // User not authenticated, show explore instead
        toast.error('Please sign in to see your feed');
      } else {
        toast.error('Failed to load posts');
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const setupRealtimeUpdates = () => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('newPost', (post: PostType) => {
      addPost(post);
    });

    return () => {
      socket.off('newPost');
    };
  };

  const loadMore = () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    loadPosts(page + 1);
  };

  // Pull to refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === 0) return;
    
    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStartY.current;
    
    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance, 100));
      if (distance > 80) {
        setIsPulling(true);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling) {
      await loadPosts(1);
      toast.success('Refreshed!');
    }
    touchStartY.current = 0;
    setPullDistance(0);
    setIsPulling(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return <SkeletonFeed count={5} />;
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <AnimatePresence>
        {pullDistance > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, height: pullDistance }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center"
            style={{ height: pullDistance }}
          >
            <motion.div
              animate={{ rotate: isPulling ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <RefreshCw
                className={`${isPulling ? 'text-emerald-500' : 'text-gray-400'}`}
                size={24}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {type === 'feed' && isAuthenticated && (
        <CreatePost onPostCreated={() => loadPosts(1)} />
      )}

      {posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 px-6"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mb-6 flex justify-center"
          >
            {type === 'feed' ? (
              <TrendingUp className="text-gray-300 dark:text-gray-700" size={64} />
            ) : (
              <Sparkles className="text-gray-300 dark:text-gray-700" size={64} />
            )}
          </motion.div>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2 font-medium">
            {type === 'feed' 
              ? 'Your feed is empty'
              : 'No posts yet'}
          </p>
          <p className="text-gray-400 dark:text-gray-500">
            {type === 'feed' 
              ? 'Follow some users to see their posts here!'
              : 'Be the first to post!'}
          </p>
        </motion.div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            {posts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Post post={post} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Infinite Scroll Observer Target */}
          <div ref={observerTarget} className="h-20 flex items-center justify-center">
            {isLoadingMore && hasMore && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 text-emerald-500"
              >
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm font-medium">Loading more...</span>
              </motion.div>
            )}
          </div>
        </>
      )}

      {/* Jump to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all z-50 group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

