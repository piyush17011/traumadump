import { Response, NextFunction } from 'express';
import slugify from 'slugify';
import Post from '../models/Post';
import Category from '../models/Category';
import Reaction from '../models/Reaction';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const generateSlug = async (title: string): Promise<string> => {
  let slug = slugify(title, { lower: true, strict: true });
  let exists = await Post.findOne({ slug });
  let count = 1;
  while (exists) {
    slug = `${slugify(title, { lower: true, strict: true })}-${count}`;
    exists = await Post.findOne({ slug });
    count++;
  }
  return slug;
};

export const getPosts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10, category, sort = 'latest', search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: any = { isPublished: true };

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    let sortObj: any = { createdAt: -1 };
    if (sort === 'trending') {
      sortObj = { 'reactions.understand': -1, commentCount: -1, createdAt: -1 };
    } else if (sort === 'top') {
      sortObj = { viewCount: -1, createdAt: -1 };
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('category', 'name slug icon color')
        .populate('author', 'username avatar')
        .lean(),
      Post.countDocuments(query),
    ]);

    const safePosts = posts.map((p) => ({
      ...p,
      author: p.isAnonymous ? { username: 'Anonymous', avatar: '' } : p.author,
    }));

    let userReactions: Record<string, string> = {};
    if (req.user) {
      const postIds = posts.map((p) => p._id);
      const reactions = await Reaction.find({ user: req.user._id, post: { $in: postIds } });
      reactions.forEach((r) => { userReactions[r.post.toString()] = r.type; });
    }

    res.json({
      success: true,
      data: safePosts.map((p) => ({
        ...p,
        userReaction: userReactions[p._id.toString()] || null,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, isPublished: true })
      .populate('category', 'name slug icon color')
      .populate('author', 'username avatar bio createdAt');

    if (!post) return next(createError('Post not found', 404));

    // Only increment view if the request includes the view=1 flag
    // This flag is sent only on first load, not on reaction refetches
    if (req.query.view === '1') {
      await Post.findByIdAndUpdate(post._id, { $inc: { viewCount: 1 } });
    }

    const safePost = post.toObject();
    if (post.isAnonymous) {
      (safePost as any).author = { username: 'Anonymous', avatar: '' };
    }

    let userReaction = null;
    if (req.user) {
      const reaction = await Reaction.findOne({ user: req.user._id, post: post._id });
      userReaction = reaction?.type || null;
    }

    res.json({ success: true, data: { ...safePost, userReaction } });
  } catch (err) {
    next(err);
  }
};

export const createPost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content, categorySlug, isAnonymous = false, tags = [] } = req.body;

    if (!title || !content || !categorySlug) {
      return next(createError('Title, content, and category are required', 400));
    }

    const category = await Category.findOne({ slug: categorySlug });
    if (!category) return next(createError('Category not found', 404));

    const slug = await generateSlug(title);

    const post = await Post.create({
      title,
      slug,
      content,
      author: req.user!._id,
      category: category._id,
      isAnonymous,
      tags,
    });

    await Promise.all([
      Category.findByIdAndUpdate(category._id, { $inc: { postCount: 1 } }),
      User.findByIdAndUpdate(req.user!._id, { $inc: { postsCount: 1 } }),
    ]);

    const populated = await post.populate('category', 'name slug icon color');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

export const updatePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return next(createError('Post not found', 404));

    if (post.author.toString() !== req.user!._id.toString()) {
      return next(createError('Not authorized to edit this post', 403));
    }

    const { title, content, isAnonymous, tags } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (isAnonymous !== undefined) post.isAnonymous = isAnonymous;
    if (tags) post.tags = tags;

    await post.save();
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return next(createError('Post not found', 404));

    const isOwner = post.author.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(createError('Not authorized', 403));
    }

    await Post.findByIdAndDelete(post._id);
    await Promise.all([
      Category.findByIdAndUpdate(post.category, { $inc: { postCount: -1 } }),
      User.findByIdAndUpdate(post.author, { $inc: { postsCount: -1 } }),
    ]);

    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

export const reactToPost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type } = req.body;
    const validTypes = ['understand', 'support', 'strong', 'notAlone', 'hope'];
    if (!validTypes.includes(type)) return next(createError('Invalid reaction type', 400));

    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return next(createError('Post not found', 404));

    const existing = await Reaction.findOne({ user: req.user!._id, post: post._id });

    if (existing) {
      if (existing.type === type) {
        // Toggle off
        await Reaction.findByIdAndDelete(existing._id);
        await Post.findByIdAndUpdate(post._id, { $inc: { [`reactions.${type}`]: -1 } });
        await User.findByIdAndUpdate(post.author, { $inc: { reactionsReceived: -1 } });
        res.json({ success: true, message: 'Reaction removed' });
      } else {
        // Switch reaction
        await Post.findByIdAndUpdate(post._id, {
          $inc: { [`reactions.${existing.type}`]: -1, [`reactions.${type}`]: 1 },
        });
        existing.type = type as any;
        await existing.save();
        res.json({ success: true, message: 'Reaction updated', reaction: type });
      }
    } else {
      await Reaction.create({ user: req.user!._id, post: post._id, type });
      await Post.findByIdAndUpdate(post._id, { $inc: { [`reactions.${type}`]: 1 } });
      await User.findByIdAndUpdate(post.author, { $inc: { reactionsReceived: 1 } });
      res.json({ success: true, message: 'Reaction added', reaction: type });
    }
  } catch (err) {
    next(err);
  }
};

export const getTrendingPosts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const posts = await Post.find({ isPublished: true })
      .sort({ 'reactions.understand': -1, commentCount: -1, createdAt: -1 })
      .limit(6)
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