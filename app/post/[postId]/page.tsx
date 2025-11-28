'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post as PostType } from '@/lib/types';
import { postApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Post from '@/components/Post';
import CreatePost from '@/components/CreatePost';
import toast from 'react-hot-toast';
import { ArrowLeft, MessageCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from '@/components/ui/Spinner';

export default function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [post, setPost] = useState<PostType | null>(null);
  const [replies, setReplies] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReplyBox, setShowReplyBox] = useState(false);

  useEffect(() => {
    loadPost();
    loadReplies();
  }, [postId]);

  const loadPost = async () => {
    try {
      const data = await postApi.getPost(postId);
      setPost(data);
    } catch (error) {
      toast.error('Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReplies = async () => {
    try {
      const data = await postApi.getReplies(postId);
      setReplies(data);
    } catch (error) {
      console.error('Failed to load replies');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!post) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <p className="text-gray-500 text-lg">Post not found</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div
        className="border-b border-gray-200/50 bg-white/80 backdrop-blur-xl sticky top-16 z-10 flex items-center space-x-4 p-4 shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <MessageCircle size={22} className="text-blue-500" />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Thread
          </span>
        </h1>
      </motion.div>

      {/* Original Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Post 
          post={post} 
          onReply={() => setShowReplyBox(!showReplyBox)}
          showReplyLine={replies.length > 0}
        />
      </motion.div>

      {/* Reply Box */}
      <AnimatePresence>
        {showReplyBox && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b border-gray-200 overflow-hidden"
          >
            <CreatePost
              replyTo={postId}
              placeholder="Post your reply"
              onPostCreated={() => {
                setShowReplyBox(false);
                loadReplies();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replies */}
      <div>
        {replies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-4 flex justify-center"
            >
              <MessageCircle className="text-gray-300" size={64} />
            </motion.div>
            <p className="text-gray-500 font-medium mb-2">No replies yet</p>
            <p className="text-gray-400 text-sm">Be the first to reply!</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {replies.map((reply, index) => (
              <motion.div
                key={reply._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <Post post={reply} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

