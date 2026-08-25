import mongoose, { Document, Schema } from 'mongoose';

export interface IDailySeatAllocation extends Document {
  date: Date;
  classroomId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  seatId: mongoose.Types.ObjectId;
  allocationType: 'random' | 'permanent';
  createdBy: mongoose.Types.ObjectId; // admin user
  createdAt: Date;
}

const DailySeatAllocationSchema = new Schema(
  {
    date: { type: Date, required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    seatId: { type: Schema.Types.ObjectId, ref: 'Seat', required: true },
    allocationType: { type: String, enum: ['random', 'permanent'], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IDailySeatAllocation>(
  'DailySeatAllocation',
  DailySeatAllocationSchema
);
