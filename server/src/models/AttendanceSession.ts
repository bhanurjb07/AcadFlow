import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendanceSession extends Document {
  scheduleId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  classroomId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  status: 'open' | 'locked';
  createdAt: Date;
}

const AttendanceSessionSchema = new Schema(
  {
    scheduleId: { type: Schema.Types.ObjectId, ref: 'ClassSchedule', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, enum: ['open', 'locked'], default: 'open' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IAttendanceSession>('AttendanceSession', AttendanceSessionSchema);
