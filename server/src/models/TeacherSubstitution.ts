import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacherSubstitution extends Document {
  absentTeacherId: mongoose.Types.ObjectId;
  substituteTeacherId: mongoose.Types.ObjectId;
  classScheduleId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  date: Date;
  reason?: string;
  createdBy: mongoose.Types.ObjectId; // admin
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSubstitutionSchema = new Schema(
  {
    absentTeacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    substituteTeacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    classScheduleId: { type: Schema.Types.ObjectId, ref: 'ClassSchedule', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    date: { type: Date, required: true },
    reason: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITeacherSubstitution>('TeacherSubstitution', TeacherSubstitutionSchema);
