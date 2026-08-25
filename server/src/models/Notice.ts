import mongoose, { Document, Schema } from 'mongoose';

export interface INotice extends Document {
  title: string;
  content: string;
  targetRole: 'all' | 'student' | 'teacher' | 'admin';
  attachmentUrl?: string;
  postedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    targetRole: {
      type: String,
      enum: ['all', 'student', 'teacher', 'admin'],
      default: 'all',
    },
    attachmentUrl: { type: String },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<INotice>('Notice', NoticeSchema);
