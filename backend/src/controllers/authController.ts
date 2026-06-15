import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import { createError } from '../middleware/errorHandler';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id: string): string =>
  jwt.sign(
    { id },
    process.env.JWT_SECRET as jwt.Secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

const sendToken = (user: any, statusCode: number, res: Response): void => {
  const token = signToken(user._id.toString());
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      isAnonymousDefault: user.isAnonymousDefault,
      postsCount: user.postsCount,
      reactionsReceived: user.reactionsReceived,
      createdAt: user.createdAt,
    },
  });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return next(createError('Please provide username, email and password', 400));
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(createError('Email or username already in use', 409));
    }

    const user = await User.create({ username, email, password });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(createError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password || !(await user.comparePassword(password))) {
      return next(createError('Invalid email or password', 401));
    }

    if (!user.isActive) {
      return next(createError('Account is deactivated', 403));
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { idToken } = req.body;
    if (!idToken) return next(createError('Google ID token required', 400));

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) return next(createError('Invalid Google token', 400));

    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email }] });

    if (!user) {
      // Generate unique username from email
      let baseUsername = payload.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      let username = baseUsername;
      let count = 0;
      while (await User.findOne({ username })) {
        count++;
        username = `${baseUsername}${count}`;
      }

      user = await User.create({
        username,
        email: payload.email,
        googleId: payload.sub,
        avatar: payload.picture || '',
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return next(createError('User not found', 404));
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
