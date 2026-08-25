import mongoose, { Document, Schema } from 'mongoose';

export interface IClassSchedule extends Document {
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  classroomId: mongoose.Types.ObjectId;
  section: string;
  day: string; // e.g., 'Monday'
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  period: number;
  createdAt: Date;
}

const ClassScheduleSchema = new Schema(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    section: { type: String, required: true },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    period: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IClassSchedule>('ClassSchedule', ClassScheduleSchema);
