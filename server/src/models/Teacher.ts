import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacher extends Document {
  userId: mongoose.Types.ObjectId;
  employeeId: string;
  name: string;
  department: string;
  subjects: string[];
  availability: {
    day: string;
    from: string; // HH:MM
    to: string;   // HH:MM
  }[];
  status: string;
  createdAt: Date;
}

const TeacherSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    subjects: [{ type: String }],
    availability: [
      {
        day: { type: String, required: true },
        from: { type: String, required: true },
        to: { type: String, required: true },
      },
    ],
    status: { type: String, default: 'active' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<ITeacher>('Teacher', TeacherSchema);
