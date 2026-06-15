import { Response, NextFunction } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const getComments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({ slug });
    if (!post) return next(createError('Post not found', 404));

    const comments = await Comment.find({ post: post._id, parentComment: null })
      .sort({ createdAt: 1 })
      .populate('author', 'username avatar')
      .lean();

    const safeComments = comments.map((c) => ({
      ...c,
      author: c.isAnonymous ? { username: 'Anonymous', avatar: '' } : c.author,
    }));

    res.json({ success: true, data: safeComments });
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const { content, isAnonymous = false, parentComment } = req.body;

    if (!content?.trim()) return next(createError('Comment content is required', 400));

    const post = await Post.findOne({ slug });
    if (!post) return next(createError('Post not found', 404));

    const comment = await Comment.create({
      content,
      author: req.user!._id,
      post: post._id,
      isAnonymous,
      parentComment: parentComment || undefined,
    });

    await Post.findByIdAndUpdate(post._id, { $inc: { commentCount: 1 } });

    const populated = await comment.populate('author', 'username avatar');
    const safe = populated.toObject();
    if (comment.isAnonymous) (safe as any).author = { username: 'Anonymous', avatar: '' };

    res.status(201).json({ success: true, data: safe });
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return next(createError('Comment not found', 404));

    const isOwner = comment.author.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin';

    if (!isOwner && !isAdmin) return next(createError('Not authorized', 403));

    await Comment.findByIdAndDelete(comment._id);
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};
