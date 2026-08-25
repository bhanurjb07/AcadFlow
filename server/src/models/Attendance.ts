import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  sessionId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  attendancePercentage: number;
  markedBy: mongoose.Types.ObjectId;
  markedAt: Date;
}

const AttendanceSchema = new Schema(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      required: true,
    },
    attendancePercentage: { type: Number, default: 0 },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    markedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
