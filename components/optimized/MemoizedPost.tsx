'use client';

import { memo } from 'react';
import Post from '../Post';
import { Post as PostType } from '@/lib/types';

interface MemoizedPostProps {
  post: PostType;
  onReply?: () => void;
  showReplyLine?: boolean;
}

/**
 * Memoized Post component
 * Only re-renders when post data changes
 */
const MemoizedPost = memo(
  ({ post, onReply, showReplyLine }: MemoizedPostProps) => {
    return <Post post={post} onReply={onReply} showReplyLine={showReplyLine} />;
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    return (
      prevProps.post._id === nextProps.post._id &&
      prevProps.post.likes.length === nextProps.post.likes.length &&
      prevProps.post.replyCount === nextProps.post.replyCount &&
      prevProps.showReplyLine === nextProps.showReplyLine
    );
  }
);

MemoizedPost.displayName = 'MemoizedPost';

export default MemoizedPost;

