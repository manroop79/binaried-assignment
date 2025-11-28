'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';
import { Button } from './Button';
import { Calendar, MapPin } from 'lucide-react';
import { useState } from 'react';

interface UserHoverCardProps {
  user: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
    bio?: string;
    location?: string;
    createdAt: string;
    followersCount?: number;
    followingCount?: number;
  };
  isOpen: boolean;
  position: { x: number; y: number };
  onFollow?: () => void;
  isFollowing?: boolean;
  children?: React.ReactNode;
}

export function UserHoverCard({ 
  user, 
  isOpen, 
  position, 
  onFollow, 
  isFollowing = false 
}: UserHoverCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getImageUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  };

  return (
    <AnimatePresence>
      {(isOpen || isHovered) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[100] pointer-events-auto"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-4 w-80 backdrop-blur-xl">
            {/* Header with Avatar and Follow Button */}
            <div className="flex items-start justify-between mb-3">
              <Avatar className="w-16 h-16 ring-2 ring-emerald-500/20">
                <AvatarImage src={getImageUrl(user.avatar)} alt={user.displayName} />
                <AvatarFallback>{user.displayName[0]}</AvatarFallback>
              </Avatar>
              {onFollow && (
                <Button
                  onClick={onFollow}
                  size="sm"
                  variant={isFollowing ? 'outline' : 'default'}
                  className={isFollowing ? '' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>

            {/* User Info */}
            <div className="mb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {user.displayName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{user.username}
              </p>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
                {user.bio}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {user.followingCount || 0}
                </span>{' '}
                <span className="text-gray-500 dark:text-gray-400">Following</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {user.followersCount || 0}
                </span>{' '}
                <span className="text-gray-500 dark:text-gray-400">Followers</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

