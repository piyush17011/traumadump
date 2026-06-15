import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  isAnonymous: boolean;
  parentComment?: mongoose.Types.ObjectId;
  likes: number;
  isReported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    isAnonymous: { type: Boolean, default: false },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    likes: { type: Number, default: 0 },
    isReported: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommentSchema.index({ post: 1, createdAt: 1 });
CommentSchema.index({ author: 1 });

export default mongoose.model<IComment>('Comment', CommentSchema);
