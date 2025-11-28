'use client';

import { useEffect, useState } from 'react';
import { Calendar, Camera, Sparkles } from 'lucide-react';
import { User, Post as PostType } from '@/lib/types';
import { userApi, postApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatNumber, getImageUrl } from '@/lib/utils';
import Post from './Post';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from './ui/Avatar';
import { Button } from './ui/Button';

interface UserProfileProps {
  username: string;
}

export default function UserProfile({ username }: UserProfileProps) {
  const { user: currentUser, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ displayName: '', bio: '' });

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    loadProfile();
    loadUserPosts();
  }, [username]);

  const loadProfile = async () => {
    try {
      const data = await userApi.getProfile(username);
      setProfile(data);
      setIsFollowing(data.followers?.includes(currentUser?._id || '') || false);
      setEditData({ displayName: data.displayName, bio: data.bio || '' });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      const data = await postApi.getUserPosts(username);
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts');
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Please sign in to follow users');
      return;
    }

    try {
      const result = await userApi.followUser(profile!._id);
      setIsFollowing(result.isFollowing);
      toast.success(result.message);
    } catch (error) {
      toast.error('Failed to follow user');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const updated = await userApi.updateProfile(editData);
      setProfile(updated);
      updateUser(updated);
      setIsEditing(false);
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await userApi.uploadAvatar(file);
      setProfile(result.user);
      updateUser(result.user);
      toast.success('Avatar updated');
    } catch (error) {
      toast.error('Failed to upload avatar');
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await userApi.uploadCover(file);
      setProfile(result.user);
      updateUser(result.user);
      toast.success('Cover image updated');
    } catch (error) {
      toast.error('Failed to upload cover image');
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center py-20"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="text-blue-500" size={48} />
        </motion.div>
      </motion.div>
    );
  }

  if (!profile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <p className="text-gray-500 text-lg">User not found</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Cover Image */}
      <motion.div
        className="relative h-40 sm:h-56 bg-gradient-to-r from-gray-900 via-gray-800 to-black overflow-hidden"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {profile.coverImage ? (
          <motion.img
            src={getImageUrl(profile.coverImage)}
            alt="Cover"
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-emerald-900/20 to-black"
          >
            <div className="absolute inset-0 opacity-30" 
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(20, 184, 166, 0.2) 0%, transparent 50%)'
              }}
            />
          </motion.div>
        )}
        {isOwnProfile && (
          <motion.label
            className="absolute bottom-4 right-4 p-3 bg-black/50 backdrop-blur-sm text-white rounded-full cursor-pointer hover:bg-black/70 transition-all shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Camera size={20} />
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </motion.label>
        )}
      </motion.div>

      {/* Profile Info */}
      <div className="bg-white dark:bg-transparent border-b border-gray-200 dark:border-gray-800/50 pb-6 sm:pb-8">
        <div className="px-4 sm:px-8">
          {/* Avatar */}
          <div className="relative -mt-16 sm:-mt-20 mb-4">
            <motion.div
              className="relative inline-block"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Avatar className="w-28 sm:w-36 h-28 sm:h-36 border-4 border-white dark:border-black shadow-2xl">
                <AvatarImage src={getImageUrl(profile.avatar)} alt={profile.displayName} />
                <AvatarFallback className="text-3xl">{profile.displayName[0]}</AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <motion.label
                  className="absolute bottom-2 right-2 p-2 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600 transition-all shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Camera size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </motion.label>
              )}
            </motion.div>
          </div>

          {/* Edit/Follow Button */}
          <motion.div
            className="flex justify-end mb-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {isOwnProfile ? (
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                className="relative overflow-hidden group"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            ) : (
              <Button
                onClick={handleFollow}
                variant={isFollowing ? "outline" : "default"}
                className={isFollowing ? "hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950 dark:hover:text-red-400" : ""}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </motion.div>

          {/* Name and Bio */}
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3 mb-4"
              >
                <motion.input
                  type="text"
                  value={editData.displayName}
                  onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Display Name"
                  whileFocus={{ scale: 1.01 }}
                />
                <motion.textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                  placeholder="Bio"
                  rows={3}
                  maxLength={160}
                  whileFocus={{ scale: 1.01 }}
                />
                <Button
                  onClick={handleUpdateProfile}
                  className="w-full"
                >
                  Save Changes
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="viewing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <motion.h1
                  className="text-2xl font-bold dark:text-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {profile.displayName}
                </motion.h1>
                <motion.p
                  className="text-gray-500 dark:text-gray-400"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  @{profile.username}
                </motion.p>
                {profile.bio && (
                  <motion.p
                    className="mt-3 text-gray-900 dark:text-gray-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {profile.bio}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Joined Date */}
          <motion.div
            className="flex items-center space-x-2 mt-4 text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            <Calendar size={18} />
            <span>
              Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex items-center space-x-4 sm:space-x-6 mt-5 text-sm sm:text-base"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {[
              { count: profile.postCount || 0, label: 'Posts' },
              { count: profile.followingCount || 0, label: 'Following' },
              { count: profile.followersCount || 0, label: 'Followers' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.65 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
              >
                <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {formatNumber(stat.count)}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* User Posts */}
      <div>
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-4 flex justify-center"
            >
              <Sparkles className="text-gray-300" size={64} />
            </motion.div>
            <p className="text-gray-500 font-medium">No posts yet</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {posts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <Post post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

