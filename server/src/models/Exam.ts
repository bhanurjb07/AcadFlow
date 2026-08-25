import mongoose, { Document, Schema } from 'mongoose';

export interface IExam extends Document {
  subjectId: mongoose.Types.ObjectId;
  classScheduleId: mongoose.Types.ObjectId; // reference to ClassSchedule
  date: Date;
  maxMarks: number;
  durationMinutes: number;
  createdBy: mongoose.Types.ObjectId; // admin or teacher
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    classScheduleId: { type: Schema.Types.ObjectId, ref: 'ClassSchedule', required: true },
    date: { type: Date, required: true },
    maxMarks: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IExam>('Exam', ExamSchema);
