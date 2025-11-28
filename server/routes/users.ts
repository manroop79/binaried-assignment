import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import Post from '../models/Post';
import { authenticate, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// Get user profile
router.get('/:username', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's post count
    const postCount = await Post.countDocuments({ author: user._id });

    res.json({
      ...user,
      postCount,
      followersCount: user.followers.length,
      followingCount: user.following.length,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put(
  '/profile',
  authenticate,
  [
    body('displayName').optional().trim().isLength({ min: 1, max: 50 }),
    body('bio').optional().trim().isLength({ max: 160 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { displayName, bio } = req.body;

      const user = await User.findByIdAndUpdate(
        req.userId,
        { displayName, bio },
        { new: true }
      ).select('-password');

      res.json(user);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Upload avatar
router.post(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const avatarUrl = `/uploads/${req.file.filename}`;

      const user = await User.findByIdAndUpdate(
        req.userId,
        { avatar: avatarUrl },
        { new: true }
      ).select('-password');

      res.json({ avatar: avatarUrl, user });
    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Upload cover image
router.post(
  '/cover',
  authenticate,
  upload.single('cover'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const coverUrl = `/uploads/${req.file.filename}`;

      const user = await User.findByIdAndUpdate(
        req.userId,
        { coverImage: coverUrl },
        { new: true }
      ).select('-password');

      res.json({ coverImage: coverUrl, user });
    } catch (error) {
      console.error('Upload cover error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Follow/Unfollow user
router.post('/:userId/follow', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const targetUserId = req.params.userId;

    if (req.userId?.toString() === targetUserId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const currentUser = await User.findById(req.userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser?.following.includes(targetUser._id);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.userId, {
        $pull: { following: targetUser._id },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: req.userId },
      });

      res.json({ message: 'Unfollowed successfully', isFollowing: false });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.userId, {
        $addToSet: { following: targetUser._id },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: req.userId },
      });

      res.json({ message: 'Followed successfully', isFollowing: true });
    }
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's followers
router.get('/:userId/followers', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'username displayName avatar')
      .select('followers');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.followers);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's following
router.get('/:userId/following', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('following', 'username displayName avatar')
      .select('following');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.following);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const query = req.params.query;
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { displayName: { $regex: query, $options: 'i' } },
      ],
    })
      .select('-password')
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

