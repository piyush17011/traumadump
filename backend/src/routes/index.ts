import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, googleLogin, getMe } from '../controllers/authController';
import {
  getPosts, getPost, createPost, updatePost,
  deletePost, reactToPost, getTrendingPosts,
} from '../controllers/postController';
import { getComments, addComment, deleteComment } from '../controllers/commentController';
import {
  getCategories, getCategory, getProfile, updateProfile,
  getStats, createReport, search,
} from '../controllers/miscController';
import { protect, optionalAuth } from '../middleware/auth';

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many requests' });
const postLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

// ── Auth ──────────────────────────────────────────────────────
router.post('/auth/register', authLimiter, register);
router.post('/auth/login', authLimiter, login);
router.post('/auth/google', authLimiter, googleLogin);
router.get('/auth/me', protect, getMe);

// ── Posts ─────────────────────────────────────────────────────
router.get('/posts', optionalAuth, getPosts);
router.get('/posts/trending', getTrendingPosts);
router.post('/posts', protect, postLimiter, createPost);
router.get('/posts/:slug', optionalAuth, getPost);
router.put('/posts/:slug', protect, updatePost);
router.delete('/posts/:slug', protect, deletePost);
router.post('/posts/:slug/react', protect, reactToPost);

// ── Comments ──────────────────────────────────────────────────
router.get('/posts/:slug/comments', getComments);
router.post('/posts/:slug/comments', protect, addComment);
router.delete('/comments/:id', protect, deleteComment);

// ── Categories ────────────────────────────────────────────────
router.get('/categories', getCategories);
router.get('/categories/:slug', getCategory);

// ── Users ─────────────────────────────────────────────────────
router.get('/users/:username', getProfile);
router.put('/users/me', protect, updateProfile);

// ── Search ────────────────────────────────────────────────────
router.get('/search', search);

// ── Misc ──────────────────────────────────────────────────────
router.get('/stats', getStats);
router.post('/reports', protect, createReport);

export default router;
