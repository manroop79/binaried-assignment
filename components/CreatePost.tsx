'use client';

import { useState, useRef } from 'react';
import { Image as ImageIcon, X, Smile, Sparkles, Loader2 } from 'lucide-react';
import { useAuthStore, usePostStore } from '@/lib/store';
import { postApi } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from './ui/Avatar';
import { Button } from './ui/Button';

interface CreatePostProps {
  replyTo?: string;
  onPostCreated?: () => void;
  placeholder?: string;
}

export default function CreatePost({ replyTo, onPostCreated, placeholder = "What's happening?" }: CreatePostProps) {
  const { user } = useAuthStore();
  const { addPost } = usePostStore();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }

    const newImages = [...images, ...files].slice(0, 4);
    setImages(newImages);

    // Create previews
    const previews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const post = await postApi.createPost({
        content: content.trim(),
        images,
        replyTo,
      });

      if (!replyTo) {
        addPost(post);
      }

      setContent('');
      setImages([]);
      setImagePreviews([]);
      toast.success(replyTo ? 'Reply posted!' : 'Post created!');
      onPostCreated?.();
    } catch (error) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : undefined;
      toast.error(errorMessage || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const charLimit = 280;
  const charPercentage = (content.length / charLimit) * 100;

  return (
    <motion.div
      className="bg-white dark:bg-transparent border-b border-gray-200 dark:border-gray-800/50 px-4 sm:px-6 py-4 sm:py-5"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3 sm:space-x-4">
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={getImageUrl(user.avatar)} alt={user.displayName} />
            <AvatarFallback>{user.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <motion.div
              animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                className="w-full resize-none text-xl outline-none placeholder-gray-400 dark:placeholder-gray-600 focus:placeholder-gray-300 transition-all dark:bg-transparent dark:text-white"
                rows={isFocused ? 4 : 3}
                maxLength={charLimit}
              />
            </motion.div>

            {/* Image Previews */}
            <AnimatePresence>
              {imagePreviews.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`grid gap-2 mt-3 ${
                    imagePreviews.length === 1 ? 'grid-cols-1' :
                    imagePreviews.length === 2 ? 'grid-cols-2' :
                    'grid-cols-2'
                  }`}
                >
                  {imagePreviews.map((preview, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-48 object-cover rounded-2xl"
                      />
                      <motion.button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-gray-900/80 backdrop-blur-sm text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={16} />
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center space-x-1">
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={images.length >= 4}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Add images"
                >
                  <ImageIcon size={20} />
                </motion.button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                <motion.button
                  type="button"
                  className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Add emoji"
                >
                  <Smile size={20} />
                </motion.button>

                <div className="ml-3 flex items-center space-x-2">
                  {/* Character count circle */}
                  <motion.div className="relative w-8 h-8 flex items-center justify-center">
                    <svg className="w-8 h-8 transform -rotate-90">
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                        fill="none"
                      />
                      <motion.circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke={charPercentage > 90 ? "#ef4444" : "#10b981"}
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 12}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 12 }}
                        animate={{
                          strokeDashoffset: 2 * Math.PI * 12 * (1 - charPercentage / 100),
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </svg>
                    {charPercentage > 80 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`absolute text-xs font-medium ${
                          charPercentage > 100 ? "text-red-500" : "text-gray-600"
                        }`}
                      >
                        {charLimit - content.length}
                      </motion.span>
                    )}
                  </motion.div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!content.trim() || isLoading || content.length > charLimit}
                size="default"
                className="relative overflow-hidden group"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <Loader2 className="animate-spin" size={16} />
                    <span>Posting...</span>
                  </span>
                ) : (
                  <span>{replyTo ? 'Reply' : 'Post'}</span>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}

