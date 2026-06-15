import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Category from '../models/Category';
import connectDB from '../config/database';

const categories = [
  { name: 'Family', slug: 'family', description: 'Family dynamics, relationships and stories', icon: '🏠', color: '#F59E0B' },
  { name: 'Relationships', slug: 'relationships', description: 'Love, dating, and connections', icon: '💕', color: '#EC4899' },
  { name: 'Breakups', slug: 'breakups', description: 'Healing and moving on', icon: '💔', color: '#EF4444' },
  { name: 'College & School', slug: 'college', description: 'Academic stress and campus life', icon: '🎓', color: '#8B5CF6' },
  { name: 'Career & Work', slug: 'career', description: 'Work struggles and professional life', icon: '💼', color: '#3B82F6' },
  { name: 'Anxiety & Stress', slug: 'anxiety', description: 'Managing stress and anxious thoughts', icon: '🌊', color: '#06B6D4' },
  { name: 'Friendships', slug: 'friendships', description: 'Friend drama, loneliness, social life', icon: '🤝', color: '#10B981' },
  { name: 'Self Improvement', slug: 'self-improvement', description: 'Growth journeys and personal wins', icon: '🌱', color: '#84CC16' },
  { name: 'Success Stories', slug: 'success', description: 'Wins, breakthroughs, and progress', icon: '✨', color: '#F59E0B' },
  { name: 'Confessions', slug: 'confessions', description: 'Things you\'ve never said out loud', icon: '🤫', color: '#A855F7' },
  { name: 'Life Stories', slug: 'life-stories', description: 'Experiences that shaped who you are', icon: '📖', color: '#64748B' },
  { name: 'Mental Health', slug: 'mental-health', description: 'Open conversations about wellbeing', icon: '🧠', color: '#6366F1' },
];

const seed = async () => {
  await connectDB();
  await Category.deleteMany({});
  await Category.insertMany(categories);
  console.log(`✅ Seeded ${categories.length} categories`);
  await mongoose.disconnect();
};

seed().catch((err) => { console.error(err); process.exit(1); });
