import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  reporter: mongoose.Types.ObjectId;
  targetType: 'post' | 'comment';
  targetId: mongoose.Types.ObjectId;
  reason: 'harassment' | 'hate_speech' | 'spam' | 'self_harm' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['post', 'comment'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: {
      type: String,
      enum: ['harassment', 'hate_speech', 'spam', 'self_harm', 'other'],
      required: true,
    },
    description: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

ReportSchema.index({ status: 1 });
ReportSchema.index({ reporter: 1 });

export default mongoose.model<IReport>('Report', ReportSchema);
