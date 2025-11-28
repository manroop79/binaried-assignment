'use client';

import { motion } from 'framer-motion';

export function SkeletonPost() {
  return (
    <div className="border-b border-gray-200/50 dark:border-gray-800/50 px-4 sm:px-6 py-5">
      <div className="flex space-x-3 sm:space-x-4">
        {/* Left indicator skeleton */}
        <div className="hidden sm:flex flex-col items-center space-y-3 pt-1 w-12 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <div className="w-0.5 h-8 bg-gradient-to-b from-gray-300 dark:from-gray-700 to-transparent animate-pulse" />
        </div>

        {/* Avatar skeleton */}
        <div className="shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 animate-shimmer" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 space-y-3">
          {/* Header skeleton */}
          <div className="flex items-center space-x-2">
            <div className="h-4 w-24 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded animate-shimmer" />
            <div className="h-4 w-16 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded animate-shimmer" />
            <div className="h-4 w-12 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded animate-shimmer" />
          </div>

          {/* Text skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded animate-shimmer" />
            <div className="h-4 w-5/6 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded animate-shimmer" />
            <div className="h-4 w-4/6 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded animate-shimmer" />
          </div>

          {/* Actions skeleton */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-12">
              <div className="h-8 w-12 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded animate-shimmer" />
              <div className="h-8 w-12 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded animate-shimmer" />
              <div className="h-8 w-12 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonFeed({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPost key={i} />
      ))}
    </>
  );
}

