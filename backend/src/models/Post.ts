import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  author: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  isAnonymous: boolean;
  tags: string[];
  reactions: {
    understand: number;
    support: number;
    strong: number;
    notAlone: number;
    hope: number;
  };
  commentCount: number;
  viewCount: number;
  isPublished: boolean;
  isReported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    content: { type: String, required: true, minlength: 1, maxlength: 5000 },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    isAnonymous: { type: Boolean, default: false },
    tags: [{ type: String, trim: true, lowercase: true }],
    reactions: {
      understand: { type: Number, default: 0 },
      support: { type: Number, default: 0 },
      strong: { type: Number, default: 0 },
      notAlone: { type: Number, default: 0 },
      hope: { type: Number, default: 0 },
    },
    commentCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    isReported: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PostSchema.index({ slug: 1 });
PostSchema.index({ author: 1 });
PostSchema.index({ category: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ title: 'text', content: 'text' });

export default mongoose.model<IPost>('Post', PostSchema);