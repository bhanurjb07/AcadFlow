import mongoose, { Document, Schema } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  code: string;
  department: string;
  semester: string;
  credits: number;
  totalPeriods: number;
  createdAt: Date;
}

const SubjectSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    semester: { type: String, required: true },
    credits: { type: Number, required: true },
    totalPeriods: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<ISubject>('Subject', SubjectSchema);
