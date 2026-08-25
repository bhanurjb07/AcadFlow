import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  studentId: string;
  rollNumber: string;
  name: string;
  department: string;
  semester: string;
  section: string;
  batch?: string;
  subjects: string[];
  profileImage?: string;
  createdAt: Date;
}

const StudentSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: String, required: true, unique: true },
    rollNumber: { type: String, required: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: String, required: true },
    section: { type: String, required: true },
    batch: { type: String },
    subjects: [{ type: String }],
    profileImage: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IStudent>('Student', StudentSchema);
