'use client';

import { useState, useRef, lazy, Suspense } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Trash2, MoreHorizontal, Share2, Repeat2, Bookmark } from 'lucide-react';
import { Post as PostType } from '@/lib/types';
import { useAuthStore, usePostStore } from '@/lib/store';
import { postApi } from '@/lib/api';
import { formatDate, getImageUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from './ui/Avatar';

// Lazy load heavy components
const UserHoverCard = lazy(() => import('./ui/UserHoverCard').then(m => ({ default: m.UserHoverCard })));
const ImageLightbox = lazy(() => import('./ui/ImageLightbox').then(m => ({ default: m.ImageLightbox })));

interface PostProps {
  post: PostType;
  onReply?: () => void;
  showReplyLine?: boolean;
}

export default function Post({ post, onReply, showReplyLine }: PostProps) {
  const { user } = useAuthStore();
  const { removePost } = usePostStore();
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?._id || ''));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUserCard, setShowUserCard] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [isReposted, setIsReposted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isOwnPost = user?._id === post.author._id;

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCardPosition({ x: rect.left, y: rect.bottom + 8 });
    
    hoverTimeoutRef.current = setTimeout(() => {
      setShowUserCard(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setTimeout(() => setShowUserCard(false), 100);
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like posts');
      return;
    }

    try {
      const result = await postApi.likePost(post._id);
      setIsLiked(result.isLiked);
      setLikesCount(result.likesCount);
    } catch {
      toast.error('Failed to like post');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);
    try {
      await postApi.deletePost(post._id);
      removePost(post._id);
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="border-b border-gray-200/50 dark:border-gray-800/50 px-4 sm:px-6 py-5 transition-all relative group cursor-pointer"
    >
      <div className="flex space-x-3 sm:space-x-4">
        {/* Left Content - Post Stats Preview */}
        <div className="hidden sm:flex flex-col items-center space-y-3 pt-1 w-12 flex-shrink-0">
          <motion.div 
            className="text-gray-400 dark:text-gray-600 text-xs flex flex-col items-center space-y-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
            <div className="w-0.5 h-8 bg-linear-to-b from-emerald-500/50 to-transparent"></div>
          </motion.div>
        </div>
        {/* Avatar with Hover Card */}
        <Link 
          href={`/${post.author.username}`} 
          className="shrink-0"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Avatar className="w-12 h-12 hover:ring-2 hover:ring-emerald-500/30 transition-all">
            <AvatarImage src={getImageUrl(post.author.avatar)} alt={post.author.displayName} />
            <AvatarFallback>{post.author.displayName[0]}</AvatarFallback>
          </Avatar>
        </Link>

        {/* User Hover Card */}
        <Suspense fallback={null}>
          <UserHoverCard
            user={post.author}
            isOpen={showUserCard}
            position={cardPosition}
            isFollowing={false}
          />
        </Suspense>

        {/* Vertical line for reply thread */}
        {showReplyLine && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            className="absolute left-10 top-16 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 to-purple-300"
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 flex-wrap">
              <Link
                href={`/${post.author.username}`}
                className="font-bold hover:underline truncate dark:text-white"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {post.author.displayName}
              </Link>
              <Link
                href={`/${post.author.username}`}
                className="text-gray-500 dark:text-gray-400 hover:underline truncate"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                @{post.author.username}
              </Link>
              <span className="text-gray-400 dark:text-gray-600">·</span>
              <Link
                href={`/post/${post._id}`}
                className="text-gray-500 dark:text-gray-400 hover:underline hover:text-blue-500 transition-colors"
              >
                {formatDate(post.createdAt)}
              </Link>
            </div>

            {/* More menu */}
            {isOwnPost && (
              <div className="relative">
                <motion.button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-blue-50 rounded-full text-gray-500 hover:text-blue-500 transition-all opacity-0 group-hover:opacity-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MoreHorizontal size={18} />
                </motion.button>

                <AnimatePresence>
                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      ></div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-20 overflow-hidden"
                      >
                        <motion.button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50 transition-colors"
                          whileHover={{ x: 4 }}
                        >
                          <Trash2 size={18} />
                          <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                        </motion.button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Post content */}
          <Link href={`/post/${post._id}`}>
            <motion.p
              className="mt-2 text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {post.content}
            </motion.p>

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`mt-3 grid gap-2 rounded-2xl overflow-hidden ${
                  post.images.length === 1
                    ? 'grid-cols-1'
                    : post.images.length === 2
                    ? 'grid-cols-2'
                    : post.images.length === 3
                    ? 'grid-cols-2'
                    : 'grid-cols-2'
                }`}
              >
                {post.images.map((image, index) => (
                  <motion.div
                    key={index}
                    className={`relative overflow-hidden cursor-pointer ${
                      post.images!.length === 3 && index === 0 ? 'col-span-2' : ''
                    }`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLightboxIndex(index);
                      setShowLightbox(true);
                    }}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </Link>

          {/* Actions */}
          <motion.div
            className="flex items-center justify-between mt-3 max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={onReply}
              className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 group/btn"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className="p-2 rounded-full group-hover/btn:bg-emerald-50 dark:group-hover/btn:bg-emerald-950/50 transition-all"
                whileHover={{ rotate: 15 }}
              >
                <MessageCircle size={18} />
              </motion.div>
              {post.replyCount > 0 && (
                <motion.span
                  className="text-sm font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {post.replyCount}
                </motion.span>
              )}
            </motion.button>

            <motion.button
              onClick={handleLike}
              className={`flex items-center space-x-2 group/btn ${
                isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className="p-2 rounded-full group-hover/btn:bg-red-50 dark:group-hover/btn:bg-red-950/50 transition-all"
                animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              </motion.div>
              {likesCount > 0 && (
                <motion.span
                  className="text-sm font-medium"
                  key={likesCount}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {likesCount}
                </motion.span>
              )}
            </motion.button>

            <motion.button
              onClick={() => {
                setIsReposted(!isReposted);
                toast.success(isReposted ? 'Repost removed' : 'Reposted!');
              }}
              className={`flex items-center space-x-2 group/btn ${
                isReposted ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className="p-2 rounded-full group-hover/btn:bg-emerald-50 dark:group-hover/btn:bg-emerald-950/50 transition-all"
                animate={isReposted ? { rotate: [0, 360] } : {}}
                transition={{ duration: 0.5 }}
              >
                <Repeat2 size={18} />
              </motion.div>
            </motion.button>

            <motion.button
              onClick={() => {
                setIsBookmarked(!isBookmarked);
                toast.success(isBookmarked ? 'Removed from bookmarks' : 'Bookmarked!');
              }}
              className={`flex items-center space-x-2 group/btn ${
                isBookmarked ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className="p-2 rounded-full group-hover/btn:bg-blue-50 dark:group-hover/btn:bg-blue-950/50 transition-all"
                animate={isBookmarked ? { y: [0, -5, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
              </motion.div>
            </motion.button>

            <motion.button
              className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-teal-500 group/btn opacity-0 group-hover:opacity-100 transition-opacity"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
                toast.success('Link copied to clipboard!');
              }}
            >
              <motion.div
                className="p-2 rounded-full group-hover/btn:bg-teal-50 dark:group-hover/btn:bg-teal-950/50 transition-all"
                whileHover={{ rotate: 15 }}
              >
                <Share2 size={18} />
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Image Lightbox */}
      {post.images && post.images.length > 0 && (
        <Suspense fallback={null}>
          <ImageLightbox
            images={post.images}
            currentIndex={lightboxIndex}
            isOpen={showLightbox}
            onClose={() => setShowLightbox(false)}
          />
        </Suspense>
      )}
    </motion.article>
  );
}

