import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import User from '../models/User';
import Post from '../models/Post';
import Report from '../models/Report';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

// ── Categories ──────────────────────────────────────────────

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ postCount: -1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) return next(createError('Category not found', 404));
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// ── Users / Profiles ─────────────────────────────────────────

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password -googleId -email');
    if (!user) return next(createError('User not found', 404));

    const posts = await Post.find({ author: user._id, isPublished: true, isAnonymous: false })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('category', 'name slug icon color')
      .populate('author', 'username avatar')
      .lean();

    res.json({ success: true, data: { user, posts } });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bio, avatar, isAnonymousDefault } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { bio, avatar, isAnonymousDefault },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ── Stats ─────────────────────────────────────────────────────

export const getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [users, posts] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Post.countDocuments({ isPublished: true }),
    ]);

    // Sum all reactions across all posts
    const reactionsAgg = await Post.aggregate([
      { $group: {
        _id: null,
        total: {
          $sum: {
            $add: [
              '$reactions.understand',
              '$reactions.support',
              '$reactions.strong',
              '$reactions.notAlone',
              '$reactions.hope',
            ],
          },
        },
      }},
    ]);

    res.json({
      success: true,
      data: {
        users,
        posts,
        reactions: reactionsAgg[0]?.total || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Reports ───────────────────────────────────────────────────

export const createReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { targetType, targetId, reason, description } = req.body;
    if (!targetType || !targetId || !reason) {
      return next(createError('targetType, targetId and reason are required', 400));
    }

    await Report.create({ reporter: req.user!._id, targetType, targetId, reason, description });
    res.status(201).json({ success: true, message: 'Report submitted. Thank you.' });
  } catch (err) {
    next(err);
  }
};

// ── Search ────────────────────────────────────────────────────

export const search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q, type = 'posts' } = req.query;
    if (!q) return next(createError('Search query is required', 400));

    if (type === 'users') {
      const users = await User.find({
        username: { $regex: q as string, $options: 'i' },
      }).select('username avatar bio postsCount').limit(10);
      return res.json({ success: true, data: users }) as any;
    }

    const posts = await Post.find({
      $text: { $search: q as string },
      isPublished: true,
    })
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .populate('category', 'name slug icon color')
      .populate('author', 'username avatar')
      .lean();

    const safePosts = posts.map((p) => ({
      ...p,
      author: p.isAnonymous ? { username: 'Anonymous', avatar: '' } : p.author,
    }));

    res.json({ success: true, data: safePosts });
  } catch (err) {
    next(err);
  }
};