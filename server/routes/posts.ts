import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Post from '../models/Post';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for post images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/posts/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  },
});

// Create post
router.post(
  '/',
  authenticate,
  upload.array('images', 4),
  [body('content').trim().isLength({ min: 1, max: 280 })],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { content, replyTo } = req.body;
      const files = req.files as Express.Multer.File[];

      const images = files?.map(file => `/uploads/posts/${file.filename}`) || [];

      const post = new Post({
        author: req.userId,
        content,
        images,
        replyTo: replyTo || null,
      });

      await post.save();

      // Update reply count if this is a reply
      if (replyTo) {
        await Post.findByIdAndUpdate(replyTo, {
          $inc: { replyCount: 1 },
        });
      }

      // Populate author details
      await post.populate('author', 'username displayName avatar');

      // Emit socket event for real-time update
      const io = req.app.get('io');
      io.emit('newPost', post);

      res.status(201).json(post);
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get feed (posts from followed users + own posts)
router.get('/feed', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followingIds = [...currentUser.following, req.userId];

    const posts = await Post.find({
      author: { $in: followingIds },
      replyTo: null, // Only top-level posts
    })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json(posts);
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get explore (all posts)
router.get('/explore', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ replyTo: null })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json(posts);
  } catch (error) {
    console.error('Get explore error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:postId', async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'username displayName avatar')
      .lean();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get post replies
router.get('/:postId/replies', async (req: Request, res: Response) => {
  try {
    const replies = await Post.find({ replyTo: req.params.postId })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json(replies);
  } catch (error) {
    console.error('Get replies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user posts
router.get('/user/:username', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: user._id, replyTo: null })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json(posts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.post('/:postId/like', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.userId!);

    if (isLiked) {
      // Unlike
      await Post.findByIdAndUpdate(req.params.postId, {
        $pull: { likes: req.userId },
      });

      res.json({ message: 'Post unliked', isLiked: false, likesCount: post.likes.length - 1 });
    } else {
      // Like
      await Post.findByIdAndUpdate(req.params.postId, {
        $addToSet: { likes: req.userId },
      });

      // Emit socket event
      const io = req.app.get('io');
      io.emit('postLiked', { postId: req.params.postId, userId: req.userId });

      res.json({ message: 'Post liked', isLiked: true, likesCount: post.likes.length + 1 });
    }
  } catch (error) {
    console.error('Like/unlike error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:postId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.userId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete associated image files
    if (post.images && post.images.length > 0) {
      post.images.forEach(imagePath => {
        const fullPath = path.join(process.cwd(), imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await Post.findByIdAndDelete(req.params.postId);

    // Update reply count if this was a reply
    if (post.replyTo) {
      await Post.findByIdAndUpdate(post.replyTo, {
        $inc: { replyCount: -1 },
      });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search posts
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const query = req.params.query;
    const posts = await Post.find({
      content: { $regex: query, $options: 'i' },
      replyTo: null,
    })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(posts);
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

