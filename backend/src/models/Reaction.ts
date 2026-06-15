import mongoose, { Document, Schema } from 'mongoose';

export type ReactionType = 'understand' | 'support' | 'strong' | 'notAlone' | 'hope';

export interface IReaction extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  type: ReactionType;
  createdAt: Date;
}

const ReactionSchema = new Schema<IReaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    type: {
      type: String,
      enum: ['understand', 'support', 'strong', 'notAlone', 'hope'],
      required: true,
    },
  },
  { timestamps: true }
);

// One reaction per user per post
ReactionSchema.index({ user: 1, post: 1 }, { unique: true });

export default mongoose.model<IReaction>('Reaction', ReactionSchema);
