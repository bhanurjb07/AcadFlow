import mongoose, { Document, Schema } from 'mongoose';

export interface IExamResult extends Document {
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  marksObtained: number;
  grade?: string;
  evaluatedBy: mongoose.Types.ObjectId; // teacher or admin
  evaluatedAt: Date;
}

const ExamResultSchema = new Schema(
  {
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    marksObtained: { type: Number, required: true },
    grade: { type: String },
    evaluatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    evaluatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IExamResult>('ExamResult', ExamResultSchema);
